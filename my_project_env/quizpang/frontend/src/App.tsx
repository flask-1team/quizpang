import React, { useState, useEffect } from 'react';
import { Page, Quiz, Question, User, QuizMode, TimerConfig, QuizAttempt } from '../types';
import Header from './components/Header';
import Footer from './components/Footer.tsx';
import HomePage from './components/HomePage.tsx';
import QuizListPage from './components/QuizListPage.tsx';
import QuizGamePage from './components/QuizGamePage.tsx';
import QuizCreationPage from './components/QuizCreationPage.tsx';
import LoginPage from './components/LoginPage.tsx';
import SignUpPage from './components/SignUpPage.tsx';
import CustomAlertModal from './components/CustomAlertModal.tsx';
import KeyFeaturesPage from './components/KeyFeaturesPage.tsx';
import QuizCategoriesPage from './components/QuizCategoriesPage.tsx';
import ProjectGoalsPage from './components/ProjectGoalsPage.tsx';
import WelcomeModal from './components/WelcomeModal.tsx';
import RankingPage from './components/RankingPage';
import HistoryPage from './components/HistoryPage';
import ModeSelectionModal from './components/ModeSelectionModal';

// App.tsx 맨 위 import들 아래쯤에 추가
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');



// Mock Data (생략... 동일)
const mockUsers: User[] = [
    { id: 'Admin', username: '관리자' },
    { id: 'HistoryBuff', username: '역사덕후' },
    { id: 'CodeMaster', username: '코딩고수' },
    { id: 'TriviaKing', username: '상식왕' },
];
// ... mockQuizzes, mockQuestions, mockHistory는 동일하므로 생략 ...
const mockQuizzes: Quiz[] = [
    { quiz_id: 1, title: 'React 기초', category: '프로그래밍', creator_id: 'Admin', votes_avg: 4.5, votes_count: 120, questions_count: 3 },
    { quiz_id: 2, title: '한국사 퀴즈', category: '역사', creator_id: 'HistoryBuff', votes_avg: 4.8, votes_count: 250, questions_count: 2 },
    { quiz_id: 3, title: 'JavaScript 심화', category: '프로그래밍', creator_id: 'CodeMaster', votes_avg: 4.9, votes_count: 310, questions_count: 2 },
    { quiz_id: 4, title: '알쓸신잡 퀴즈', category: '상식', creator_id: 'TriviaKing', votes_avg: 4.2, votes_count: 180, questions_count: 2 },
    { quiz_id: 5, title: 'CSS 마스터', category: '프로그래밍', creator_id: 'CodeMaster', votes_avg: 4.6, votes_count: 150, questions_count: 2 },
    { quiz_id: 6, title: '세계사 상식', category: '역사', creator_id: 'HistoryBuff', votes_avg: 4.7, votes_count: 220, questions_count: 2 },
    { quiz_id: 7, title: '알고리즘 챌린지', category: '프로그래밍', creator_id: 'CodeMaster', votes_avg: 4.8, votes_count: 450, questions_count: 2 },
];
const mockQuestions: Record<number, Question[]> = {
    1: [
        { id: 101, type: 'multiple', text: 'React에서 컴포넌트의 상태를 관리하는 Hook은 무엇인가요?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct_answer: 'useState', explanation: 'useState는 함수형 컴포넌트에서 상태(state)를 추가하고 관리할 수 있게 해주는 Hook입니다. 상태가 변경되면 컴포넌트가 다시 렌더링됩니다.', votes_avg: 4.2, votes_count: 50 },
        { id: 102, type: 'ox', text: 'React는 Angular보다 먼저 출시되었다.', correct_answer: 'X', explanation: 'AngularJS(1.0)는 2010년에, React는 2013년에 출시되었습니다. 따라서 React가 더 늦게 출시되었습니다.', votes_avg: 4.0, votes_count: 45 },
        { id: 103, type: 'subjective', text: '가상 DOM은 무엇의 약자인가요?', correct_answer: 'Virtual DOM', explanation: '가상 DOM(Virtual DOM)은 실제 DOM의 가벼운 복사본으로, UI 변경 사항을 메모리에서 계산하여 실제 DOM 조작을 최소화함으로써 성능을 향상시킵니다.', votes_avg: 4.6, votes_count: 60 },
    ],
    2: [
        { id: 201, type: 'multiple', text: '조선을 건국한 왕의 이름은 무엇인가요?', options: ['태조 이성계', '세종대왕', '궁예', '왕건'], correct_answer: '태조 이성계', explanation: '태조 이성계는 위화도 회군을 통해 고려를 무너뜨리고 1392년에 조선을 건국한 초대 왕입니다.', votes_avg: 4.9, votes_count: 120 },
        { id: 202, type: 'subjective', text: '임진왜란 당시 이순신 장군이 한산도에서 사용한 진법 이름은?', correct_answer: '학익진', explanation: '학익진은 학이 날개를 펼친 형태의 진법으로, 한산도 대첩에서 이순신 장군이 사용하여 일본 수군을 크게 물리치는 데 결정적인 역할을 했습니다.', votes_avg: 4.8, votes_count: 110 },
    ],
    3: [
        { id: 301, type: 'subjective', text: 'JavaScript에서 "===" 연산자는 무엇을 비교하나요?', correct_answer: '값과 타입', explanation: '"===" 연산자는 값과 타입을 모두 비교하는 엄격한 동등 연산자입니다.', votes_avg: 4.9, votes_count: 150 },
        { id: 302, type: 'multiple', text: '다음 중 JavaScript의 원시 타입이 아닌 것은?', options: ['Object', 'String', 'Number', 'Boolean'], correct_answer: 'Object', explanation: 'Object는 참조 타입이며, String, Number, Boolean, Null, Undefined, Symbol, BigInt는 원시 타입입니다.', votes_avg: 4.8, votes_count: 160 },
    ],
    4: [
        { id: 401, type: 'ox', text: '물의 화학식은 H2O2이다.', correct_answer: 'X', explanation: '물의 화학식은 H2O이며, H2O2는 과산화수소입니다.', votes_avg: 4.1, votes_count: 90 },
        { id: 402, type: 'multiple', text: '지구에서 가장 큰 대륙은?', options: ['아시아', '아프리카', '북아메리카', '유럽'], correct_answer: '아시아', explanation: '아시아는 면적과 인구 모두에서 세계에서 가장 큰 대륙입니다.', votes_avg: 4.3, votes_count: 90 },
    ],
    5: [
        { id: 501, type: 'subjective', text: 'CSS에서 글자 색을 바꾸는 속성은 무엇인가요?', correct_answer: 'color', explanation: 'color 속성을 사용하여 텍스트의 색상을 지정할 수 있습니다.', votes_avg: 4.5, votes_count: 80 },
        { id: 502, type: 'multiple', text: 'CSS 박스 모델에 포함되지 않는 것은?', options: ['display', 'margin', 'padding', 'border'], correct_answer: 'display', explanation: 'CSS 박스 모델은 content, padding, border, margin으로 구성됩니다. display는 요소의 렌더링 방식을 결정하는 속성입니다.', votes_avg: 4.7, votes_count: 70 },
    ],
    6: [
        { id: 601, type: 'multiple', text: '제2차 세계대전을 일으킨 독일의 지도자는?', options: ['히틀러', '무솔리니', '스탈린', '처칠'], correct_answer: '히틀러', explanation: '아돌프 히틀러는 나치 독일의 총통으로 제2차 세계대전을 일으켰습니다.', votes_avg: 4.6, votes_count: 110 },
        { id: 602, type: 'subjective', text: '프랑스 혁명의 3대 정신은 자유, 평등, 그리고 무엇인가요?', correct_answer: '박애', explanation: '프랑스 혁명은 자유, 평등, 박애(우애)를 기본 이념으로 삼았습니다.', votes_avg: 4.8, votes_count: 110 },
    ],
    7: [
        { id: 701, type: 'multiple', text: '시간 복잡도 O(n log n)을 가지는 정렬 알고리즘이 아닌 것은?', options: ['버블 정렬', '퀵 정렬', '병합 정렬', '힙 정렬'], correct_answer: '버블 정렬', explanation: '버블 정렬의 평균 및 최악 시간 복잡도는 O(n^2)입니다. 퀵, 병합, 힙 정렬은 평균적으로 O(n log n)의 시간 복잡도를 가집니다.', votes_avg: 4.9, votes_count: 250 },
        { id: 702, type: 'subjective', text: '큐(Queue) 자료구조의 특징을 나타내는 약어는 무엇인가요?', correct_answer: 'FIFO', explanation: '큐는 First-In, First-Out (FIFO) 원칙에 따라 동작하는 자료구조입니다. 먼저 들어온 데이터가 먼저 나갑니다.', votes_avg: 4.7, votes_count: 200 },
    ]
};
const mockHistory: QuizAttempt[] = [
    { attemptId: 1, quizId: 1, userId: 'Admin', score: 2, totalQuestions: 3, date: Date.now() - 86400000, mode: 'exam' },
    { attemptId: 2, quizId: 2, userId: 'Admin', score: 1, totalQuestions: 2, date: Date.now() - 172800000, mode: 'study' },
    { attemptId: 3, quizId: 3, userId: 'Admin', score: 2, totalQuestions: 2, date: Date.now(), mode: 'exam' },
    { attemptId: 4, quizId: 4, userId: 'Admin', score: 0, totalQuestions: 2, date: Date.now() - 50000, mode: 'study' },
    { attemptId: 5, quizId: 5, userId: 'Admin', score: 1, totalQuestions: 2, date: Date.now() - 259200000, mode: 'exam' },
];


const App: React.FC = () => {
    const [page, setPage] = useState<Page>('home');
    const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
    const [activeQuizMode, setActiveQuizMode] = useState<QuizMode>('study');
    const [activeTimerConfig, setActiveTimerConfig] = useState<TimerConfig>({ mode: 'total', duration: 300 });

    //const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);

    // 처음엔 빈 배열로 두는 걸 추천 (mockQuizzes 대신)
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    //const [questions, setQuestions] = useState<Record<number, Question[]>>(mockQuestions);
    // ✅ 변경
    const [questions, setQuestions] = useState<Record<number, Question[]>>({});
    const [users, setUsers] = useState<User[]>(mockUsers);
    //const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>(mockHistory);
    const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);


    //const [isLoggedIn, setIsLoggedIn] = useState(false);
    //const [currentUser, setCurrentUser] = useState<string | null>(null);

    // 추가/교체 (username과 userId를 분리)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserName, setCurrentUserName] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

        // 2) 로더 함수 추가
    const loadHistory = async (uid: string) => {
    try {
        const res = await fetch(`${API_BASE}/api/history/${uid}`);
        if (res.ok) {
        const data: QuizAttempt[] = await res.json();
        setQuizHistory(data);
        } else {
        console.error('history fetch failed', await res.text());
        }
    } catch (e) {
        console.error(e);
    }
    };


        // 3) 앱 시작 시 로그인 복원되면 히스토리도 불러오기
    useEffect(() => {
        const uid = localStorage.getItem('qp.user_id');
        const uname = localStorage.getItem('qp.username');
        if (uid && uname) {
            setIsLoggedIn(true);
            setCurrentUserId(uid);
            setCurrentUserName(uname);
            // ✅ 복원되면 서버 히스토리도 즉시 로드
            loadHistory(uid);
        }
    }, []);

    const [alert, setAlert] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // ModeSelectionModal에 전달할 퀴즈 정보
    const [quizForModeSelection, setQuizForModeSelection] = useState<Quiz | null>(null); 
    // ^^^ 이 상태가 모달을 열고 닫는 역할을 합니다.

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedQuizPang');
        if (!hasVisited) {
            setShowWelcomeModal(true);
            localStorage.setItem('hasVisitedQuizPang', 'true');
        }
    }, []);

    useEffect(() => {
        loadQuizzes();          // ✅ 앱 시작할 때 서버 목록으로 동기화
    }, []);

    // 5) history 화면으로 들어갈 때 보장 로딩
    useEffect(() => {
        if (page === 'history') {
            const uid = currentUserId || localStorage.getItem('qp.user_id');
            if (uid) loadHistory(uid);        // ✅ 추가
        }
    }, [page, currentUserId]);


    // 서버에서 퀴즈 목록 가져오기
  const loadQuizzes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/list`);
      if (res.ok) {
        const list: Quiz[] = await res.json();
        setQuizzes(list);
      } else {
        console.error('quiz/list failed', await res.text());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuestions = async (quizId: number) => {
    // 이미 로드해둔 경우 재요청 생략
    if (questions[quizId]?.length) return;

    const res = await fetch(`${API_BASE}/api/quiz/${quizId}/questions`);
    if (!res.ok) {
        console.error('loadQuestions failed', await res.text());
        showCustomAlert('문제를 불러오지 못했습니다.');
        return;
    }
    const data = await res.json();              // { quiz: {...}, questions: [...] }
    setQuestions(prev => ({ ...prev, [quizId]: data.questions }));
  };

    const showCustomAlert = (message: string) => {
        setAlert({ isOpen: true, message });
    };

    const handleNavigate = (newPage: Page, quizId?: number) => {
        setPage(newPage);
        if (quizId) {
            setActiveQuizId(quizId);
        } else if (['quizList', 'home', 'history', 'ranking'].includes(newPage)) {
            setActiveQuizId(null);
        }
        setQuizForModeSelection(null); // Close modal on any navigation
        window.scrollTo(0, 0);
    };
    
   
    // 4) 로그인 성공 시에도 로드
    const handleLogin = (username: string) => {
        const uid = localStorage.getItem('qp.user_id'); // 백엔드가 저장해둔 것
        setIsLoggedIn(true);
        setCurrentUserName(username);
        setCurrentUserId(uid || null);
        if (uid) loadHistory(uid);          // ✅ 추가
        showCustomAlert(`${username}님, 환영합니다!`);
        handleNavigate('home');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUserName(null);
        setCurrentUserId(null);
        // 필요하면 localStorage도 정리
        localStorage.removeItem('qp.user_id'); localStorage.removeItem('qp.username');
        showCustomAlert('성공적으로 로그아웃되었습니다.');
        handleNavigate('home');
    };


    const handleSignUp = (username: string) => {
        // In a real app, this would involve API calls. Here, we'll just log the user in.
        handleLogin(username);
    };


    const handleSaveQuiz = async (newQuiz: Quiz, newQuestions: Question[]) => {
        // 기존 로컬 추가 로직을 유지해도 되지만,
        // 최종 진실원본은 서버이므로 저장 직후 동기화 한 번!
        // setQuizzes(prev => [...prev, newQuiz]);
        // setQuestions(prev => ({ ...prev, [newQuiz.quiz_id]: newQuestions }));
        await loadQuizzes();     // ✅ 저장 후 서버 기준 재동기화
    };
    

    const handleRateQuestion = async (quizId: number, questionId: number, rating: number) => {
        try {
            // 1) 서버에 반영
            const res = await fetch(`${API_BASE}/api/question/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, rating }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('rate failed', err);
                showCustomAlert(err.error || '평가 저장에 실패했습니다.');
                return;
            }

            // 2) 문제/퀴즈 데이터 재동기화
            await loadQuestions(quizId);   // 해당 퀴즈의 문제들(평점/카운트 포함) 최신화
            await loadQuizzes();           // 카드에 쓰는 quizzes 갱신 => 카드 평점 즉시 반영

            showCustomAlert('평가가 반영되었습니다.');
        } catch (e) {
            console.error(e);
            showCustomAlert('평가 저장 중 오류가 발생했습니다.');
        }
    };

    

    const handleQuizCompletion = async (
            quizId: number,
            score: number,
            totalQuestions: number,
            mode: QuizMode
        ) => {
        // 로그인 안 했으면 저장하지 않음
        const uid = currentUserId || localStorage.getItem('qp.user_id') || '';
        if (!uid) return;

        try {
            // ✅ 백엔드에 기록 저장 (학습/시험 모드 모두 저장)
            const res = await fetch(`${API_BASE}/api/attempt/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: uid,            // 문자열 ID (DB의 User.id)
                quizId,                 // 방금 푼 퀴즈의 quiz_id
                score,
                totalQuestions,
                mode,                   // 'study' 또는 'exam'
            }),
            });

            if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('attempt/save failed', err);
            showCustomAlert(err.error || '기록 저장에 실패했습니다.');
            }

            // ✅ 저장 후 내 기록 다시 불러오기
            const histRes = await fetch(`${API_BASE}/api/history/${uid}`);
            if (histRes.ok) {
            const historyFromServer = await histRes.json();
            setQuizHistory(historyFromServer); // 서버 규격과 동일한 필드로 내려온다고 가정
            }

            // 원하면 자동 이동
            // handleNavigate('history');

        } catch (e) {
            console.error(e);
            showCustomAlert('기록 저장 중 오류가 발생했습니다.');
        }
    };


    // 퀴즈 목록 페이지에서 퀴즈를 선택할 때 모드 선택 모달을 열도록 상태를 설정하는 함수
    const handleSelectQuizForModal = (quiz: Quiz) => {
        setQuizForModeSelection(quiz); // 이 함수가 모달을 엽니다.
    };

    // 기존의 handleSelectQuiz(quizId: number) 함수와 selectedQuiz 상태는 삭제했습니다.
    // const handleSelectQuiz = (quizId: number) => { ... } // 삭제됨
    // const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null); // 삭제됨


    const handleStartQuiz = (quizId: number, mode: QuizMode, timerConfig: TimerConfig) => {
        setQuizForModeSelection(null);
        setActiveQuizMode(mode);
        setActiveTimerConfig(timerConfig);

        // 비동기 호출을 즉시 실행해서 반환 타입은 여전히 void
        (async () => {
            await loadQuestions(quizId);
            handleNavigate('quizGame', quizId);
        })();
    };


    // 라인 170~176의 중복된 렌더링 JSX 블록도 제거했습니다.
    // {currentPage === 'quizList' && ( ... )} // 삭제됨


    const renderPage = () => {
        switch (page) {
            case 'quizList':
                // 수정: onSelectQuiz prop을 추가하고, questions prop은 제거했습니다.
                return <QuizListPage 
                    quizzes={quizzes} 
                    onNavigate={handleNavigate} 
                    onSelectQuiz={handleSelectQuizForModal} // 이 prop이 누락되어 오류가 발생했습니다.
                />;
            case 'quizGame':
                const activeQuiz = quizzes.find(q => q.quiz_id === activeQuizId);
                const activeQuestions = activeQuizId ? questions[activeQuizId] : [];
                return activeQuiz ? (
                    <QuizGamePage 
                        quiz={activeQuiz} 
                        questions={activeQuestions} 
                        onNavigate={handleNavigate} 
                        onRateQuestion={handleRateQuestion}
                        mode={activeQuizMode}
                        timerConfig={activeTimerConfig}
                        onQuizComplete={handleQuizCompletion}
                    />
                ) : <QuizListPage quizzes={quizzes} onNavigate={handleNavigate} onSelectQuiz={handleSelectQuizForModal} />; // onSelectQuiz prop 추가
            case 'quizCreation':
                return <QuizCreationPage onSaveQuiz={handleSaveQuiz} onNavigate={handleNavigate} showCustomAlert={showCustomAlert} />;
            case 'login':
                return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} showCustomAlert={showCustomAlert} />;
            case 'signup':
                return <SignUpPage onSignUp={handleSignUp} onNavigate={handleNavigate} showCustomAlert={showCustomAlert} />;
            case 'keyFeatures':
                return <KeyFeaturesPage onNavigate={handleNavigate} />;
            case 'quizCategories':
                return <QuizCategoriesPage onNavigate={handleNavigate} />;
            case 'projectGoals':
                return <ProjectGoalsPage onNavigate={handleNavigate} />;
            case 'ranking':
                return <RankingPage quizzes={quizzes} users={users} onNavigate={handleNavigate} />;
            case 'history':
                return (
                    <HistoryPage
                    history={quizHistory}
                    quizzes={quizzes}
                    currentUser={currentUserId}
                    onNavigate={handleNavigate}
                    onSelectQuiz={(quizId) => {
                        const q = quizzes.find(qz => qz.quiz_id === quizId);
                        if (q) {
                        // 기존 모달 열어주는 핸들러 재사용
                        setQuizForModeSelection(q);
                        } else {
                        // 목록으로 이동 + 안내
                        handleNavigate('quizList');
                        showCustomAlert('해당 퀴즈 정보를 목록에서 찾을 수 없어 목록으로 이동합니다.');
                        }
                    }}
                    />
                );
            case 'home':
            default:
                return <HomePage onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800">
            <Header onNavigate={handleNavigate} isLoggedIn={isLoggedIn} currentUser={currentUserName} onLogout={handleLogout} />
            <div className="flex-grow">
                {renderPage()}
            </div>
            <Footer />
            <CustomAlertModal isOpen={alert.isOpen} message={alert.message} onClose={() => setAlert({ isOpen: false, message: '' })} />
            <WelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
            <ModeSelectionModal
                quiz={quizForModeSelection}
                onClose={() => setQuizForModeSelection(null)}
                onStartQuiz={handleStartQuiz}
            />
        </div>
    );
};

export default App;
