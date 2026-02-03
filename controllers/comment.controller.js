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
    const { post_id: postId } = request.params;

    try {
        const requestData = {
            postId,
        };
        const responseData = await commentModel.getComments(requestData);

        if (!responseData || responseData.length === 0) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_COMMENT);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        const comments = responseData.map(comment => ({
            ...comment,
            profileImage: pathToUrl(request, comment.profileImage),
        }));

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.GET_COMMENTS_SUCCESS,
            data: comments,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 작성
exports.writeComment = async (request, response, next) => {
    const { post_id: postId } = request.params;
    const userId = request.userId;
    const { commentContent } = request.body;

    try {
        const requestData = {
            postId,
            userId,
            commentContent,
        };

        const responseData = await commentModel.writeComment(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (responseData === 'insert_error') {
            const error = new Error(STATUS_MESSAGE.INTERNAL_SERVER_ERROR);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

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
    const { post_id: postId, comment_id: commentId } = request.params;
    const userId = request.userId;
    const { commentContent } = request.body;

    try {
        const requestData = {
            postId,
            commentId,
            userId,
            commentContent,
        };
        const responseData = await commentModel.updateComment(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (responseData === 'update_error') {
            const error = new Error(STATUS_MESSAGE.INTERNAL_SERVER_ERROR);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.UPDATE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 댓글 삭제
exports.softDeleteComment = async (request, response, next) => {
    const { post_id: postId, comment_id: commentId } = request.params;
    const userId = request.userId;

    try {
        const requestData = {
            postId,
            commentId,
            userId,
        };
        const results = await commentModel.softDeleteComment(requestData);

        if (!results) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (results === 'no_auth_error') {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        if (results === 'delete_error') {
            const error = new Error(STATUS_MESSAGE.INTERNAL_SERVER_ERROR);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.DELETE_COMMENT_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
