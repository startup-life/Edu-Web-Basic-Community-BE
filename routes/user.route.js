const express = require('express');
const userController = require('../controllers/user.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');
const {
    updateUserValidation,
    changePasswordValidation,
    deleteUserValidation,
    checkEmailValidation,
    checkNicknameValidation,
} = require('../validators/user.validator.js');
const { methodNotAllowed } = require('../middleware/method-not-allowed.middleware.js');

const router = express.Router();

router
    .route('/users/me')
    .get(isLoggedIn, userController.getUser)
    .put(isLoggedIn, updateUserValidation, userController.updateUser)
    .delete(isLoggedIn, deleteUserValidation, userController.softDeleteUser)
    .all(methodNotAllowed);

router
    .route('/users/me/password')
    .patch(isLoggedIn, changePasswordValidation, userController.changePassword)
    .all(methodNotAllowed);

router
    .route('/users/email/check')
    .get(checkEmailValidation, userController.checkEmail)
    .all(methodNotAllowed);

router
    .route('/users/nickname/check')
    .get(checkNicknameValidation, userController.checkNickname)
    .all(methodNotAllowed);

module.exports = router;
