const commentModel = require('../model/commentModel.js');
const { createValidationError } = require('../util/errorUtil.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../util/constant/httpStatusCode');

const addValidationError = (errors, field, code) => {
    if (!errors[field]) {
        errors[field] = [];
    }
    if (!errors[field].includes(code)) {
        errors[field].push(code);
    }
};

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
        const errors = {};
        if (!postId) {
            addValidationError(errors, 'postId', 'REQUIRED');
        } else if (Number.isNaN(Number(postId))) {
            addValidationError(errors, 'postId', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

        const requestData = {
            postId,
        };
        const responseData = await commentModel.getComments(requestData);

        if (!responseData || responseData.length === 0) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_COMMENT);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.GET_COMMENTS_SUCCESS,
            data: responseData,
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
        const errors = {};
        if (!postId) {
            addValidationError(errors, 'postId', 'REQUIRED');
        } else if (Number.isNaN(Number(postId))) {
            addValidationError(errors, 'postId', 'INVALID_FORMAT');
        }

        if (!commentContent) {
            addValidationError(errors, 'commentContent', 'REQUIRED');
        } else if (commentContent.length > 1000) {
            addValidationError(errors, 'commentContent', 'TOO_LONG');
        }

        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

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
        const errors = {};
        if (!postId) {
            addValidationError(errors, 'postId', 'REQUIRED');
        } else if (Number.isNaN(Number(postId))) {
            addValidationError(errors, 'postId', 'INVALID_FORMAT');
        }

        if (!commentId) {
            addValidationError(errors, 'commentId', 'REQUIRED');
        } else if (Number.isNaN(Number(commentId))) {
            addValidationError(errors, 'commentId', 'INVALID_FORMAT');
        }

        if (!commentContent) {
            addValidationError(errors, 'commentContent', 'REQUIRED');
        } else if (commentContent.length > 1000) {
            addValidationError(errors, 'commentContent', 'TOO_LONG');
        }

        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

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
        const errors = {};
        if (!postId) {
            addValidationError(errors, 'postId', 'REQUIRED');
        } else if (Number.isNaN(Number(postId))) {
            addValidationError(errors, 'postId', 'INVALID_FORMAT');
        }

        if (!commentId) {
            addValidationError(errors, 'commentId', 'REQUIRED');
        } else if (Number.isNaN(Number(commentId))) {
            addValidationError(errors, 'commentId', 'INVALID_FORMAT');
        }

        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

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
