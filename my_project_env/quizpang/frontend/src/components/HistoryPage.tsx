import React, { useEffect, useMemo, useState } from 'react';
import { Page, QuizAttempt, Quiz } from '../../types';

interface HistoryPageProps {
  history: QuizAttempt[];      // <- 기존 prop은 그대로(호환)
  quizzes: Quiz[];
  currentUser: string | null;
  onNavigate: (page: Page) => void;
  onSelectQuiz: (quizId: number) => void;
}

type MyCreatedQuiz = {
  quizId: number;
  title: string;
  questionsCount: number;
  votesAvg: number;
  votesCount: number;
  createdAt: string | null;
};

const HistoryPage: React.FC<HistoryPageProps> = ({
  history, quizzes, currentUser, onNavigate, onSelectQuiz
}) => {
  const [myCreated, setMyCreated] = useState<MyCreatedQuiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(history);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/my/summary/${currentUser}`);
        if (res.ok) {
          const data = await res.json();
          setAttempts(data.attempts || []);
          setMyCreated(data.created || []);
        } else {
          console.error('my/summary failed', await res.text());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-700">로그인이 필요합니다.</h2>
        <button onClick={() => onNavigate('login')}
          className="mt-4 px-6 py-2 bg-violet-700 text-white font-semibold rounded-lg hover:bg-violet-800">
          로그인 페이지로
        </button>
      </div>
    );
  }

  const byLatest = (a: QuizAttempt, b: QuizAttempt) => b.date - a.date;

  const getQuizTitle = (id: number) =>
    quizzes.find(q => q.quiz_id === id)?.title || '알 수 없는 퀴즈';

  return (
    <div className="min-h-screen pt-10 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          className="flex items-center text-gray-600 hover:text-violet-700 mb-8"
          onClick={() => onNavigate('home')}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span className="font-semibold">홈으로 돌아가기</span>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900">나의 기록 🗂️</h2>
          <p className="mt-3 text-lg text-gray-600">{currentUser}님의 활동 현황입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 왼쪽: 내가 푼 기록 */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">🧠</span> 내가 푼 기록
            </h3>
            <p className="text-sm text-gray-500 mb-4">가장 최근 풀이부터 정렬됩니다.</p>
            <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[320px]">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  <span className="ml-3 text-gray-500">불러오는 중…</span>
                </div>
              ) : attempts.length ? (
                <ul className="space-y-4">
                  {attempts.sort(byLatest).map(a => (
                    <li key={a.attemptId}
                        className="p-4 rounded-lg bg-gray-50 border flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-800">{getQuizTitle(a.quizId)}</p>
                        <div className="text-sm text-gray-500 mt-1 flex items-center space-x-3">
                          <span>🕒 {new Date(a.date).toLocaleString()}</span>
                          <span>{a.mode === 'exam' ? '📝 시험' : '📚 학습'}</span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-violet-700">{a.score} / {a.totalQuestions}</p>
                          <p className="text-xs text-gray-500">점수</p>
                        </div>
                        <button
                          onClick={() => onSelectQuiz(a.quizId)}
                          className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 text-sm">
                          다시 풀기
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-10">풀이 기록이 없습니다. 지금 도전해보세요!</p>
              )}
            </div>
          </div>

          {/* 오른쪽: 내가 만든 기록 */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">💡</span> 내가 만든 기록
            </h3>
            <p className="text-sm text-gray-500 mb-4">내가 제작한 퀴즈와 문제 수, 평점.</p>
            <div className="bg-white p-6 rounded-xl shadow-lg border min-h-[320px]">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  <span className="ml-3 text-gray-500">불러오는 중…</span>
                </div>
              ) : myCreated.length ? (
                <ul className="space-y-4">
                  {myCreated.map(q => (
                    <li key={q.quizId}
                        className="p-4 rounded-lg bg-gray-50 border flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-800">{q.title}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          문제 {q.questionsCount}개 · 평점 {q.votesAvg?.toFixed(1)} ({q.votesCount})
                          {q.createdAt ? ` · 생성 ${new Date(q.createdAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => onSelectQuiz(q.quizId)}
                        className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 text-sm">
                        풀어보기
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-10">아직 만든 퀴즈가 없습니다. 첫 퀴즈를 만들어보세요!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
