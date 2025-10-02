import React, { useState, useEffect } from 'react'; // useEffect, useState 추가
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
    quizCount?: number;
    attemptCount?: number;
}

// -----------------------------------------------------
// 1. 랭킹 계산 로직 함수 분리 (클라이언트 측 계산 제거)
// -----------------------------------------------------
// 퀴즈 제작 랭킹 로직은 이제 백엔드에서 총 문제 수를 기준으로 계산하므로, 
// 기존의 generateCreatorRanking 함수는 제거했습니다.

// -----------------------------------------------------
// 2. 랭킹 리스트 컴포넌트 (반복되는 UI 분리)
// -----------------------------------------------------

// 헬퍼: 메달 아이콘
const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return <span className="font-bold text-gray-500">{`#${rank}`}</span>;
};

interface RankingListProps {
    title: string;
    description: string;
    rankedUsers: RankedUser[];
    scoreLabel: string;
    countLabel: string;
    icon: string;
    isLoading: boolean; // 로딩 상태 추가
}

const RankingList: React.FC<RankingListProps> = ({ 
    title, 
    description, 
    rankedUsers, 
    scoreLabel, 
    countLabel, 
    icon,
    isLoading
}) => {
    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">{icon}</span> {title}
            </h3>
            <p className="text-sm text-gray-500 mb-6">{description}</p>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[400px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full py-10">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                         <p className="ml-3 text-gray-500">랭킹 데이터 로딩 중...</p>
                    </div>
                ) : rankedUsers.length > 0 ? (
                    <ul className="space-y-4">
                        {rankedUsers.map((user) => (
                            <li
                                key={user.userId + title}
                                className={`p-4 rounded-lg flex items-center justify-between transition-all duration-300 ${
                                    user.rank === 1 ? 'bg-yellow-100 border-2 border-yellow-400 transform scale-105 shadow-md' :
                                    user.rank === 2 ? 'bg-gray-200 border-2 border-gray-400' :
                                    user.rank === 3 ? 'bg-orange-200 border-2 border-orange-400' :
                                    'bg-gray-50 border'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl w-12 text-center">{getMedal(user.rank)}</span>
                                    <div>
                                        <p className="text-lg font-bold text-gray-800">{user.username}</p>
                                        <p className="text-sm text-gray-500">
                                            {/* 제작 랭킹은 quizCount를, 풀이 랭킹은 attemptCount를 사용 */}
                                            {title === '퀴즈 제작 랭킹' 
                                                ? `${user.quizCount || 0}개의 퀴즈 제작`
                                                : `${user.attemptCount || 0}${countLabel}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-extrabold text-violet-700">
                                        {user.totalScore.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">{scoreLabel}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-10">랭킹 정보가 없습니다.</p>
                )}
            </div>
        </div>
    );
};


// -----------------------------------------------------
// 3. 메인 컴포넌트: 두 개의 랭킹 표시
// -----------------------------------------------------

const RankingPage: React.FC<RankingPageProps> = ({ quizzes, users, onNavigate }) => {
    
    // 퀴즈 제작 랭킹 상태 (백엔드에서 받아올 데이터)
    const [creatorRanking, setCreatorRanking] = useState<RankedUser[]>([]);
    const [isLoadingCreator, setIsLoadingCreator] = useState(true);

    // 퀴즈 풀이 랭킹 상태 (백엔드에서 받아올 데이터)
    const [attemptRanking, setAttemptRanking] = useState<RankedUser[]>([]);
    const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);

    // A. 백엔드에서 퀴즈 제작 랭킹 데이터를 가져오는 로직 (총 문제 수 기준)
    useEffect(() => {
        const fetchCreatorRanking = async () => {
            setIsLoadingCreator(true);
            try {
                // API 엔드포인트 호출 (기존 /api/ranking/creator 사용 가정)
                // 이 엔드포인트는 이제 총 제작 문제 수를 기준으로 정렬된 데이터를 반환합니다.
                const response = await fetch('/api/ranking/creator');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // 서버에서 이미 제작 문제 수(totalScore) 순으로 정렬되어 오므로 순위만 부여합니다.
                const rankedData: RankedUser[] = data.map((item: any, index: number) => ({
                    userId: item.userId,
                    username: item.username,
                    totalScore: item.totalScore, // 총 제작 문제 수 (랭킹 기준)
                    quizCount: item.quizCount, // 제작한 퀴즈 수
                    rank: index + 1, 
                    attemptCount: 0,
                }));

                setCreatorRanking(rankedData);

            } catch (error) {
                console.error("Failed to fetch creator ranking data:", error);
                setCreatorRanking([]);
            } finally {
                setIsLoadingCreator(false);
            }
        };

        fetchCreatorRanking();
    }, []); 
    
    // B. 백엔드에서 퀴즈 풀이 랭킹 데이터를 가져오는 로직 (맞춘 문제 수 기준)
    useEffect(() => {
        const fetchAttemptRanking = async () => {
            setIsLoadingAttempt(true);
            try {
                const response = await fetch('/api/ranking/attempt');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                const rankedData: RankedUser[] = data.map((item: any, index: number) => ({
                    userId: item.userId,
                    username: item.username,
                    totalScore: item.totalScore, // 맞춘 문제 수 (점수)
                    attemptCount: item.attemptCount, // 총 시도 횟수
                    rank: index + 1, // 서버가 정렬한 순서대로 순위 부여
                    quizCount: 0,
                }));

                setAttemptRanking(rankedData);

            } catch (error) {
                console.error("Failed to fetch attempt ranking data:", error);
                setAttemptRanking([]);
            } finally {
                setIsLoadingAttempt(false);
            }
        };

        fetchAttemptRanking();
    }, []);


    return (
        <div className="min-h-screen pt-10 pb-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    className="flex items-center text-gray-600 hover:text-violet-700 mb-10 transition duration-150"
                    onClick={() => onNavigate('home')}
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    <span className="font-semibold">홈으로 돌아가기</span>
                </button>
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900">명예의 전당 🏆</h2>
                    <p className="mt-4 text-xl text-gray-600">퀴즈 제작과 풀이, 두 분야의 마스터들을 만나보세요!</p>
                </div>

                {/* 2단 컨테이너: flex-col 대신 md:flex로 가로 배치 */}
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* 1. 퀴즈 제작 랭킹 */}
                    <div className="md:w-1/2">
                        <RankingList 
                            title="퀴즈 제작 랭킹"
                            description="사용자가 제작한 총 문제 수를 기준으로 순위가 결정됩니다. (문제 기여도)"
                            rankedUsers={creatorRanking}
                            scoreLabel="총 제작 문제 수"
                            countLabel="개의 퀴즈 제작"
                            icon="💡"
                            isLoading={isLoadingCreator}
                        />
                    </div>
                    
                    {/* 2. 퀴즈 풀이 랭킹 (API 호출로 실제 데이터 반영) */}
                    <div className="md:w-1/2">
                        <RankingList 
                            title="퀴즈 풀이 랭킹"
                            description="성공적으로 맞춘 문제 수(문제당 1점)를 기준으로 순위가 결정됩니다." 
                            rankedUsers={attemptRanking}
                            scoreLabel="총 획득 점수"
                            countLabel="개 문제 성공"
                            icon="🧠"
                            isLoading={isLoadingAttempt} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RankingPage;
