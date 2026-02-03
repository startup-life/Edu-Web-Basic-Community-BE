const dbConnect = require('../databases/index.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const { createHttpError } = require('../utils/error.util.js');

/**
 * 댓글 조회
 * 댓글 작성
 * 댓글 수정
 * 댓글 삭제
 */

// 댓글 조회
exports.getComments = async requestData => {
    const { postId } = requestData;

    const sql = `
    SELECT
        ct.id,
        ct.content,
        ct.post_id,
        ct.user_id,
        ct.nickname,
        ct.created_at,
        ut.file_id,
        COALESCE(ft.path, NULL) AS profileImage
    FROM comments AS ct
    LEFT JOIN users AS ut ON ct.user_id = ut.id
    LEFT JOIN files AS ft ON ut.file_id = ft.id
    WHERE ct.post_id = ? AND ct.deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId]);

    return results;
};

// 댓글 작성
exports.writeComment = async requestData => {
    const { postId, userId, nickname, commentContent } = requestData;

    const checkPostSql = `
        SELECT * FROM posts
        WHERE id = ? AND deleted_at IS NULL;
        `;
    const checkPostResults = await dbConnect.query(checkPostSql, [postId]);

    if (!checkPostResults || checkPostResults.length === 0)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.POST_NOT_FOUND,
        );

    const insertCommentSql = `
        INSERT INTO comments
        (post_id, user_id, nickname, content)
        VALUES (?, ?, ?, ?);
        `;
    const results = await dbConnect.query(insertCommentSql, [
        postId,
        userId,
        nickname,
        commentContent,
    ]);

    if (!results)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    const commentsCountSql = `
        UPDATE posts
        SET comment_count = comment_count + 1
        WHERE id = ?;
        `;
    await dbConnect.query(commentsCountSql, [postId]);

    return results;
};

// 댓글 수정
exports.updateComment = async requestData => {
    const { postId, commentId, userId, commentContent } = requestData;

    const checkPostSql = `
        SELECT * FROM posts
        WHERE id = ? AND deleted_at IS NULL;
    `;
    const checkPostResults = await dbConnect.query(checkPostSql, [postId]);

    if (!checkPostResults || checkPostResults.length === 0)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.POST_NOT_FOUND,
        );

    const sql = `
        UPDATE comments
        SET content = ?
        WHERE post_id = ? 
        AND id = ? 
        AND user_id = ?
        AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [
        commentContent,
        postId,
        commentId,
        userId,
    ]);

    if (!results || results.affectedRows === 0)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    return results;
};

// 댓글 삭제
exports.softDeleteComment = async requestData => {
    const { postId, commentId, userId } = requestData;

    // 게시물 존재 여부 확인
    const checkPostSql = `
    SELECT * FROM posts
    WHERE id = ? AND deleted_at IS NULL;
    `;
    const checkPostResults = await dbConnect.query(checkPostSql, [postId]);
    if (!checkPostResults || checkPostResults.length === 0)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.POST_NOT_FOUND,
        );

    // userId가 댓글 작성자 userId와 일치하는지 확인
    const checkUserSql = `
    SELECT * FROM comments
    WHERE post_id = ? AND id = ? AND user_id = ? AND deleted_at IS NULL;
    `;
    const checkUserResults = await dbConnect.query(checkUserSql, [
        postId,
        commentId,
        userId,
    ]);

    if (!checkUserResults || checkUserResults.length === 0)
        throw createHttpError(
            STATUS_CODE.UNAUTHORIZED,
            STATUS_MESSAGE.REQUIRED_AUTHORIZATION,
        );

    // 댓글 소프트 삭제
    const sql = `
    UPDATE comments
    SET deleted_at = now()
    WHERE post_id = ?
    AND id = ?
    AND user_id = ?
    AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [postId, commentId, userId]);

    if (!results || results.affectedRows === 0)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    // 댓글 수 감소
    const commentsCountSql = `
    UPDATE posts
    SET comment_count = comment_count - 1
    WHERE id = ?;
    `;
    await dbConnect.query(commentsCountSql, [postId]);

    return;
};
