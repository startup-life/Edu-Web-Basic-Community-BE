const {
    STATUS_CODE,
    STATUS_MESSAGE
} = require('../constants/http-status-code.constant.js');
const { createValidationError } = require('../utils/error.util.js');
const addValidationError = (errors, field, code) => {
    if (!errors[field]) {
        errors[field] = [];
    }
    if (!errors[field].includes(code)) {
        errors[field].push(code);
    }
};

exports.uploadFile = (request, response, next) => {
    try {
        if (!request.file) {
            const errors = {};
            addValidationError(errors, 'file', 'REQUIRED');
            throw createValidationError(errors);
        }

        response.status(STATUS_CODE.CREATED).send({
            code: STATUS_MESSAGE.FILE_UPLOAD_SUCCESS,
            data: {
                profileImageUrl: `/public/image/profile/${request.file.filename}`
            }
        });
    } catch (error) {
        return next(error);
    }
};

exports.uploadPostFile = (request, response, next) => {
    try {
        if (!request.file) {
            const errors = {};
            addValidationError(errors, 'file', 'REQUIRED');
            throw createValidationError(errors);
        }

        response.status(STATUS_CODE.CREATED).send({
            code: STATUS_MESSAGE.FILE_UPLOAD_SUCCESS,
            data: {
                filePath: `/public/image/post/${request.file.filename}`
            }
        });
    } catch (error) {
        return next(error);
    }
};
