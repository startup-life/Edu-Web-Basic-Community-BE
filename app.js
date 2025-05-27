const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // JSON 요청 본문 처리를 위해 express의 json 미들웨어 사용

app.get('/', (request, response) => {
    return response.status(200).send('GET 요청에 성공했습니다.');
});

app.post('/', (request, response) => {
    return response.status(201).json({
        status: 201,
        message: 'POST 요청에 성공했습니다.',
        data: request.body
    });
});

app.put('/', (request, response) => {
    return response.status(200).json({
        status: 200,
        message: 'PUT 요청에 성공했습니다.',
        data: request.body
    });
});

app.patch('/', (request, response) => {
    return response.status(200).json({
        status: 200,
        message: 'PATCH 요청에 성공했습니다.',
        data: request.body
    });
});

app.delete('/', (request, response) => {
    return response.status(204).end();
});

app.listen(port, () => {
    console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});