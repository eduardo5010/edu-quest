
import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import Latex from 'react-latex-next';
import { CodeExerciseDetails } from '../types';
import { geminiService } from '../services/geminiService';

interface CodeExerciseProps {
    instructions: string;
    exercise: CodeExerciseDetails;
    onComplete: (score: number) => void;
}

type TestResult = 'passed' | 'failed' | 'pending';

const LoadingSpinner: React.FC<{text?: string}> = ({text = "Thinking..."}) => (
    <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <span>{text}</span>
    </div>
);

const CodeExercise: React.FC<CodeExerciseProps> = ({ instructions, exercise, onComplete }) => {
    const [code, setCode] = useState(exercise.initialCode);
    const [results, setResults] = useState<TestResult[]>(exercise.tests.map(() => 'pending'));
    const [hasRun, setHasRun] = useState(false);
    const [firstFailedTest, setFirstFailedTest] = useState<string | null>(null);
    const [isHintLoading, setIsHintLoading] = useState(false);
    const [aiHint, setAiHint] = useState<string | null>(null);
    const [showSolution, setShowSolution] = useState(false);


    const runTests = () => {
        setAiHint(null);
        setFirstFailedTest(null);
        let firstFailure: string | null = null;
        
        if (exercise.tests.length === 0) { // For open-ended projects
            onComplete(1); // Auto-pass if no tests
            return;
        }

        const newResults = exercise.tests.map(test => {
            try {
                // Combines user's code and the test expression.
                // It's not sandboxed, but much simpler for AI generation.
                const testFunction = new Function(`${code}\nreturn ${test.code};`);
                const passed = testFunction();

                if (passed !== true) { // Explicitly check for true
                    if (!firstFailure) firstFailure = test.description;
                    return 'failed';
                }
                return 'passed';
            } catch (error) {
                console.error(`Test execution error for "${test.description}":`, error);
                 if (!firstFailure) {
                    firstFailure = test.description;
                }
                return 'failed';
            }
        });

        setResults(newResults);
        setFirstFailedTest(firstFailure);
        setHasRun(true);
        
        const passedCount = newResults.filter(r => r === 'passed').length;
        const score = passedCount / newResults.length;
        onComplete(score);
    };

    const handleGetHint = async () => {
        if (!firstFailedTest) return;
        setIsHintLoading(true);
        setAiHint(null);
        try {
            const hint = await geminiService.generateCodeHint(instructions, code, firstFailedTest);
            setAiHint(hint);
        } catch(e) {
            setAiHint("Sorry, I couldn't generate a hint right now. Please try again.");
        } finally {
            setIsHintLoading(false);
        }
    };

    const allPassed = hasRun && (exercise.tests.length === 0 || results.every(r => r === 'passed'));

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[75vh] min-h-[600px]">
            {/* Instructions Panel */}
            <div className="lg:w-1/3 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 overflow-y-auto">
                <h3 className="text-xl font-bold mb-3">Instructions</h3>
                <div className="prose dark:prose-invert max-w-none">
                    <Latex>{instructions}</Latex>
                </div>
            </div>

            {/* Code and Results Panel */}
            <div className="lg:w-2/3 flex flex-col gap-4">
                {/* Code Editor */}
                <div className="flex-grow flex flex-col bg-slate-900 rounded-lg shadow-md overflow-hidden">
                    <div className="flex-shrink-0 bg-slate-800 text-white p-2 text-sm font-mono rounded-t-lg">
                        Editor
                    </div>
                     <Editor
                        height="100%"
                        theme="vs-dark"
                        defaultLanguage="javascript"
                        value={showSolution ? exercise.solution : code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            readOnly: showSolution,
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                        }}
                        loading={<LoadingSpinner text="Loading Editor..." />}
                    />
                </div>

                {/* Results and Controls */}
                <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                     <div className="flex justify-between items-center flex-wrap gap-2">
                        <h3 className="text-lg font-bold">Tests</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowSolution(!showSolution)} className="text-sm font-semibold text-slate-500 hover:text-indigo-500 transition-colors">{showSolution ? 'Hide Solution' : 'Show Solution'}</button>
                             <button onClick={handleGetHint} disabled={!firstFailedTest || isHintLoading} className="bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300 dark:disabled:bg-amber-800 disabled:cursor-not-allowed text-sm flex items-center gap-2">
                                ✨ {isHintLoading ? <LoadingSpinner/> : 'AI Hint'}
                            </button>
                            <button onClick={runTests} className="bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-600 transition-colors">
                                {exercise.tests.length === 0 ? 'Submit Project' : 'Run Tests'}
                            </button>
                        </div>
                    </div>
                    {aiHint && <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-lg"><Latex>{aiHint}</Latex></div>}
                    <div className="mt-3 space-y-2">
                        {exercise.tests.map((test, index) => (
                            <div key={index} className="flex items-center text-sm">
                                <span className="mr-2">
                                    {results[index] === 'pending' && '⚪'}
                                    {results[index] === 'passed' && '✅'}
                                    {results[index] === 'failed' && '❌'}
                                </span>
                                <span className={`${results[index] === 'failed' ? 'text-slate-500' : ''}`}>{test.description}</span>
                            </div>
                        ))}
                    </div>
                    {allPassed && (
                        <div className="mt-4 p-3 text-center bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg font-semibold">
                            🎉 {exercise.tests.length > 0 ? 'All tests passed! Great job!' : 'Project submitted successfully!'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeExercise;