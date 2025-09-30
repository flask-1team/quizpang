import React from 'react';
import { Page } from '../../types';

interface KeyFeaturesPageProps {
    onNavigate: (page: Page) => void;
}

const KeyFeaturesPage: React.FC<KeyFeaturesPageProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen pt-10 pb-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button 
                    className="flex items-center text-gray-600 hover:text-violet-700 mb-6 transition duration-150" 
                    onClick={() => onNavigate('home')}>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    <span className="font-semibold">홈으로 돌아가기</span>
                </button>
                <div className="text-center">
                    <h2 className="text-base text-violet-700 font-semibold tracking-wide uppercase">Our Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        QuizPang!의 주요 기능
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        학습, 공유, 경쟁의 모든 것을 한 곳에서 경험하세요.
                    </p>
                </div>

                <div className="mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1: Quiz Creation */}
                        <div className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-200">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-700 text-white mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">1. 퀴즈 제작</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>직관적인 UI로 퀴즈 생성</li>
                                <li>객관식 / OX / 주관식 지원</li>
                                <li>이미지 첨부 가능</li>
                            </ul>
                        </div>

                        {/* Feature 2: Quiz Sharing */}
                        <div className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-200">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-700 text-white mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">2. 퀴즈 공유</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>링크 또는 코드로 공유</li>
                                <li>카테고리별 탐색 기능</li>
                            </ul>
                        </div>

                        {/* Feature 3: Quiz Participation */}
                        <div className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-200">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-700 text-white mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">3. 퀴즈 참여 및 풀이</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>실시간 결과 확인</li>
                                <li>정답률, 소요 시간 통계</li>
                            </ul>
                        </div>

                        {/* Feature 4: Ranking System */}
                        <div className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-200">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-700 text-white mb-4">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">4. 투표 및 랭킹</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>퀴즈 품질 평가 시스템</li>
                                <li>점수 기반 랭킹 제공</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyFeaturesPage;
