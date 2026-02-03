const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

const methodNotAllowed = (request, response) => {
    return response.status(STATUS_CODE.METHOD_NOT_ALLOWED).json({
        code: STATUS_MESSAGE.METHOD_NOT_ALLOWED,
        data: null,
    });
};

module.exports = { methodNotAllowed };
