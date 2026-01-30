const bcrypt = require('bcrypt');
const userModel = require('../models/user.model.js');
const { validEmail, validNickname, validPassword } = require('../utils/valid.util.js');
const { createValidationError } = require('../utils/error.util.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

const SALT_ROUNDS = 10;
const addValidationError = (errors, field, code) => {
    if (!errors[field]) {
        errors[field] = [];
    }
    if (!errors[field].includes(code)) {
        errors[field].push(code);
    }
};

const addPasswordValidationErrors = (errors, password) => {
    if (!password) {
        addValidationError(errors, 'password', 'REQUIRED');
        return;
    }
    if (password.length < 8) {
        addValidationError(errors, 'password', 'TOO_SHORT');
    } else if (password.length > 20) {
        addValidationError(errors, 'password', 'TOO_LONG');
    } else if (!validPassword(password)) {
        addValidationError(errors, 'password', 'INVALID_FORMAT');
    }
};

/**
 * 유저 정보 가져오기
 * 비밀번호 변경
 * 회원 탈퇴
 * 이메일 중복 체크
 * 닉네임 중복 체크
 */

// 유저 정보 가져오기
exports.getUser = async (request, response, next) => {
    const { user_id: userId } = request.params;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }
        if (
            request.userId &&
            parseInt(userId, 10) !== parseInt(request.userId, 10)
        ) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        const requestData = {
            userId,
        };
        const responseData = await userModel.getUser(requestData);

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
    const { user_id: userId } = request.params;
    const { nickname, profileImageUrl } = request.body;

    try {
        const errors = {};
        if (!userId) {
            addValidationError(errors, 'userId', 'REQUIRED');
        } else if (Number.isNaN(Number(userId))) {
            addValidationError(errors, 'userId', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }
        if (
            request.userId &&
            parseInt(userId, 10) !== parseInt(request.userId, 10)
        ) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        if (!nickname) {
            addValidationError(errors, 'nickname', 'REQUIRED');
        } else if (nickname.length < 2) {
            addValidationError(errors, 'nickname', 'TOO_SHORT');
        } else if (nickname.length > 10) {
            addValidationError(errors, 'nickname', 'TOO_LONG');
        } else if (!validNickname(nickname)) {
            addValidationError(errors, 'nickname', 'INVALID_FORMAT');
        }

        if (
            profileImageUrl !== undefined &&
            profileImageUrl !== null &&
            typeof profileImageUrl !== 'string'
        ) {
            addValidationError(errors, 'profileImageUrl', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
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
    const { user_id: userId } = request.params;
    const { password } = request.body;

    try {
        const errors = {};
        if (!userId) {
            addValidationError(errors, 'userId', 'REQUIRED');
        } else if (Number.isNaN(Number(userId))) {
            addValidationError(errors, 'userId', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }
        if (
            request.userId &&
            parseInt(userId, 10) !== parseInt(request.userId, 10)
        ) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        addPasswordValidationErrors(errors, password);
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
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
    const { user_id: userId } = request.params;

    try {
        const errors = {};
        if (!userId) {
            addValidationError(errors, 'userId', 'REQUIRED');
        } else if (Number.isNaN(Number(userId))) {
            addValidationError(errors, 'userId', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }
        if (
            request.userId &&
            parseInt(userId, 10) !== parseInt(request.userId, 10)
        ) {
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
        const errors = {};
        if (!email) {
            addValidationError(errors, 'email', 'REQUIRED');
        } else if (!validEmail(email)) {
            addValidationError(errors, 'email', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

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
        const errors = {};
        if (!nickname) {
            addValidationError(errors, 'nickname', 'REQUIRED');
        } else if (nickname.length < 2) {
            addValidationError(errors, 'nickname', 'TOO_SHORT');
        } else if (nickname.length > 10) {
            addValidationError(errors, 'nickname', 'TOO_LONG');
        } else if (!validNickname(nickname)) {
            addValidationError(errors, 'nickname', 'INVALID_FORMAT');
        }
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

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
