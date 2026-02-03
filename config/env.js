const requiredEnv = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
    'DB_PORT',
    'SESSION_SECRET',
    'BACKEND_PORT',
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    throw new Error(`Missing env vars: ${missingEnv.join(', ')}`);
}

module.exports = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_PORT: process.env.DB_PORT,
    SESSION_SECRET: process.env.SESSION_SECRET,
    BACKEND_PORT: process.env.BACKEND_PORT,
    FRONTEND_ORIGINS: process.env.FRONTEND_ORIGINS,
    NODE_ENV: process.env.NODE_ENV,
};
