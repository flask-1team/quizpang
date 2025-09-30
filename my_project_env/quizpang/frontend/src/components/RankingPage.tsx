import React from 'react';
import { Page, Quiz, User } from '../types';

interface RankingPageProps {
    quizzes: Quiz[];
    users: User[];
    onNavigate: (page: Page) => void;
}

interface RankedUser {
    rank: number;
    userId: string;
    username: string;
    totalScore: number;
    quizCount: number;
}

const RankingPage: React.FC<RankingPageProps> = ({ quizzes, users, onNavigate }) => {
    // 1. Calculate scores
    const userScores = new Map<string, { score: number; quizCount: number }>();
    quizzes.forEach(quiz => {
        const userStat = userScores.get(quiz.creator_id) || { score: 0, quizCount: 0 };
        userStat.score += quiz.votes_avg * quiz.votes_count;
        userStat.quizCount += 1;
        userScores.set(quiz.creator_id, userStat);
    });

    // 2. Map to user data and sort
    const rankedUsers: RankedUser[] = Array.from(userScores.entries())
        .map(([userId, stats]) => {
            const user = users.find(u => u.id === userId);
            return {
                userId,
                username: user ? user.username : '알 수 없는 사용자',
                totalScore: Math.round(stats.score),
                quizCount: stats.quizCount,
            };
        })
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((user, index) => ({ ...user, rank: index + 1 }));

    // 3. Helper for medal icons
    const getMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return <span className="font-bold text-gray-500">{`#${rank}`}</span>;
    };

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
                    <h2 className="text-4xl font-extrabold text-gray-900">명예의 전당 🏆</h2>
                    <p className="mt-4 text-xl text-gray-600">최고의 퀴즈 마스터들을 만나보세요!</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-2xl">
                    {rankedUsers.length > 0 ? (
                        <ul className="space-y-4">
                            {rankedUsers.map((user) => (
                                <li
                                    key={user.userId}
                                    className={`p-4 rounded-lg flex items-center justify-between transition-all duration-300 ${
                                        user.rank === 1 ? 'bg-yellow-100 border-2 border-yellow-400 transform scale-105' :
                                        user.rank === 2 ? 'bg-gray-200 border-2 border-gray-400' :
                                        user.rank === 3 ? 'bg-orange-200 border-2 border-orange-400' :
                                        'bg-gray-50 border'
                                    }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-2xl w-12 text-center">{getMedal(user.rank)}</span>
                                        <div>
                                            <p className="text-lg font-bold text-gray-800">{user.username}</p>
                                            <p className="text-sm text-gray-500">{user.quizCount}개의 퀴즈 제작</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-extrabold text-violet-700">{user.totalScore.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">총 점수</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-gray-500 text-center py-10">아직 랭킹에 등록된 사용자가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankingPage;
