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

    const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
    const [questions, setQuestions] = useState<Record<number, Question[]>>(mockQuestions);
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>(mockHistory);


    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

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
    
    const handleLogin = (username: string) => {
        setIsLoggedIn(true);
        setCurrentUser(username);
        showCustomAlert(`${username}님, 환영합니다!`);
        handleNavigate('home');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        showCustomAlert('성공적으로 로그아웃되었습니다.');
        handleNavigate('home');
    };

    const handleSignUp = (username: string) => {
        // In a real app, this would involve API calls. Here, we'll just log the user in.
        handleLogin(username);
    };

    const handleSaveQuiz = (newQuiz: Quiz, newQuestions: Question[]) => {
        const updatedQuizzes = [...quizzes, newQuiz];
        const updatedQuestions = { ...questions, [newQuiz.quiz_id]: newQuestions };
        setQuizzes(updatedQuizzes);
        setQuestions(updatedQuestions);
    };
    
    const handleRateQuestion = (quizId: number, questionId: number, rating: number) => {
        const updatedQuestions = { ...questions };
        const quizQuestions = updatedQuestions[quizId];
        if (quizQuestions) {
            const questionIndex = quizQuestions.findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
                const question = quizQuestions[questionIndex];
                const newTotalScore = (question.votes_avg * question.votes_count) + rating;
                const newVotesCount = question.votes_count + 1;
                question.votes_avg = newTotalScore / newVotesCount;
                question.votes_count = newVotesCount;
                setQuestions(updatedQuestions);
            }
        }
    };
    
    const handleQuizCompletion = (quizId: number, score: number, totalQuestions: number, mode: QuizMode) => {
        if (!currentUser) return; // Only save history if logged in

        const newAttempt: QuizAttempt = {
            attemptId: Date.now(),
            quizId,
            userId: currentUser, // Using username as ID for mock purposes
            score,
            totalQuestions,
            date: Date.now(),
            mode,
        };
        setQuizHistory(prevHistory => [...prevHistory, newAttempt]);
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
        handleNavigate('quizGame', quizId);
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
                return <HistoryPage history={quizHistory} quizzes={quizzes} currentUser={currentUser} onNavigate={handleNavigate} />;
            case 'home':
            default:
                return <HomePage onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800">
            <Header onNavigate={handleNavigate} isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={handleLogout} />
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