// express 모듈을 불러옵니다.
const express = require('express');
// express 애플리케이션을 생성합니다.
const app = express();
// 웹 서버가 사용할 포트 번호를 정의합니다.
const port = 3000;

// response.send() 사용
app.get('/send', (request, response) => {
    return response.send('Hello, this is response.send()!');
});

// response.json() 사용
app.get('/json', (request, response) => {
    return response.status(200).json({
        status: 200,
        message: 'Hello, this is response.json()!',
        data: null
    });
});

// response.end() 사용
app.get('/end', (request, response) => {
    return response.end();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
