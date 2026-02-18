
import React, { useMemo } from 'react';
import { User, Course, Lesson } from '../types';
import MemoryMap from './MemoryMap';

interface ProgressDetailsProps {
    user: User;
    courses: Course[];
}

const ProgressDetails: React.FC<ProgressDetailsProps> = ({ user, courses }) => {

    const userCourses = useMemo(() => courses.filter(c => user.enrolledCourseIds.includes(c.id)), [courses, user]);
    
    const allItemsMap = useMemo(() => {
        const map = new Map<string, { title: string }>();
        courses.forEach(course => {
            course.modules.forEach(module => {
                module.lessons.forEach(lesson => {
                    map.set(lesson.id, { title: lesson.title });
                });
            });
        });
        // Subjects can be added here in the future
        return map;
    }, [courses]);

    const calculateCourseProgress = (course: Course) => {
        const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        if (totalLessons === 0) return 0;
        const completedLessons = course.modules.flatMap(m => m.lessons).filter(l => user.progress[l.id]).length;
        return (completedLessons / totalLessons) * 100;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Detailed Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Course Progress */}
                <div>
                    <h3 className="text-lg font-bold mb-3">Course Completion</h3>
                    <div className="space-y-4">
                        {userCourses.map(course => (
                            <div key={course.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{course.title}</span>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{Math.round(calculateCourseProgress(course))}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${calculateCourseProgress(course)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Memory Map */}
                <div>
                     <h3 className="text-lg font-bold mb-3">Memory Map</h3>
                     <MemoryMap learningState={user.learningState} allItemsMap={allItemsMap} />
                </div>
            </div>
        </div>
    );
};

export default ProgressDetails;
