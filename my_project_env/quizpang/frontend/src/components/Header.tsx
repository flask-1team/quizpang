import React from 'react';
import { Page } from '../../types';

interface HeaderProps {
    onNavigate: (page: Page) => void;
    isLoggedIn: boolean;
    currentUser: string | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isLoggedIn, currentUser, onLogout }) => {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('home')}>
                        <span className="text-3xl font-extrabold text-violet-700">QuizPang!</span>
                    </div>
                    
                    <nav className="hidden md:flex space-x-8 text-gray-600 font-semibold">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('keyFeatures'); }} className="hover:text-violet-700 transition duration-150">주요 기능</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('quizCategories'); }} className="hover:text-violet-700 transition duration-150">퀴즈 종류</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('projectGoals'); }} className="hover:text-violet-700 transition duration-150">프로젝트 목표</a>
                        {/* <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('ranking'); }} className="hover:text-violet-700 transition duration-150">명예의 전당</a> */}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                {/* <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('history'); }} className="text-gray-600 font-semibold hover:text-violet-700 transition duration-150 hidden sm:block">나의 기록</a> */}
                                <span className="text-gray-600 font-semibold hidden sm:block">환영합니다, {currentUser}님!</span>
                                <button onClick={onLogout} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:bg-gray-300 transition duration-150">
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => onNavigate('login')} className="text-gray-600 font-semibold hover:text-violet-700">로그인</button>
                                <button onClick={() => onNavigate('signup')} className="bg-violet-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-violet-800 transition duration-150">회원가입</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;