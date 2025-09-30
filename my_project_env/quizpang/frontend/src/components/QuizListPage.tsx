import React, { useState } from 'react';
import { Quiz, Page } from '../../types';
import { CATEGORIES } from '../../constants';

interface QuizListPageProps {
    quizzes: Quiz[];
    onNavigate: (page: Page) => void;
    // prop 이름은 QuizId가 아닌 Quiz 객체를 받으므로, quiz를 명시하는 것이 더 명확합니다.
    onSelectQuiz: (quiz: Quiz) => void; 
}

const QuizListPage: React.FC<QuizListPageProps> = ({ quizzes, onNavigate, onSelectQuiz }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuizzes = quizzes.filter(quiz => {
        const categoryMatch = selectedCategory === 'All' || quiz.category === selectedCategory;
        const searchMatch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });

    return (
        <div className="min-h-screen pt-10 pb-10 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button 
                    className="flex items-center text-gray-600 hover:text-violet-700 mb-6 transition duration-150" 
                    onClick={() => onNavigate('home')}>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    <span className="font-semibold">홈으로 돌아가기</span>
                </button>

                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900">퀴즈 탐색하기</h2>
                    <p className="mt-4 text-xl text-gray-600">흥미로운 퀴즈를 발견하고 지식을 테스트해보세요.</p>
                </div>

                {/* Filter and Search Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-white rounded-xl shadow-md">
                    <div className="w-full md:w-1/2 mb-4 md:mb-0">
                        <label htmlFor="search-quiz" className="sr-only">퀴즈 검색</label>
                        <input 
                            id="search-quiz"
                            type="text"
                            placeholder="퀴즈 제목으로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-700"
                        >
                            <option value="All">모든 카테고리</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {/* Quiz List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredQuizzes.length > 0 ? (
                        filteredQuizzes.map(quiz => (
                            <div 
                                key={quiz.quiz_id}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                // 68번째 줄 부근 수정: 화살표 함수 본문을 중괄호로 감싸서 유효한 구문으로 만듭니다.
                                onClick={() => {
                                    if (onSelectQuiz) {
                                        onSelectQuiz(quiz); 
                                    }
                                }}
                            >
                                <div>
                                    <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">{quiz.category}</span>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">제작자: {quiz.creator_id}</p>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3 mt-4">
                                    <span>{quiz.questions_count} 문제</span>
                                    <span>평점: {quiz.votes_avg.toFixed(1)} ★</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center py-10">해당 조건에 맞는 퀴즈가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizListPage;