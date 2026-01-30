const express = require('express');
const authController = require('../controller/authController.js');
const isLoggedIn = require('../util/authUtil.js');

const router = express.Router();

router.post('/auth/signup', authController.signupUser);
router.post('/auth/login', authController.loginUser);
router.post('/auth/logout', isLoggedIn, authController.logoutUser);
router.get('/auth/check', isLoggedIn, authController.checkAuth);

module.exports = router;
