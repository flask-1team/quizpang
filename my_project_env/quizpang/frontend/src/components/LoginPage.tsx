// import React, { useState } from 'react';
// import { Page } from '../../types';

// // Flask 백엔드의 URL (현재 5001 포트에서 실행 중)
// const API_BASE_URL = 'http://localhost:5001';

// interface LoginPageProps {
//     onLogin: (username: string) => void;
//     onNavigate: (page: Page) => void;
//     showCustomAlert: (message: string) => void;
// }

// const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate, showCustomAlert }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
        
//         if (!email.trim() || !password.trim()) {
//             showCustomAlert("이메일과 비밀번호를 모두 입력해주세요.");
//             return;
//         }

//         setIsLoading(true);

//         try {
//             // 수정된 백엔드 API 경로: /api/auth/login 사용
//             const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 // 로그인 성공
//                 showCustomAlert(`로그인 성공! 환영합니다, ${data.username}님!`);
//                 onLogin(data.username);
//                 onNavigate('home');
//             } else {
//                 // 로그인 실패 (401 Unauthorized 또는 다른 오류)
//                 const errorMessage = data.error || "로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.";
//                 showCustomAlert(errorMessage);
//             }
//         } catch (error) {
//             console.error('로그인 API 호출 오류:', error);
//             showCustomAlert("서버와 통신하는 중 오류가 발생했습니다.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex items-center justify-center">
//             <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
//                  <button 
//                     className="flex items-center text-gray-600 hover:text-violet-700 mb-6 transition duration-150" 
//                     onClick={() => onNavigate('home')}>
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
//                     <span>뒤로가기</span>
//                 </button>
//                 <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
//                     <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
//                         QuizPang! 로그인
//                     </h2>
//                     <form className="space-y-6" onSubmit={handleSubmit}>
//                         <div>
//                             <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
//                             <div className="mt-1">
//                                 <input id="email" name="email" type="email" autoComplete="email" required 
//                                        value={email} onChange={e => setEmail(e.target.value)}
//                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
//                                        disabled={isLoading} />
//                             </div>
//                         </div>
//                         <div>
//                             <label htmlFor="password"className="block text-sm font-medium text-gray-700">비밀번호</label>
//                             <div className="mt-1">
//                                 <input id="password" name="password" type="password" autoComplete="current-password" required 
//                                        value={password} onChange={e => setPassword(e.target.value)}
//                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
//                                        disabled={isLoading} />
//                             </div>
//                         </div>
//                         <div>
//                             <button type="submit" 
//                                     className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition duration-150 
//                                                 ${isLoading ? 'bg-violet-400 cursor-not-allowed' : 'bg-violet-700 hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'}`}
//                                     disabled={isLoading}>
//                                 {isLoading ? '로그인 중...' : '로그인'}
//                             </button>
//                         </div>
//                     </form>
//                     <p className="mt-6 text-center text-sm text-gray-600">
//                         계정이 없으신가요?{' '}
//                         <button onClick={() => onNavigate('signup')} className="font-medium text-violet-700 hover:text-violet-600">
//                             회원가입
//                         </button>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;
// 로그인할때 로컬 스토리지 등록
import React, { useState } from 'react';
import { Page } from '../../types';

// ✅ Vite 환경변수 우선, 없으면 5001
const API_BASE_URL = 'http://localhost:5001';

interface LoginPageProps {
  onLogin: (username: string) => void;
  onNavigate: (page: Page) => void;
  showCustomAlert: (message: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate, showCustomAlert }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showCustomAlert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include', // 세션 쿠키 방식이면 주석 해제
        body: JSON.stringify({ email, password }),
      });

      // 응답 파싱 안전 처리
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        /* 서버 에러로 JSON이 아닐 수 있음 */
      }

      if (res.ok) {
        // ✅ 여기서 user_id/username 저장 (퀴즈 생성 시 사용)
        if (data.user_id) localStorage.setItem('qp.user_id', String(data.user_id));
        if (data.username) localStorage.setItem('qp.username', String(data.username));

        showCustomAlert(`로그인 성공! 환영합니다, ${data.username}님!`);
        onLogin(data.username);
        onNavigate('home');
      } else {
        const msg =
          data?.error ||
          '로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해주세요.';
        showCustomAlert(msg);
      }
    } catch (err) {
      console.error('로그인 API 호출 오류:', err);
      showCustomAlert('서버와 통신하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        <button
          className="flex items-center text-gray-600 hover:text-violet-700 mb-6 transition duration-150"
          onClick={() => onNavigate('home')}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>뒤로가기</span>
        </button>

        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">QuizPang! 로그인</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition duration-150 
                ${isLoading ? 'bg-violet-400 cursor-not-allowed' : 'bg-violet-700 hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'}`}
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <button onClick={() => onNavigate('signup')} className="font-medium text-violet-700 hover:text-violet-600">
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

