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
    const { postId, commentId, userId, nickname, commentContent } = requestData;

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

    const checkCommentSql = `
        SELECT id, user_id
        FROM comments
        WHERE post_id = ?
        AND id = ?
        AND deleted_at IS NULL;
    `;
    const checkCommentResults = await dbConnect.query(checkCommentSql, [
        postId,
        commentId,
    ]);

    if (!checkCommentResults || checkCommentResults.length === 0)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.COMMENT_NOT_FOUND,
        );

    if (`${checkCommentResults[0].user_id}` !== `${userId}`)
        throw createHttpError(
            STATUS_CODE.FORBIDDEN,
            STATUS_MESSAGE.FORBIDDEN,
        );

    const updateCommentSql = `
        UPDATE comments
        SET content = ?, nickname = ?
        WHERE post_id = ? 
        AND id = ? 
        AND user_id = ?
        AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(updateCommentSql, [
        commentContent,
        nickname,
        postId,
        commentId,
        userId,
    ]);

    if (!results)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    return;
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

    // 댓글 존재 여부 확인
    const checkCommentSql = `
    SELECT id, user_id
    FROM comments
    WHERE post_id = ? AND id = ? AND deleted_at IS NULL;
    `;
    const checkCommentResults = await dbConnect.query(checkCommentSql, [
        postId,
        commentId,
    ]);

    if (!checkCommentResults || checkCommentResults.length === 0)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.COMMENT_NOT_FOUND,
        );

    if (`${checkCommentResults[0].user_id}` !== `${userId}`)
        throw createHttpError(
            STATUS_CODE.FORBIDDEN,
            STATUS_MESSAGE.FORBIDDEN,
        );

    // 댓글 소프트 삭제
    const deleteCommentSql = `
    UPDATE comments
    SET deleted_at = now()
    WHERE post_id = ?
    AND id = ?
    AND user_id = ?
    AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(deleteCommentSql, [
        postId,
        commentId,
        userId,
    ]);

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
