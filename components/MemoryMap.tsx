import React from 'react';
import { LearningState } from '../types';

interface MemoryMapProps {
    learningState: Record<string, LearningState>;
    allItemsMap: Map<string, { title: string }>;
}

const MemoryMap: React.FC<MemoryMapProps> = ({ learningState, allItemsMap }) => {
    
    const getStrengthColor = (strength: number) => {
        if (strength > 0.8) return 'bg-green-500';
        if (strength > 0.6) return 'bg-green-400';
        if (strength > 0.4) return 'bg-yellow-400';
        if (strength > 0.2) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // FIX: Explicitly typed the `[id, state]` parameter in the map function to `[string, LearningState]`.
    // This resolves a TypeScript inference issue where `state` was being inferred as `unknown`,
    // causing a downstream error in the `sort` method when trying to access `a.strength`.
    const items = Object.entries(learningState).map(([id, state]: [string, LearningState]) => ({
        id,
        title: allItemsMap.get(id)?.title || 'Unknown Topic',
        strength: state.strength
    })).sort((a,b) => a.strength - b.strength);

    if (items.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400">Complete some lessons to build your Memory Map!</p>
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {items.map(item => (
                    <div 
                        key={item.id}
                        title={`Strength: ${Math.round(item.strength * 100)}%`}
                        className={`p-2 rounded-lg text-white text-xs font-semibold shadow-md ${getStrengthColor(item.strength)}`}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
            <div className="flex items-center space-x-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Needs Review</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-yellow-400"></div><span>Getting Stronger</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Mastered</span></div>
            </div>
        </div>
    );
};

export default MemoryMap;
