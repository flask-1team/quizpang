import React from 'react';
import { Page } from '../../types';

interface ProjectGoalsPageProps {
    onNavigate: (page: Page) => void;
}

const goalsData = [
    {
        title: '참여형 학습 문화 조성',
        description: '사용자가 직접 퀴즈 제작자로 참여하여 능동적인 학습 문화를 형성합니다.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        title: '지식 공유 플랫폼',
        description: '다양한 주제와 난이도의 문제를 집단 지성으로 축적하고 공유합니다.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.543-.543A9 9 0 0112 2a9 9 0 014.75 1.75l.543.543m0 0l-1.178 1.178a3 3 0 01-4.242 0l-1.178-1.178m0 0l-1.414-1.414A5.002 5.002 0 0112 5a5.002 5.002 0 01-2.929-.828z" />
            </svg>
        )
    },
    {
        title: '게임화 요소 강화',
        description: '투표, 랭킹, 추천 시스템을 통해 학습 동기를 부여하고 참여를 유도합니다.',
        icon: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        title: '교육적 확장성',
        description: '학교, 학원, 스터디 그룹 등 다양한 교육 환경에서 활용 가능한 도구를 제공합니다.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l5.373-2.986m0 0L12 6.5l5.627 2.514M23 12l-5.373-2.986m0 0L12 6.5l-5.627 2.514" />
            </svg>
        )
    }
];

const ProjectGoalsPage: React.FC<ProjectGoalsPageProps> = ({ onNavigate }) => {
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
                    <h2 className="text-base text-violet-700 font-semibold tracking-wide uppercase">Our Mission</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        프로젝트 목표
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        QuizPang!이 지향하는 가치와 비전을 소개합니다.
                    </p>
                </div>

                <div className="mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                       {goalsData.map((goal) => (
                           <div key={goal.title} className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-200 flex items-start space-x-4">
                               <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-violet-700 text-white">
                                   {goal.icon}
                               </div>
                               <div>
                                   <h3 className="text-xl font-bold text-gray-900 mb-2">{goal.title}</h3>
                                   <p className="text-gray-600">{goal.description}</p>
                               </div>
                           </div>
                       ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectGoalsPage;
