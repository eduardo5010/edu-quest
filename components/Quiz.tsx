
import React, { useState } from 'react';
import Latex from 'react-latex-next';
import { QuizQuestion, QuizOption } from '../types';
import { geminiService } from '../services/geminiService';

interface QuizProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOptionId) return;

    setIsAnswered(true);
    const isAnswerCorrect = selectedOptionId === currentQuestion.correctOptionId;

    if (isAnswerCorrect) {
        setScore(prevScore => prevScore + 1);
    } else {
        setIsFeedbackLoading(true);
        setAiFeedback(null);
        try {
            const selectedOption = currentQuestion.options.find(o => o.id === selectedOptionId);
            const correctOption = currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId);

            if (selectedOption && correctOption) {
                const feedback = await geminiService.generateQuizFeedback(
                    currentQuestion.question,
                    selectedOption.text,
                    correctOption.text
                );
                setAiFeedback(feedback);
            } else {
                 setAiFeedback("Could not determine feedback for this option.");
            }
        } catch (error) {
            console.error("Failed to get AI feedback:", error);
            setAiFeedback("The AI tutor couldn't respond, but check the explanation below for details.");
        } finally {
            setIsFeedbackLoading(false);
        }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setShowHint(false);
    setAiFeedback(null);
    setIsFeedbackLoading(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalScore = score / questions.length;
      onQuizComplete(finalScore);
    }
  };
  
  const getOptionClasses = (option: QuizOption) => {
    let classes = 'w-full text-left p-4 my-2 rounded-lg border-2 transition-all duration-200 font-medium ';
    if (!isAnswered) {
        classes += selectedOptionId === option.id 
            ? 'bg-indigo-200 dark:bg-indigo-900 border-indigo-500' 
            : 'bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600';
    } else {
        if (option.id === currentQuestion.correctOptionId) {
            classes += 'bg-green-200 dark:bg-green-900 border-green-500';
        } else if (option.id === selectedOptionId) {
            classes += 'bg-red-200 dark:bg-red-900 border-red-500';
        } else {
            classes += 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-60';
        }
    }
    return classes;
  };

  if (questions.length === 0) {
    return <div>No questions available for this quiz.</div>;
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-start">
        <div className="mb-4">
            <p className="text-sm font-semibold text-slate-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <h2 className="text-2xl font-bold mt-1"><Latex>{currentQuestion.question}</Latex></h2>
        </div>
        {currentQuestion.hint && !isAnswered && (
             <button onClick={() => setShowHint(true)} className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 flex items-center space-x-1">
                <span>💡</span>
                <span>Hint</span>
            </button>
        )}
      </div>

       {showHint && !isAnswered && (
            <div className="p-3 mb-4 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
                <Latex>{currentQuestion.hint}</Latex>
            </div>
        )}

      <div>
        {currentQuestion.options.map(option => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
            className={getOptionClasses(option)}
          >
            <Latex>{option.text}</Latex>
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[120px]">
        {isAnswered && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                <p className={`font-bold text-lg ${isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite!'}
                </p>

                {!isCorrect && (
                    <div className="mt-3 text-red-700 dark:text-red-300">
                    {isFeedbackLoading ? (
                        <div className="flex items-center space-x-2 text-sm opacity-80">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            <span>AI tutor is preparing feedback...</span>
                        </div>
                    ) : aiFeedback ? (
                        <div className="flex items-start space-x-2">
                            <span className="text-lg mt-0.5">✨</span>
                            <p className="text-sm"><Latex>{aiFeedback}</Latex></p>
                        </div>
                    ) : null}
                    </div>
                )}

                {currentQuestion.explanation && (
                    <div className={`mt-3 pt-3 border-t ${isCorrect ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'} text-slate-700 dark:text-slate-300`}>
                        <p className="font-semibold text-sm mb-1">Explanation:</p>
                        <p className="text-sm"><Latex>{currentQuestion.explanation}</Latex></p>
                    </div>
                )}
            </div>
        )}
      </div>


      <div className="mt-4">
          {!isAnswered ? (
               <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOptionId}
                  className="w-full py-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  Check Answer
                </button>
          ) : (
                <button
                  onClick={handleNextQuestion}
                  className={`w-full py-3 text-white font-bold rounded-lg transition-colors ${isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
          )}
      </div>
    </div>
  );
};

export default Quiz;
