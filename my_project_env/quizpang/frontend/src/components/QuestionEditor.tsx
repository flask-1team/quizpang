import React from 'react';
import { Question, QuestionType } from '../../types';

interface QuestionEditorProps {
    index: number;
    question: Question;
    onUpdate: (index: number, question: Question) => void;
    onRemove: (index: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ index, question, onUpdate, onRemove }) => {
    
    const handleInputChange = (field: keyof Question, value: any) => {
        onUpdate(index, { ...question, [field]: value });
    };

    const handleOptionChange = (optionIndex: number, value: string) => {
        const newOptions = [...(question.options || [])];
        newOptions[optionIndex] = value;
        onUpdate(index, { ...question, options: newOptions });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as QuestionType;
        const newQuestion: Question = { ...question, type: newType, correct_answer: '' };
        if (newType === 'multiple') {
            newQuestion.options = ['', '', '', ''];
        } else if (newType === 'ox') {
            newQuestion.options = ['O', 'X'];
            newQuestion.correct_answer = '';
        }
        else {
            delete newQuestion.options;
        }
        onUpdate(index, newQuestion);
    };
    
    return (
        <div className="p-6 border border-purple-300 rounded-lg bg-purple-50">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-800">문제 {index + 1}</h4>
                <button 
                    onClick={() => onRemove(index)} 
                    className="text-red-500 hover:text-red-700 font-semibold transition duration-150"
                >
                    문제 삭제
                </button>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">문제 유형</label>
                <select 
                    value={question.type} 
                    onChange={handleTypeChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="multiple">객관식</option>
                    <option value="subjective">주관식</option>
                    <option value="ox">O/X</option>
                </select>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">문제 내용</label>
                <textarea 
                    value={question.text} 
                    onChange={(e) => handleInputChange('text', e.target.value)} 
                    placeholder="예: 대한민국의 수도는 어디일까요?"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={2}
                />
            </div>

            {question.type === 'multiple' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">보기 (정답 체크)</label>
                    <div className="space-y-2">
                        {question.options?.map((opt, i) => (
                            <div key={i} className="flex items-center">
                                <input 
                                    type="radio" 
                                    name={`answer-${question.id}`} 
                                    id={`answer-${question.id}-${i}`}
                                    checked={question.correct_answer === opt}
                                    onChange={() => handleInputChange('correct_answer', opt)}
                                    className="mr-2 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                                    disabled={!opt.trim()}
                                />
                                <input 
                                    type="text" 
                                    value={opt} 
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    placeholder={`보기 ${i + 1}`}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

             {question.type === 'ox' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">정답 선택</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name={`answer-${question.id}`} 
                                value="O"
                                checked={question.correct_answer === 'O'}
                                onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                                className="mr-2 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                            />
                            O
                        </label>
                         <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name={`answer-${question.id}`} 
                                value="X"
                                checked={question.correct_answer === 'X'}
                                onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                                className="mr-2 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300"
                            />
                            X
                        </label>
                    </div>
                </div>
            )}

            {question.type === 'subjective' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">정답</label>
                    <input 
                        type="text" 
                        value={question.correct_answer} 
                        onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                        placeholder="주관식 정답을 입력하세요."
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            )}

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">해설 (선택 사항)</label>
                <textarea 
                    value={question.explanation || ''} 
                    onChange={(e) => handleInputChange('explanation', e.target.value)} 
                    placeholder="정답에 대한 해설을 입력하세요."
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                />
            </div>
        </div>
    );
};

export default QuestionEditor;