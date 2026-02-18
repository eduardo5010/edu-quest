
import { Course, User, Post, StudyCycle, Subject } from '../types';

export const MOCK_SUBJECTS: Subject[] = [
    {
        id: 'subject-1',
        name: 'Calculus I',
        difficulty: 'Advanced',
        content: [
            { type: 'pdf_summary', title: 'Chapter 1: Limits', summary: 'A limit is the value that a function approaches as the input approaches some value. Limits are essential to calculus and are used to define continuity, derivatives, and integrals.' },
            { type: 'video', title: 'Essence of calculus, chapter 1', url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM' }
        ]
    },
    {
        id: 'subject-2',
        name: 'Linear Algebra',
        difficulty: 'Intermediate',
        content: []
    },
    {
        id: 'subject-3',
        name: 'Data Structures',
        difficulty: 'Intermediate',
        content: []
    }
];

export const MOCK_CYCLES: StudyCycle[] = [
    {
        id: 'cycle-1',
        name: 'University Semester 1',
        subjectIds: ['subject-1', 'subject-2', 'subject-3']
    }
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Doe',
    email: 'alex@example.com',
    password: 'password123',
    avatarUrl: 'https://picsum.photos/seed/alex/100/100',
    level: 5,
    xp: 720,
    streak: 3,
    lastStudiedDate: new Date(new Date().setDate(new Date().getDate() - 1)).toDateString(),
    enrolledCourseIds: ['course-1', 'course-2'],
    studyCycleIds: ['cycle-1'],
    progress: { 'lesson-1-1': true, 'lesson-1-2': true, 'lesson-2-1': true, },
    completedModuleIds: [],
    learningState: { 'lesson-1-1': { strength: 0.9, lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), nextReviewDue: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), reviewHistory: [{ timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), performance: 0.9 }], }, 'lesson-2-1': { strength: 0.4, lastReviewed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), nextReviewDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), reviewHistory: [{ timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), performance: 1.0 }], } },
    achievements: [ { id: 'ach-1', name: 'Course Starter', description: 'Begin your first course.', icon: '🎓' }, { id: 'ach-2', name: 'Quick Learner', description: 'Complete a lesson.', icon: '⚡' }, ],
    certifications: [],
    roles: ['student', 'creator', 'teacher'],
    githubUrl: 'https://github.com/vitejs',
    linkedinUrl: 'https://www.linkedin.com/company/vitejs/',
    bio: 'Lifelong learner & AI enthusiast. Building the future of education, one course at a time. Currently obsessed with React and Spanish.',
    followers: ['user-2'],
    following: ['user-2'],
    subscription: 'premium',
    wallet: { globalCredits: 150, individualCredits: 25, },
    sleepSchedule: { minBedtime: '23:00', maxWakeup: '08:00' },
    unavailableSlots: [ { day: 'Wednesday', startTime: '18:00', endTime: '20:00' }, { day: 'Saturday', startTime: '10:00', endTime: '14:00' } ],
    weeklySchedule: [ {day: 'Monday', startTime: '09:00', endTime: '10:00', subjectId: 'subject-1', type: 'fixed'}, {day: 'Tuesday', startTime: '10:00', endTime: '11:00', subjectId: 'subject-2', type: 'rotating'} ],
    studentIds: ['user-2'],
    weeklyXp: 985,
    league: 'Gold',
    mockTestResults: [],
  },
  {
    id: 'user-2',
    name: 'Beta Tester',
    email: 'beta@example.com',
    password: 'password123',
    avatarUrl: 'https://picsum.photos/seed/beta/100/100',
    level: 2,
    xp: 210,
    streak: 1,
    lastStudiedDate: new Date().toDateString(),
    enrolledCourseIds: ['course-2'],
    studyCycleIds: [],
    progress: { 'lesson-2-1': true, },
    completedModuleIds: [],
    learningState: {},
    achievements: [ { id: 'ach-1', name: 'Course Starter', description: 'Begin your first course.', icon: '🎓' }, ],
    certifications: [],
    roles: ['student'],
    bio: 'Just here to learn and explore. Currently working through the Spanish 101 course!',
    followers: ['user-1'],
    following: ['user-1'],
    subscription: 'free',
    wallet: { globalCredits: 10, individualCredits: 0, },
    sleepSchedule: { minBedtime: '23:00', maxWakeup: '08:00' },
    unavailableSlots: [],
    weeklySchedule: [],
    teacherIds: ['user-1'],
    weeklyXp: 720,
    league: 'Gold',
    mockTestResults: [],
  },
  ...Array.from({ length: 8 }, (_, i) => {
    const userNames = ['Chloe', 'David', 'Emily', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
    const weeklyXps = [1420, 1190, 1150, 1050, 950, 750, 620, 510];
    return {
      id: `user-${i + 3}`,
      name: userNames[i],
      email: `${userNames[i].toLowerCase()}@example.com`,
      avatarUrl: `https://picsum.photos/seed/${userNames[i]}/100/100`,
      level: Math.floor(weeklyXps[i] / 200),
      xp: weeklyXps[i] * 3,
      streak: Math.floor(Math.random() * 10),
      lastStudiedDate: new Date().toDateString(),
      enrolledCourseIds: [],
      studyCycleIds: [],
      progress: {},
      completedModuleIds: [],
      learningState: {},
      achievements: [],
      certifications: [],
      roles: ['student' as const],
      bio: `Learning something new every day. My weekly goal is ${weeklyXps[i]} XP!`,
      followers: [],
      following: [],
      subscription: 'free' as const,
      wallet: { globalCredits: weeklyXps[i] / 10, individualCredits: 0 },
      sleepSchedule: { minBedtime: '23:00', maxWakeup: '08:00' },
      unavailableSlots: [],
      weeklySchedule: [],
      weeklyXp: weeklyXps[i],
      league: 'Gold' as const,
      mockTestResults: [],
    };
  })
];

export const MOCK_POSTS: Post[] = [ 
    { 
        id: 'post-3', 
        authorId: 'user-1', 
        authorName: 'Alex Doe', 
        authorAvatar: 'https://picsum.photos/seed/alex/100/100', 
        content: `I've been diving deep into the history of programming languages, and it's absolutely fascinating! It all started with basic machine code, then assembly language which gave mnemonics to machine instructions. Then came Fortran, one of the first high-level languages, which revolutionized scientific computing. LISP followed with its unique parenthesized syntax, influencing many languages to come. The 60s and 70s were a golden age, giving us COBOL for business, BASIC for beginners, and the legendary C, which is still a foundation for so much of modern software. It's truly amazing to see how each language built upon the ideas of its predecessors. What's a piece of tech history that fascinates you all?`, 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
        reactions: { 'user-2': 'insightful' }, 
        comments: [] 
    },
    { 
        id: 'post-4', 
        authorId: 'user-2', 
        authorName: 'Beta Tester', 
        authorAvatar: 'https://picsum.photos/seed/beta/100/100', 
        content: `Found this amazing photo of the James Webb Space Telescope. The level of engineering is just mind-blowing. Look at those hexagonal mirrors! https://picsum.photos/seed/space/600/400`, 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), 
        reactions: { 'user-1': 'love' }, 
        comments: [] 
    },
    { 
        id: 'post-5', 
        authorId: 'user-1', 
        authorName: 'Alex Doe', 
        authorAvatar: 'https://picsum.photos/seed/alex/100/100', 
        content: `For anyone studying Linear Algebra, this video series by 3Blue1Brown is an absolute must-watch. It gives you such a great intuition for what vectors and matrices actually *are*. \nhttps://www.youtube.com/watch?v=fNk_zzaMoSs`, 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
        reactions: { 'user-2': 'like' }, 
        comments: [] 
    },
    { 
        id: 'post-1', 
        authorId: 'user-2', 
        authorName: 'Beta Tester', 
        authorAvatar: 'https://picsum.photos/seed/beta/100/100', 
        content: "Just finished the 'Common Greetings' lesson in Spanish 101. ¡Hola a todos! What course is everyone else enjoying right now?", 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
        reactions: { 'user-1': 'love' }, 
        comments: [ { id: 'comment-1', authorId: 'user-1', authorName: 'Alex Doe', authorAvatar: 'https://picsum.photos/seed/alex/100/100', content: `That's awesome! I'm working through the React for Beginners course. It's challenging but fun!`, timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), } ] 
    }, 
    { 
        id: 'post-2', 
        authorId: 'user-1', 
        authorName: 'Alex Doe', 
        authorAvatar: 'https://picsum.photos/seed/alex/100/100', 
        content: "Learning about React components is blowing my mind! It's like building with digital LEGOs. 🤯 #webdev #react. You can find the official docs here: https://react.dev/", 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), 
        reactions: { 'user-2': 'insightful' }, 
        comments: [] 
    } 
];

export const MOCK_COURSES: Course[] = [ { id: 'course-1', title: 'React for Beginners', description: 'Learn the fundamentals of React and build your first web application.', creator: 'AI', icon: '⚛️', certificationProjectId: 'lesson-1-5', modules: [ { id: 'module-1-1', title: 'Introduction to React', workloadHours: 40, lessons: [ { id: 'lesson-1-1', title: 'What is React?', type: 'text', difficulty: 'Beginner', content: 'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called “components”.', xp: 20, }, { id: 'lesson-1-2', title: 'Setting up Your Environment', type: 'video', difficulty: 'Beginner', content: 'https://www.youtube.com/watch?v=SqcY0GlETPk', xp: 30, }, { id: 'lesson-1-3', title: 'Your First Component', type: 'quiz', difficulty: 'Intermediate', content: 'Let\'s test your knowledge about components.', xp: 50, quiz: [ { id: 'q-1-3-1', type: 'multiple-choice', question: 'What is the main building block of a React application?', options: [ { id: 'opt-1', text: 'Functions' }, { id: 'opt-2', text: 'Components' }, { id: 'opt-3', text: 'Variables' }, { id: 'opt-4', text: 'Stylesheets' }, ], correctOptionId: 'opt-2', hint: 'Think about how React applications are structured from smaller, reusable pieces.', explanation: 'Components are the core building blocks in React. They let you split the UI into independent, reusable pieces, and think about each piece in isolation.' }, { id: 'q-1-3-2', type: 'multiple-choice', question: 'What syntax extension is commonly used with React?', options: [ { id: 'opt-1', text: 'HTML' }, { id: 'opt-2', text: 'JS' }, { id: 'opt-3', text: 'JSX' }, { id: 'opt-4', text: 'XML' }, ], correctOptionId: 'opt-3', hint: 'It looks like HTML but allows you to write JavaScript in it.', explanation: 'JSX (JavaScript XML) is a syntax extension for JavaScript. It allows you to write HTML-like code in your JavaScript files, which makes creating complex UIs more intuitive.' }, ], }, { id: 'lesson-1-4', title: 'JSX and Props', type: 'code-exercise', difficulty: 'Intermediate', xp: 75, content: 'Components can receive data through "props". Let\'s practice passing props to a component. Your task is to complete the `Greeting` component so it displays a personalized message.', exercise: { initialCode: `function Greeting(props) {\n  // Your code here!\n  return <h1>Hello, World!</h1>;\n}\n\n// This is how the component would be used:\n// <Greeting name="Alex" />`, solution: `function Greeting(props) {\n  return <h1>Hello, {props.name}!</h1>;\n}`, tests: [ { description: 'Displays the correct greeting for the name "Alex"', code: `(function() { const userCode = CODE_PLACEHOLDER; const Greeting = new Function('props', 'return (' + userCode + ')(props)'); const result = Greeting({name: 'Alex'}); return result.props.children.join('') === 'Hello, Alex!'; })()` }, { description: 'Displays the correct greeting for the name "Sarah"', code: `(function() { const userCode = CODE_PLACEHOLDER; const Greeting = new Function('props', 'return (' + userCode + ')(props)'); const result = Greeting({name: 'Sarah'}); return result.props.children.join('') === 'Hello, Sarah!'; })()` } ] } }, { id: 'lesson-1-5', title: 'Project: Build a Counter App', type: 'project', difficulty: 'Advanced', xp: 150, content: 'Build a simple counter application. It should display a number and have two buttons: one to increment the count and one to decrement it.', exercise: { initialCode: `function Counter() {\n  // You will need to use the useState hook here.\n  const count = 0;\n\n  return (\n    <div>\n      <h2>{count}</h2>\n      <button>Decrement</button>\n      <button>Increment</button>\n    </div>\n  );\n}`, solution: `function Counter() {\n  const [count, setCount] = React.useState(0);\n\n  return (\n    <div>\n      <h2>{count}</h2>\n      <button onClick={() => setCount(count - 1)}>Decrement</button>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );}`, tests: [] } } ], }, ], }, { id: 'course-2', title: 'Spanish 101', description: 'Start your journey to fluency with basic Spanish greetings and phrases.', creator: 'Maria Garcia', icon: '🇪🇸', modules: [ { id: 'module-2-1', title: 'Greetings & Basics', workloadHours: 20, lessons: [ { id: 'lesson-2-1', title: 'Common Greetings', type: 'text', difficulty: 'Beginner', content: 'Hola means Hello. Buenos días means Good morning. ¿Cómo estás? means How are you?', xp: 20, }, { id: 'lesson-2-2', title: 'Pronunciation Guide', type: 'video', difficulty: 'Beginner', content: 'https://www.youtube.com/watch?v=hsLy_c_hD0E', xp: 30, }, { id: 'lesson-2-3', title: 'Basic Quiz', type: 'quiz', difficulty: 'Beginner', content: 'Time to practice!', xp: 50, quiz: [ { id: 'q-2-3-1', type: 'multiple-choice', question: 'How do you say "Hello" in Spanish?', options: [ { id: 'opt-1', text: 'Adiós' }, { id: 'opt-2', text: 'Gracias' }, { id: 'opt-3', text: 'Hola' }, { id: 'opt-4', text: 'Por favor' }, ], correctOptionId: 'opt-3', hint: 'It is a very common greeting worldwide.', explanation: '"Hola" is the most common way to say "Hello" in Spanish. "Adiós" means "Goodbye", "Gracias" means "Thank you", and "Por favor" means "Please".' }, ], }, ], }, ], }, ];