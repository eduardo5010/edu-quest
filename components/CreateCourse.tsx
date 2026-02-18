
import React, { useState } from 'react';
import { Course } from '../types';
import { geminiService } from '../services/geminiService';

interface CreateCourseProps {
  onCourseCreated: (course: Course) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="text-slate-500 dark:text-slate-400">AI is thinking...</span>
    </div>
);


const CreateCourse: React.FC<CreateCourseProps> = ({ onCourseCreated }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a course topic.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newCourse = await geminiService.generateCourse(topic);
      onCourseCreated(newCourse);
    } catch (err) {
      console.error('Failed to generate course:', err);
      setError('Sorry, the AI failed to create the course. Please try a different topic.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-2">Create a New Course</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Let our AI curriculum designer build a complete course for you on any topic!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="course-topic" className="sr-only">Course Topic</label>
            <input
              id="course-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Introduction to Python' or 'History of Ancient Rome'"
              className="w-full px-5 py-4 text-lg text-slate-700 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-lg font-bold text-white bg-indigo-500 rounded-lg shadow-lg hover:bg-indigo-600 transform hover:-translate-y-1 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              ✨ Generate with AI
            </button>
          )}
        </form>

        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default CreateCourse;
