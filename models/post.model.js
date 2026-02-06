const dbConnect = require('../databases/index.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const { createHttpError } = require('../utils/error.util.js');

/**
 * 게시글 작성
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 * 게시글 삭제
 */

// 게시글 첨부 파일 추가
const insertPostFile = async (userId, postId, attachFileUrl) => {
    const sql = `
    INSERT INTO files
    (user_id, post_id, path, category)
    VALUES (?, ?, ?, 2);
    `;
    return dbConnect.query(sql, [userId, postId, attachFileUrl]);
};

// 게시글 작성자 조회
const findPostOwnerId = async postId => {
    const sql = `
    SELECT user_id
    FROM posts
    WHERE id = ? AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);
    if (!results || results.length === 0) return null;
    return results[0].user_id;
};

// 게시글 파일 ID 업데이트
const updatePostFileId = async (postId, fileId) => {
    const sql = `
    UPDATE posts
    SET file_id = ?
    WHERE id = ?;
    `;
    return dbConnect.query(sql, [fileId, postId]);
};

// 게시글 목록 조회
exports.getPosts = async requestData => {
    const { offset, limit } = requestData;
    const sql = `
    SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.file_id,
        posts.user_id,
        posts.nickname,
        posts.created_at,
        posts.updated_at,
        posts.deleted_at,
        CASE
            WHEN posts.like_count >= 1000000 THEN CONCAT(ROUND(posts.like_count / 1000000, 1), 'M')
            WHEN posts.like_count >= 1000 THEN CONCAT(ROUND(posts.like_count / 1000, 1), 'K')
            ELSE CAST(posts.like_count AS CHAR)
        END as like_count,
        CASE
            WHEN posts.comment_count >= 1000000 THEN CONCAT(ROUND(posts.comment_count / 1000000, 1), 'M')
            WHEN posts.comment_count >= 1000 THEN CONCAT(ROUND(posts.comment_count / 1000, 1), 'K')
            ELSE CAST(posts.comment_count AS CHAR)
        END as comment_count,
        CASE
            WHEN posts.view_count >= 1000000 THEN CONCAT(ROUND(posts.view_count / 1000000, 1), 'M')
            WHEN posts.view_count >= 1000 THEN CONCAT(ROUND(posts.view_count / 1000, 1), 'K')
            ELSE CAST(posts.view_count AS CHAR)
        END as view_count,
        COALESCE(files.path, NULL) AS profileImageUrl
    FROM posts
            LEFT JOIN users ON posts.user_id = users.id
            LEFT JOIN files ON users.file_id = files.id
    WHERE posts.deleted_at IS NULL
    ORDER BY posts.created_at DESC
    LIMIT ${limit} OFFSET ${offset};
    `;
    const results = await dbConnect.query(sql);

    if (!results) return null;
    return results;
};

const buildSearchPostsQuery = requestData => {
    const { keyword, offset, limit, sort } = requestData;
    const keywordTerm = keyword;
    const parsedOffset = Number.parseInt(offset, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    const safeOffset = Number.isNaN(parsedOffset) ? 0 : Math.max(0, parsedOffset);
    const safeLimit = Number.isNaN(parsedLimit) ? 10 : Math.max(1, parsedLimit);
    const normalizedSort = sort === 'relevance' ? 'relevance' : 'recent';
    const orderByClause =
        normalizedSort === 'relevance'
            ? 'relevance_score DESC, posts.created_at DESC'
            : 'posts.created_at DESC';

    const sql = `
    SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.file_id,
        posts.user_id,
        posts.nickname,
        posts.created_at,
        posts.updated_at,
        posts.deleted_at,
        CASE
            WHEN posts.like_count >= 1000000 THEN CONCAT(ROUND(posts.like_count / 1000000, 1), 'M')
            WHEN posts.like_count >= 1000 THEN CONCAT(ROUND(posts.like_count / 1000, 1), 'K')
            ELSE CAST(posts.like_count AS CHAR)
        END as like_count,
        CASE
            WHEN posts.comment_count >= 1000000 THEN CONCAT(ROUND(posts.comment_count / 1000000, 1), 'M')
            WHEN posts.comment_count >= 1000 THEN CONCAT(ROUND(posts.comment_count / 1000, 1), 'K')
            ELSE CAST(posts.comment_count AS CHAR)
        END as comment_count,
        CASE
            WHEN posts.view_count >= 1000000 THEN CONCAT(ROUND(posts.view_count / 1000000, 1), 'M')
            WHEN posts.view_count >= 1000 THEN CONCAT(ROUND(posts.view_count / 1000, 1), 'K')
            ELSE CAST(posts.view_count AS CHAR)
        END as view_count,
        COALESCE(files.path, NULL) AS profileImageUrl,
        MATCH(posts.title, posts.content, posts.nickname)
            AGAINST(? IN BOOLEAN MODE) AS relevance_score
    FROM posts
            LEFT JOIN users ON posts.user_id = users.id
            LEFT JOIN files ON users.file_id = files.id
    WHERE posts.deleted_at IS NULL
        AND MATCH(posts.title, posts.content, posts.nickname)
            AGAINST(? IN BOOLEAN MODE)
    ORDER BY ${orderByClause}
    LIMIT ${safeLimit} OFFSET ${safeOffset};
    `;

    return {
        sql,
        params: [keywordTerm, keywordTerm],
    };
};

// 게시글 검색
exports.searchPosts = async requestData => {
    const { sql, params } = buildSearchPostsQuery(requestData);
    const results = await dbConnect.query(sql, params);

    if (!results) return null;
    return results;
};

// 게시글 검색 EXPLAIN
exports.explainSearchPosts = async requestData => {
    const { sql, params } = buildSearchPostsQuery(requestData);
    const explainSql = `EXPLAIN ${sql}`;
    const results = await dbConnect.query(explainSql, params);

    if (!results) return null;
    return results;
};

// 게시글 좋아요 증가
exports.likePost = async requestData => {
    const { postId, userId } = requestData;

    return dbConnect.withTransaction(async connection => {
        // 게시글 존재 여부 확인
        const [postRows] = await connection.execute(
            `
            SELECT id
            FROM posts
            WHERE id = ? AND deleted_at IS NULL;
            `,
            [postId],
        );
        if (!postRows || postRows.length === 0)
            throw createHttpError(
                STATUS_CODE.NOT_FOUND,
                STATUS_MESSAGE.POST_NOT_FOUND,
            );

        // 좋아요 중복 여부 확인
        const [likedRows] = await connection.execute(
            `
            SELECT id
            FROM post_likes
            WHERE post_id = ? AND user_id = ?
            LIMIT 1;
            `,
            [postId, userId],
        );
        if (likedRows && likedRows.length > 0)
            throw createHttpError(
                STATUS_CODE.CONFLICT,
                STATUS_MESSAGE.POST_ALREADY_LIKED,
            );

        try {
            await connection.execute(
                `
                INSERT INTO post_likes
                (post_id, user_id)
                VALUES (?, ?);
                `,
                [postId, userId],
            );
        } catch (error) {
            if (error && error.code === 'ER_DUP_ENTRY') {
                throw createHttpError(
                    STATUS_CODE.CONFLICT,
                    STATUS_MESSAGE.POST_ALREADY_LIKED,
                );
            }
            throw error;
        }

        // 게시글 좋아요 수 증가 (posts는 이미 FOR UPDATE로 잠긴 상태)
        const [updateResults] = await connection.execute(
            `
            UPDATE posts
            SET like_count = like_count + 1
            WHERE id = ? AND deleted_at IS NULL;
            `,
            [postId],
        );
        if (!updateResults || updateResults.affectedRows === 0)
            throw createHttpError(
                STATUS_CODE.NOT_FOUND,
                STATUS_MESSAGE.POST_NOT_FOUND,
            );

        // 변경된 좋아요 수 조회
        const [rows] = await connection.execute(
            `
            SELECT like_count
            FROM posts
            WHERE id = ?;
            `,
            [postId],
        );
        return rows && rows[0] ? rows[0].like_count : null;
    });
};

// 게시글 좋아요 감소
exports.unlikePost = async requestData => {
    const { postId, userId } = requestData;

    return dbConnect.withTransaction(async connection => {
        // 게시글 존재 여부 확인
        const [postRows] = await connection.execute(
            `
            SELECT id
            FROM posts
            WHERE id = ? AND deleted_at IS NULL;
            `,
            [postId],
        );
        if (!postRows || postRows.length === 0)
            throw createHttpError(
                STATUS_CODE.NOT_FOUND,
                STATUS_MESSAGE.POST_NOT_FOUND,
            );

        // 좋아요 존재 여부 확인
        const [likedRows] = await connection.execute(
            `
            SELECT id
            FROM post_likes
            WHERE post_id = ? AND user_id = ?
            LIMIT 1;
            `,
            [postId, userId],
        );
        if (!likedRows || likedRows.length === 0)
            throw createHttpError(
                STATUS_CODE.CONFLICT,
                STATUS_MESSAGE.POST_ALREADY_UNLIKED,
            );

        await connection.execute(
            `
            DELETE FROM post_likes
            WHERE post_id = ? AND user_id = ?;
            `,
            [postId, userId],
        );

        // 게시글 좋아요 수 감소
        const [updateResults] = await connection.execute(
            `
            UPDATE posts
            SET like_count = CASE
                WHEN like_count > 0 THEN like_count - 1
                ELSE 0
            END
            WHERE id = ? AND deleted_at IS NULL;
            `,
            [postId],
        );
        if (!updateResults || updateResults.affectedRows === 0)
            throw createHttpError(
                STATUS_CODE.NOT_FOUND,
                STATUS_MESSAGE.POST_NOT_FOUND,
            );

        // 변경된 좋아요 수 조회
        const [rows] = await connection.execute(
            `
            SELECT like_count
            FROM posts
            WHERE id = ?;
            `,
            [postId],
        );
        return rows && rows[0] ? rows[0].like_count : null;
    });
};

// 게시글 상세 조회
exports.getPost = async requestData => {
    const { postId, userId } = requestData;

    console.log('[SP] sp_get_post_detail', { postId, userId });

    const results = await dbConnect.query(
        'CALL sp_get_post_detail(?, ?);',
        [userId, postId],
    );

    const rows = Array.isArray(results) ? results[0] : [];
    return rows && rows.length > 0 ? rows[0] : null;
};

// 게시글 작성
exports.writePost = async requestData => {
    const { userId, nickname, title, content, attachFileUrl } = requestData;

    if (!nickname)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.NOT_FOUND_USER,
        );

    return dbConnect.withTransaction(async connection => {
        const insertPostSql = `
        INSERT INTO posts
        (user_id, nickname, title, content)
        VALUES (?, ?, ?, ?);
        `;
        const [writePostResults] = await connection.execute(insertPostSql, [
            userId,
            nickname,
            title,
            content,
        ]);

        if (!writePostResults || !writePostResults.insertId)
            throw createHttpError(
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
            );

        // 첨부 파일이 있는 경우 파일 정보 삽입 및 게시글과 파일 연결
        if (attachFileUrl) {
            const insertFileSql = `
            INSERT INTO files
            (user_id, post_id, path, category)
            VALUES (?, ?, ?, 2);
            `;
            const [postFileResults] = await connection.execute(insertFileSql, [
                userId,
                writePostResults.insertId,
                attachFileUrl,
            ]);

            if (!postFileResults || !postFileResults.insertId)
                throw createHttpError(
                    STATUS_CODE.INTERNAL_SERVER_ERROR,
                    STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
                );

            const updatePostSql = `
            UPDATE posts
            SET file_id = ?
            WHERE id = ?;
            `;
            await connection.execute(updatePostSql, [
                postFileResults.insertId,
                writePostResults.insertId,
            ]);

            writePostResults.fileUrl = attachFileUrl;
        }

        return writePostResults;
    });
};

// 게시글 수정
exports.updatePost = async requestData => {
    const { postId, userId, title, content, attachFileUrl } = requestData;

    const ownerId = await findPostOwnerId(postId);
    if (!ownerId)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.POST_NOT_FOUND,
        );
    if (`${ownerId}` !== `${userId}`)
        throw createHttpError(
            STATUS_CODE.FORBIDDEN,
            STATUS_MESSAGE.FORBIDDEN,
        );

    const updatePostSql = `
    UPDATE posts
    SET title = ?, content = ?
    WHERE id = ? AND deleted_at IS NULL;
    `;
    const updatePostResults = await dbConnect.query(updatePostSql, [
        title,
        content,
        postId,
    ]);

    if (!updatePostResults || updatePostResults.affectedRows === 0)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    if (attachFileUrl === undefined) return;

    if (attachFileUrl === null) {
        const sql = `
        UPDATE posts
        SET file_id = NULL
        WHERE id = ?;
        `;
        await dbConnect.query(sql, [postId]);
        return;
    }

    const postFileResults = await insertPostFile(
        userId,
        postId,
        attachFileUrl,
    );
    if (!postFileResults || !postFileResults.insertId)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    await updatePostFileId(postId, postFileResults.insertId);
    return;
};

// 게시글 삭제
exports.softDeletePost = async requestData => {
    const { postId } = requestData;

    const sql = `
    UPDATE posts
    SET deleted_at = NOW()
    WHERE id = ? AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);

    if (!results || results.affectedRows === 0)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.POST_NOT_FOUND,
        );
    return;
};
