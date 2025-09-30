import React from 'react';
import { Page } from '../../types';

interface QuizCategoriesPageProps {
    onNavigate: (page: Page) => void;
}

const categoryData = [
    {
        name: '자격증',
        description: '정보처리기사, 컴활 등 다양한 자격증 시험을 대비하세요.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
    },
    {
        name: '어학',
        description: 'TOEIC, TOEFL, TOPIK 등 어학 능력 향상을 위한 퀴즈들을 만나보세요.',
        icon: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
        ),
    },
    {
        name: '교과서',
        description: '초등, 중등, 고등 교과 과정에 맞춘 학습 퀴즈로 내신을 관리하세요.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        name: '시험 준비',
        description: '공무원 시험, 수능, NCS 등 각종 중요한 시험을 체계적으로 준비하세요.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
    },
    {
        name: '상식',
        description: '역사, 과학, 문화, 예술 등 알아두면 쓸모있는 다양한 상식을 넓혀보세요.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
    {
        name: '기타',
        description: '취미, 게임, 트렌드 등 흥미로운 주제의 퀴즈를 즐겨보세요.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
        ),
    },
];


const QuizCategoriesPage: React.FC<QuizCategoriesPageProps> = ({ onNavigate }) => {
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
                    <h2 className="text-base text-violet-700 font-semibold tracking-wide uppercase">Categories</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        퀴즈 종류
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        다양한 분야의 퀴즈를 탐색하고 새로운 지식을 발견하세요.
                    </p>
                </div>

                <div className="mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {categoryData.map((category) => (
                           <div key={category.name} className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-200 transform hover:-translate-y-1 transition-transform duration-300">
                               <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-700 text-white mb-4">
                                   {category.icon}
                               </div>
                               <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                               <p className="text-gray-600">{category.description}</p>
                           </div>
                       ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizCategoriesPage;