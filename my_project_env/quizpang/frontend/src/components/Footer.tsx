
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer id="main-footer" className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-lg font-bold mb-2">QuizPang! (퀴즈팡!) | 참여형 퀴즈 플랫폼</p>
                <p className="text-sm text-gray-400">Powered by React & Tailwind CSS</p>
                <p className="text-xs mt-4 text-gray-500">© 2024 QuizPang! All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
