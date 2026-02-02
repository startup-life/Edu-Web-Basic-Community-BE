const express = require('express');
const userController = require('../controllers/user.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');
const {
    getUserValidation,
    updateUserValidation,
    changePasswordValidation,
    deleteUserValidation,
    checkEmailValidation,
    checkNicknameValidation,
} = require('../validators/user.validator.js');
const { methodNotAllowed } = require('../middleware/method-not-allowed.middleware.js');

const router = express.Router();

router
    .route('/users/:user_id')
    .get(isLoggedIn, getUserValidation, userController.getUser)
    .put(isLoggedIn, updateUserValidation, userController.updateUser)
    .delete(isLoggedIn, deleteUserValidation, userController.softDeleteUser)
    .all(methodNotAllowed);

router
    .route('/users/:user_id/password')
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
