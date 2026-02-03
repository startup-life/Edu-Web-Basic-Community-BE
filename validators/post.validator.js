const { body, param, query } = require('express-validator');
const { handleValidation } = require('./index.js');

const postIdParamValidation = param('post_id')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isInt()
    .withMessage('INVALID_FORMAT');

const titleValidation = body('title')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isLength({ max: 26 })
    .withMessage('TOO_LONG');

const contentValidation = body('content')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isLength({ max: 1500 })
    .withMessage('TOO_LONG');

const offsetValidation = query('offset')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isInt()
    .withMessage('INVALID_FORMAT');

const limitValidation = query('limit')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isInt()
    .withMessage('INVALID_FORMAT');

const getPostsValidation = [offsetValidation, limitValidation, handleValidation];

const getPostValidation = [postIdParamValidation, handleValidation];

const writePostValidation = [titleValidation, contentValidation, handleValidation];

const updatePostValidation = [
    postIdParamValidation,
    titleValidation,
    contentValidation,
    handleValidation,
];

const deletePostValidation = [postIdParamValidation, handleValidation];

module.exports = {
    getPostsValidation,
    getPostValidation,
    writePostValidation,
    updatePostValidation,
    deletePostValidation,
    postIdParamValidation,
};
