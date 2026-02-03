const multer = require('multer');
const path = require('path');
const {
    STATUS_CODE,
    STATUS_MESSAGE,
} = require('../constants/http-status-code.constant.js');

// 업로드 최대 크기: 10MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// 허용할 이미지 MIME 타입
const IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
]);

// multer fileFilter에서 사용할 422 에러 객체 생성
const createInvalidFileError = fieldName => {
    const error = new Error(STATUS_MESSAGE.INVALID_INPUT);
    error.status = STATUS_CODE.UNPROCESSABLE_ENTITY;
    error.data = { [fieldName]: ['INVALID_FORMAT'] };
    return error;
};

// 필드별 파일 타입 검증 필터 생성
const createFileFilter = fieldName => (request, file, callback) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
        return callback(createInvalidFileError(fieldName));
    }
    return callback(null, true);
};

// MIME 타입을 확장자로 매핑 (파일명 표준화 용도)
const mimeToExtension = mimetype => {
    switch (mimetype) {
        case 'image/jpeg':
        case 'image/jpg':
            return '.jpg';
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        case 'image/webp':
            return '.webp';
        default:
            return '';
    }
};

// 저장 파일명 생성: 필드명-타임스탬프+난수-확장자
const buildFilename = file => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // 1e9는 10^9(1,000,000,000) 범위의 난수를 의미
    const extension = mimeToExtension(file.mimetype);
    return `${file.fieldname}-${uniqueSuffix}${extension}`;
};

// 프로필 이미지 저장 위치/파일명 규칙
const profileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(
            null,
            path.join(__dirname, '..', 'public', 'image', 'profile'),
        );
    },
    filename: (request, file, callback) => {
        callback(null, buildFilename(file));
    },
});

// 게시글 첨부 이미지 저장 위치/파일명 규칙
const postStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(
            null,
            path.join(__dirname, '..', 'public', 'image', 'post'),
        );
    },
    filename: (request, file, callback) => {
        callback(null, buildFilename(file));
    },
});

// 프로필/게시글용 업로드 미들웨어 생성
const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: createFileFilter('profileImage'),
});
const uploadPost = multer({
    storage: postStorage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: createFileFilter('postFile'),
});

module.exports = { uploadProfile, uploadPost };
