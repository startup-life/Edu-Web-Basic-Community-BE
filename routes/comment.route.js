const express = require('express');
const commentController = require('../controllers/comment.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');
const {
    getCommentsValidation,
    writeCommentValidation,
    updateCommentValidation,
    deleteCommentValidation,
} = require('../validators/comment.validator.js');
const { methodNotAllowed } = require('../middleware/method-not-allowed.middleware.js');

const router = express.Router();

router
    .route('/posts/:post_id/comments')
    .get(isLoggedIn, getCommentsValidation, commentController.getComments)
    .post(isLoggedIn, writeCommentValidation, commentController.writeComment)
    .all(methodNotAllowed);

router
    .route('/posts/:post_id/comments/:comment_id')
    .patch(isLoggedIn, updateCommentValidation, commentController.updateComment)
    .delete(isLoggedIn, deleteCommentValidation, commentController.softDeleteComment)
    .all(methodNotAllowed);

module.exports = router;
