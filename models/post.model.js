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
exports.getPosts = async (requestData, response) => {
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
    const results = await dbConnect.query(sql, response);

    if (!results) return null;
    return results;
};

// 게시글 상세 조회
exports.getPost = async (requestData, response) => {
    const { postId } = requestData;

    // 게시글 정보 가져오기
    const postSql = `
    SELECT 
        posts.id,
        posts.title,
        posts.content,
        posts.file_id,
        posts.user_id,
        posts.nickname,
        posts.created_at,
        posts.like_count,
        posts.comment_count,
        posts.view_count,
        COALESCE(post_files.path, NULL) AS filePath,
        COALESCE(profile_files.path, NULL) AS profileImage
    FROM posts
    LEFT JOIN files AS post_files
        ON posts.file_id = post_files.id
    LEFT JOIN users
        ON posts.user_id = users.id
    LEFT JOIN files AS profile_files
        ON users.file_id = profile_files.id
        AND profile_files.category = 1
        AND profile_files.deleted_at IS NULL
    WHERE posts.id = ? AND posts.deleted_at IS NULL;
    `;
    const results = await dbConnect.query(postSql, [postId], response);

    if (!results || results.length === 0) return null;

    const postResult = results[0];

    // 조회수 증가
    const hitsSql = `
        UPDATE posts SET view_count = view_count + 1 WHERE id = ? AND deleted_at IS NULL;
        `;
    await dbConnect.query(hitsSql, [postId], response);

    return postResult;
};

// 게시글 작성
exports.writePost = async requestData => {
    const { userId, nickname, title, content, attachFileUrl } = requestData;

    if (!nickname)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.NOT_FOUND_USER,
        );

    const insertPostSql = `
    INSERT INTO posts
    (user_id, nickname, title, content)
    VALUES (?, ?, ?, ?);
    `;
    const writePostResults = await dbConnect.query(insertPostSql, [
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
        const postFileResults = await insertPostFile(
            userId,
            writePostResults.insertId,
            attachFileUrl,
        );

        if (!postFileResults || !postFileResults.insertId)
            throw createHttpError(
                STATUS_CODE.INTERNAL_SERVER_ERROR,
                STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
            );

        await updatePostFileId(
            writePostResults.insertId,
            postFileResults.insertId,
        );

        writePostResults.fileUrl = attachFileUrl;
    }

    return writePostResults;
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
