const express = require('express');
const authRoute = require('./auth.route.js'); // 인증 라우트
const userRoute = require('./user.route.js'); // 사용자 라우트
const postRoute = require('./post.route.js'); // 게시물 라우트
const fileRoute = require('./file.route.js'); // 파일 라우트
const commentRoute = require('./comment.route.js'); // 댓글 라우트

const router = express.Router();

// 각 라우트를 수동으로 설정
router.use(authRoute);
router.use(userRoute);
router.use(postRoute);
router.use(fileRoute);
router.use(commentRoute);

module.exports = router;
