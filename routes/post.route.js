const express = require('express');
const postController = require('../controllers/post.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');
const {
    getPostsValidation,
    getPostValidation,
    writePostValidation,
    updatePostValidation,
    deletePostValidation,
    likePostValidation,
    searchPostsValidation,
} = require('../validators/post.validator.js');
const { methodNotAllowed } = require('../middleware/method-not-allowed.middleware.js');

const router = express.Router();

router
    .route('/posts')
    .get(isLoggedIn, getPostsValidation, postController.getPosts)
    .post(isLoggedIn, writePostValidation, postController.writePost)
    .all(methodNotAllowed);

router
    .route('/posts/search')
    .get(isLoggedIn, searchPostsValidation, postController.searchPosts)
    .all(methodNotAllowed);

router
    .route('/posts/:postId')
    .get(isLoggedIn, getPostValidation, postController.getPost)
    .patch(isLoggedIn, updatePostValidation, postController.updatePost)
    .delete(isLoggedIn, deletePostValidation, postController.softDeletePost)
    .all(methodNotAllowed);

router
    .route('/posts/:postId/likes')
    .post(isLoggedIn, likePostValidation, postController.likePost)
    .delete(isLoggedIn, likePostValidation, postController.unlikePost)
    .all(methodNotAllowed);

module.exports = router;
