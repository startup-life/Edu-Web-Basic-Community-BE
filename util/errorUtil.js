const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('./constant/httpStatusCode');

const createValidationError = errors => {
    const error = new Error(STATUS_MESSAGE.INVALID_INPUT);
    error.status = STATUS_CODE.UNPROCESSABLE_ENTITY;
    error.data = errors;
    return error;
};

module.exports = { createValidationError };
