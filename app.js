// express 모듈을 불러옵니다.
const express = require('express');

// connect-timeout 모듈을 불러옵니다.
const timeout = require('connect-timeout');

// express 애플리케이션을 생성합니다.
const app = express();

// 웹 서버가 사용할 포트 번호를 정의합니다.
const port = 3000;

// 요청 타임아웃 설정 (예: 5초)
app.use(timeout('5s'));

// 라우트 정의
app.get('/', (request, response) => {
    // 10초 후 응답을 보냅니다.
    setTimeout(() => {
        response.send('Hello World!');
    }, 10000);
});

// 타임아웃 발생 시 처리 핸들러
app.use((request, response, next) => {
    if (!request.timedout) next();
    else
        response.status(503).send({
            status: 503,
            message: 'Request_timeout',
            data: null,
        });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
