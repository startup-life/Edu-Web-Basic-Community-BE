const bcrypt = require('bcrypt');
const userModel = require('../models/user.model.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const { pathToUrl, urlToPath } = require('../utils/url.util.js');

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
        const responseData = await userModel.getUser({ userId });

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.USER_RETRIEVED,
            data: {
                ...responseData,
                profileImageUrl: pathToUrl(
                    request,
                    responseData.profileImageUrl,
                ),
            },
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
        const normalizedProfileImageUrl =
            profileImageUrl === undefined
                ? undefined
                : urlToPath(profileImageUrl);

        const requestData = {
            userId,
            nickname,
            profileImageUrl: normalizedProfileImageUrl,
        };
        await userModel.updateUser(requestData);

        if (normalizedProfileImageUrl !== undefined) {
            request.session.profileImageUrl =
                normalizedProfileImageUrl === null
                    ? null
                    : normalizedProfileImageUrl;
        }
        request.session.nickname = nickname;

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.USER_UPDATED,
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
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const requestData = {
            userId,
            password: hashedPassword,
        };
        await userModel.changePassword(requestData);

        return response.status(STATUS_CODE.CREATED).json({
            code: STATUS_MESSAGE.USER_PASSWORD_UPDATED,
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
        const requestData = {
            userId,
        };
        await userModel.softDeleteUser(requestData);

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.USER_DELETED,
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

        await userModel.checkEmail(requestData);

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.AVAILABLE_EMAIL,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};

// 닉네임 중복 체크
exports.checkNickname = async (request, response, next) => {
    const { nickname } = request.query;

    try {
        const requestData = { nickname };

        await userModel.checkNickname(requestData);

        return response.status(STATUS_CODE.OK).json({
            code: STATUS_MESSAGE.AVAILABLE_NICKNAME,
            data: null,
        });
    } catch (error) {
        return next(error);
    }
};
