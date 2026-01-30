const express = require('express');
const postController = require('../controllers/post.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get('/posts', isLoggedIn, postController.getPosts);
router.get('/posts/:post_id', isLoggedIn, postController.getPost);
router.post('/posts', isLoggedIn, postController.writePost);
router.patch('/posts/:post_id', isLoggedIn, postController.updatePost);
router.delete('/posts/:post_id', isLoggedIn, postController.softDeletePost);

module.exports = router;
