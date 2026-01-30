const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

const createValidationError = errors => {
    const error = new Error(STATUS_MESSAGE.INVALID_INPUT);
    error.status = STATUS_CODE.UNPROCESSABLE_ENTITY;
    error.data = errors;
    return error;
};

module.exports = { createValidationError };
