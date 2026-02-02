const express = require('express');
const postController = require('../controllers/post.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');
const {
    getPostsValidation,
    getPostValidation,
    writePostValidation,
    updatePostValidation,
    deletePostValidation,
} = require('../validators/post.validator.js');
const { methodNotAllowed } = require('../middleware/method-not-allowed.middleware.js');

const router = express.Router();

router
    .route('/posts')
    .get(isLoggedIn, getPostsValidation, postController.getPosts)
    .post(isLoggedIn, writePostValidation, postController.writePost)
    .all(methodNotAllowed);

router
    .route('/posts/:post_id')
    .get(isLoggedIn, getPostValidation, postController.getPost)
    .patch(isLoggedIn, updatePostValidation, postController.updatePost)
    .delete(isLoggedIn, deletePostValidation, postController.softDeletePost)
    .all(methodNotAllowed);

module.exports = router;
