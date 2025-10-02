import React, { useState, useEffect } from 'react';

// Flask 백엔드의 URL (현재 5001 포트에서 실행 중)
const API_BASE_URL = 'http://localhost:5001';

// RankingPageProps 인터페이스는 이제 API 호출에만 사용되는 onNavigate만 가집니다.
interface RankingPageProps {
    // onNavigate 함수는 페이지 이동 로직에 필요할 수 있으므로 유지합니다.
    onNavigate: (page: string) => void;
}

// 백엔드 API에서 받을 데이터 구조 정의
interface RankedUser {
    rank: number;
    userId: string;
    username: string;
    totalScore: number;
    quizCount: number;
}

const RankingPage: React.FC<RankingPageProps> = ({ onNavigate }) => {
    // 랭킹 데이터를 저장할 상태
    const [rankingData, setRankingData] = useState<RankedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // API 호출 함수
    const fetchRanking = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Flask 백엔드의 /api/ranking 엔드포인트 호출
            // **API_BASE_URL 상수를 사용하여 절대 경로로 호출합니다.**
            const response = await fetch(`${API_BASE_URL}/api/quiz/ranking`); 
            
            if (!response.ok) {
                // HTTP 상태 코드가 200 범위가 아니면 에러 처리
                throw new Error(`Failed to fetch ranking (Status: ${response.status})`);
            }
            
            const data: RankedUser[] = await response.json();
            
            // NOTE: 백엔드에서 순위가 이미 계산되어 오지만, 프론트엔드에서 rank가 빠진 채 올 경우를 대비해
            // rank를 추가하는 로직을 추가합니다. (현재 백엔드 코드에서는 rank가 포함되어 옴)
            const rankedDataWithRank = data.map((user, index) => ({
                ...user,
                rank: index + 1
            }));

            setRankingData(rankedDataWithRank);
        } catch (err) {
            console.error("Failed to fetch ranking:", err);
            
            let errorMessage = "랭킹 데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.";

            // 'Unexpected token <' 오류 발생 시, 백엔드 실행 여부를 확인하도록 명확히 안내
            if (err instanceof SyntaxError && String(err).includes("Unexpected token '<'")) {
                 errorMessage = `🚨 서버 응답 오류: 서버에서 예상치 못한 HTML 문서(JSON이 아님)가 반환되었습니다. Flask 서버(${API_BASE_URL})가 실행 중인지, 그리고 '/api/quiz/ranking' 엔드포인트가 정상 동작하는지 확인해주세요.`;
            } else if (err instanceof Error) {
                // API_BASE_URL을 사용하여 오류 메시지 강화
                errorMessage = `네트워크 또는 HTTP 오류: ${err.message}. (요청 URL: ${API_BASE_URL}/api/ranking)`;
            }

            // 사용자에게 표시할 에러 메시지 설정
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchRanking();
    }, []); // 빈 배열: 최초 1회만 실행

    // 랭킹 순위에 따른 메달 이모지 반환 함수
    const getMedal = (rank: number): string => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank.toString();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-screen">
                <div className="text-xl text-gray-600">랭킹 데이터 로딩 중...</div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex justify-center items-center h-full min-h-screen">
                <div className="text-xl text-red-500 p-8 rounded-lg bg-red-100 border border-red-400 text-center max-w-lg mx-auto">
                    <p>🚨 오류 발생</p>
                    <p className="text-sm text-red-700 mt-3 whitespace-pre-wrap">{error}</p>
                    <p className="text-sm text-red-400 mt-4 font-bold">🛠️ 해결 방법: 백엔드 서버(app.py)를 실행(재실행)하고 새로고침하세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-xl p-6">
                <h1 className="text-3xl font-extrabold text-center text-violet-700 mb-6">🏆 퀴즈 랭킹 보드</h1>
                <p className="text-center text-gray-500 mb-8">
                    총 획득 점수 기준으로 순위가 매겨집니다. 당신의 퀴즈 실력을 뽐내보세요!
                </p>

                <div className="space-y-4">
                    {rankingData.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {rankingData.map((user) => (
                                <li
                                    key={user.userId}
                                    className={`
                                        flex justify-between items-center p-4 rounded-xl transition duration-300
                                        ${
                                            user.rank === 1 ? 'bg-yellow-100 border-2 border-yellow-500 scale-[1.02]' :
                                            user.rank === 2 ? 'bg-gray-200 border-2 border-gray-400' :
                                            user.rank === 3 ? 'bg-orange-200 border-2 border-orange-400' :
                                            'bg-white border hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-3xl w-10 text-center font-black">
                                            {getMedal(user.rank)}
                                        </span>
                                        <div>
                                            <p className="text-lg font-bold text-gray-800">{user.username}</p>
                                            <p className="text-sm text-gray-500">
                                                제작 퀴즈: {user.quizCount}개
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-violet-700">
                                            {user.totalScore.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">총 획득 점수</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-gray-500 text-center py-10">
                            아직 랭킹에 등록된 사용자가 없습니다. 퀴즈를 풀고 점수를 획득해 보세요!
                         </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankingPage;
