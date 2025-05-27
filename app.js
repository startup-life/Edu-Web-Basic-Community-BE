// express 모듈을 불러옵니다.
const express = require('express');
// helmet 모듈을 불러옵니다.
const helmet = require('helmet');

// express 애플리케이션을 생성합니다.
const app = express();

// 웹 서버가 사용할 포트 번호를 정의합니다.
const port = 3000;

// helmet 미들웨어를 적용합니다.
app.use(helmet());

// 라우트 정의
app.get('/', (request, response) => {
    return response.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});