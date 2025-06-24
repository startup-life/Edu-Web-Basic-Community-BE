// Dummy data, JSON 구조
const comments = [
    {
        comment_id: 1,
        comment_content: '좋은 글이네요.',
        post_id: 1,
        user_id: 2,
        nickname: '밥',
        created_at: '2024-12-10T10:00:00Z',
        updated_at: '2024-12-10T10:00:00Z',
        deleted_at: null,
    },
    {
        comment_id: 2,
        comment_content: '감사합니다!',
        post_id: 1,
        user_id: 1,
        nickname: '앨리스',
        created_at: '2024-12-10T10:05:00Z',
        updated_at: '2024-12-10T10:05:00Z',
        deleted_at: null,
    },
];

/**
 * 댓글 조회
 * 댓글 작성
 * 댓글 수정
 * 댓글 삭제
 */

// 댓글 조회
exports.getComments = (request, response) => {
    const postId = parseInt(request.params.post_id, 10);
    const filteredComments = comments.filter(comment => comment.post_id === postId && !comment.deleted_at);
    return response.status(200).json({ data: filteredComments });
};

// 댓글 작성
exports.writeComment = (request, response) => {
    const postId = parseInt(request.params.post_id, 10);
    const userId = parseInt(request.headers.userid, 10);
    const { commentContent } = request.body;

    const newComment = {
        comment_id: comments.length + 1,
        comment_content: commentContent,
        post_id: postId,
        user_id: userId,
        nickname: '사용자',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    };

    comments.push(newComment);
    return response.status(201).json({ data: newComment });
};

// 댓글 수정
exports.updateComment = (request, response) => {
    const postId = parseInt(request.params.post_id, 10);
    const commentId = parseInt(request.params.comment_id, 10);
    const { commentContent } = request.body;

    const comment = comments.find(comment =>
        comment.post_id === postId &&
        comment.comment_id === commentId &&
        !comment.deleted_at
    );

    if (!comment) {
        return response.status(404).json({ data: null });
    }

    comment.comment_content = commentContent;
    comment.updated_at = new Date().toISOString();

    return response.status(200).json({ data: comment });
};

// 댓글 삭제
exports.softDeleteComment = (request, response) => {
    const postId = parseInt(request.params.post_id, 10);
    const commentId = parseInt(request.params.comment_id, 10);

    const comment = comments.find(comment =>
        comment.post_id === postId &&
        comment.comment_id === commentId &&
        !comment.deleted_at
    );

    if (!comment) {
        return response.status(404).json({ data: null });
    }

    comment.deleted_at = new Date().toISOString();

    return response.status(200).json({ data: null });
};