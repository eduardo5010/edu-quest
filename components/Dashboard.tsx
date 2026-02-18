
import React, { useMemo } from 'react';
import { Course, User, Subject } from '../types';
import { srsService } from '../services/srsService';

interface DashboardProps {
  user: User;
  courses: Course[];
  subjects: Subject[];
  onSelectCourse: (courseId: string) => void;
  onEnrollCourse: (courseId: string) => void;
  onCreateCourse: () => void;
  onNavigateToSubscription: () => void;
  onSelectReview: (itemId: string, itemType: 'lesson' | 'subject') => void;
  onSelectStudySession: (subjectId: string) => void;
  onNavigateToMockTests: () => void;
}

const CourseCard: React.FC<{ course: Course, onSelect: () => void, progress?: number, isEnrolled: boolean, onEnroll?: () => void }> = ({ course, onSelect, progress, isEnrolled, onEnroll }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
    <div className="p-6">
      <div className="flex items-center space-x-4">
        <div className="text-4xl">{course.icon}</div>
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{course.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Criado por: {course.creator}</p>
        </div>
      </div>
      
      {isEnrolled ? (
        <div className="mt-4 cursor-pointer" onClick={onSelect}>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-right text-xs mt-1 text-slate-500">{Math.round(progress || 0)}% Concluído</p>
          <button className="mt-4 w-full bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold py-2 rounded-lg hover:bg-indigo-100 transition-colors">Continuar Quest</button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10 mb-4">{course.description}</p>
          <button 
            onClick={(e) => { e.stopPropagation(); onEnroll?.(); }} 
            className="w-full bg-indigo-500 text-white font-bold py-2 rounded-lg hover:bg-indigo-600 transition-colors shadow-md"
          >
            Matricular-se Gratuitamente
          </button>
        </div>
      )}
    </div>
  </div>
);

const UserStats: React.FC<{ user: User }> = ({ user }) => {
    const nextLevelXp = (user.level + 1) * 150;
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-extrabold mb-4 text-slate-800 dark:text-white">Seu Desempenho</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <div className="text-2xl font-black text-indigo-500">{user.level}</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nível</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-100 dark:border-amber-800">
                    <div className="text-2xl font-black text-amber-500">{user.xp}</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total XP</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl border border-orange-100 dark:border-orange-800">
                    <div className="text-2xl font-black text-orange-500">{user.streak} 🔥</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ofensiva</div>
                </div>
                <div className="bg-sky-50 dark:bg-sky-900/30 p-3 rounded-xl border border-sky-100 dark:border-sky-800">
                    <div className="text-2xl font-black text-sky-500">{nextLevelXp - user.xp}</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Falta para Up</div>
                </div>
            </div>
        </div>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ user, courses, subjects, onSelectCourse, onEnrollCourse, onCreateCourse, onNavigateToSubscription, onSelectReview, onSelectStudySession, onNavigateToMockTests }) => {
  const userCourses = useMemo(() => courses.filter(c => user.enrolledCourseIds.includes(c.id)), [courses, user]);
  const communityCourses = useMemo(() => courses.filter(c => !user.enrolledCourseIds.includes(c.id)), [courses, user]);
  const isTeacher = user.roles.includes('teacher');

  const calculateCourseProgress = (course: Course) => {
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    if (totalLessons === 0) return 0;
    const completedLessons = course.modules.flatMap(m => m.lessons).filter(l => user.progress[l.id]).length;
    return (completedLessons / totalLessons) * 100;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Olá, {user.name}! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">O que vamos aprender hoje na nossa jornada?</p>
        </div>
        <div className="flex items-center space-x-3">
            {!isTeacher && (
                <div className="hidden lg:block bg-indigo-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-indigo-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Quer ensinar?</p>
                    <p className="text-xs font-bold">Ative o modo educador no perfil!</p>
                </div>
            )}
            <button onClick={onCreateCourse} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-transform hover:scale-105 shadow-lg">
                <span className="text-xl">✨</span>
                <span>Criar Curso com IA</span>
            </button>
        </div>
      </div>

      <UserStats user={user} />

      {/* Seção de Cursos do Usuário */}
      {userCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-6 text-slate-800 dark:text-white flex items-center space-x-2">
                <span>📖</span>
                <span>Meus Estudos</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.map(course => (
                <CourseCard 
                    key={course.id} 
                    course={course} 
                    isEnrolled={true}
                    onSelect={() => onSelectCourse(course.id)} 
                    progress={calculateCourseProgress(course)} 
                />
              ))}
            </div>
          </div>
      )}

      {/* Seção de Cursos da Comunidade */}
      <div>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center space-x-2">
                <span>🌎</span>
                <span>Comunidade EduQuest</span>
            </h2>
        </div>
        {communityCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityCourses.map(course => (
                <CourseCard 
                    key={course.id} 
                    course={course} 
                    isEnrolled={false}
                    onEnroll={() => onEnrollCourse(course.id)}
                    onSelect={() => onSelectCourse(course.id)} 
                />
              ))}
            </div>
        ) : (
            <div className="bg-slate-100 dark:bg-slate-800/50 p-10 rounded-2xl text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 font-bold mb-4">Ainda não há outros cursos na comunidade.</p>
                <button onClick={onCreateCourse} className="text-indigo-500 font-black hover:underline">Seja o primeiro a criar um curso! ✨</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
