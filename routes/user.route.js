const express = require('express');
const userController = require('../controllers/user.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');

const router = express.Router();

router.get('/users/:user_id', isLoggedIn, userController.getUser);
router.get('/users/email/check', userController.checkEmail);
router.get('/users/nickname/check', userController.checkNickname);

router.put('/users/:user_id', isLoggedIn, userController.updateUser);

router.patch(
    '/users/:user_id/password',
    isLoggedIn,
    userController.changePassword,
);

router.delete('/users/:user_id', isLoggedIn, userController.softDeleteUser);

module.exports = router;
