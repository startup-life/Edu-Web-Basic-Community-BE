const express = require('express');
const authController = require('../controllers/auth.controller.js');
const isLoggedIn = require('../middleware/auth.middleware.js');
const { methodNotAllowed } = require('../middleware/method-not-allowed.middleware.js');
const {
    loginValidation,
    signupValidation,
} = require('../validators/auth.validator.js');

const router = express.Router();

router
    .route('/auth/signup')
    .post(signupValidation, authController.signupUser)
    .all(methodNotAllowed);

router
    .route('/auth/login')
    .post(loginValidation, authController.loginUser)
    .all(methodNotAllowed);

router
    .route('/auth/logout')
    .post(isLoggedIn, authController.logoutUser)
    .all(methodNotAllowed);

router
    .route('/auth/check')
    .get(isLoggedIn, authController.checkAuth)
    .all(methodNotAllowed);

module.exports = router;
