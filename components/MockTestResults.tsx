
import React from 'react';
import Latex from 'react-latex-next';
import { MockTestResult } from '../types';

interface MockTestResultsProps {
  result: MockTestResult;
  onDone: () => void;
}

const MockTestResults: React.FC<MockTestResultsProps> = ({ result, onDone }) => {
    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Resultado do Simulado</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{result.examType} - {result.subject}</p>
            </div>

            {/* Score and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Pontuação</div>
                    <div className={`text-6xl font-extrabold ${result.score > 0.7 ? 'text-green-500' : result.score > 0.4 ? 'text-amber-500' : 'text-red-500'}`}>
                        {Math.round(result.score * 100)}%
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Respostas Corretas</div>
                    <div className="text-6xl font-extrabold text-slate-800 dark:text-white">
                        {Math.round(result.score * result.questions.length)}<span className="text-3xl text-slate-400">/{result.questions.length}</span>
                    </div>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Tempo</div>
                    <div className="text-6xl font-extrabold text-slate-800 dark:text-white">
                        {formatDuration(result.durationSeconds)}
                    </div>
                </div>
            </div>
            
            {/* AI Analysis */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <span className="text-2xl">✨</span>
                    <span>Análise da IA</span>
                </h2>
                <div className="prose prose-indigo dark:prose-invert max-w-none">
                    <Latex>{result.aiAnalysis}</Latex>
                </div>
            </div>

            {/* Question Review */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Revisão das Questões</h2>
                <div className="space-y-6">
                    {result.questions.map((q, index) => {
                        const userAnswerId = result.userAnswers[q.id];
                        const isCorrect = userAnswerId === q.correctOptionId;
                        const userAnswerText = q.options.find(opt => opt.id === userAnswerId)?.text;

                        return (
                            <div key={q.id} className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <p className="font-semibold">{index + 1}. <Latex>{q.question}</Latex></p>
                                <div className="mt-2 space-y-2 text-sm">
                                    {q.options.map(opt => {
                                        let classes = "p-2 rounded-md ";
                                        if (opt.id === q.correctOptionId) {
                                            classes += "bg-green-100 dark:bg-green-900/50";
                                        } else if (opt.id === userAnswerId) {
                                            classes += "bg-red-100 dark:bg-red-900/50";
                                        }
                                        return <div key={opt.id} className={classes}><Latex>{opt.text}</Latex></div>
                                    })}
                                </div>
                                <div className="mt-2 text-xs p-2 bg-slate-100 dark:bg-slate-700/50 rounded">
                                    <span className="font-bold">Sua resposta:</span> {userAnswerText ? <Latex>{userAnswerText}</Latex> : <span className="italic">Não respondida</span>} {isCorrect ? '✅' : '❌'}
                                </div>
                                <div className="mt-2 text-xs p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded">
                                    <span className="font-bold">Explicação:</span> <Latex>{q.explanation}</Latex>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="text-center">
                <button onClick={onDone} className="bg-indigo-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-600 transition-colors">
                    Voltar para Simulados
                </button>
            </div>

        </div>
    );
};

export default MockTestResults;