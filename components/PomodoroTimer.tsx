
import React, { useState, useEffect, useRef } from 'react';

const STUDY_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

interface PomodoroTimerProps {
    onSessionComplete: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
    const [mode, setMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
    const [timeLeft, setTimeLeft] = useState(STUDY_TIME);
    const [isActive, setIsActive] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsActive(false);
            if (mode === 'study') {
                onSessionComplete();
                const newSessions = sessions + 1;
                setSessions(newSessions);
                setMode(newSessions % 4 === 0 ? 'longBreak' : 'shortBreak');
            } else {
                setMode('study');
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft]);
    
    useEffect(() => {
        switch(mode) {
            case 'study': setTimeLeft(STUDY_TIME); break;
            case 'shortBreak': setTimeLeft(SHORT_BREAK); break;
            case 'longBreak': setTimeLeft(LONG_BREAK); break;
        }
    }, [mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    const messages = {
        study: "Time to focus!",
        shortBreak: "Time for a short break.",
        longBreak: "Time for a long break!"
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button onClick={() => setIsMinimized(false)} className="bg-indigo-600 text-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:bg-indigo-700">
                    <span>{formatTime(timeLeft)}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-80 border border-slate-200 dark:border-slate-700">
            <div className="p-4">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Pomodoro Timer</h3>
                    <button onClick={() => setIsMinimized(true)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&minus;</button>
                 </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{messages[mode]}</p>

                <div className="text-center my-6">
                    <p className="text-6xl font-extrabold">{formatTime(timeLeft)}</p>
                </div>

                <div className="flex justify-center">
                    <button onClick={toggleTimer} className={`px-8 py-3 font-bold rounded-lg text-white ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                </div>
                <p className="text-center text-xs mt-3 text-slate-400">Completed sessions: {sessions}</p>
            </div>
        </div>
    );
};

export default PomodoroTimer;
