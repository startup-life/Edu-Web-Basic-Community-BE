// express 모듈을 불러옵니다.
const express = require('express');
// express 애플리케이션을 생성합니다.
const app = express();
// 웹 서버가 사용할 포트 번호를 정의합니다.
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/**
 * 루트 경로('/')에 대한 GET 요청을 처리
 * 요청이 오면 'Hello World!' 문자열을 응답
 */
app.get('/', (request, response) => {
    // 응답.보내다('Hello World!');
    response.send('Hello World!');
});

app.post('/users', (request, response) => {
    const name = request.body.name;
    const email = request.body.email;

    return response.send(`${name}, ${email}`);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});