import React, { useState, useEffect, useMemo } from 'react';
import { Quiz, Question, Page, QuizMode, TimerConfig } from '../../types';

interface QuizGamePageProps {
    quiz: Quiz;
    questions: Question[];
    onNavigate: (page: Page) => void;
    onRateQuestion: (quizId: number, questionId: number, rating: number) => void;
    mode: QuizMode;
    timerConfig: TimerConfig; // 이 prop이 undefined일 수 있습니다.
    onQuizComplete: (quizId: number, score: number, totalQuestions: number, mode: QuizMode) => void;
}

const StarRating: React.FC<{ onRate: (rating: number) => void }> = ({ onRate }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isRated, setIsRated] = useState(false);

    const handleRate = (rate: number) => {
        if (isRated) return;
        setRating(rate);
        onRate(rate);
        setIsRated(true);
    };

    if (isRated) {
        return <p className="text-center text-sm text-green-600 font-semibold">평가해주셔서 감사합니다!</p>;
    }

    return (
        <div className="flex justify-center items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-colors duration-150"
                    aria-label={`Rate ${star} stars`}
                >
                    <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                </button>
            ))}
        </div>
    );
};

const QuizGamePage: React.FC<QuizGamePageProps> = ({ 
    quiz, 
    questions, 
    onNavigate, 
    onRateQuestion, 
    mode, 
    // timerConfig에 기본값을 설정하거나 구조 분해 시 기본값을 설정합니다.
    timerConfig = { mode: 'total', duration: 0 }, // 수정: props 정의가 아닌 구조 분해 시 기본값 설정
    onQuizComplete
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false); // Only for study mode
    const [timeLeft, setTimeLeft] = useState(timerConfig.duration);
    // props의 구조 분해 (Destructuring) 부분에서 기본값을 설정하거나, 
    // 혹은 useMemo나 useState에서 접근 시 방어적 코드를 사용합니다.
    const initialTimerValue = timerConfig?.duration ?? 0; // 안전하게 접근: timerConfig가 없거나 duration이 없으면 0을 사용


    useEffect(() => {
        if (showResult) {
            onQuizComplete(quiz.quiz_id, score, questions.length, mode);
        }
    }, [showResult]);

    useEffect(() => {
        if (mode !== 'exam' || showResult) return;

        if (timeLeft <= 0) {
            if (timerConfig.mode === 'total') {
                setShowResult(true);
            } else { // per-question timeout
                processAnswerAndMoveNext(true); // timeout flag
            }
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [mode, showResult, timeLeft, timerConfig.mode]);
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered && mode === 'study') return;
        setSelectedAnswer(answer);
    };

    const processAnswerAndMoveNext = (isTimeout: boolean = false) => {
        const answerToRecord = isTimeout ? null : selectedAnswer;
        
        if (!isTimeout && selectedAnswer === null) return;
        
        if (!isTimeout) {
            const isCorrect = selectedAnswer!.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
            if (isCorrect) {
                setScore(score + 1);
            }
        }
        
        setUserAnswers([...userAnswers, answerToRecord]);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            if (timerConfig.mode === 'per-question') {
                setTimeLeft(timerConfig.duration);
            }
        } else {
            setShowResult(true);
        }
    };

    const handleSubmitAnswerForStudy = () => {
        if (selectedAnswer === null) return;
        const isCorrect = selectedAnswer.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
        if (isCorrect) {
            setScore(score + 1);
        }
        setUserAnswers([...userAnswers, selectedAnswer]);
        setIsAnswered(true);
    };

    const handleNextQuestionForStudy = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };
    
    const getOptionClass = (option: string) => {
        if (mode === 'exam' || !isAnswered) {
            return selectedAnswer === option
                ? 'bg-violet-200 border-violet-700'
                : 'bg-white border-gray-300 hover:bg-gray-100';
        }

        // Study Mode Feedback
        const isCorrectAnswer = option.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
        const isSelectedAnswer = option.toLowerCase() === selectedAnswer?.toLowerCase();

        if (isCorrectAnswer) return 'bg-green-200 border-green-700 text-green-900 pointer-events-none';
        if (isSelectedAnswer) return 'bg-red-200 border-red-700 text-red-900 pointer-events-none';
        return 'bg-gray-100 border-gray-300 opacity-60 pointer-events-none';
    };


    if (!quiz || !questions || questions.length === 0) {
        return (
            <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-700">퀴즈를 불러올 수 없습니다.</h2>
                <button onClick={() => onNavigate('quizList')} className="mt-4 px-6 py-2 bg-violet-700 text-white font-semibold rounded-lg hover:bg-violet-800 transition duration-150">
                    퀴즈 목록으로 돌아가기
                </button>
            </div>
        );
    }
    
    if (showResult) {
        return (
            <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex flex-col justify-center items-center">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-2xl w-full">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">퀴즈 결과</h2>
                    <p className="text-xl text-gray-600 mb-6">총 {questions.length}문제 중 <span className="text-violet-700 font-bold">{score}</span>문제를 맞혔습니다!</p>
                    <div className="mb-8 max-h-96 overflow-y-auto">
                        {questions.map((q, i) => (
                            <div key={q.id} className="p-4 border-b text-left">
                                <p className="font-semibold">{i + 1}. {q.text}</p>
                                <p className={`mt-1 ${userAnswers[i]?.toLowerCase() === q.correct_answer.toLowerCase() ? 'text-green-600' : 'text-red-600'}`}>
                                    내 답변: {userAnswers[i] || '미입력'} | 정답: {q.correct_answer}
                                </p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => onNavigate('quizList')} className="px-8 py-3 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 transition duration-150">
                        다른 퀴즈 풀기
                    </button>
                </div>
            </div>
        );
    }
    
    const displayTime = timerConfig.mode === 'total' ? formatTime(timeLeft) : `${timeLeft} 초`;
    const timeColor = (timerConfig.mode === 'total' && timeLeft < 60) || (timerConfig.mode === 'per-question' && timeLeft < 10) ? 'text-red-600' : 'text-gray-800';


    return (
        <div className="min-h-screen pt-10 pb-10 bg-gray-50 flex flex-col justify-center items-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`text-sm font-semibold ${mode === 'exam' ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'} px-2 py-1 rounded-full`}>
                            {mode === 'exam' ? `📝 시험 모드 (${timerConfig.mode === 'total' ? '총 시간' : '문제당'})` : '📚 학습 모드'}
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-2">{quiz.title}</h2>
                        <p className="text-gray-500 mt-1">문제 {currentQuestionIndex + 1} / {questions.length}</p>
                    </div>
                    {mode === 'exam' && (
                        <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-sm font-semibold text-gray-500">남은 시간</p>
                            <p className={`text-3xl font-bold ${timeColor}`}>
                                {displayTime}
                            </p>
                        </div>
                    )}
                </div>

                <div className="my-8 p-6 bg-purple-50 rounded-lg">
                    <p className="text-xl font-semibold text-gray-800">{currentQuestion.text}</p>
                </div>

                <div className="space-y-4">
                    {currentQuestion.type === 'multiple' && currentQuestion.options?.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition duration-150 ${getOptionClass(option)}`}
                            disabled={mode === 'study' && isAnswered}
                        >
                            {option}
                        </button>
                    ))}
                    {currentQuestion.type === 'ox' && (
                        <div className="flex justify-center space-x-4">
                            <button onClick={() => handleAnswerSelect('O')} className={`px-12 py-4 rounded-lg border-2 text-2xl font-bold transition duration-150 ${getOptionClass('O')}`} disabled={mode === 'study' && isAnswered}>O</button>
                            <button onClick={() => handleAnswerSelect('X')} className={`px-12 py-4 rounded-lg border-2 text-2xl font-bold transition duration-150 ${getOptionClass('X')}`} disabled={mode === 'study' && isAnswered}>X</button>
                        </div>
                    )}
                     {currentQuestion.type === 'subjective' && (
                        <input 
                            type="text"
                            value={selectedAnswer || ''}
                            onChange={(e) => handleAnswerSelect(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700 disabled:bg-gray-100"
                            placeholder="정답을 입력하세요."
                            disabled={mode === 'study' && isAnswered}
                        />
                    )}
                </div>

                {mode === 'study' && isAnswered && (
                    <div className="mt-6 space-y-4">
                        <div className={`p-4 rounded-lg text-center font-bold text-lg ${selectedAnswer?.toLowerCase() === currentQuestion.correct_answer.toLowerCase() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {selectedAnswer?.toLowerCase() === currentQuestion.correct_answer.toLowerCase() ? '🎉 정답입니다!' : `❌ 오답입니다. (정답: ${currentQuestion.correct_answer})`}
                        </div>
                        {currentQuestion.explanation && (
                            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                                <h4 className="font-bold">해설</h4>
                                <p>{currentQuestion.explanation}</p>
                            </div>
                        )}
                        <div className="p-4 bg-gray-100 rounded-lg">
                             <h4 className="font-bold text-center mb-2 text-gray-700">이 문제는 어땠나요?</h4>
                             <StarRating onRate={(rating) => onRateQuestion(quiz.quiz_id, currentQuestion.id, rating)} />
                        </div>
                    </div>
                )}


                <div className="mt-8 text-right">
                    {mode === 'study' ? (
                        !isAnswered ? (
                            <button 
                                onClick={handleSubmitAnswerForStudy} 
                                disabled={selectedAnswer === null}
                                className="px-8 py-3 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 disabled:bg-gray-400 transition duration-150"
                            >
                                답변 제출
                            </button>
                        ) : (
                             <button 
                                onClick={handleNextQuestionForStudy}
                                className="px-8 py-3 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 transition duration-150"
                            >
                                {currentQuestionIndex === questions.length - 1 ? '결과 보기' : '다음 문제'}
                            </button>
                        )
                    ) : (
                        <button 
                            onClick={() => processAnswerAndMoveNext()} 
                            disabled={selectedAnswer === null}
                            className="px-8 py-3 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 disabled:bg-gray-400 transition duration-150"
                        >
                             {currentQuestionIndex === questions.length - 1 ? '결과 제출' : '다음 문제'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizGamePage;