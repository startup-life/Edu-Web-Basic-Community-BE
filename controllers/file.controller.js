const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

exports.uploadFile = (request, response, next) => {
    try {
        if (!request.file) {
            const error = new Error(STATUS_MESSAGE.INVALID_INPUT);
            error.status = STATUS_CODE.UNPROCESSABLE_ENTITY;
            error.data = { file: ['REQUIRED'] };
            throw error;
        }

        response.status(STATUS_CODE.CREATED).send({
            code: STATUS_MESSAGE.FILE_UPLOAD_SUCCESS,
            data: {
                profileImageUrl: `/public/image/profile/${request.file.filename}`,
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
            error.data = { file: ['REQUIRED'] };
            throw error;
        }

        response.status(STATUS_CODE.CREATED).send({
            code: STATUS_MESSAGE.FILE_UPLOAD_SUCCESS,
            data: {
                filePath: `/public/image/post/${request.file.filename}`,
            },
        });
    } catch (error) {
        return next(error);
    }
};
