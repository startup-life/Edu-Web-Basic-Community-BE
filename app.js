// express 모듈을 불러옵니다.
const express = require('express');
// express-rate-limit 모듈을 불러옵니다.
const rateLimit = require('express-rate-limit');

// express 애플리케이션을 생성합니다.
const app = express();

// 웹 서버가 사용할 포트 번호를 정의합니다.
const port = 3000;

// 요청 속도 제한 설정
const limiter = rateLimit({
    // 1분 동안
    windowMs: 1 * 60 * 1000,
    // 최대 5개의 요청을 허용
    max: 5,
    // 제한 초과 시 전송할 메시지
    message: 'too_many_requests',
    // RateLimit 헤더 정보를 표준으로 사용할지 여부
    standardHeaders: true,
    // 레거시 X-RateLimit 헤더를 제거할지 여부
    legacyHeaders: false,
});

// 모든 요청에 대해 요청 속도 제한 적용
app.use(limiter);

// 라우트 정의
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});