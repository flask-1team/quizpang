import React, { useState } from 'react';
import { Page } from '../../types';

// Flask 백엔드의 URL (현재 5001 포트에서 실행 중)
const API_BASE_URL = 'http://localhost:5001';

interface SignUpPageProps {
    onSignUp: (username: string) => void;
    onNavigate: (page: Page) => void;
    showCustomAlert: (message: string) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigate, showCustomAlert }) => {
    // 폼 입력 상태
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // 로딩 상태 (버튼 비활성화 및 피드백용)
    const [loading, setLoading] = useState(false); 

    // handleSubmit 함수를 async로 선언하여 await 사용 가능하도록 수정
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. 클라이언트 유효성 검사 (Validation)
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            showCustomAlert("모든 항목을 입력해주세요.");
            return;
        }
        if (password !== confirmPassword) {
            showCustomAlert("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (password.length < 6) {
            showCustomAlert("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            // 수정된 백엔드 API 경로: /api/auth/signup 사용
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 회원가입 성공 (HTTP 201 Created 예상)
                showCustomAlert(`회원가입 성공! ${username}님, 이제 로그인하실 수 있습니다.`);
                // 성공 후 로그인 페이지로 이동
                onNavigate('login'); 
            } else {
                // 회원가입 실패 (400 Bad Request 또는 500 Internal Error)
                const errorMessage = data.error || "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
                showCustomAlert(errorMessage);
            }
        } catch (error) {
            console.error('회원가입 API 호출 오류:', error);
            showCustomAlert("서버와 통신하는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex items-center justify-center">
             <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
                 <button 
                    className="flex items-center text-gray-600 hover:text-violet-700 mb-6 transition duration-150" 
                    onClick={() => onNavigate('home')}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    <span>뒤로가기</span>
                </button>
                <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
                        QuizPang! 회원가입
                    </h2>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">사용자 이름</label>
                            <div className="mt-1">
                                <input id="username" name="username" type="text" autoComplete="username" required 
                                       value={username} onChange={e => setUsername(e.target.value)}
                                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                                       disabled={loading} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" required 
                                       value={email} onChange={e => setEmail(e.target.value)}
                                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                                       disabled={loading} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">비밀번호 (6자 이상)</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" autoComplete="new-password" required 
                                       value={password} onChange={e => setPassword(e.target.value)}
                                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                                       disabled={loading} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
                            <div className="mt-1">
                                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required 
                                       value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                                       disabled={loading}
                                       />
                            </div>
                        </div>
                        <div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition duration-150 ${
                                    loading 
                                        ? 'bg-violet-400 cursor-not-allowed' 
                                        : 'bg-violet-700 hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                                }`}>
                                {loading ? '가입 요청 중...' : '가입하기'}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        이미 계정이 있으신가요?{' '}
                        <button onClick={() => onNavigate('login')} className="font-medium text-violet-700 hover:text-violet-600">
                            로그인
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
