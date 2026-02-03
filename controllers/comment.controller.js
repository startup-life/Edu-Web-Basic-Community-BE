const commentModel = require('../models/comment.model.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const { pathToUrl } = require('../utils/url.util.js');

/**
 * 댓글 조회
 * 댓글 작성
 * 댓글 수정
 * 댓글 삭제
 */

// 댓글 조회
exports.getComments = async (request, response, next) => {
    const { postId } = request.params;

    try {
        const requestData = {
            postId,
        };
        const responseData = await commentModel.getComments(requestData);

        const comments = responseData.map(comment => ({
            id: comment.id,
            content: comment.content,
            postId: comment.post_id,
            author: {
                userId: comment.user_id,
                nickname: comment.nickname,
                profileImageUrl: pathToUrl(request, comment.profileImage),
            },
            createdAt: comment.created_at,
        }));

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.COMMENTS_RETRIEVED,
            data: comments,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 작성
exports.writeComment = async (request, response, next) => {
    const { postId } = request.params;
    const userId = request.userId;
    const nickname = request.session && request.session.nickname;
    const { commentContent } = request.body;

    try {
        const requestData = {
            postId,
            userId,
            nickname,
            commentContent,
        };

        await commentModel.writeComment(requestData);

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.WRITE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 수정
exports.updateComment = async (request, response, next) => {
    const { postId, commentId } = request.params;
    const userId = request.userId;
    const nickname = request.session && request.session.nickname;
    const { commentContent } = request.body;

    try {
        const requestData = {
            postId,
            commentId,
            userId,
            nickname,
            commentContent,
        };
        await commentModel.updateComment(requestData);

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.COMMENT_UPDATED,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 삭제
exports.softDeleteComment = async (request, response, next) => {
    const { postId, commentId } = request.params;
    const userId = request.userId;

    try {
        const requestData = {
            postId,
            commentId,
            userId,
        };
        await commentModel.softDeleteComment(requestData);

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.COMMENT_DELETED,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
