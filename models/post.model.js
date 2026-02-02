const dbConnect = require('../databases/index.js');
const { STATUS_MESSAGE } = require('../constants/http-status-code.constant.js');

/**
 * 게시글 작성
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 * 게시글 삭제
 */

// 게시글 작성
exports.writePost = async requestData => {
    const { userId, postTitle, postContent, attachFilePath } = requestData;

    const nicknameSql = `
    SELECT nickname FROM user
    WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const nicknameResults = await dbConnect.query(nicknameSql, [userId]);

    if (!nicknameResults[0]) {
        return STATUS_MESSAGE.NOT_FOUND_USER;
    }

    const writePostSql = `
    INSERT INTO post
    (user_id, nickname, title, content)
    VALUES (?, ?, ?, ?);
    `;
    const writePostResults = await dbConnect.query(writePostSql, [
        userId,
        nicknameResults[0].nickname,
        postTitle,
        postContent,
    ]);
    if (!writePostResults) {
        return null;
    }

    if (attachFilePath) {
        const postFilePathSql = `
        INSERT INTO file
        (user_id, post_id, path, category)
        VALUES (?, ?, ?, 2);
        `;
        const postFileResults = await dbConnect.query(postFilePathSql, [
            userId,
            writePostResults.insertId,
            attachFilePath,
        ]);

        const updatePostSql = `
        UPDATE post
        SET file_id = ?
        WHERE post_id = ?;
        `;
        await dbConnect.query(updatePostSql, [
            postFileResults.insertId,
            writePostResults.insertId,
        ]);

        writePostResults.filePath = attachFilePath;
    }

    return writePostResults;
};

// 게시글 목록 조회
exports.getPosts = async (requestData, response) => {
    const { offset, limit } = requestData;
    const sql = `
    SELECT
        post.post_id,
        post.title,
        post.content,
        post.file_id,
        post.user_id,
        post.nickname,
        post.created_at,
        post.updated_at,
        post.deleted_at,
        CASE
            WHEN post.like_count >= 1000000 THEN CONCAT(ROUND(post.like_count / 1000000, 1), 'M')
            WHEN post.like_count >= 1000 THEN CONCAT(ROUND(post.like_count / 1000, 1), 'K')
            ELSE post.like_count
        END as like_count,
        CASE
            WHEN post.comment_count >= 1000000 THEN CONCAT(ROUND(post.comment_count / 1000000, 1), 'M')
            WHEN post.comment_count >= 1000 THEN CONCAT(ROUND(post.comment_count / 1000, 1), 'K')
            ELSE post.comment_count
        END as comment_count,
        CASE
            WHEN post.view_count >= 1000000 THEN CONCAT(ROUND(post.view_count / 1000000, 1), 'M')
            WHEN post.view_count >= 1000 THEN CONCAT(ROUND(post.view_count / 1000, 1), 'K')
            ELSE post.view_count
        END as view_count,
        COALESCE(file.path, NULL) AS profileImageUrl
    FROM post
            LEFT JOIN user ON post.user_id = user.user_id
            LEFT JOIN file ON user.file_id = file.file_id
    WHERE post.deleted_at IS NULL
    ORDER BY post.created_at DESC
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
        post.post_id,
        post.title,
        post.content,
        post.file_id,
        post.user_id,
        post.nickname,
        post.created_at,
        post.updated_at,
        post.deleted_at,
        CASE
            WHEN post.like_count >= 1000000 THEN CONCAT(ROUND(post.like_count / 1000000, 1), 'M')
            WHEN post.like_count >= 1000 THEN CONCAT(ROUND(post.like_count / 1000, 1), 'K')
            ELSE CAST(post.like_count AS CHAR)
        END as like_count,
        CASE
            WHEN post.comment_count >= 1000000 THEN CONCAT(ROUND(post.comment_count / 1000000, 1), 'M')
            WHEN post.comment_count >= 1000 THEN CONCAT(ROUND(post.comment_count / 1000, 1), 'K')
            ELSE CAST(post.comment_count AS CHAR)
        END as comment_count,
        CASE
            WHEN post.view_count >= 1000000 THEN CONCAT(ROUND(post.view_count / 1000000, 1), 'M')
            WHEN post.view_count >= 1000 THEN CONCAT(ROUND(post.view_count / 1000, 1), 'K')
            ELSE CAST(post.view_count AS CHAR)
        END as view_count,
        COALESCE(file.path, NULL) AS filePath
    FROM post
    LEFT JOIN file ON post.file_id = file.file_id
    WHERE post.post_id = ? AND post.deleted_at IS NULL;
    `;
    const results = await dbConnect.query(postSql, [postId], response);

    if (!results || results.length === 0) return null;

    const postResult = results[0];
    postResult.profileImage = null;

    // 조회수 증가
    const hitsSql = `
        UPDATE post SET view_count = view_count + 1 WHERE post_id = ? AND deleted_at IS NULL;
        `;
    await dbConnect.query(hitsSql, [postId], response);

    // 유저 프로필 이미지 file id 가져오기
    const userSql = `
        SELECT file_id FROM user WHERE user_id = ?;
        `;
    const userResults = await dbConnect.query(
        userSql,
        [postResult.user_id],
        response,
    );

    // 유저 프로필 이미지 가져오기
    if (userResults && userResults.length > 0 && userResults[0].file_id) {
        const profileImageSql = `
            SELECT path FROM file WHERE file_id = ? AND category = 1 AND user_id = ?;
            `;
        const profileImageResults = await dbConnect.query(
            profileImageSql,
            [userResults[0].file_id, postResult.user_id],
            response,
        );

        if (profileImageResults && profileImageResults.length > 0) {
            postResult.profileImage = profileImageResults[0].path;
        }
    }
    return postResult;
};

// 게시글 수정
exports.updatePost = async requestData => {
    const { postId, userId, postTitle, postContent, attachFilePath } =
        requestData;

    const updatePostSql = `
    UPDATE post
    SET title = ?, content = ?
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const updatePostResults = await dbConnect.query(updatePostSql, [
        postTitle,
        postContent,
        postId,
    ]);

    if (!updatePostResults) return null;

    if (attachFilePath === null) {
        const sql = `
        UPDATE post
        SET file_id = NULL
        WHERE post_id = ?;
        `;
        await dbConnect.query(sql, [postId]);
    } else {
        // 파일 경로 존재 여부 확인
        const checkFilePathSql = `
        SELECT COUNT(*) AS existing
        FROM file
        WHERE path = ?;
        `;
        const checkResults = await dbConnect.query(checkFilePathSql, [
            attachFilePath,
        ]);
        if (checkResults[0].existing === 0) {
            // 파일 경로가 존재하지 않으면 새로운 파일 정보 삽입
            const postFilePathSql = `
            INSERT INTO file
            (user_id, post_id, path, category)
            VALUES (?, ?, ?, 2);
            `;
            const postFileResults = await dbConnect.query(postFilePathSql, [
                userId,
                postId,
                attachFilePath,
            ]);

            // file_id 업데이트
            const updatePostFileSql = `
            UPDATE post
            SET file_id = ?
            WHERE post_id = ?;
            `;
            await dbConnect.query(updatePostFileSql, [
                postFileResults.insertId,
                postId,
            ]);
        }
    }

    return { ...updatePostResults, post_id: postId };
};

// 게시글 삭제
exports.softDeletePost = async requestData => {
    const { postId } = requestData;

    const sql = `
    UPDATE post
    SET deleted_at = NOW()
    WHERE post_id = ? AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);

    if (!results || results.affectedRows === 0) return null;

    return results;
};
