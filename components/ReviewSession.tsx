
import React, { useState, useEffect } from 'react';
import { Course, Lesson, QuizQuestion, Subject } from '../types';
import { geminiService } from '../services/geminiService';
import Quiz from './Quiz';

interface ReviewSessionProps {
  item: Lesson | Subject;
  onComplete: (performance: number) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col justify-center items-center space-y-4 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
        <span className="text-slate-500 dark:text-slate-400 text-lg">Your AI tutor is preparing your review...</span>
    </div>
);

const ReviewSession: React.FC<ReviewSessionProps> = ({ item, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLesson = 'xp' in item;
  const title = isLesson ? item.title : item.name;
  const topic = isLesson ? 'the parent course' : 'this study subject';

  useEffect(() => {
    const generateQuiz = async () => {
      try {
        const reviewQuestions = await geminiService.generateReviewQuiz(title, topic);
        if (reviewQuestions.length === 0) throw new Error("AI returned no questions.");
        setQuestions(reviewQuestions);
      } catch (err) {
        console.error("Failed to generate review quiz:", err);
        setError("Sorry, the AI couldn't create a review session right now. Please try again later.");
      }
    };

    generateQuiz();
  }, [item.id]);

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md">
         <p className="text-sm text-purple-500 font-semibold">Reviewing: {isLesson ? 'Course Lesson' : 'Study Subject'}</p>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Let's see what you remember. Complete this quiz to strengthen your knowledge.</p>
      </div>

      <div className="mb-8">
        {error && <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>}
        {!questions && !error && <LoadingSpinner />}
        {questions && <Quiz questions={questions} onQuizComplete={onComplete} />}
      </div>
    </div>
  );
};

export default ReviewSession;
