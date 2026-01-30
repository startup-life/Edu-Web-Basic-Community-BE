const { STATUS_CODE, STATUS_MESSAGE } = require('../constants/http-status-code.constant.js');

const isLoggedIn = async (req, res, next) => {
    const userId = req.session && req.session.userId ? req.session.userId : null;

    try {
        if (!userId) {
            const error = new Error(STATUS_MESSAGE.REQUIRED_AUTHORIZATION);
            error.status = STATUS_CODE.UNAUTHORIZED;
            return next(error);
        }
        req.userId = userId;
        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = isLoggedIn;
