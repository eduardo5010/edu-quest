
import React from 'react';
import { Course, Lesson, Module, User } from '../types';

interface CourseDetailProps {
  course: Course;
  user: User;
  onSelectLesson: (lessonId: string) => void;
  onClaimCertificate: (courseId: string) => void;
}

const DifficultyBadge: React.FC<{ difficulty: Lesson['difficulty'] }> = ({ difficulty }) => {
    const colors = {
        'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Intermediate': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors[difficulty]}`}>{difficulty}</span>
}

const XpBadge: React.FC<{ xp: number }> = ({ xp }) => (
    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300">
        {xp} XP
    </span>
);

const LessonItem: React.FC<{ lesson: Lesson; isCompleted: boolean; onSelect: () => void; isLocked: boolean; isProject: boolean; }> = ({ lesson, isCompleted, onSelect, isLocked, isProject }) => {
  const getIcon = () => {
    switch (lesson.type) {
      case 'video': return '▶️';
      case 'text': return '📖';
      case 'quiz': return '❓';
      case 'code-exercise': return '💻';
      case 'project': return '🛠️';
      default: return '📝';
    }
  };

  return (
    <li className="my-1">
      <button 
        onClick={onSelect}
        disabled={isLocked}
        className={`w-full text-left p-4 rounded-lg flex items-center justify-between transition-all duration-200 ${
          isLocked
            ? 'bg-slate-200 dark:bg-slate-700/50 cursor-not-allowed'
            : isProject 
            ? 'bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900'
            : 'bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700'
        }`}
      >
        <div className="flex items-center">
          <span className="text-2xl mr-4">{isLocked ? '🔒' : getIcon()}</span>
          <div>
            <p className={`font-semibold ${isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{lesson.title}</p>
            <div className="flex items-center space-x-2 mt-1">
                <DifficultyBadge difficulty={lesson.difficulty} />
                <XpBadge xp={lesson.xp} />
            </div>
          </div>
        </div>
        {isCompleted && !isLocked && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>}
      </button>
    </li>
  );
};

const ModuleItem: React.FC<{module: Module, user: User, onSelectLesson: (lessonId: string) => void, isPreviousModuleComplete: boolean}> = ({module, user, onSelectLesson, isPreviousModuleComplete}) => {
    const isCredited = user.completedModuleIds.includes(module.id);
    const allLessonsInModuleComplete = module.lessons.every(l => user.progress[l.id]);
    const isModuleComplete = isCredited || allLessonsInModuleComplete;

    let isPreviousLessonInModuleCompleted = isPreviousModuleComplete;

    if (isCredited) {
        return (
            <div className="bg-slate-200 dark:bg-slate-700/50 rounded-2xl p-6 opacity-75">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-400">{module.title}</h2>
                    <span className="font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">✓ Aproveitada</span>
                </div>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{module.workloadHours} horas de carga horária</p>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold mb-1">{module.title}</h2>
                 {isModuleComplete && <span className="text-2xl">🎉</span>}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{module.workloadHours} horas de carga horária</p>
            <ul>
              {module.lessons.map((lesson) => {
                 const isCompleted = user.progress[lesson.id] || false;
                 const isLocked = !isPreviousLessonInModuleCompleted;
                 if (!isLocked) {
                     isPreviousLessonInModuleCompleted = isCompleted;
                 }
                
                return (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={isCompleted}
                    onSelect={() => onSelectLesson(lesson.id)}
                    isLocked={isLocked}
                    isProject={lesson.type === 'project'}
                  />
                );
              })}
            </ul>
        </div>
    );
};

const CourseDetail: React.FC<CourseDetailProps> = ({ course, user, onSelectLesson, onClaimCertificate }) => {
  let isPreviousModuleCompleted = true;

  const totalWorkload = course.modules.reduce((sum, module) => sum + module.workloadHours, 0);
  const completedWorkload = course.modules.reduce((sum, module) => {
      const allLessonsComplete = module.lessons.every(l => user.progress[l.id]);
      if(user.completedModuleIds.includes(module.id) || allLessonsComplete) {
          return sum + module.workloadHours;
      }
      return sum;
  }, 0);
  
  const courseProgressPercentage = totalWorkload > 0 ? (completedWorkload / totalWorkload) * 100 : 0;
  
  const allLessons = course.modules.flatMap(m => m.lessons);
  const allLessonsCompleted = allLessons.every(l => user.progress[l.id]);

  const isCourseComplete = courseProgressPercentage >= 100 || allLessonsCompleted;
  const hasCertificate = user.certifications.some(c => c.courseId === course.id);

  return (
    <div className="space-y-6">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <div className="text-6xl mb-4">{course.icon}</div>
        <h1 className="text-4xl font-extrabold">{course.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">{course.description}</p>

        <div className="max-w-md mx-auto mt-6">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-indigo-500">Progresso da Graduação</span>
                <span className="text-sm font-semibold text-indigo-500">{Math.round(courseProgressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full" style={{ width: `${courseProgressPercentage}%` }}></div>
            </div>
        </div>

        {isCourseComplete && course.certificationProjectId && (
             <div className="mt-6">
                <button 
                    onClick={() => onClaimCertificate(course.id)}
                    disabled={hasCertificate}
                    className="px-8 py-4 bg-amber-400 text-amber-900 font-bold text-lg rounded-xl shadow-lg hover:bg-amber-500 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-1 transition-all duration-200"
                >
                    {hasCertificate ? '📜 Certificate Claimed!' : '🏆 Claim Certificate'}
                </button>
            </div>
        )}
      </div>

      <div className="space-y-8">
        {course.modules.map((module) => {
            const isCredited = user.completedModuleIds.includes(module.id);
            const allLessonsInModuleComplete = module.lessons.every(l => user.progress[l.id]);
            const isModuleComplete = isCredited || allLessonsInModuleComplete;

            const currentModuleResult = (
                 <ModuleItem 
                    key={module.id}
                    module={module}
                    user={user}
                    onSelectLesson={onSelectLesson}
                    isPreviousModuleComplete={isPreviousModuleCompleted}
                 />
            );
            
            isPreviousModuleCompleted = isModuleComplete;
            return currentModuleResult;
        })}
      </div>
    </div>
  );
};

export default CourseDetail;