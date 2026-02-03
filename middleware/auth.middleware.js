const { STATUS_CODE, STATUS_MESSAGE } = require('../constants/http-status-code.constant.js');

const isLoggedIn = async (request, response, next) => {
    const userId = request.session && request.session.userId ? request.session.userId : null;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            return next(error);
        }
        request.userId = userId;
        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = isLoggedIn;
