const bcrypt = require('bcrypt');
const dbConnect = require('../databases/index.js');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const { createHttpError } = require('../utils/error.util.js');
const {
    isEmailTaken,
    isNicknameTaken,
} = require('../utils/user-duplicate.util.js');

/** 헬퍼 함수
 * 유저 추가
 * 프로필 이미지 파일 추가
 * 유저 프로필 이미지 파일 ID 업데이트
 */

// 유저 추가
const insertUser = async (email, password, nickname) => {
    const insertUserSql = `
    INSERT INTO users (email, password, nickname)
    VALUES (?, ?, ?);
    `;
    const userResults = await dbConnect.query(insertUserSql, [
        email,
        password,
        nickname,
    ]);

    return userResults.insertId || null;
};

// 프로필 이미지 파일 추가
const insertProfileFile = async (userId, profileImageUrl) => {
    const insertFileSql = `
    INSERT INTO files (user_id, path, category)
    VALUES (?, ?, 1);
    `;
    const fileResults = await dbConnect.query(insertFileSql, [
        userId,
        profileImageUrl,
    ]);

    return fileResults.insertId || null;
};

// 유저 프로필 이미지 파일 ID 업데이트
const updateUserProfileImageId = async (userId, profileImageId) => {
    const updateUserSql = `
    UPDATE users
    SET file_id = ?
    WHERE id = ?;
    `;
    await dbConnect.query(updateUserSql, [profileImageId, userId]);
};


/**
 * 회원가입
 * 로그인
 * 유저 기본 정보 불러오기 (세션 기반 체크용)
 */

// 회원가입
exports.signUpUser = async requestData => {
    const { email, password, nickname, profileImageUrl } = requestData;

    const emailTaken = await isEmailTaken(email);
    if (emailTaken)
        throw createHttpError(
            STATUS_CODE.CONFLICT,
            STATUS_MESSAGE.ALREADY_EXIST_EMAIL,
        );

    const nicknameTaken = await isNicknameTaken(nickname);
    if (nicknameTaken)
        throw createHttpError(
            STATUS_CODE.CONFLICT,
            STATUS_MESSAGE.ALREADY_EXIST_NICKNAME,
        );

    const userId = await insertUser(email, password, nickname);
    if (!userId)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    if (profileImageUrl) {
        const profileImageId = await insertProfileFile(userId, profileImageUrl);
        if (profileImageId) {
            await updateUserProfileImageId(userId, profileImageId);
        }
    }
};

// 로그인
exports.loginUser = async (requestData, response) => {
    const { email, password } = requestData;

    const sql = `
    SELECT
        users.id AS user_id,
        users.email,
        users.nickname,
        users.password,
        COALESCE(files.path, NULL) AS profileImageUrl
    FROM users
    LEFT JOIN files
        ON users.file_id = files.id
        AND files.deleted_at IS NULL
        AND files.category = 1
    WHERE users.email = ? AND users.deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [email]);

    if (!results[0] || results[0] === 'undefined' || results[0] === undefined)
        throw createHttpError(
            STATUS_CODE.UNAUTHORIZED,
            STATUS_MESSAGE.INVALID_CREDENTIALS,
        );

    const match = await bcrypt.compare(password, results[0].password);
    if (!match)
        throw createHttpError(
            STATUS_CODE.UNAUTHORIZED,
            STATUS_MESSAGE.INVALID_CREDENTIALS,
        );

    const user = {
        userId: results[0].user_id,
        email: results[0].email,
        nickname: results[0].nickname,
        profileImageUrl: results[0].profileImageUrl ?? null,
    };

    return user;
};
