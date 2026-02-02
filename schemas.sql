CREATE DATABASE IF NOT EXISTS `edu_community_express_v2`;
USE `edu_community_express_v2`;
CREATE TABLE IF NOT EXISTS user
(
    `id`          INT UNSIGNED    NOT NULL    AUTO_INCREMENT            COMMENT '유저 인덱스',
    `email`       VARCHAR(150)    NOT NULL                              COMMENT '이메일',
    `password`    VARCHAR(150)    NOT NULL                              COMMENT '패스워드. 8자 이상, 특수 문자 포함',
    `nickname`    VARCHAR(45)     NOT NULL                              COMMENT '닉네임. 20바이트 (한글 기준 10글자) 제한',
    `file_id`     INT UNSIGNED    NULL                                  COMMENT '파일 인덱스. 프로필 사진의 인덱스',
    `created_at`  TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP COMMENT '생성한 때',
    `updated_at`  TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP COMMENT '수정한 때',
    `deleted_at`  TIMESTAMP       NULL                                  COMMENT '삭제한 때',
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS post
(
    `id`             INT UNSIGNED    NOT NULL    AUTO_INCREMENT             COMMENT '게시글 인덱스',
    `post_title`     VARCHAR(45)     NOT NULL                               COMMENT '게시글 제목',
    `post_content`   TEXT            NOT NULL                               COMMENT '게시글 내용',
    `file_id`        INT UNSIGNED    NULL                                   COMMENT '파일 인덱스. 첨부 파일 있는 경우. 첨부 파일의 인덱스',
    `user_id`        INT UNSIGNED    NOT NULL                               COMMENT '유저 인덱스',
    `nickname`       VARCHAR(45)     NOT NULL                               COMMENT '닉네임',
    `like`           INT UNSIGNED    NOT NULL    DEFAULT 0                  COMMENT '좋아요. 1,000 이상 -> 1K',
    `comment_count`  INT UNSIGNED    NOT NULL    DEFAULT 0                  COMMENT '댓글 개수. 1,000 이상 -> 1K',
    `hits`           INT UNSIGNED    NOT NULL    DEFAULT 0                  COMMENT '조회수. 1,000 이상 -> 1K',
    `created_at`     TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP  COMMENT '생성한 때',
    `updated_at`     TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP  COMMENT '수정한 때',
    `deleted_at`     TIMESTAMP       NULL                                   COMMENT '삭제한 때',
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS file
(
    `id`                INT UNSIGNED    NOT NULL    AUTO_INCREMENT              COMMENT '파일 인덱스',
    `user_id`           INT UNSIGNED    NOT NULL                                COMMENT '유저 인덱스',
    `post_id`           INT UNSIGNED    NULL                                    COMMENT '게시글 인덱스',
    `file_path`         VARCHAR(125)     NULL                                    COMMENT '첨부 파일 경로',
    `file_category`     INT UNSIGNED    NOT NULL                                COMMENT '파일 카테고리',
    `created_at`        TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP   COMMENT '생성한 때',
    `updated_at`        TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP   COMMENT '수정한 때',
    `deleted_at`        TIMESTAMP       NULL                                    COMMENT '삭제한 때',
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS comment
(
    `id`               INT UNSIGNED    NOT NULL    AUTO_INCREMENT               COMMENT '댓글 인덱스',
    `comment_content`  TEXT            NOT NULL                                 COMMENT '댓글 내용',
    `post_id`          INT UNSIGNED    NOT NULL                                 COMMENT '게시글 인덱스',
    `user_id`          INT UNSIGNED    NOT NULL                                 COMMENT '유저 인덱스',
    `nickname`         VARCHAR(45)     NOT NULL                                 COMMENT '닉네임',
    `created_at`       TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP    COMMENT '생성한 때',
    `updated_at`       TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP    COMMENT '수정한 때',
    `deleted_at`       TIMESTAMP       NULL                                     COMMENT '삭제한 때',
    PRIMARY KEY (id)
);
