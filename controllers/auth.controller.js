const bcrypt = require('bcrypt');
const userModel = require('../models/user.model.js');
const {
    validEmail,
    validNickname,
    validPassword,
} = require('../utils/valid.util.js');
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
 * 로그인
 * 회원가입
 * 로그인 상태 체크
 * 로그아웃
 */

// 로그인
exports.loginUser = async (request, response, next) => {
    const { email, password } = request.body;

    try {
        const errors = {};
        if (!email) {
            addValidationError(errors, 'email', 'REQUIRED');
        } else if (!validEmail(email)) {
            addValidationError(errors, 'email', 'INVALID_FORMAT');
        }
        addPasswordValidationErrors(errors, password);
        if (Object.keys(errors).length > 0) {
            throw createValidationError(errors);
        }

        const requestData = {
            email,
            password,
        };
        const responseData = await userModel.loginUser(requestData, response);

        if (!responseData || responseData === null) {
            const error = new Error(STATUS_MESSAGE.INVALID_EMAIL_OR_PASSWORD);
            error.status = STATUS_CODE.UNAUTHORIZED;
            throw error;
        }

        await new Promise((resolve, reject) => {
            request.session.regenerate(err => {
                if (err) {
                    reject(err);
                    return;
                }
                request.session.userId = responseData.userId;
                request.session.email = responseData.email;
                request.session.nickname = responseData.nickname;
                request.session.profileImageUrl =
                    responseData.profileImageUrl ?? null;
                request.session.save(saveErr =>
                    saveErr ? reject(saveErr) : resolve(),
                );
            });
        });

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.LOGIN_SUCCESS,
            data: responseData,
        });
    } catch (error) {
        return next(error);
    }
};

// 회원가입
exports.signupUser = async (request, response, next) => {
    const { email, password, nickname, profileImageUrl } = request.body;

    try {
        const errors = {};
        if (!email) {
            addValidationError(errors, 'email', 'REQUIRED');
        } else if (!validEmail(email)) {
            addValidationError(errors, 'email', 'INVALID_FORMAT');
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

        addPasswordValidationErrors(errors, password);

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

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const reqSignupData = {
            email,
            password: hashedPassword,
            nickname,
            profileImageUrl: profileImageUrl || null,
        };

        const resSignupData = await userModel.signUpUser(reqSignupData);

        if (resSignupData === 'already_exist_email') {
            const error = new Error(STATUS_MESSAGE.ALREADY_EXIST_EMAIL);
            error.status = STATUS_CODE.CONFLICT;
            throw error;
        }

        if (resSignupData === null) {
            const error = new Error(STATUS_MESSAGE.SIGNUP_FAILED);
            error.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
            throw error;
        }

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.SIGNUP_SUCCESS,
            data: resSignupData,
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

        const requestData = {
            userId,
        };
        let email = request.session && request.session.email;
        let nickname = request.session && request.session.nickname;
        const hasSessionProfile =
            request.session &&
            Object.prototype.hasOwnProperty.call(
                request.session,
                'profileImageUrl',
            );
        let profileImageUrl =
            hasSessionProfile && request.session.profileImageUrl
                ? request.session.profileImageUrl
                : null;

        if (!email || !nickname || !hasSessionProfile) {
            const userData = hasSessionProfile
                ? await userModel.getUserSummary(requestData)
                : await userModel.getUser(requestData);

            if (!userData) {
                const error = new Error(STATUS_MESSAGE.NOT_FOUND_USER);
                error.status = STATUS_CODE.NOT_FOUND;
                throw error;
            }

            email = userData.email;
            nickname = userData.nickname;
            if (
                profileImageUrl === null &&
                userData.profileImageUrl !== undefined
            ) {
                profileImageUrl = userData.profileImageUrl;
            }

            request.session.email = email;
            request.session.nickname = nickname;
            request.session.profileImageUrl = profileImageUrl;
        }

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.AUTH_CHECK_SUCCESS,
            data: {
                userId,
                email,
                nickname,
                profileImageUrl,
                auth_status: true,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// 로그아웃
exports.logoutUser = async (request, response, next) => {
    try {
        request.session.destroy(async error => {
            if (error) {
                return next(error);
            }

            try {
                response.clearCookie('connect.sid');
                return response.status(STATUS_CODE.OK).json({
                    code: STATUS_MESSAGE.LOGOUT_SUCCESS,
                    data: null,
                });
            } catch (error) {
                return next(error);
            }
        });
    } catch (error) {
        return next(error);
    }
};
