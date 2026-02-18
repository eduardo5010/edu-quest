
import React, { useState, useEffect } from 'react';
import Latex from 'react-latex-next';
import { MockTestQuestion } from '../types';

interface MockTestSessionProps {
    test: {
        id: string;
        examType: string;
        subject: string;
        questions: MockTestQuestion[];
    };
    onFinishTest: (
        test: MockTestSessionProps['test'],
        userAnswers: Record<string, string>,
        durationSeconds: number
    ) => void;
}

const MockTestSession: React.FC<MockTestSessionProps> = ({ test, onFinishTest }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleSelectOption = (questionId: string, optionId: string) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };
    
    const handleFinish = () => {
        if (window.confirm("Tem certeza que deseja finalizar o simulado?")) {
            onFinishTest(test, userAnswers, elapsedTime);
        }
    };

    const currentQuestion = test.questions[currentQuestionIndex];
    const answeredCount = Object.keys(userAnswers).length;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
            <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold">{test.examType}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{test.subject}</p>
                </div>
                <div className="text-lg font-mono font-semibold bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-md">
                    {formatTime(elapsedTime)}
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex-grow">
                    <p className="font-semibold text-indigo-500">Questão {currentQuestionIndex + 1} de {test.questions.length}</p>
                    <div className="prose dark:prose-invert max-w-none mt-2">
                        <Latex>{currentQuestion.question}</Latex>
                    </div>

                    <div className="mt-6 space-y-3">
                        {currentQuestion.options.map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors flex items-start space-x-4 ${userAnswers[currentQuestion.id] === option.id ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 border-slate-300 dark:border-slate-600'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-1 flex items-center justify-center font-bold text-sm ${userAnswers[currentQuestion.id] === option.id ? 'bg-indigo-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
                                    {String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                                </div>
                                <div><Latex>{option.text}</Latex></div>
                            </button>
                        ))}
                    </div>
                </div>

                <footer className="mt-6 flex justify-between items-center">
                    <button 
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="bg-white dark:bg-slate-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                     <p className="text-sm font-semibold text-slate-500">{answeredCount} de {test.questions.length} respondidas</p>
                    {currentQuestionIndex < test.questions.length - 1 ? (
                        <button 
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                            className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-600"
                        >
                            Próxima
                        </button>
                    ) : (
                         <button 
                            onClick={handleFinish}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-green-600"
                        >
                            Finalizar
                        </button>
                    )}
                </footer>
            </main>
        </div>
    );
};

export default MockTestSession;
