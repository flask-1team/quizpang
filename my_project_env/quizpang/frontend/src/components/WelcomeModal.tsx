
import React from 'react';
// import { pandaImage } from '../assets/panda-image'

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[100]">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                {/* <img src="../assets/팡팡이5.png" alt="Panda character" className="w-45 h-32 mx-auto mb-4" /> */}
                <h2 className="text-3xl font-extrabold text-violet-700 mb-2">QuizPang!에 오신 것을 환영합니다!</h2>
                <p className="text-gray-600 mb-6">
                    사용자가 직접 만들고 평가하는 참여형 퀴즈 플랫폼, 퀴즈팡!에서<br />
                    다양한 지식을 탐험하고 당신의 지식을 공유해보세요.
                </p>
                <button 
                    onClick={onClose} 
                    className="px-8 py-3 bg-violet-700 text-white font-bold rounded-full hover:bg-violet-800 transition duration-150 shadow-lg"
                >
                    시작하기
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;
