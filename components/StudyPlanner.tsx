
import React, { useState } from 'react';
import { StudyCycle, Subject, User, UnavailableSlot, ScheduleSlot } from '../types';
import { geminiService } from '../services/geminiService';

interface StudyPlannerProps {
    user: User;
    cycles: StudyCycle[];
    subjects: Subject[];
    onUpdateCycles: (cycles: StudyCycle[]) => void;
    onUpdateSubjects: (subjects: Subject[]) => void;
    onUpdateUser: (user: User) => void;
    onScheduleUpdate: (schedule: ScheduleSlot[]) => void;
}

const LoadingSpinner: React.FC = () => ( <div className="flex justify-center items-center space-x-2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div><span className="text-slate-500 dark:text-slate-400">AI is planning...</span></div> );

const ScheduleView: React.FC<{ schedule: ScheduleSlot[], subjects: Subject[] }> = ({ schedule, subjects }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // FIX: Explicitly type the Map to help TypeScript inference.
    const subjectsMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

    return (
        <div className="mt-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
             <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-2">
                {days.map(day => <div key={day}>{day.substring(0,3)}</div>)}
            </div>
             <div className="grid grid-cols-7 gap-1">
                {days.map(day => (
                    <div key={day} className="bg-white dark:bg-slate-800 rounded p-1 space-y-1 min-h-[100px]">
                        {schedule.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime)).map((slot, i) => {
                            const subject = subjectsMap.get(slot.subjectId);
                            return (
                                <div key={i} className={`p-1 rounded text-xs ${slot.type === 'fixed' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-sky-100 dark:bg-sky-900'}`}>
                                    <p className="font-bold truncate">{subject?.name || 'Subject'}</p>
                                    <p>{slot.startTime}-{slot.endTime}</p>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const StudyPlanner: React.FC<StudyPlannerProps> = ({ user, cycles, subjects, onUpdateCycles, onUpdateSubjects, onUpdateUser, onScheduleUpdate }) => {
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(cycles[0]?.id || null);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
    
    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim() || !selectedCycleId) return;

        const { difficulty, summary } = await geminiService.analyzeAndSummarizeSubject(newSubjectName);
        
        const newSubject: Subject = {
            id: `subject-${Date.now()}`,
            name: newSubjectName,
            difficulty,
            content: [{ type: 'pdf_summary', title: 'AI-Generated Summary', summary }]
        };

        const updatedSubjects = [...subjects, newSubject];
        onUpdateSubjects(updatedSubjects);

        const updatedCycles = cycles.map(c => c.id === selectedCycleId ? { ...c, subjectIds: [...c.subjectIds, newSubject.id] } : c);
        onUpdateCycles(updatedCycles);
        
        setNewSubjectName('');
    }

    const handleGenerateSchedule = async () => {
        setIsLoadingSchedule(true);
        const userSubjects = subjects.filter(s => cycles.find(c => c.id === selectedCycleId)?.subjectIds.includes(s.id));
        try {
            const newSchedule = await geminiService.generateWeeklySchedule(user, userSubjects);
            onScheduleUpdate(newSchedule);
        } catch (error) {
            console.error("Failed to generate schedule", error);
        } finally {
            setIsLoadingSchedule(false);
        }
    };

    const selectedCycleSubjects = subjects.filter(s => cycles.find(c => c.id === selectedCycleId)?.subjectIds.includes(s.id));

    return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Study Planner</h1><p className="text-slate-500 dark:text-slate-400 mt-1">Organize your studies and create a personalized schedule.</p></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cycles and Subjects */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">My Study Cycles</h2>
                        {cycles.map(cycle => (
                            <button key={cycle.id} onClick={() => setSelectedCycleId(cycle.id)} className={`w-full text-left p-2 rounded ${selectedCycleId === cycle.id ? 'bg-indigo-100 dark:bg-indigo-900 font-bold' : ''}`}>
                                {cycle.name}
                            </button>
                        ))}
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Subjects in Cycle</h2>
                        <ul className="space-y-2">{selectedCycleSubjects.map(s => <li key={s.id} className="p-2 bg-slate-100 dark:bg-slate-700 rounded">{s.name} <span className="text-xs text-slate-500">({s.difficulty})</span></li>)}</ul>
                        <form onSubmit={handleAddSubject} className="mt-4 flex space-x-2">
                            <input type="text" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="New subject name" className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500 text-sm"/>
                            <button type="submit" className="bg-indigo-500 text-white px-3 rounded hover:bg-indigo-600">+</button>
                        </form>
                    </div>
                </div>
                {/* Schedule */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">My Weekly Schedule</h2>
                        <button onClick={handleGenerateSchedule} disabled={isLoadingSchedule} className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 disabled:bg-indigo-400 text-sm">
                            {isLoadingSchedule ? <LoadingSpinner /> : '✨ Generate with AI'}
                        </button>
                    </div>
                    <ScheduleView schedule={user.weeklySchedule} subjects={subjects} />
                </div>
            </div>
        </div>
    );
};

export default StudyPlanner;
