const mysql = require('mysql2/promise');
const colors = require('colors');

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    waitForConnections: true,
};

/* DB Pool 생성 */
const pool = mysql.createPool(config);

const query = async (queryString, params = []) => {
    console.log(colors.yellow(queryString));

    const [rows] = await pool.execute(queryString, params);
    return rows;
};

module.exports = { config, pool, query };
