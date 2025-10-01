// import React, { useState } from 'react';
// import { Page, Quiz, Question, QuestionType } from '../../types';
// import { CATEGORIES } from '../../constants';
// import QuestionEditor from './QuestionEditor';

// // Flask 백엔드의 URL (현재 5001 포트에서 실행 중)
// const API_BASE_URL = 'http://localhost:5001';


// interface QuizCreationPageProps {
//     onSaveQuiz: (newQuiz: Quiz, newQuestions: Question[]) => void;
//     onNavigate: (page: Page) => void;
//     showCustomAlert: (message: string) => void;
// }

// const QuizCreationPage: React.FC<QuizCreationPageProps> = ({ onSaveQuiz, onNavigate, showCustomAlert }) => {
//     const [title, setTitle] = useState('');
//     const [category, setCategory] = useState('');
//     const [questions, setQuestions] = useState<Question[]>([]);
    
//     const addQuestion = () => {
//         const newQuestion: Question = {
//             id: Date.now(), // Unique ID for keys
//             type: 'multiple',
//             text: '',
//             options: ['', '', '', ''],
//             correct_answer: '',
//             explanation: '',
//             votes_avg: 0,
//             votes_count: 0,
//         };
//         setQuestions([...questions, newQuestion]);
//     };

//     const updateQuestion = (index: number, updatedQuestion: Question) => {
//         const newQuestions = [...questions];
//         newQuestions[index] = updatedQuestion;
//         setQuestions(newQuestions);
//     };

//     const removeQuestion = (index: number) => {
//         setQuestions(questions.filter((_, i) => i !== index));
//     };

//     /**
//      * 퀴즈 제목, 카테고리, 문제 내용 및 정답에 대한 유효성을 검사합니다.
//      * @returns {boolean} 유효성 검사 통과 여부
//      */
//     const validateQuiz = () => {
//         if (!title.trim()) {
//             showCustomAlert('퀴즈 제목을 입력해주세요.');
//             return false;
//         }
//         if (!category) {
//             showCustomAlert('카테고리를 선택해주세요.');
//             return false;
//         }
//         if (questions.length === 0) {
//             showCustomAlert('최소한 하나 이상의 문제를 추가해주세요.');
//             return false;
//         }

//         for (let i = 0; i < questions.length; i++) {
//             const q = questions[i];
            
//             // 공통 유효성 검사
//             if (!q.text.trim()) {
//                 showCustomAlert(`${i + 1}번 문제의 내용을 입력해주세요.`);
//                 return false;
//             }
//             if (!q.correct_answer.trim()) {
//                 showCustomAlert(`${i + 1}번 문제의 정답을 입력해주세요.`);
//                 return false;
//             }

//             // 객관식 (multiple) 전용 유효성 검사
//             if (q.type === 'multiple') {
//                 if (!q.options || q.options.length !== 4 || q.options.some(opt => !opt.trim())) {
//                     showCustomAlert(`${i + 1}번 문제의 모든 4가지 보기를 입력해주세요.`);
//                     return false;
//                 }
//                 // 정답이 보기 목록에 포함되어 있는지 확인
//                 if (!q.options.includes(q.correct_answer)) {
//                     showCustomAlert(`${i + 1}번 문제의 정답이 보기 목록에 포함되어 있지 않습니다.`);
//                     return false;
//                 }
//             }

//             // O/X (ox) 전용 유효성 검사
//             if (q.type === 'ox') {
//                 if (q.correct_answer.toLowerCase() !== 'o' && q.correct_answer.toLowerCase() !== 'x') {
//                     showCustomAlert(`${i + 1}번 O/X 문제의 정답은 'O' 또는 'X'여야 합니다.`);
//                     return false;
//                 }
//             }
//         }
//         return true;
//     };

//     /**
//      * 퀴즈 데이터를 서버에 저장합니다.
//      */
//     const handleSaveQuiz = async () => {
//         if (!validateQuiz()) {
//             return;
//         }

//         // 서버로 전송할 데이터 구조. Question.id는 제외하고 options는 JSON 문자열로 변환합니다.
//         const quizData = {
//             title,
//             category,
//             // TODO: 실제로는 인증 시스템에서 얻은 로그인된 사용자 ID를 사용해야 합니다. 현재는 임시 값.
//             creator_id: 'CurrentUser (Mock)', 
//             questions: questions.map(({ id, ...rest }) => ({ 
//                 ...rest,
//                 // 객관식 보기(options)는 DB에 JSON 형태로 저장하기 위해 JSON 문자열로 직렬화
//                 options: rest.options ? JSON.stringify(rest.options) : null,
//             })),
//         };

//         try {
//             const response = await fetch(`${API_BASE_URL}/api/quiz/create`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(quizData),
//             });

//             const result = await response.json();

//             if (response.ok) {
//                 // 서버에서 저장된 퀴즈 정보를 받아와 프론트엔드 상태 업데이트
//                 const newQuiz: Quiz = {
//                     quiz_id: result.quiz_id,
//                     title,
//                     category,
//                     creator_id: result.creator_id,
//                     votes_avg: 0,
//                     votes_count: 0,
//                     questions_count: questions.length,
//                 };

//                 showCustomAlert('퀴즈가 성공적으로 저장되었습니다!');
//                 // 부모 컴포넌트에 저장된 퀴즈 정보 전달 및 목록 페이지로 이동
//                 onSaveQuiz(newQuiz, questions); 
//                 onNavigate('quizList');
//             } else {
//                 // 서버에서 에러 메시지를 받으면 표시
//                 showCustomAlert(`퀴즈 저장 실패: ${result.error || response.statusText}`);
//                 console.error('Quiz save failed:', result);
//             }
//         } catch (error) {
//             console.error('API Error:', error);
//             showCustomAlert('서버와의 통신 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
//         }
//     };


//     return (
//         <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-4xl mx-auto">
//                 <div className="mb-8">
//                     <button 
//                         className="flex items-center text-gray-600 hover:text-violet-700 transition duration-150" 
//                         onClick={() => onNavigate('home')}>
//                         <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
//                         홈으로 돌아가기
//                     </button>
//                 </div>

//                 <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl">
//                     <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
//                         새로운 퀴즈 만들기
//                     </h2>

//                     {/* 퀴즈 기본 정보 */}
//                     <div className="space-y-6 mb-10">
//                         <div>
//                             <label htmlFor="quiz-title" className="block text-xl font-bold text-gray-700 mb-2">퀴즈 제목</label>
//                             <input
//                                 id="quiz-title"
//                                 type="text"
//                                 value={title}
//                                 onChange={(e) => setTitle(e.target.value)}
//                                 placeholder="예: React Hook 심화 과정"
//                                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-lg transition duration-150"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor="quiz-category" className="block text-xl font-bold text-gray-700 mb-2">카테고리</label>
//                             <select
//                                 id="quiz-category"
//                                 value={category}
//                                 onChange={(e) => setCategory(e.target.value)}
//                                 className="w-full p-4 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-violet-500 text-lg appearance-none transition duration-150"
//                             >
//                                 <option value="" disabled>카테고리를 선택하세요</option>
//                                 {CATEGORIES.map((cat) => (
//                                     <option key={cat} value={cat}>{cat}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     {/* 문제 목록 */}
//                     <h3 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">
//                         문제 목록 ({questions.length}개)
//                     </h3>
                    
//                     <div className="space-y-8 mb-8">
//                         {questions.length === 0 ? (
//                             <p className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-xl">
//                                 아직 퀴즈 문제가 없습니다. '문제 추가' 버튼을 눌러 첫 번째 문제를 만들어보세요!
//                             </p>
//                         ) : (
//                             questions.map((q, index) => (
//                                 <QuestionEditor 
//                                     key={q.id} 
//                                     index={index} 
//                                     question={q} 
//                                     onUpdate={updateQuestion} 
//                                     onRemove={removeQuestion} 
//                                 />
//                             ))
//                         )}
//                     </div>
//                     <div className="flex justify-between items-center mb-10">
//                         <button 
//                             className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition duration-150 flex items-center shadow-md" 
//                             onClick={addQuestion}
//                         >
//                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//                             문제 추가
//                         </button>
//                         <button 
//                             className="px-8 py-3 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 transition duration-150 shadow-md" 
//                             onClick={handleSaveQuiz}
//                         >
//                             퀴즈 저장하기
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default QuizCreationPage;
//로컬스토리지에서 읽기
import React, { useState } from 'react';
import { Page, Quiz, Question } from '../../types';
import { CATEGORIES } from '../../constants';
import QuestionEditor from './QuestionEditor';

// ✅ 환경변수 우선, 없으면 5001
const API_BASE_URL = 'http://localhost:5001';

interface QuizCreationPageProps {
  onSaveQuiz: (newQuiz: Quiz, newQuestions: Question[]) => void;
  onNavigate: (page: Page) => void;
  showCustomAlert: (message: string) => void;
}

const QuizCreationPage: React.FC<QuizCreationPageProps> = ({ onSaveQuiz, onNavigate, showCustomAlert }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      type: 'multiple',
      text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      votes_avg: 0,
      votes_count: 0,
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (index: number, updated: Question) => {
    const next = [...questions];
    next[index] = updated;
    setQuestions(next);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      showCustomAlert('퀴즈 제목을 입력해주세요.');
      return false;
    }
    if (!category) {
      showCustomAlert('카테고리를 선택해주세요.');
      return false;
    }
    if (questions.length === 0) {
      showCustomAlert('최소한 하나 이상의 문제를 추가해주세요.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        showCustomAlert(`${i + 1}번 문제의 내용을 입력해주세요.`);
        return false;
      }
      if (!q.correct_answer.trim()) {
        showCustomAlert(`${i + 1}번 문제의 정답을 입력해주세요.`);
        return false;
      }
      if (q.type === 'multiple') {
        if (!q.options || q.options.length !== 4 || q.options.some(opt => !opt.trim())) {
          showCustomAlert(`${i + 1}번 문제의 모든 4가지 보기를 입력해주세요.`);
          return false;
        }
        if (!q.options.includes(q.correct_answer)) {
          showCustomAlert(`${i + 1}번 문제의 정답이 보기 목록에 포함되어 있지 않습니다.`);
          return false;
        }
      }
      if (q.type === 'ox') {
        const ans = q.correct_answer.toLowerCase();
        if (ans !== 'o' && ans !== 'x') {
          showCustomAlert(`${i + 1}번 O/X 문제의 정답은 'O' 또는 'X'여야 합니다.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSaveQuiz = async () => {
    if (!validateQuiz()) return;

    // ✅ 로그인 사용자 ID 확보
    const userId = localStorage.getItem('qp.user_id') || '';
    if (!userId) {
      showCustomAlert('로그인이 필요합니다. 먼저 로그인해 주세요.');
      onNavigate('login');
      return;
    }

    // ✅ 서버 전송 데이터: creator_id에 현재 로그인 사용자 사용
    //    options는 배열 그대로 전달(백엔드가 JSON으로 저장 처리)
    const quizData = {
      title,
      category,
      creator_id: userId, // ← 중요!
      questions: questions.map(({ id, ...rest }) => ({
        ...rest,
        // 기존처럼 문자열화하고 싶다면: options: rest.options ? JSON.stringify(rest.options) : null,
        options: rest.options ?? null,
      })),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 헤더로도 보내서 백엔드가 우선 사용하도록 할 수 있음(서버에서 지원 시)
          'X-User-Id': userId,
        },
        body: JSON.stringify(quizData),
      });

      const result = await res.json();

      if (res.ok) {
        const newQuiz: Quiz = {
          quiz_id: result.quiz_id,
          title,
          category,
          creator_id: quizData.creator_id,
          votes_avg: 0,
          votes_count: 0,
          questions_count: questions.length,
        };
        showCustomAlert('퀴즈가 성공적으로 저장되었습니다!');
        onSaveQuiz(newQuiz, questions);
        onNavigate('quizList');
      } else {
        showCustomAlert(`퀴즈 저장 실패: ${result.error || res.statusText}`);
        console.error('Quiz save failed:', result);
      }
    } catch (e) {
      console.error('API Error:', e);
      showCustomAlert('서버와의 통신 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-violet-700 transition duration-150"
            onClick={() => onNavigate('home')}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            홈으로 돌아가기
          </button>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
            새로운 퀴즈 만들기
          </h2>

          {/* 퀴즈 기본 정보 */}
          <div className="space-y-6 mb-10">
            <div>
              <label htmlFor="quiz-title" className="block text-xl font-bold text-gray-700 mb-2">퀴즈 제목</label>
              <input
                id="quiz-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: React Hook 심화 과정"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-lg transition duration-150"
              />
            </div>
            <div>
              <label htmlFor="quiz-category" className="block text-xl font-bold text-gray-700 mb-2">카테고리</label>
              <select
                id="quiz-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-4 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-violet-500 text-lg appearance-none transition duration-150"
              >
                <option value="" disabled>카테고리를 선택하세요</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 문제 목록 */}
          <h3 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3">
            문제 목록 ({questions.length}개)
          </h3>

          <div className="space-y-8 mb-8">
            {questions.length === 0 ? (
              <p className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-xl">
                아직 퀴즈 문제가 없습니다. '문제 추가' 버튼을 눌러 첫 번째 문제를 만들어보세요!
              </p>
            ) : (
              questions.map((q, index) => (
                <QuestionEditor
                  key={q.id}
                  index={index}
                  question={q}
                  onUpdate={updateQuestion}
                  onRemove={removeQuestion}
                />
              ))
            )}
          </div>

          <div className="flex justify-between items-center mb-10">
            <button
              className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition duration-150 flex items-center shadow-md"
              onClick={addQuestion}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              문제 추가
            </button>
            <button
              className="px-8 py-3 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 transition duration-150 shadow-md"
              onClick={handleSaveQuiz}
            >
              퀴즈 저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreationPage;
