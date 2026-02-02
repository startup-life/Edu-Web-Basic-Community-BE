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

// 닉네임 업데이트
const updateNickname = async (userId, nickname) => {
    const sql = `
        UPDATE users
        SET nickname = ?
        WHERE id = ? AND deleted_at IS NULL;
    `;
    await dbConnect.query(sql, [nickname, userId]);
    return;
};

// 프로필 이미지 삭제
const clearProfileImage = async userId => {
    const sql = `
        UPDATE users
        SET file_id = NULL
        WHERE id = ? AND deleted_at IS NULL;
    `;
    await dbConnect.query(sql, [userId]);
    return;
};

// 프로필 이미지 파일 추가
const insertProfileImage = async (userId, profileImageUrl) => {
    const sql = `
        INSERT INTO files
        (user_id, path, category)
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

// 유저 프로필 이미지 파일 ID 업데이트
const updateUserProfileImageId = async (userId, profileImageId) => {
    const sql = `
        UPDATE users
        SET file_id = ?
        WHERE id = ? AND deleted_at IS NULL;
    `;
    await dbConnect.query(sql, [profileImageId, userId]);
    return;
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
    SELECT users.*, COALESCE(files.path, NULL) AS path
    FROM users
    LEFT JOIN files ON users.file_id = files.id
    WHERE users.id = ? AND users.deleted_at IS NULL;
    `;
    const userData = await dbConnect.query(sql, [userId]);

    const results = {
        userId: userData[0].id,
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
    return;
};


// 비밀번호 변경
exports.changePassword = async requestData => {
    const { userId, password } = requestData;

    const sql = `
    UPDATE users
    SET password = ?
    WHERE id = ?;
    `;
    await dbConnect.query(sql, [password, userId]);
    return;
};

// 회원탈퇴
exports.softDeleteUser = async requestData => {
    const { userId } = requestData;
    const selectSql = `SELECT * FROM users WHERE id = ? AND deleted_at IS NULL;`;
    const selectResults = await dbConnect.query(selectSql, [userId]);

    if (!selectResults.length)
        throw createHttpError(
            STATUS_CODE.NOT_FOUND,
            STATUS_MESSAGE.NOT_FOUND_USER,
        );

    const updateSql = `UPDATE users SET deleted_at = now() WHERE id = ?;`;
    await dbConnect.query(updateSql, [userId]);
    return;
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
