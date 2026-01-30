const express = require('express');
const multerUtil = require('../utils/multer.util.js');
const fileController = require('../controllers/file.controller.js');

const router = express.Router();

router.post(
    '/users/upload/profile-image',
    multerUtil.uploadProfile.single('profileImage'),
    fileController.uploadFile
);
router.post(
    '/posts/upload/attach-file',
    multerUtil.uploadPost.single('postFile'),
    fileController.uploadPostFile
);

module.exports = router;