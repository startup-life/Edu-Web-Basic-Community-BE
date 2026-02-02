const dbConnect = require('../databases/index.js');

const isEmailTaken = async email => {
    const sql = `SELECT 1 FROM user_table WHERE email = ? LIMIT 1;`;
    const results = await dbConnect.query(sql, [email]);
    return results.length !== 0;
};

const isNicknameTaken = async nickname => {
    const sql = `SELECT 1 FROM user_table WHERE nickname = ? LIMIT 1;`;
    const results = await dbConnect.query(sql, [nickname]);
    return results.length !== 0;
};

module.exports = { isEmailTaken, isNicknameTaken };
