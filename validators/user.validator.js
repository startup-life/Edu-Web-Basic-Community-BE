const { query } = require('express-validator');
const { handleValidation } = require('./index.js');
const {
    emailValidation,
    passwordValidation,
    nicknameValidation,
    profileImageUrlValidation,
    EMAIL_REGEX,
    NICKNAME_REGEX,
} = require('./auth.validator.js');

const emailQueryValidation = query('email')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .matches(EMAIL_REGEX)
    .withMessage('INVALID_FORMAT');

const nicknameQueryValidation = query('nickname')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isLength({ min: 2 })
    .withMessage('TOO_SHORT')
    .bail()
    .isLength({ max: 10 })
    .withMessage('TOO_LONG')
    .bail()
    .matches(NICKNAME_REGEX)
    .withMessage('INVALID_FORMAT');

const updateUserValidation = [
    nicknameValidation,
    profileImageUrlValidation,
    handleValidation,
];

const changePasswordValidation = [
    passwordValidation,
    handleValidation,
];

const deleteUserValidation = [handleValidation];

const checkEmailValidation = [emailQueryValidation, handleValidation];

const checkNicknameValidation = [nicknameQueryValidation, handleValidation];

module.exports = {
    updateUserValidation,
    changePasswordValidation,
    deleteUserValidation,
    checkEmailValidation,
    checkNicknameValidation,
};
