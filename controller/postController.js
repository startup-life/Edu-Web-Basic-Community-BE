// Dummy data, JSON 구조
const posts = [
    {
        post_id: 1,
        post_title: '첫 번째 게시글',
        post_content: '첫 번째 내용입니다.',
        user_id: 1,
        nickname: '앨리스',
        like: 0,
        comment_count: 0,
        hits: 10,
        created_at: '2024-12-10T10:00:00Z',
        updated_at: '2024-12-10T10:00:00Z',
        deleted_at: null,
    },
    {
        post_id: 2,
        post_title: '두 번째 글',
        post_content: '내용이 있습니다.',
        user_id: 2,
        nickname: '밥',
        like: 2,
        comment_count: 1,
        hits: 15,
        created_at: '2024-12-11T11:00:00Z',
        updated_at: '2024-12-11T11:00:00Z',
        deleted_at: null,
    },
];

/**
 * 게시글 작성
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 * 게시글 삭제
 */

// 게시글 작성
exports.writePost = (request, response) => {
    const userId = parseInt(request.headers.userid, 10);
    const { postTitle, postContent } = request.body;

    const newPost = {
        post_id: posts.length + 1,
        post_title: postTitle,
        post_content: postContent,
        user_id: userId,
        nickname: '사용자', // 실제 구현에서는 유저 정보에서 가져옴
        like: 0,
        comment_count: 0,
        hits: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    };

    posts.push(newPost);
    return response.status(201).json({ data: newPost });
};

// 게시글 목록 조회
exports.getPosts = (request, response) => {
    return response.status(200).json({ data: posts.filter(post => !post.deleted_at) });
};

// 게시글 상세 조회
exports.getPost = (request, response) => {
    const postId = parseInt(request.params.post_id, 10);
    const post = posts.find(post => post.post_id === postId && !post.deleted_at);

    if (!post) {
        return response.status(404).json({ data: null });
    }

    post.hits += 1;
    return response.status(200).json({ data: post });
};

// 게시글 수정
exports.updatePost = (request, response) => {
    const postId = parseInt(request.params.post_id, 10);
    const { postTitle, postContent } = request.body;

    const post = posts.find(post => post.post_id === postId && !post.deleted_at);
    if (!post) {
        return response.status(404).json({ data: null });
    }

    post.post_title = postTitle;
    post.post_content = postContent;
    post.updated_at = new Date().toISOString();

    return response.status(200).json({ data: post });
};

// 게시글 삭제
exports.softDeletePost = (request, response) => {
    const postId = parseInt(request.params.post_id, 10);
    const post = posts.find(post => post.post_id === postId && !post.deleted_at);
    if (!post) {
        return response.status(404).json({ data: null });
    }

    post.deleted_at = new Date().toISOString();
    return response.status(200).json({ data: null });
};