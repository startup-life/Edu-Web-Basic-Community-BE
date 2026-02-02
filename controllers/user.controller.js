const bcrypt = require('bcrypt');
const userModel = require('../models/user.model.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

const SALT_ROUNDS = 10;

/**
 * 유저 정보 가져오기
 * 비밀번호 변경
 * 회원 탈퇴
 * 이메일 중복 체크
 * 닉네임 중복 체크
 */

// 유저 정보 가져오기
exports.getUser = async (request, response, next) => {
    const userId = request.userId;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        const responseData = await userModel.getUser({ userId });

        if (responseData === null) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.GET_USER_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        return next(error);
    }
};

// 회원정보 수정
exports.updateUser = async (request, response, next) => {
    const { nickname, profileImageUrl } = request.body;
    const userId = request.userId;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        const requestData = {
            userId,
            nickname,
            profileImageUrl,
        };
        const responseData = await userModel.updateUser(requestData);

        if (responseData === null) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        if (responseData === STATUS_MESSAGE.UPDATE_PROFILE_IMAGE_FAILED) {
            const error = new Error(STATUS_MESSAGE.UPDATE_PROFILE_IMAGE_FAILED);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        if (profileImageUrl !== undefined) {
            request.session.profileImageUrl = profileImageUrl ?? null;
        }
        request.session.nickname = nickname;

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.UPDATE_USER_DATA_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 비밀번호 변경
exports.changePassword = async (request, response, next) => {
    const { password } = request.body;
    const userId = request.userId;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const requestData = {
            userId,
            password: hashedPassword,
        };
        const responseData = await userModel.changePassword(requestData);

        if (!responseData) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.CHANGE_USER_PASSWORD_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 회원 탈퇴
exports.softDeleteUser = async (request, response, next) => {
    const userId = request.userId;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        const requestData = {
            userId,
        };
        const responseData = await userModel.softDeleteUser(requestData);

        if (responseData === null) {
            const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
            error.status = STATUS_CODE.NOT_FOUND;
            throw error;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.DELETE_USER_DATA_SUCCESS,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 이메일 중복 체크
exports.checkEmail = async (request, response, next) => {
    const { email } = request.query;

    try {
        const requestData = { email };

        const resData = await userModel.checkEmail(requestData);

        if (resData === null) {
            return response.status(STATUS_CODE.OK).json({
                code: STATUS_MESSAGE.AVAILABLE_EMAIL,
                data: null,
            });
        }

        const error = new Error(STATUS_MESSAGE.ALREADY_EXIST_EMAIL);
        error.status = STATUS_CODE.CONFLICT;
        throw error;
    } catch (error) {
        return next(error);
    }
};

// 닉네임 중복 체크
exports.checkNickname = async (request, response, next) => {
    const { nickname } = request.query;

    try {
        const requestData = { nickname };

        const responseData = await userModel.checkNickname(requestData);

        if (!responseData) {
            return response.status(STATUS_CODE.OK).json({
                code: STATUS_MESSAGE.AVAILABLE_NICKNAME,
                data: null,
            });
        }

        const error = new Error(STATUS_MESSAGE.ALREADY_EXIST_NICKNAME);
        error.status = STATUS_CODE.CONFLICT;
        throw error;
    } catch (error) {
        return next(error);
    }
};
