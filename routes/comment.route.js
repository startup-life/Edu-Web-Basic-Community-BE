const express = require('express');
const commentController = require('../controllers/comment.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get(
    '/posts/:post_id/comments',
    isLoggedIn,
    commentController.getComments,
);
router.post(
    '/posts/:post_id/comments',
    isLoggedIn,
    commentController.writeComment,
);
router.patch(
    '/posts/:post_id/comments/:comment_id',
    isLoggedIn,
    commentController.updateComment,
);
router.delete(
    '/posts/:post_id/comments/:comment_id',
    isLoggedIn,
    commentController.softDeleteComment,
);

module.exports = router;
