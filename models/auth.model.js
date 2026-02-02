const bcrypt = require('bcrypt');
const dbConnect = require('../databases/index.js');
const {
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

/**
 * 회원가입
 * 로그인
 * 유저 기본 정보 불러오기 (세션 기반 체크용)
 */

// 회원가입
exports.signUpUser = async requestData => {
    const { email, password, nickname, profileImageUrl } = requestData;

    const checkEmailSql = `SELECT email FROM user_table WHERE email = ?;`;
    const checkEmailResults = await dbConnect.query(checkEmailSql, [email]);

    const checkNicknameSql = `SELECT nickname FROM user_table WHERE nickname = ?;`;
    const checkNicknameResults = await dbConnect.query(checkNicknameSql, [nickname ]);

    if (checkEmailResults.length !== 0) return STATUS_MESSAGE.ALREADY_EXIST_EMAIL;
    if (checkNicknameResults.length !== 0) return STATUS_MESSAGE.ALREADY_EXIST_NICKNAME;

    const insertUserSql = `
    INSERT INTO user_table (email, password, nickname)
    VALUES (?, ?, ?);
    `;
    const userResults = await dbConnect.query(insertUserSql, [
        email,
        password,
        nickname,
    ]);

    if (!userResults.insertId) return null;

    let profileImageId = null;
    if (profileImageUrl) {
        const insertFileSql = `
        INSERT INTO file_table (user_id, file_path, file_category)
        VALUES (?, ?, 1);
        `;
        const fileResults = await dbConnect.query(insertFileSql, [
            userResults.insertId,
            profileImageUrl,
        ]);

        if (fileResults.insertId) {
            profileImageId = fileResults.insertId;

            const updateUserSql = `
            UPDATE user_table
            SET file_id = ?
            WHERE user_id = ?;
            `;
            await dbConnect.query(updateUserSql, [
                profileImageId,
                userResults.insertId,
            ]);
        }
    }
};

// 로그인
exports.loginUser = async (requestData, response) => {
    const { email, password } = requestData;

    const sql = `SELECT * FROM user_table WHERE email = ? AND deleted_at IS NULL;`;
    const results = await dbConnect.query(sql, [email], response);

    if (!results[0] || results[0] === 'undefined' || results[0] === undefined)
        return null;

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return null;

    let profileImageUrl = null;
    if (results[0].file_id !== null) {
        const profileSql = `SELECT file_path FROM file_table WHERE file_id = ? AND deleted_at IS NULL AND file_category = 1;`;
        const profileResults = await dbConnect.query(
            profileSql,
            [results[0].file_id],
            response,
        );
        if (profileResults && profileResults[0]) {
            profileImageUrl = profileResults[0].file_path;
        }
    }

    const user = {
        userId: results[0].user_id,
        email: results[0].email,
        nickname: results[0].nickname,
        profileImageUrl,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        deleted_at: results[0].deleted_at,
    };

    return user;
};

// 유저 기본 정보 불러오기 (세션 기반 체크용)
exports.getUserSummary = async requestData => {
    const { userId } = requestData;

    const sql = `
    SELECT user_id, email, nickname
    FROM user_table
    WHERE user_id = ? AND deleted_at IS NULL;
    `;
    const userData = await dbConnect.query(sql, [userId]);

    if (!userData || userData.length === 0) return null;

    return {
        userId: userData[0].user_id,
        email: userData[0].email,
        nickname: userData[0].nickname,
        profileImageUrl: null,
    };
};
