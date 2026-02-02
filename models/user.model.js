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

const updateNickname = async (userId, nickname) => {
    const sql = `
        UPDATE user_table
        SET nickname = ?
        WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const results = await dbConnect.query(sql, [nickname, userId]);

    if (!results)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.NOT_FOUND_USER,
        );

    return results;
};

const clearProfileImage = async userId => {
    const sql = `
        UPDATE user_table
        SET file_id = NULL
        WHERE user_id = ? AND deleted_at IS NULL;
    `;
    await dbConnect.query(sql, [userId]);
};

const insertProfileImage = async (userId, profileImageUrl) => {
    const sql = `
        INSERT INTO file_table
        (user_id, file_path, file_category)
        VALUES (?, ?, 1);
    `;
    const results = await dbConnect.query(sql, [userId, profileImageUrl]);

    if (!results.insertId)
        throw createHttpError(
            STATUS_CODE.INTERNAL_SERVER_ERROR,
            STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        );

    return results.insertId;
};

const updateUserProfileImageId = async (userId, profileImageId) => {
    const sql = `
        UPDATE user_table
        SET file_id = ?
        WHERE user_id = ? AND deleted_at IS NULL;
    `;
    return dbConnect.query(sql, [profileImageId, userId]);
};

/**
 * 유저 정보 불러오기
 * 회원정보 수정
 * 비밀번호 변경
 * 회원 탈퇴
 * 이메일 중복 체크
 * 닉네임 중복 체크
 */

// 유저 정보 불러오기
exports.getUser = async requestData => {
    const { userId } = requestData;

    const sql = `
    SELECT user.*, COALESCE(file.path, NULL) AS path
    FROM user
    LEFT JOIN file ON user.file_id = file.file_id
    WHERE user.user_id = ? AND user.deleted_at IS NULL;
    `;
    const userData = await dbConnect.query(sql, [userId]);

    if (userData.length === 0) {
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.NOT_FOUND_USER,
        );
    }

    const results = {
        userId: userData[0].user_id,
        email: userData[0].email,
        nickname: userData[0].nickname,
        profileImageUrl: userData[0].path,
        created_at: userData[0].created_at,
    };
    return results;
};

// 회원정보 수정
exports.updateUser = async requestData => {
    const { userId, nickname, profileImageUrl } = requestData;

    await updateNickname(userId, nickname);

    if (profileImageUrl === undefined) return;
    if (profileImageUrl === null) {
        await clearProfileImage(userId);
        return;
    }

    const profileImageId = await insertProfileImage(userId, profileImageUrl);
    await updateUserProfileImageId(userId, profileImageId);
};


// 비밀번호 변경
exports.changePassword = async requestData => {
    const { userId, password } = requestData;

    const sql = `
    UPDATE user
    SET password = ?
    WHERE user_id = ?;
    `;
    const results = await dbConnect.query(sql, [password, userId]);

    if (!results.affectedRows)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.NOT_FOUND_USER,
        );
};

// 회원탈퇴
exports.softDeleteUser = async requestData => {
    const { userId } = requestData;
    const selectSql = `SELECT * FROM user WHERE user_id = ? AND deleted_at IS NULL;`;
    const selectResults = await dbConnect.query(selectSql, [userId]);

    if (!selectResults.length)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.NOT_FOUND_USER,
        );

    const updateSql = `UPDATE user SET deleted_at = now() WHERE user_id = ?;`;
    await dbConnect.query(updateSql, [userId]);
};

// 이메일 중복 체크
exports.checkEmail = async requestData => {
    const { email } = requestData;

    const taken = await isEmailTaken(email);
    if (!taken) return;
    throw createHttpError(
        STATUS_CODE.CONFLICT,
        STATUS_MESSAGE.ALREADY_EXIST_EMAIL,
    );
};

// 닉네임 중복 체크
exports.checkNickname = async requestData => {
    const { nickname } = requestData;

    const taken = await isNicknameTaken(nickname);
    if (!taken) return;
    throw createHttpError(
        STATUS_CODE.CONFLICT,
        STATUS_MESSAGE.ALREADY_EXIST_NICKNAME,
    );
};
