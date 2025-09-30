
import React from 'react';

interface CustomAlertModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">알림</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-violet-700 text-white font-semibold rounded-lg hover:bg-violet-800 transition duration-150">확인</button>
                </div>
            </div>
        </div>
    );
};

export default CustomAlertModal;
