const { body } = require('express-validator');
const { handleValidation } = require('./index.js');

const EMAIL_REGEX =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;

const emailValidation = body('email')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .matches(EMAIL_REGEX)
    .withMessage('INVALID_FORMAT');

const passwordValidation = body('password')
    .notEmpty()
    .withMessage('REQUIRED')
    .bail()
    .isLength({ min: 8 })
    .withMessage('TOO_SHORT')
    .bail()
    .isLength({ max: 20 })
    .withMessage('TOO_LONG')
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage('INVALID_FORMAT');

const nicknameValidation = body('nickname')
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

const profileImageUrlValidation = body('profileImageUrl')
    .optional({ values: 'null' })
    .isString()
    .withMessage('INVALID_FORMAT');

const loginValidation = [emailValidation, passwordValidation, handleValidation];

const signupValidation = [
    emailValidation,
    passwordValidation,
    nicknameValidation,
    profileImageUrlValidation,
    handleValidation,
];

module.exports = {
    loginValidation,
    signupValidation,
    emailValidation,
    passwordValidation,
    nicknameValidation,
    profileImageUrlValidation,
    EMAIL_REGEX,
    PASSWORD_REGEX,
    NICKNAME_REGEX,
};
