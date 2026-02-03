const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');
const { pathToUrl } = require('../utils/url.util.js');

exports.uploadFile = (request, response, next) => {
    try {
        if (!request.file) {
            const error = new Error(STATUS_MESSAGE.INVALID_INPUT);
            error.status = STATUS_CODE.UNPROCESSABLE_ENTITY;
            error.data = { profileImage: ['REQUIRED'] };
            throw error;
        }

        const profileImagePath = `/public/image/profile/${request.file.filename}`;

        response.status(STATUS_CODE.CREATED).send({
            code: STATUS_MESSAGE.PROFILE_IMAGE_UPLOADED,
            data: {
                profileImageUrl: pathToUrl(request, profileImagePath),
            },
        });
    } catch (error) {
        return next(error);
    }
};

exports.uploadPostFile = (request, response, next) => {
    try {
        if (!request.file) {
            const error = new Error(STATUS_MESSAGE.INVALID_INPUT);
            error.status = STATUS_CODE.UNPROCESSABLE_ENTITY;
            error.data = { postFile: ['REQUIRED'] };
            throw error;
        }

        const filePath = `/public/image/post/${request.file.filename}`;

        response.status(STATUS_CODE.CREATED).send({
            code: STATUS_MESSAGE.FILE_UPLOAD_SUCCESS,
            data: {
                fileUrl: pathToUrl(request, filePath),
            },
        });
    } catch (error) {
        return next(error);
    }
};
