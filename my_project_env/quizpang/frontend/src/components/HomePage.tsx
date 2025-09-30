import React from 'react';
import { Page } from '../../types';

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    return (
        <main>
            <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 bg-purple-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                    {/* Text Content */}
                    <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
                            지식을 나누고,<br />
                            함께 성장하는 <span className="text-violet-700">퀴즈팡!</span>
                        </h1>
                        <p className="mt-4 text-xl text-gray-600 max-w-lg mx-auto md:mx-0">
                            투표와 랭킹으로 검증된, 사용자가 직접 만드는 참여형 학습 플랫폼.
                        </p>
                        <div className="mt-8 flex justify-center md:justify-start space-x-4">
                            <button
                                onClick={() => onNavigate('quizCreation')}
                                className="px-8 py-3 text-lg font-bold text-white bg-violet-700 rounded-full transition duration-300 ease-in-out hover:bg-violet-800 shadow-lg hover:shadow-xl"
                            >
                                나만의 퀴즈 만들기
                            </button>
                            <button
                                onClick={() => onNavigate('quizList')}
                                className="px-6 py-3 text-lg font-bold text-violet-700 bg-white border-2 border-violet-700 rounded-full transition duration-300 ease-in-out hover:bg-purple-100 shadow-md"
                            >
                                퀴즈 탐색하기
                            </button>
                        </div>
                    </div>

                    {/* Visual Placeholder */}
                    <div className="md:w-1/2 flex justify-center">
                        <div
                            onClick={() => onNavigate('quizGame')}
                            className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-purple-200 rounded-3xl shadow-2xl flex items-center justify-center p-6 cursor-pointer hover:bg-purple-300 transition duration-300"
                        >
                            <span className="text-4xl text-violet-700 font-bold">참여하기</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;