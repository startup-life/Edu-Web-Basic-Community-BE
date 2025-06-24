// Dummy data, JSON구조
const users = [
    {
        user_id: 1,
        email: 'alice@example.com',
        password: 'Alice@1234',
        nickname: '앨리스',
        file_id: 101,
        session_id: 'sess-abc123',
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z',
        deleted_at: null,
    },
    {
        user_id: 2,
        email: 'bob@example.com',
        password: 'Bob!pass2024',
        nickname: '밥',
        file_id: 102,
        session_id: 'sess-def456',
        created_at: '2024-12-02T11:30:00Z',
        updated_at: '2024-12-02T11:30:00Z',
        deleted_at: null,
    },
    {
        user_id: 3,
        email: 'carol@example.com',
        password: 'Carol#Pass5678',
        nickname: '캐롤',
        file_id: null,
        session_id: null,
        created_at: '2024-12-03T12:45:00Z',
        updated_at: '2024-12-03T12:45:00Z',
        deleted_at: null,
    },
    {
        user_id: 4,
        email: 'david@example.com',
        password: 'David*Secure999',
        nickname: '데이빗',
        file_id: 103,
        session_id: 'sess-ghi789',
        created_at: '2024-12-04T14:15:00Z',
        updated_at: '2024-12-04T14:15:00Z',
        deleted_at: null,
    },
    {
        user_id: 5,
        email: 'eve@example.com',
        password: 'Eve%Password!1',
        nickname: '이브',
        file_id: null,
        session_id: null,
        created_at: '2024-12-05T15:20:00Z',
        updated_at: '2024-12-05T15:20:00Z',
        deleted_at: null,
    },
];

/**
 * 로그인
 * 회원가입
 * 유저 정보 가져오기
 * 회원 정보 수정
 * 로그인 상태 체크
 * 비밀번호 변경
 * 회원 탈퇴
 * 로그아웃
 * 이메일 중복 체크
 * 닉네임 중복 체크
 */

// 로그인
exports.loginUser = (request, response) => {
    const { email, password } = request.body;
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return response.status(401).json({ data: null });
    }
    return response.status(200).json({ data: user });
};

// 회원가입
exports.signupUser = (request, response) => {
    const { email, password, nickname } = request.body;
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return response.status(400).json({ data: 'duplicate' });
    }

    const newUser = {
        user_id: users.length + 1,
        email,
        password,
        nickname,
        file_id: null,
        session_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    };

    users.push(newUser);
    return response.status(201).json({ data: newUser });
};

// 유저 정보 가져오기
exports.getUser = (request, response) => {
    const userId = parseInt(request.params.user_id, 10);
    const user = users.find(user => user.user_id === userId);
    if (!user) {
        return response.status(404).json({ data: null });
    }
    return response.status(200).json({ data: user });
};

// 회원정보 수정
exports.updateUser = (request, response) => {
    const userId = parseInt(request.params.user_id, 10);
    const { nickname } = request.body;

    const user = users.find(user => user.user_id === userId);
    if (!user) {
        return response.status(404).json({ data: null });
    }

    user.nickname = nickname;
    user.updated_at = new Date().toISOString();

    return response.status(200).json({ data: null });
};

// 로그인 상태 체크
exports.checkAuth = (request, response) => {
    const userId = parseInt(request.headers.userid, 10);
    const user = users.find(user => user.user_id === userId);
    if (!user) {
        return response.status(401).json({ data: null });
    }

    return response.status(200).json({
        data: {
            userId: user.user_id,
            email: user.email,
            nickname: user.nickname,
            auth_token: user.session_id,
            auth_status: true,
        },
    });
};

// 비밀번호 변경
exports.changePassword = (request, response) => {
    const userId = parseInt(request.params.user_id, 10);
    const { password } = request.body;

    const user = users.find(user => user.user_id === userId);
    if (!user) {
        return response.status(404).json({ data: null });
    }

    user.password = password;
    user.updated_at = new Date().toISOString();

    return response.status(200).json({ data: null });
};

// 회원 탈퇴
exports.softDeleteUser = (request, response) => {
    const userId = parseInt(request.params.user_id, 10);
    const user = users.find(user => user.user_id === userId);
    if (!user) {
        return response.status(404).json({ data: null });
    }

    user.deleted_at = new Date().toISOString();
    return response.status(200).json({ data: null });
};

// 로그아웃
exports.logoutUser = (request, response) => {
    const userId = parseInt(request.headers.userid, 10);
    const user = users.find(user => user.user_id === userId);
    if (!user) {
        return response.status(404).json({ data: null });
    }

    user.session_id = null;
    return response.status(204).end();
};

// 이메일 중복 체크
exports.checkEmail = (request, response) => {
    const { email } = request.query;
    const user = users.find(user => user.email === email);
    if (user) {
        return response.status(400).json({ data: 'duplicate' });
    }
    return response.status(200).json({ data: null });
};

// 닉네임 중복 체크
exports.checkNickname = (request, response) => {
    const { nickname } = request.query;
    const user = users.find(user => user.nickname === nickname);
    if (user) {
        return response.status(400).json({ data: 'duplicate' });
    }
    return response.status(200).json({ data: null });
};