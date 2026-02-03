const { body, param } = require('express-validator');
const { handleValidation } = require('./index.js');
const { postIdParamValidation } = require('./post.validator.js');

const commentIdParamValidation = param('commentId')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isInt()
    .withMessage('INVALID_FORMAT');

const commentContentValidation = body('commentContent')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isLength({ max: 1000 })
    .withMessage('TOO_LONG');

const getCommentsValidation = [postIdParamValidation, handleValidation];

const writeCommentValidation = [
    postIdParamValidation,
    commentContentValidation,
    handleValidation,
];

const updateCommentValidation = [
    postIdParamValidation,
    commentIdParamValidation,
    commentContentValidation,
    handleValidation,
];

const deleteCommentValidation = [
    postIdParamValidation,
    commentIdParamValidation,
    handleValidation,
];

module.exports = {
    getCommentsValidation,
    writeCommentValidation,
    updateCommentValidation,
    deleteCommentValidation,
};
