/**
 * validationResult: express-validator의 검증 결과 수집 함수
 * - 라우트 미들웨어 체인에서 실행된 모든 검증 규칙의 결과를 request 객체에서 추출
 * - 검증 실패 시 에러 정보(필드명, 에러 메시지 등)를 배열로 반환
 */
const { validationResult } = require('express-validator');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

/**
 * 검증 결과 처리 미들웨어
 * - 각 validator 체인의 마지막에 배치하여 검증 결과를 처리
 * - 검증 성공 시 다음 미들웨어로 진행
 * - 검증 실패 시 422 에러와 함께 필드별 에러 코드 반환
 */
const handleValidation = (request, response, next) => {
    // request 객체에서 이전 미들웨어들의 검증 결과 수집
    const errors = validationResult(request);

    // 검증 에러가 존재하는 경우
    if (!errors.isEmpty()) {
        // 에러를 필드별로 그룹화할 객체
        // 결과 형태: { email: ['REQUIRED'], password: ['TOO_SHORT', 'INVALID_FORMAT'] }
        const formattedErrors = {};

        // 에러 배열을 순회하며 필드별로 에러 코드 분류
        errors.array().forEach(error => {
            const field = error.path; // 에러가 발생한 필드명 (email, password 등)

            // 해당 필드의 에러 배열이 없으면 초기화
            if (!formattedErrors[field]) {
                formattedErrors[field] = [];
            }

            // 중복 에러 코드 방지 후 추가
            if (!formattedErrors[field].includes(error.msg)) {
                formattedErrors[field].push(error.msg);
            }
        });

        // 검증 실패 에러 객체 생성
        const validationError = new Error(STATUS_MESSAGE.INVALID_INPUT);
        validationError.status = STATUS_CODE.UNPROCESSABLE_ENTITY; // 422
        validationError.data = formattedErrors; // 필드별 에러 코드 첨부
        return next(validationError); // 에러 핸들러로 전달
    }

    // 검증 성공 시 다음 미들웨어(컨트롤러)로 진행
    return next();
};

module.exports = { handleValidation };
