const postModel = require('../models/post.model.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const { pathToUrl, urlToPath } = require('../utils/url.util.js');

/**
 * 게시글 작성
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 * 게시글 삭제
 */

// 게시글 목록 조회
exports.getPosts = async (request, response, next) => {
    const { offset, limit } = request.query;

    try {
        const requestData = {
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        };
        const responseData = await postModel.getPosts(requestData);

        const posts = responseData.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            likeCount: post.like_count,
            commentCount: post.comment_count,
            viewCount: post.view_count,
            author: {
                userId: post.user_id,
                nickname: post.nickname,
                profileImageUrl: pathToUrl(request, post.profileImageUrl),
            },
            createdAt: post.created_at,
        }));

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.POSTS_RETRIEVED,
            data: posts,
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 상세 조회
exports.getPost = async (request, response, next) => {
    const { post_id: postId } = request.params;

    try {
        const requestData = {
            postId,
        };
        const responseData = await postModel.getPost(requestData, response);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.POST_NOT_FOUND);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        const postData = {
            ...responseData,
            filePath: pathToUrl(request, responseData.filePath),
            profileImage: pathToUrl(request, responseData.profileImage),
        };

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.POST_RETRIEVED,
            data: postData,
        });
    } catch (error) {
        return next(error);
    }
};

// 게시글 작성
exports.writePost = async (request, response, next) => {
    const userId = request.userId;
    const nickname = request.session && request.session.nickname;
    const { title, content, attachFileUrl } = request.body;

    try {
        const normalizedAttachFilePath =
            attachFileUrl === undefined
                ? undefined
                : urlToPath(attachFileUrl) || null;

        const requestData = {
            userId,
            nickname,
            title,
            content,
            attachFileUrl: normalizedAttachFilePath,
        };
        const responseData = await postModel.writePost(requestData);

        if (responseData && responseData.fileUrl) {
            responseData.fileUrl = pathToUrl(request, responseData.fileUrl);
        }

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.POST_CREATED,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 수정
exports.updatePost = async (request, response, next) => {
    const { post_id: postId } = request.params;
    const userId = request.userId;
    const { title, content, attachFileUrl } = request.body;

    try {
        const normalizedAttachFilePath =
            attachFileUrl === undefined
                ? undefined
                : urlToPath(attachFileUrl) || null;

        const requestData = {
            postId,
            userId,
            title,
            content,
            attachFileUrl: normalizedAttachFilePath,
        };
        await postModel.updatePost(requestData);

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.UPDATE_POST_SUCCESS,
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// 게시글 삭제
exports.softDeletePost = async (request, response, next) => {
    const { post_id: postId } = request.params;

    try {
        const requestData = {
            postId,
        };
        const results = await postModel.softDeletePost(requestData);

        if (!results) {
            const error = new Error(STATUS_MESSAGE.POST_NOT_FOUND);
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
