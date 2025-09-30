import React from 'react';
import { Page, QuizAttempt, Quiz } from '../../types';

interface HistoryPageProps {
    history: QuizAttempt[];
    quizzes: Quiz[];
    currentUser: string | null;
    onNavigate: (page: Page) => void;
    onSelectQuiz: (quizId: number) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, quizzes, currentUser, onNavigate, onSelectQuiz }) => {
    if (!currentUser) {
        return (
            <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-700">로그인이 필요합니다.</h2>
                <button onClick={() => onNavigate('login')} className="mt-4 px-6 py-2 bg-violet-700 text-white font-semibold rounded-lg hover:bg-violet-800 transition duration-150">
                    로그인 페이지로
                </button>
            </div>
        );
    }

    const userHistory = history
        .filter(attempt => attempt.userId === currentUser)
        .sort((a, b) => b.date - a.date); // Sort by most recent first

    const getQuizTitle = (quizId: number) => {
        const quiz = quizzes.find(q => q.quiz_id === quizId);
        return quiz ? quiz.title : '알 수 없는 퀴즈';
    };

    const formatDateGroup = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return '오늘';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return '어제';
        }
        return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    };

    const groupedHistory = userHistory.reduce((acc, attempt) => {
        const dateKey = new Date(attempt.date).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(attempt);
        return acc;
    }, {} as Record<string, QuizAttempt[]>);

    const sortedGroupKeys = Object.keys(groupedHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="min-h-screen pt-10 pb-10 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    className="flex items-center text-gray-600 hover:text-violet-700 mb-6 transition duration-150"
                    onClick={() => onNavigate('home')}
                >
                     <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                     </svg>
                    <span className="font-semibold">홈으로 돌아가기</span>
                </button>
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900">나의 퀴즈 기록 📜</h2>
                    <p className="mt-4 text-xl text-gray-600">{currentUser}님의 퀴즈 참여 내역입니다.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-2xl">
                    {userHistory.length > 0 ? (
                        <div>
                            {sortedGroupKeys.map((dateKey) => (
                                <div key={dateKey} className="mb-6 last:mb-0">
                                    <h3 className="text-lg font-bold text-gray-600 my-3 pl-2 border-l-4 border-violet-300">
                                        {formatDateGroup(new Date(dateKey).getTime())}
                                    </h3>
                                    <ul className="space-y-4">
                                        {groupedHistory[dateKey].map((attempt) => (
                                            <li
                                                key={attempt.attemptId}
                                                className="p-4 rounded-lg bg-gray-50 border flex flex-col sm:flex-row items-start sm:items-center justify-between"
                                            >
                                                <div className="flex-grow mb-3 sm:mb-0">
                                                    <p className="text-lg font-bold text-gray-800">{getQuizTitle(attempt.quizId)}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <span>
                                                            🕒 {new Date(attempt.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span>
                                                            {attempt.mode === 'exam' ? '📝 시험 모드' : '📚 학습 모드'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 w-full sm:w-auto">
                                                   <div className="text-right flex-grow sm:flex-grow-0">
                                                        <p className="text-xl font-extrabold text-violet-700">{attempt.score} / {attempt.totalQuestions}</p>
                                                        <p className="text-xs text-gray-500">점수</p>
                                                    </div>
                                                    <button
                                                        onClick={() => onSelectQuiz(attempt.quizId)}
                                                        className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition duration-150 text-sm whitespace-nowrap"
                                                    >
                                                        다시 풀기
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-500 text-center py-10">아직 퀴즈를 푼 기록이 없습니다. 지금 도전해보세요!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;