
import React, { useState } from 'react';
import { User, MockTestResult } from '../types';

interface MockTestLobbyProps {
  user: User;
  onStartTest: (examType: string, subject: string) => void;
  onReviewResult: (resultId: string) => void;
}

const EXAM_OPTIONS = [
    { id: 'enem-natureza', name: 'ENEM - Ciências da Natureza', subjects: ['Biologia', 'Física', 'Química'] },
    { id: 'enem-humanas', name: 'ENEM - Ciências Humanas', subjects: ['História', 'Geografia', 'Filosofia'] },
    { id: 'fuvest-bio', name: 'FUVEST - Biologia (1ª Fase)', subjects: ['Biologia Celular', 'Genética', 'Ecologia'] }
];

const MockTestLobby: React.FC<MockTestLobbyProps> = ({ user, onStartTest, onReviewResult }) => {
    const [selectedExamId, setSelectedExamId] = useState(EXAM_OPTIONS[0].id);
    const [selectedSubject, setSelectedSubject] = useState(EXAM_OPTIONS[0].subjects[0]);

    const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newExamId = e.target.value;
        setSelectedExamId(newExamId);
        const exam = EXAM_OPTIONS.find(ex => ex.id === newExamId);
        if (exam) {
            setSelectedSubject(exam.subjects[0]);
        }
    };
    
    const selectedExam = EXAM_OPTIONS.find(ex => ex.id === selectedExamId);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Simulados</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Prepare-se com testes gerados por IA no estilo dos principais vestibulares.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Novo Simulado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="exam-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prova</label>
                        <select id="exam-type" value={selectedExamId} onChange={handleExamChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {EXAM_OPTIONS.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                        </select>
                    </div>
                     <div className="md:col-span-1">
                        <label htmlFor="exam-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Área de Foco</label>
                        <select id="exam-subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                             {selectedExam?.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>
                    <button onClick={() => onStartTest(selectedExam?.name || '', selectedSubject)} className="w-full md:w-auto bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-600 transition-colors">
                        Começar
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                 <h2 className="text-2xl font-bold mb-4">Histórico de Simulados</h2>
                 {user.mockTestResults.length > 0 ? (
                     <div className="space-y-3">
                         {user.mockTestResults.map(result => (
                             <div key={result.id} className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg flex flex-wrap justify-between items-center gap-2">
                                 <div>
                                    <p className="font-bold">{result.examType} - {result.subject}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Realizado em {new Date(result.completedDate).toLocaleDateString()}
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <p className="font-bold text-lg">{Math.round(result.score * 100)}%</p>
                                    <button onClick={() => onReviewResult(result.id)} className="bg-indigo-500 text-white font-semibold py-1 px-4 rounded-lg hover:bg-indigo-600 text-sm">
                                        Revisar
                                    </button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                    <p className="text-slate-500 dark:text-slate-400">Você ainda não completou nenhum simulado. Comece um novo para testar seus conhecimentos!</p>
                 )}
            </div>
        </div>
    );
};

export default MockTestLobby;