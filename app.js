require('dotenv').config({ path: './.env' });
require('./config/env.js');

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const route = require('./routes/index.js');
const { errorHandler } = require('./middleware/error-handler.middleware.js');
const timeout = require('connect-timeout');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('./constants/http-status-code.constant.js');

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;
const CORS_ERROR_MESSAGE = 'Not allowed by CORS';
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS ||
    'http://localhost:8080')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// CORS 설정
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || FRONTEND_ORIGINS.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(CORS_ERROR_MESSAGE));
        },
        credentials: true,
    }),
);

if (IS_PRODUCTION) {
    app.set('trust proxy', 1);
}

// 요청 속도 제한 설정
const limiter = rateLimit({
    // 10초동안
    windowMs: 10 * 1000,
    // 최대 100번의 요청을 허용
    max: 20,
    // 제한 초과 시 전송할 응답
    handler: (request, response, _next) => {
        response.status(STATUS_CODE.TOO_MANY_REQUESTS).json({
            code: STATUS_MESSAGE.RATE_LIMIT_EXCEEDED,
            data: null,
        });
    },
    // RateLimit 헤더 정보를 표준으로 사용할 지 여부
    standardHeaders: true,
    // 레거시 X-RateLimit 헤더를 제거할 지 여부
    legacyHeaders: false
});

// 정적 파일 경로 설정
app.use('/public', express.static('public'));

// JSON 및 URL-encoded 요청 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: IS_PRODUCTION ? 'none' : 'lax',
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// Timeout 설정
app.use(timeout('10s'));

// 요청 속도 제한 미들웨어
app.use(limiter);

// helmet
app.use(helmet());

// Routes
app.use('/v1', route);

// CORS Error Handler
app.use((error, request, response, next) => {
    if (error && error.message === CORS_ERROR_MESSAGE) {
        return response.status(STATUS_CODE.FORBIDDEN).json({
            code: STATUS_MESSAGE.CORS_NOT_ALLOWED,
            data: null,
        });
    }
    return next(error);
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`edu-community app listening on port ${PORT}`);
});
