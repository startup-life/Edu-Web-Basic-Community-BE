const postModel = require('../model/postModel.js');
const { createValidationError } = require('../util/errorUtil.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE
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
 * 게시글 작성
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 * 게시글 삭제
 */

// 게시글 작성
exports.writePost = async (request, response, next) => {
    const userId = request.userId;
    const { postTitle, postContent, attachFilePath } = request.body;

    try {
        const errors = {};
        if (!postTitle) {
            addValidationError(errors, 'postTitle', 'REQUIRED');
        } else if (postTitle.length > 26) {
            addValidationError(errors, 'postTitle', 'TOO_LONG');
        }

        if (!postContent) {
            addValidationError(errors, 'postContent', 'REQUIRED');
        } else if (postContent.length > 1500) {
            addValidationError(errors, 'postContent', 'TOO_LONG');
        }

        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

        const requestData = {
            userId,
            postTitle,
            postContent,
            attachFilePath: attachFilePath || null,
        };
        const responseData = await postModel.writePost(requestData);

        if (responseData === STATUS_MESSAGE.NOT_FOUND_USER) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.WRITE_POST_FAILED);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.WRITE_POST_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 목록 조회
exports.getPosts = async (request, response, next) => {
    const { offset, limit } = request.query;

    try {
        const errors = {};
        if (offset === undefined || offset === null || offset === '') {
            addValidationError(errors, 'offset', 'REQUIRED');
        } else if (Number.isNaN(Number(offset))) {
            addValidationError(errors, 'offset', 'INVALID_FORMAT');
        }
        if (limit === undefined || limit === null || limit === '') {
            addValidationError(errors, 'limit', 'REQUIRED');
        } else if (Number.isNaN(Number(limit))) {
            addValidationError(errors, 'limit', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }
        const requestData = {
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        };
        const responseData = await postModel.getPosts(requestData);

        if (!responseData || responseData.length === 0) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.GET_POSTS_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 상세 조회
exports.getPost = async (request, response, next) => {
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
            postId
        };
        const responseData = await postModel.getPost(requestData, response);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.GET_POST_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        return next(error);
    }
};

// 게시글 수정
exports.updatePost = async (request, response, next) => {
    const { post_id: postId } = request.params;
    const userId = request.userId;
    const { postTitle, postContent, attachFilePath } = request.body;

    try {
        const errors = {};
        if (!postId) {
            addValidationError(errors, 'postId', 'REQUIRED');
        } else if (Number.isNaN(Number(postId))) {
            addValidationError(errors, 'postId', 'INVALID_FORMAT');
        }

        if (!postTitle) {
            addValidationError(errors, 'postTitle', 'REQUIRED');
        } else if (postTitle.length > 26) {
            addValidationError(errors, 'postTitle', 'TOO_LONG');
        }

        if (!postContent) {
            addValidationError(errors, 'postContent', 'REQUIRED');
        } else if (postContent.length > 1500) {
            addValidationError(errors, 'postContent', 'TOO_LONG');
        }

        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

        const requestData = {
            postId,
            userId,
            postTitle,
            postContent,
            attachFilePath: attachFilePath || null,
        };
        const responseData = await postModel.updatePost(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.UPDATE_POST_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 삭제
exports.softDeletePost = async (request, response, next) => {
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
            postId
        };
        const results = await postModel.softDeletePost(requestData);

        if (!results) {
            const error = new Error(STATUS_MESSAGE.NOT_A_SINGLE_POST);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.DELETE_POST_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
