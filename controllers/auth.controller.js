const bcrypt = require('bcrypt');
const authModel = require('../models/auth.model.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const {
    regenerateSession,
    saveSession,
    destroySession,
} = require('../utils/session.util.js');

const SALT_ROUNDS = 10;

/**
 * 회원가입
 * 로그인
 * 로그인 상태 체크
 * 로그아웃
 */

// 회원가입
exports.signupUser = async (request, response, next) => {
    const { email, password, nickname, profileImageUrl } = request.body;

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const requestData = {
            email,
            password: hashedPassword,
            nickname,
            profileImageUrl: profileImageUrl || null,
        };

        await authModel.signUpUser(requestData);

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.SIGNUP_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 로그인
exports.loginUser = async (request, response, next) => {
    const { email, password } = request.body;

    try {
        const requestData = {
            email,
            password,
        };
        const responseData = await authModel.loginUser(requestData, response);

        await regenerateSession(request);
        request.session.userId = responseData.userId;
        request.session.email = responseData.email;
        request.session.nickname = responseData.nickname;
        request.session.profileImageUrl = responseData.profileImageUrl ?? null;
        await saveSession(request);

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.LOGIN_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        return next(error);
    }
};

// 로그인 상태 체크
exports.checkAuth = async (request, response, next) => {
    const userId = request.session && request.session.userId;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.INVALID_USER_ID);
            error.status = STATUS_CODE.BAD_REQUEST;
            throw error;
        }

        const email = request.session && request.session.email;
        const nickname = request.session && request.session.nickname;
        const hasSessionProfile =
            request.session &&
            Object.prototype.hasOwnProperty.call(
                request.session,
                'profileImageUrl',
            );
        const profileImageUrl =
            hasSessionProfile && request.session.profileImageUrl
                ? request.session.profileImageUrl
                : null;

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.AUTH_SUCCESS,
            data: {
                userId,
                email,
                nickname,
                profileImageUrl,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// 로그아웃
exports.logoutUser = async (request, response, next) => {
    try {
        await destroySession(request);
        response.clearCookie('connect.sid');
        
        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.LOGOUT_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
