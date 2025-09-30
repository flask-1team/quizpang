import React, { useState } from 'react';
import { Quiz, QuizMode, TimerMode, TimerConfig } from '../../types';

interface ModeSelectionModalProps {
    quiz: Quiz | null;
    onClose: () => void;
    onStartQuiz: (quizId: number, mode: QuizMode, timerConfig: TimerConfig) => void;
}

const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ quiz, onClose, onStartQuiz }) => {
    const [timerMode, setTimerMode] = useState<TimerMode>('total');
    const [totalTimeInput, setTotalTimeInput] = useState('5');
    const [perQuestionTimeInput, setPerQuestionTimeInput] = useState('30');

    if (!quiz) return null;
    
    const handleStartExam = () => {
        if (timerMode === 'total') {
            const duration = parseInt(totalTimeInput, 10) * 60;
            if (duration > 0) {
                // 이 부분: duration이 0보다 클 때만 호출
                onStartQuiz(quiz.quiz_id, 'exam', { mode: 'total', duration });
            } // duration이 0 이하면 호출하지 않음
        } else {
            const duration = parseInt(perQuestionTimeInput, 10);
            if (duration > 0) {
                // 이 부분: duration이 0보다 클 때만 호출
                onStartQuiz(quiz.quiz_id, 'exam', { mode: 'per-question', duration });
            } // duration이 0 이하면 호출하지 않음
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[100]">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">"{quiz.title}"</h2>
                <p className="text-gray-600 mb-8">어떤 모드로 퀴즈를 풀어보시겠어요?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Exam Mode Card */}
                    <div className="p-6 border-2 border-red-300 rounded-xl bg-red-50 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-red-800 mb-2">📝 시험 모드</h3>
                            <p className="text-sm text-red-700 mb-4">제한 시간 내에 실전처럼 문제를 풀어보세요.</p>
                             <div className="bg-red-200 rounded-full p-1 flex text-sm mb-4">
                                <button 
                                    onClick={() => setTimerMode('total')} 
                                    className={`w-1/2 rounded-full py-1 font-semibold transition-all ${timerMode === 'total' ? 'bg-white text-red-800 shadow' : 'text-red-700'}`}
                                >
                                    총 시간
                                </button>
                                <button 
                                    onClick={() => setTimerMode('per-question')}
                                    className={`w-1/2 rounded-full py-1 font-semibold transition-all ${timerMode === 'per-question' ? 'bg-white text-red-800 shadow' : 'text-red-700'}`}
                                >
                                    문제당
                                </button>
                            </div>
                            <div className="mb-4">
                                {timerMode === 'total' ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <label htmlFor="total-time" className="text-sm font-medium text-red-800">총 시간:</label>
                                        <input type="number" id="total-time" min="1" value={totalTimeInput} onChange={e => setTotalTimeInput(e.target.value)} className="w-20 p-1 text-center border border-red-300 rounded-md focus:ring-2 focus:ring-red-500"/>
                                        <span className="text-sm text-red-800">분</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <label htmlFor="per-question-time" className="text-sm font-medium text-red-800">문제당:</label>
                                        <input type="number" id="per-question-time" min="1" value={perQuestionTimeInput} onChange={e => setPerQuestionTimeInput(e.target.value)} className="w-20 p-1 text-center border border-red-300 rounded-md focus:ring-2 focus:ring-red-500"/>
                                        <span className="text-sm text-red-800">초</span>
                                    </div>
                                )}
                            </div>
                        </div>
                         <button 
                            className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors mt-auto"
                            onClick={handleStartExam}
                        >
                            시험 시작
                        </button>
                    </div>

                    {/* Study Mode Card */}
                    <div 
                        className="p-6 border-2 border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 hover:shadow-lg cursor-pointer transition-all flex flex-col justify-center"
                        onClick={() => onStartQuiz(quiz.quiz_id, 'study', { mode: 'total', duration: 0 })}
                    >
                        <h3 className="text-xl font-bold text-blue-800 mb-2">📚 학습 모드</h3>
                        <p className="text-sm text-blue-700">시간 제한 없이, 문제마다 정답과 해설을 확인하며 학습하세요.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeSelectionModal;
