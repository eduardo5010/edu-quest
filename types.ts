
export interface AffiliateLink {
  user_id: string;
  plan_tier: 'pro' | 'premium';
  affiliate_url: string;
}

export interface LearningState {
  strength: number; 
  lastReviewed: string; 
  nextReviewDue: string; 
  reviewHistory: {
    timestamp: string;
    performance: number; 
  }[];
}

export interface SubjectContent {
    type: 'video' | 'pdf_summary';
    title: string;
    url?: string; 
    summary?: string; 
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
    startTime: string; 
    endTime: string; 
}

export interface ScheduleSlot {
    day: string;
    startTime: string; 
    endTime: string; 
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
    userAnswers: Record<string, string>; 
    score: number; 
    durationSeconds: number;
    completedDate: string; 
    aiAnalysis: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: 'BRL' | 'USD';
  features: string[];
  hotmart_link: string;
  is_featured: boolean;
  is_premium: boolean;
  tier: 'free' | 'pro' | 'premium';
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
  progress: Record<string, boolean>; 
  completedModuleIds: string[]; 
  learningState: Record<string, LearningState>; 
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
      minBedtime: string; 
      maxWakeup: string; 
  };
  unavailableSlots: UnavailableSlot[];
  weeklySchedule: ScheduleSlot[];
  mockTestResults: MockTestResult[];
  studentIds?: string[];
  teacherIds?: string[];
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
  content: string; 
  xp: number;
  quiz?: QuizQuestion[];
  exercise?: CodeExerciseDetails;
}

export interface CodeExerciseDetails {
  initialCode: string;
  solution: string;
  tests: {
    description: string;
    code: string; 
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
    reactions: Record<string, ReactionType>; 
    comments: Comment[];
}
