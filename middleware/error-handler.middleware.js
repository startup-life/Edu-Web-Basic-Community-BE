const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

const formatSizeMb = bytes => {
    if (!bytes || Number.isNaN(bytes)) return null;
    const mb = Math.ceil(bytes / (1024 * 1024));
    return `${mb}MB`;
};

/**
 * 전역 에러 핸들러 미들웨어
 * - 모든 에러를 최종 처리하여 일관된 응답 형식으로 반환
 */
const errorHandler = (error, request, response, next) => {
    // 이미 응답이 전송된 경우 다음 핸들러로 위임
    if (response.headersSent) {
        return next(error);
    }

    // 400 - 잘못된 요청
    if (error.status === STATUS_CODE.BAD_REQUEST) {
        return response.status(STATUS_CODE.BAD_REQUEST).send({
            code: error.message || STATUS_MESSAGE.BAD_REQUEST,
            data: null,
        });
    }

    // 408 - 요청 타임아웃
    if (request.timedout) {
        console.error('Request timed out:', request.originalUrl);
        return response.status(STATUS_CODE.SERVER_TIMEOUT).send({
            code: STATUS_MESSAGE.REQUEST_TIMEOUT,
            data: null,
        });
    }

    // 409 - 리소스 충돌 (이미 존재)
    if (error.status === STATUS_CODE.CONFLICT) {
        return response.status(STATUS_CODE.CONFLICT).send({
            code: error.message,
            data: null,
        });
    }

    // 413 - 파일 크기 초과
    if (
        error.code === 'LIMIT_FILE_SIZE' ||
        error.status === STATUS_CODE.PAYLOAD_TOO_LARGE
    ) {
        const currentSize = formatSizeMb(
            Number.parseInt(request.headers['content-length'], 10),
        );
        return response.status(STATUS_CODE.PAYLOAD_TOO_LARGE).send({
            code: STATUS_MESSAGE.FILE_TOO_LARGE,
            data: {
                maxSize: '10MB',
                currentSize,
            },
        });
    }

    // 422 - 검증 실패
    if (error.status === STATUS_CODE.UNPROCESSABLE_ENTITY) {
        return response.status(STATUS_CODE.UNPROCESSABLE_ENTITY).send({
            code: STATUS_MESSAGE.INVALID_INPUT,
            data: error.data || null,
        });
    }

    // 기타 에러 (기본값: 500)
    response.status(error.status || STATUS_CODE.INTERNAL_SERVER_ERROR).send({
        code: error.message || STATUS_MESSAGE.INTERNAL_SERVER_ERROR,
        data: null,
    });
};

module.exports = { errorHandler };
