const dbConnect = require('../databases/index.js');
const { STATUS_MESSAGE } = require('../constants/http-status-code.constant.js');
const {
    isEmailTaken,
    isNicknameTaken,
} = require('../utils/user-duplicate.util.js');

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
        return null;
    }

    const results = {
        userId: userData[0].user_id,
        email: userData[0].email,
        nickname: userData[0].nickname,
        profileImageUrl: userData[0].path,
        created_at: userData[0].created_at,
        updated_at: userData[0].updated_at,
        deleted_at: userData[0].deleted_at,
    };
    return results;
};

// 회원정보 수정
exports.updateUser = async requestData => {
    const { userId, nickname, profileImageUrl } = requestData;

    const updateUserSql = `
        UPDATE user
        SET nickname = ?
        WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const updateUserResults = await dbConnect.query(updateUserSql, [
        nickname,
        userId,
    ]);

    if (!updateUserResults) return null;

    if (profileImageUrl === undefined) return updateUserResults;
    if (profileImageUrl === null) {
        const clearProfileSql = `
        UPDATE user
        SET file_id = NULL
        WHERE user_id = ? AND deleted_at IS NULL;
        `;
        await dbConnect.query(clearProfileSql, [userId]);
        return updateUserResults;
    }

    const profileImageSql = `
        INSERT INTO file
        (user_id, path, category)
        VALUES (?, ?, 1);
    `;
    const profileImageResults = await dbConnect.query(profileImageSql, [
        userId,
        profileImageUrl,
    ]);

    if (!profileImageResults.insertId)
        return STATUS_MESSAGE.UPDATE_PROFILE_IMAGE_FAILED;

    const userProfileSql = `
        UPDATE user
        SET file_id = ?
        WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const userProfileResults = await dbConnect.query(userProfileSql, [
        profileImageResults.insertId,
        userId,
    ]);

    return userProfileResults;
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

    if (!results.affectedRows) return null;

    return results;
};

// 회원탈퇴
exports.softDeleteUser = async requestData => {
    const { userId } = requestData;
    const selectSql = `SELECT * FROM user WHERE user_id = ? AND deleted_at IS NULL;`;
    const selectResults = await dbConnect.query(selectSql, [userId]);

    if (!selectResults.length) return null;

    const updateSql = `UPDATE user SET deleted_at = now() WHERE user_id = ?;`;
    await dbConnect.query(updateSql, [userId]);

    return selectResults[0];
};

// 이메일 중복 체크
exports.checkEmail = async requestData => {
    const { email } = requestData;

    const taken = await isEmailTaken(email);
    if (!taken) return null;
    return { email };
};

// 닉네임 중복 체크
exports.checkNickname = async requestData => {
    const { nickname } = requestData;

    const taken = await isNicknameTaken(nickname);
    if (!taken) return null;
    return { nickname };
};
