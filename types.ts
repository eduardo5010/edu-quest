
export interface LearningState {
  strength: number; // A value from 0 to 1 representing memory strength
  lastReviewed: string; // ISO date string
  nextReviewDue: string; // ISO date string
  reviewHistory: {
    timestamp: string;
    performance: number; // Score from 0 to 1
  }[];
}

export interface SubjectContent {
    type: 'video' | 'pdf_summary';
    title: string;
    url?: string; // For videos
    summary?: string; // For PDF summaries
}

export interface Subject {
    id: string;
    name: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    content: SubjectContent[];
}

export interface StudyCycle {
    id: string;
    name: string;
    subjectIds: string[];
}

export interface UnavailableSlot {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
}

export interface ScheduleSlot {
    day: string;
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    subjectId: string;
    type: 'fixed' | 'rotating';
}

export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Obsidian';

export interface Certificate {
    id: string;
    courseId: string;
    courseTitle: string;
    issuedDate: string;
}

export interface MockTestQuestion extends QuizQuestion {
    subject: string;
}

export interface MockTestResult {
    id: string;
    examType: string;
    subject: string;
    questions: MockTestQuestion[];
    userAnswers: Record<string, string>; // questionId: selectedOptionId
    score: number; // 0 to 1
    durationSeconds: number;
    completedDate: string; // ISO date string
    aiAnalysis: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  level: number;
  xp: number;
  streak: number;
  lastStudiedDate: string | null;
  enrolledCourseIds: string[];
  studyCycleIds: string[];
  progress: Record<string, boolean>; // lessonId: isCompleted
  completedModuleIds: string[]; // moduleIds
  learningState: Record<string, LearningState>; // lessonId or subjectId
  achievements: Achievement[];
  certifications: Certificate[];
  roles: ('student' | 'creator' | 'teacher' | 'parent')[];
  githubUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  followers: string[];
  following: string[];
  subscription: 'free' | 'premium';
  wallet: {
    globalCredits: number;
    individualCredits: number;
  };
  sleepSchedule: {
      minBedtime: string; // "HH:MM"
      maxWakeup: string; // "HH:MM"
  };
  unavailableSlots: UnavailableSlot[];
  weeklySchedule: ScheduleSlot[];
  mockTestResults: MockTestResult[];
  // For educators
  studentIds?: string[];
  // For students
  teacherIds?: string[];
  // For leagues
  weeklyXp?: number;
  league?: LeagueTier;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  creator: string;
  icon: string;
  modules: Module[];
  certificationProjectId?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  workloadHours: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'code-exercise' | 'project';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string; // Instructions for code-exercise, URL for video, text for text
  xp: number;
  quiz?: QuizQuestion[];
  exercise?: CodeExerciseDetails;
}

export interface CodeExerciseDetails {
  initialCode: string;
  solution: string;
  tests: {
    description: string;
    code: string; // Code to be evaluated, e.g., "add(2,2) === 4"
  }[];
}


export type QuestionType = 'multiple-choice' | 'fill-in-the-blank' | 'code-exercise';

export interface QuizQuestion {
  id:string;
  type: QuestionType;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  hint?: string;
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    timestamp: string;
}

export type ReactionType = 'like' | 'love' | 'insightful' | 'funny';

export interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    timestamp: string;
    reactions: Record<string, ReactionType>; // userId: reactionType
    comments: Comment[];
}