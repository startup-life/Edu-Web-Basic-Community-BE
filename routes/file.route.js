const express = require('express');
const multerUtil = require('../utils/multer.util.js');
const fileController = require('../controllers/file.controller.js');
const { methodNotAllowed } = require('../middleware/method-not-allowed.middleware.js');

const router = express.Router();

router
    .route('/users/upload/profile-image')
    .post(
        multerUtil.uploadProfile.single('profileImage'),
        fileController.uploadFile
    )
    .all(methodNotAllowed);

router
    .route('/posts/upload/attach-file')
    .post(
        multerUtil.uploadPost.single('postFile'),
        fileController.uploadPostFile
    )
    .all(methodNotAllowed);

module.exports = router;
