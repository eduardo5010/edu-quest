
import React, { useState } from 'react';
import Latex from 'react-latex-next';
import { Course, Lesson } from '../types';
import Quiz from './Quiz';
import CodeExercise from './CodeExercise';

interface LessonViewProps {
  course: Course;
  lesson: Lesson;
  onComplete: (performance: number) => void;
}

const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
  const getYouTubeId = (videoUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return <div className="aspect-video w-full bg-slate-800 flex items-center justify-center rounded-lg text-white">Invalid YouTube URL</div>;
  }

  return (
    <div className="aspect-video w-full">
      <iframe
        className="w-full h-full rounded-lg shadow-xl"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

const LessonView: React.FC<LessonViewProps> = ({ course, lesson, onComplete }) => {
  const [lessonPerformance, setLessonPerformance] = useState<number | null>(null);

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
      case 'text':
        // For text and video, completion implies perfect performance for this attempt.
        return lesson.type === 'video' ? <VideoPlayer url={lesson.content} /> : <div className="prose dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-6 rounded-lg shadow-inner"><Latex>{lesson.content}</Latex></div>;
      case 'quiz':
        return <Quiz questions={lesson.quiz || []} onQuizComplete={(score) => setLessonPerformance(score)} />;
      case 'code-exercise':
      case 'project':
        return lesson.exercise ? <CodeExercise exercise={lesson.exercise} onComplete={(score) => setLessonPerformance(score)} instructions={lesson.content} /> : <div>Exercise not found.</div>;
      default:
        return <div>Unsupported lesson type.</div>;
    }
  };

  const isCompletable = lesson.type === 'video' || lesson.type === 'text' || lessonPerformance !== null;
  const performanceScore = lessonPerformance ?? (lesson.type === 'project' || lesson.type === 'code-exercise' ? 1.0 : (lesson.exercise && lesson.exercise.tests.length > 0 ? 0 : 1.0));

  const isProject = lesson.type === 'project';

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`mb-8 p-4 rounded-xl shadow-md ${isProject ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-slate-800'}`}>
         <p className={`text-sm font-semibold ${isProject ? 'text-indigo-500' : 'text-indigo-500'}`}>{isProject ? 'Certification Project' : course.title}</p>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{lesson.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isProject 
                ? `Complete this project to prove your skills and earn your certificate!`
                : `Earn ${lesson.xp} XP for completing this lesson.`
            }
        </p>
      </div>

      <div className="mb-8">
        {renderContent()}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => onComplete(performanceScore)}
          disabled={!isCompletable}
          className="w-full sm:w-auto px-12 py-4 bg-green-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-1 transition-all duration-200"
        >
          {lesson.type === 'quiz' || lesson.type === 'code-exercise' || lesson.type === 'project' ? 'Finish' : 'Complete Lesson'} (+{lesson.xp} XP)
        </button>
      </div>
    </div>
  );
};

export default LessonView;
