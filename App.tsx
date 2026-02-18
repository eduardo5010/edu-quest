
import React, { useState, useMemo, useEffect, Suspense, startTransition } from 'react';
import { Course, User, Post, Comment, Lesson, StudyCycle, Subject, ScheduleSlot, ReactionType, Certificate, MockTestQuestion, MockTestResult, SubscriptionPlan, AffiliateLink } from './types';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import LessonView from './components/LessonView';
import CreateCourse from './components/CreateCourse';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import CommunityFeed from './components/CommunityFeed';
import Subscription from './components/Subscription';
import Wallet from './components/Wallet';
import ReviewSession from './components/ReviewSession';
import StudyPlanner from './components/StudyPlanner';
import PomodoroTimer from './components/PomodoroTimer';
import EducatorDashboard from './components/EducatorDashboard';
import MockTestLobby from './components/MockTestLobby';
import MockTestSession from './components/MockTestSession';
import MockTestResults from './components/MockTestResults';
import { authService } from './services/authService';
import { databaseService } from './services/databaseService';
import { srsService } from './services/srsService';
import { geminiService } from './services/geminiService';
import { hotmartService } from './services/hotmartService';

type View = 
  | { type: 'LANDING' } | { type: 'LOGIN' } | { type: 'REGISTER', selectedPlan?: string }
  | { type: 'DASHBOARD' } | { type: 'PROFILE' } | { type: 'COMMUNITY' }
  | { type: 'SUBSCRIPTION' } | { type: 'WALLET' } | { type: 'STUDY_PLANNER' }
  | { type: 'EDUCATOR_DASHBOARD' } | { type: 'USER_PROFILE', userId: string }
  | { type: 'COURSE_DETAIL', courseId: string }
  | { type: 'LESSON', courseId: string, lessonId: string }
  | { type: 'CREATE_COURSE' }
  | { type: 'REVIEW_SESSION', itemId: string, itemType: 'lesson' | 'subject' }
  | { type: 'STUDY_SESSION', subjectId: string }
  | { type: 'MOCK_TEST_LOBBY' }
  | { type: 'MOCK_TEST_SESSION', test: { id: string; examType: string; subject: string, questions: MockTestQuestion[] } }
  | { type: 'MOCK_TEST_RESULTS', resultId: string };

const LoadingOverlay = ({ onForceExit }: { onForceExit: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 z-50 fixed inset-0">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500"></div>
        <p className="mt-4 text-indigo-500 font-black animate-pulse">Sincronizando com EduQuest Cloud...</p>
        <button 
            onClick={onForceExit}
            className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
            Demorando demais? Clique para pular o carregamento
        </button>
    </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cycles, setCycles] = useState<StudyCycle[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [view, setView] = useState<View>({ type: 'LANDING' });
  const [isLoading, setIsLoading] = useState(true);
  const [customLogo, setCustomLogo] = useState<string | null>(localStorage.getItem('eduquest_custom_logo'));

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
        if (isLoading) setIsLoading(false);
    }, 8000);

    async function initData() {
        try {
            // Pegar referência de afiliado na URL (?ref=user-123)
            const urlParams = new URLSearchParams(window.location.search);
            const refId = urlParams.get('ref') || urlParams.get('aff');
            
            const [dbUsers, dbCourses, dbPosts, dbCycles, dbSubjects, dbPlans] = await Promise.all([
                databaseService.getUsers(),
                databaseService.getCourses(),
                databaseService.getPosts(),
                databaseService.getCycles(),
                databaseService.getSubjects(),
                databaseService.getPlans()
            ]);

            setAllUsers(dbUsers);
            setCourses(dbCourses);
            setPosts(dbPosts);
            setCycles(dbCycles);
            setSubjects(dbSubjects);
            setPlans(dbPlans);

            // Se existir um ref na URL, buscamos os links personalizados desse usuário
            if (refId) {
              const customLinks = await databaseService.getAffiliateLinks(refId);
              if (customLinks && customLinks.length > 0) {
                setAffiliateLinks(customLinks);
              }
            }
            
            const loggedInUser = await authService.getCurrentUser();
            if (loggedInUser) {
                const syncedUser = await hotmartService.syncUserWithHotmart(loggedInUser);
                setCurrentUser(syncedUser || loggedInUser);
                startTransition(() => {
                    setView({ type: 'DASHBOARD' });
                });
            }
        } catch (error) {
            console.error("Erro fatal na inicialização do banco:", error);
        } finally {
            setIsLoading(false);
            clearTimeout(safetyTimeout);
        }
    }
    initData();
  }, []);

  const navigateTo = (newView: View) => {
    window.scrollTo(0, 0);
    startTransition(() => {
      setView(newView);
    });
  };

  const handleApplyLogo = (logoUrl: string) => {
    setCustomLogo(logoUrl);
    localStorage.setItem('eduquest_custom_logo', logoUrl);
  };

  const handleEnrollCourse = async (courseId: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        const updatedUser = { 
            ...currentUser, 
            enrolledCourseIds: [...new Set([...currentUser.enrolledCourseIds, courseId])] 
        };
        setCurrentUser(updatedUser);
        await databaseService.updateUser(updatedUser);
        navigateTo({ type: 'COURSE_DETAIL', courseId });
    } catch (error) {
        console.error("Falha ao matricular-se:", error);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleItemCompletion = async (itemId: string, itemType: 'lesson' | 'subject', performance: number) => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
        let item: Lesson | Subject | undefined;
        let xpGained = 0;
        let completedModuleId: string | null = null;
        
        const updatedProgress = { ...currentUser.progress, [itemId]: true };

        if (itemType === 'lesson') {
            let lesson: Lesson | undefined;
            let lessonModule: Course['modules'][0] | undefined;
            
            for (const course of courses) {
                for (const module of course.modules) {
                    const foundLesson = module.lessons.find(l => l.id === itemId);
                    if (foundLesson) {
                        lessonModule = module;
                        lesson = foundLesson;
                        break;
                    }
                }
                if (lesson) break;
            }

            if (!lesson) return;
            item = lesson;

            const isFirstCompletion = !currentUser.progress[itemId];
            xpGained = isFirstCompletion ? lesson.xp : Math.round(lesson.xp / 10);
            
            if (lessonModule && !currentUser.completedModuleIds.includes(lessonModule.id)) {
                const allLessonsInModuleComplete = lessonModule.lessons.every(l => updatedProgress[l.id]);
                if (allLessonsInModuleComplete) {
                    completedModuleId = lessonModule.id;
                    xpGained += 100;
                }
            }

        } else {
            const subject = subjects.find(s => s.id === itemId);
            if (!subject) return;
            item = subject;
            xpGained = 25;
        }

        const newXp = currentUser.xp + xpGained;
        const levelThreshold = (currentUser.level + 1) * 150;
        let newLevel = currentUser.level;
        if (newXp >= levelThreshold) newLevel += 1;

        let newStreak = currentUser.streak;
        let newLastStudied = currentUser.lastStudiedDate;
        const today = new Date().toDateString();
        if (currentUser.lastStudiedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            newStreak = currentUser.lastStudiedDate === yesterday.toDateString() ? newStreak + 1 : 1;
            newLastStudied = today;
        }
        
        const currentLearningState = currentUser.learningState[itemId];
        const newLearningState = srsService.updateLearningState(currentLearningState, performance, item.difficulty);

        const updatedUser: User = {
            ...currentUser, xp: newXp, level: newLevel, progress: updatedProgress,
            completedModuleIds: completedModuleId ? [...currentUser.completedModuleIds, completedModuleId] : currentUser.completedModuleIds,
            learningState: { ...currentUser.learningState, [itemId]: newLearningState },
            streak: newStreak, lastStudiedDate: newLastStudied,
            weeklyXp: (currentUser.weeklyXp || 0) + xpGained,
        };
        
        setCurrentUser(updatedUser);
        await databaseService.updateUser(updatedUser);
        
        const refreshedUsers = await databaseService.getUsers();
        if (refreshedUsers.length > 0) setAllUsers(refreshedUsers);
    } catch (e) {
        console.error("Falha ao salvar progresso:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartMockTest = async (examType: string, subject: string) => {
    setIsLoading(true);
    try {
        const { questions } = await geminiService.generateMockTest(examType, subject);
        const test = { id: `test-${Date.now()}`, examType, subject, questions };
        navigateTo({ type: 'MOCK_TEST_SESSION', test });
    } catch (error) {
        console.error("Failed to start mock test:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFinishMockTest = async (test: { id: string; examType: string; subject: string; questions: MockTestQuestion[] }, userAnswers: Record<string, string>, durationSeconds: number) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        const correctAnswers = test.questions.filter(q => userAnswers[q.id] === q.correctOptionId).length;
        const score = correctAnswers / test.questions.length;
        
        const aiAnalysis = await geminiService.analyzeMockTestPerformance(test.questions, userAnswers);

        const newResult: MockTestResult = {
            id: test.id,
            examType: test.examType,
            subject: test.subject,
            questions: test.questions,
            userAnswers,
            score,
            durationSeconds,
            completedDate: new Date().toISOString(),
            aiAnalysis,
        };

        const xpGained = 100 + Math.round(score * 100);
        const updatedUser: User = {
            ...currentUser,
            mockTestResults: [newResult, ...currentUser.mockTestResults],
            xp: currentUser.xp + xpGained,
            weeklyXp: (currentUser.weeklyXp || 0) + xpGained,
        };
        
        setCurrentUser(updatedUser);
        await databaseService.updateUser(updatedUser);
        navigateTo({ type: 'MOCK_TEST_RESULTS', resultId: newResult.id });

    } catch (error) {
        console.error("Failed to finish mock test:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleClaimCertificate = async (courseId: string) => {
    if(!currentUser) return;
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    if (currentUser.certifications.some(cert => cert.courseId === courseId)) return;
    
    const allLessons = course.modules.flatMap(m => m.lessons);
    const allLessonsCompleted = allLessons.every(l => currentUser.progress[l.id]);

    if (allLessonsCompleted) {
        setIsLoading(true);
        try {
            const newCertificate: Certificate = { id: `cert-${currentUser.id}-${courseId}`, courseId: course.id, courseTitle: course.title, issuedDate: new Date().toISOString(), };
            const updatedUser: User = { ...currentUser, certifications: [...currentUser.certifications, newCertificate], xp: currentUser.xp + 250 };
            setCurrentUser(updatedUser);
            await databaseService.updateUser(updatedUser);
            alert(`Parabéns! Você ganhou o certificado de ${course.title}!`);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const addNewCourse = async (course: Course) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        course.creator = currentUser.name;
        await databaseService.saveCourse(course);
        const updatedCourses = await databaseService.getCourses();
        setCourses(updatedCourses);

        const updatedUser = { ...currentUser, enrolledCourseIds: [...new Set([...currentUser.enrolledCourseIds, course.id])] };
        setCurrentUser(updatedUser);
        await databaseService.updateUser(updatedUser);
        
        navigateTo({ type: 'COURSE_DETAIL', courseId: course.id });
    } catch (err) {
        console.error("Erro ao salvar curso gerado:", err);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleLogin = (user: User) => { setCurrentUser(user); navigateTo({type: 'DASHBOARD'}); }
  const handleLogout = () => { authService.logout(); setCurrentUser(null); navigateTo({type: 'LANDING'}); }

  const handleRegisterSuccess = async (newUser: User, selectedPlanTier?: string) => {
    const updatedUsers = await databaseService.getUsers();
    setAllUsers(updatedUsers);
    
    if (selectedPlanTier && selectedPlanTier !== 'free') {
        newUser.subscription = 'premium';
        newUser.wallet.globalCredits += (selectedPlanTier === 'premium' ? 30 : 10);
        await databaseService.updateUser(newUser);
    }

    setCurrentUser(newUser);
    navigateTo({ type: 'DASHBOARD' });
  };

  const handleCreatePost = async (content: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        const newPost: Post = { id: `post-${Date.now()}`, authorId: currentUser.id, authorName: currentUser.name, authorAvatar: currentUser.avatarUrl, content, timestamp: new Date().toISOString(), reactions: {}, comments: [], };
        await databaseService.savePosts([newPost, ...posts]);
        const updatedPosts = await databaseService.getPosts();
        setPosts(updatedPosts);
    } finally {
        setIsLoading(false);
    }
  };

  const handleReaction = async (postId: string, reaction: ReactionType) => {
    if (!currentUser) return;
    const newPosts = posts.map(post => {
      if (post.id === postId) {
        const newReactions = { ...post.reactions };
        if (newReactions[currentUser.id] === reaction) delete newReactions[currentUser.id];
        else newReactions[currentUser.id] = reaction;
        return { ...post, reactions: newReactions };
      }
      return post;
    });
    setPosts(newPosts);
    await databaseService.savePosts(newPosts);
  };

  const handleAddComment = async (postId: string, content: string) => {
     if (!currentUser) return;
     const newComment: Comment = { id: `comment-${Date.now()}`, authorId: currentUser.id, authorName: currentUser.name, authorAvatar: currentUser.avatarUrl, content, timestamp: new Date().toISOString(), };
     const newPosts = posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p);
     setPosts(newPosts);
     await databaseService.savePosts(newPosts);
  };
  
  const handleSubscribe = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        const updatedUser: User = { ...currentUser, subscription: 'premium', wallet: { ...currentUser.wallet, globalCredits: currentUser.wallet.globalCredits + 10, } };
        setCurrentUser(updatedUser);
        await databaseService.updateUser(updatedUser);
        navigateTo({type: 'DASHBOARD'});
    } finally {
        setIsLoading(false);
    }
  };

  const handleScheduleUpdate = async (schedule: ScheduleSlot[]) => {
    if(!currentUser) return;
    const updatedUser = {...currentUser, weeklySchedule: schedule};
    setCurrentUser(updatedUser);
    await databaseService.updateUser(updatedUser);
  };

  const handleToggleFollow = async (targetUserId: string) => {
      if (!currentUser) return;
      const targetUser = allUsers.find(u => u.id === targetUserId);
      if (!targetUser) return;
      
      setIsLoading(true);
      try {
          const isFollowing = currentUser.following.includes(targetUserId);
          const updatedCurrentUser: User = { ...currentUser, following: isFollowing ? currentUser.following.filter(id => id !== targetUserId) : [...currentUser.following, targetUserId] };
          const updatedTargetUser: User = { ...targetUser, followers: isFollowing ? targetUser.followers.filter(id => id !== currentUser.id) : [...targetUser.followers, currentUser.id] };
          
          setCurrentUser(updatedCurrentUser);
          await Promise.all([
              databaseService.updateUser(updatedCurrentUser),
              databaseService.updateUser(updatedTargetUser)
          ]);
          
          const refreshedUsers = await databaseService.getUsers();
          setAllUsers(refreshedUsers);
      } finally {
          setIsLoading(false);
      }
  };

  const renderContent = () => {
    if (!currentUser) {
        switch (view.type) {
            case 'REGISTER': return <Register onRegisterSuccess={(user) => handleRegisterSuccess(user, view.selectedPlan)} onNavigateToLogin={() => navigateTo({type: 'LOGIN'})} />;
            case 'LOGIN': return <Login onLoginSuccess={handleLogin} onNavigateToRegister={() => navigateTo({type: 'REGISTER'})} />;
            case 'LANDING': default: return <LandingPage plans={plans} affiliateLinks={affiliateLinks} onNavigateToRegister={(tier) => navigateTo({type: 'REGISTER', selectedPlan: tier})} onNavigateToLogin={() => navigateTo({type: 'LOGIN'})} />;
        }
    }

    const allItemsMap = new Map<string, Lesson | Subject>();
    courses.flatMap(c => c.modules).flatMap(m => m.lessons).forEach(l => allItemsMap.set(l.id, l));
    subjects.forEach(s => allItemsMap.set(s.id, s));

    switch (view.type) {
      case 'PROFILE': return <Profile profileUser={currentUser} currentUser={currentUser} courses={courses} posts={posts} onToggleFollow={handleToggleFollow} onNavigateToProfile={(userId) => navigateTo({type: 'USER_PROFILE', userId})} onNavigateToCourse={(courseId) => navigateTo({type: 'COURSE_DETAIL', courseId})}/>;
      case 'USER_PROFILE': {
        const profileUser = allUsers.find(u => u.id === view.userId);
        return profileUser ? <Profile profileUser={profileUser} currentUser={currentUser} courses={courses} posts={posts} onToggleFollow={handleToggleFollow} onNavigateToProfile={(userId) => navigateTo({type: 'USER_PROFILE', userId})} onNavigateToCourse={(courseId) => navigateTo({type: 'COURSE_DETAIL', courseId})} /> : <div>Usuário não encontrado.</div>
      }
      case 'COMMUNITY': return <CommunityFeed user={currentUser} allUsers={allUsers} posts={posts} onCreatePost={handleCreatePost} onReaction={handleReaction} onAddComment={handleAddComment} onNavigateToProfile={(userId) => navigateTo({type: 'USER_PROFILE', userId})} />;
      case 'SUBSCRIPTION': return <Subscription onSubscribe={handleSubscribe} onHotmartSuccess={handleLogin} />;
      case 'WALLET': return <Wallet user={currentUser} />;
      case 'STUDY_PLANNER': return <StudyPlanner user={currentUser} cycles={cycles.filter(c => currentUser.studyCycleIds.includes(c.id))} subjects={subjects} onUpdateCycles={(c) => databaseService.saveCycles(c).then(() => setCycles(c))} onUpdateSubjects={(s) => databaseService.saveSubjects(s).then(() => setSubjects(s))} onUpdateUser={(u) => databaseService.updateUser(u).then(() => setCurrentUser(u))} onScheduleUpdate={handleScheduleUpdate} />;
      case 'EDUCATOR_DASHBOARD': return <EducatorDashboard user={currentUser} allUsers={allUsers} onApplyLogo={handleApplyLogo} />;
      case 'MOCK_TEST_LOBBY': return <MockTestLobby user={currentUser} onStartTest={handleStartMockTest} onReviewResult={(resultId) => navigateTo({ type: 'MOCK_TEST_RESULTS', resultId })} />;
      case 'MOCK_TEST_SESSION': return <MockTestSession test={view.test} onFinishTest={handleFinishMockTest} />;
      case 'MOCK_TEST_RESULTS': {
        const result = currentUser.mockTestResults.find(r => r.id === view.resultId);
        return result ? <MockTestResults result={result} onDone={() => navigateTo({ type: 'MOCK_TEST_LOBBY' })} /> : <div>Resultado não encontrado.</div>;
      }
      case 'COURSE_DETAIL':
        const course = courses.find(c => c.id === view.courseId);
        return course ? <CourseDetail course={course} user={currentUser} onSelectLesson={(lessonId) => navigateTo({ type: 'LESSON', courseId: course.id, lessonId })} onClaimCertificate={handleClaimCertificate} /> : <div>Curso não encontrado</div>;
      case 'LESSON': {
        const lessonCourse = courses.find(c => c.id === view.courseId);
        const lesson = lessonCourse?.modules.flatMap(m => m.lessons).find(l => l.id === view.lessonId);
        return lesson && lessonCourse ? <LessonView course={lessonCourse} lesson={lesson} onComplete={(p) => { handleItemCompletion(lesson.id, 'lesson', p); navigateTo({type: 'COURSE_DETAIL', courseId: lessonCourse.id}); }} /> : <div>Lição não encontrada</div>;
      }
      case 'REVIEW_SESSION': {
        const item = allItemsMap.get(view.itemId);
        return item ? <ReviewSession item={item} onComplete={(p) => { handleItemCompletion(item.id, 'subject' in item ? 'subject' : 'lesson', p); navigateTo({type: 'DASHBOARD'}); }} /> : <div>Item não encontrado para revisão.</div>;
      }
       case 'STUDY_SESSION': {
        const subject = subjects.find(s => s.id === view.subjectId);
        return subject ? <div><h1>Estudando: {subject.name}</h1><p>{subject.content.map(c => c.summary || c.title).join('\n')}</p></div> : <div>Assunto não encontrado</div>
      }
      case 'CREATE_COURSE': return <CreateCourse onCourseCreated={addNewCourse} />;
      case 'DASHBOARD': default:
        return <Dashboard user={currentUser} courses={courses} subjects={subjects} onSelectCourse={(id) => navigateTo({ type: 'COURSE_DETAIL', courseId: id })} onEnrollCourse={handleEnrollCourse} onCreateCourse={() => navigateTo({type: 'CREATE_COURSE'})} onNavigateToSubscription={() => navigateTo({type: 'SUBSCRIPTION'})} onSelectReview={(id, type) => navigateTo({type: 'REVIEW_SESSION', itemId: id, itemType: type})} onSelectStudySession={(id) => navigateTo({ type: 'STUDY_SESSION', subjectId: id })} onNavigateToMockTests={() => navigateTo({ type: 'MOCK_TEST_LOBBY' })} />;
    }
  };
  
  const showHeaderFooter = view.type !== 'LANDING' && view.type !== 'MOCK_TEST_SESSION';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Suspense fallback={<LoadingOverlay onForceExit={() => setIsLoading(false)} />}>
          {isLoading && <LoadingOverlay onForceExit={() => setIsLoading(false)} />}
          {showHeaderFooter && <Header customLogo={customLogo} user={currentUser} onNavigateHome={() => navigateTo({type: 'DASHBOARD'})} onLogout={handleLogout} onNavigateToProfile={() => navigateTo({type: 'PROFILE'})} onNavigateToCommunity={() => navigateTo({type: 'COMMUNITY'})} onNavigateToWallet={() => navigateTo({type: 'WALLET'})} onNavigateToStudyPlanner={() => navigateTo({type: 'STUDY_PLANNER'})} onNavigateToEducatorDashboard={() => navigateTo({type: 'EDUCATOR_DASHBOARD'})} onNavigateToMockTests={() => navigateTo({type: 'MOCK_TEST_LOBBY'})} />}
          <main className={`${showHeaderFooter ? 'p-4 sm:p-6 md:p-8 max-w-7xl mx-auto' : ''}`}>{renderContent()}</main>
          {view.type === 'STUDY_SESSION' && <PomodoroTimer onSessionComplete={() => handleItemCompletion(view.subjectId, 'subject', 1.0)} />}
          {showHeaderFooter && <footer className="text-center p-4 text-slate-500 text-sm">EduQuest: AI Learning Saga</footer>}
      </Suspense>
    </div>
  );
}
