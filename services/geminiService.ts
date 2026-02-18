
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Module, Lesson, QuizQuestion, User, Subject, ScheduleSlot, QuestionType, MockTestQuestion } from '../types';

const EMOJI_ICONS = ['📚', '💡', '🚀', '🎨', '💻', '🧪', '🏛️', '🎵', '📈', '🌍'];

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateQuizFeedback(question: string, incorrectAnswer: string, correctAnswer: string): Promise<string> {
    const prompt = `
      You are an encouraging and helpful quiz tutor. A student has answered a multiple-choice question incorrectly.
      Your task is to provide a brief, helpful explanation.

      The explanation should:
      1.  Gently explain *why* the student's chosen answer ('${incorrectAnswer}') is incorrect.
      2.  Give a subtle hint towards the correct answer ('${correctAnswer}') without explicitly revealing it.
      3.  Maintain a positive tone.
      4.  Use LaTeX for formulas if needed.

      Question: "${question}"
      Student's (Incorrect) Answer: "${incorrectAnswer}"
      Correct Answer: "${correctAnswer}"
    `;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating quiz feedback:", error);
        return "Tente pensar um pouco mais sobre o conceito central desta questão.";
    }
  }

  async generatePostIdea(): Promise<string> {
    const prompt = `Gere uma pergunta instigante ou um fato curioso sobre aprendizado, tecnologia ou crescimento pessoal para uma rede social educacional.`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
        return "Qual é a coisa mais interessante que você aprendeu esta semana?";
    }
  }

  async generateCourse(topic: string): Promise<Course> {
    const courseOutlineSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        modules: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              lessons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                  },
                  required: ['title'],
                },
              },
            },
            required: ['title', 'lessons'],
          },
        },
      },
      required: ['title', 'description', 'modules'],
    };

    const prompt = `Você é um designer de currículos especialista. Crie um curso completo e estruturado para o tópico: "${topic}". 
    O curso deve ter lições curtas e engajadoras (microlearning).
    Estruture em 2-3 módulos, com 3-4 lições cada.
    Responda em PORTUGUÊS.`;

    // Usando Gemini 3 Pro para tarefas complexas de estruturação de conhecimento
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: courseOutlineSchema,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const outline = JSON.parse(response.text);
    
    const courseId = `course-${Date.now()}`;
    const modules: Module[] = await Promise.all(
        outline.modules.map(async (moduleData: any, moduleIndex: number) => {
            const moduleId = `${courseId}-module-${moduleIndex}`;
            const lessons: Lesson[] = await Promise.all(
                moduleData.lessons.map(async (lessonData: any, lessonIndex: number) => {
                    const lessonId = `${moduleId}-lesson-${lessonIndex}`;
                    const lessonContent = await this.generateLessonContent(lessonData.title, topic);
                    return {
                        id: lessonId,
                        title: lessonData.title,
                        difficulty: this.determineDifficulty(lessonIndex, moduleData.lessons.length),
                        xp: lessonContent.type === 'code-exercise' ? 75 : (lessonContent.type === 'quiz' ? 50 : 30),
                        ...lessonContent,
                    } as Lesson;
                })
            );
            return {
                id: moduleId,
                title: moduleData.title,
                workloadHours: lessons.length * 2,
                lessons,
            };
        })
    );


    return {
      id: courseId,
      title: outline.title,
      description: outline.description,
      creator: 'AI Tutor',
      icon: EMOJI_ICONS[Math.floor(Math.random() * EMOJI_ICONS.length)],
      modules,
    };
  }

  private async generateLessonContent(lessonTitle: string, courseTopic: string): Promise<Partial<Lesson>> {
    const lessonType = this.determineLessonType(lessonTitle);

    switch (lessonType) {
        case 'quiz': {
            const quiz = await this.generateQuiz(lessonTitle, courseTopic);
            return { type: 'quiz', content: 'Teste seus conhecimentos!', quiz };
        }
        case 'code-exercise': {
            return this.generateCodeExercise(lessonTitle, courseTopic);
        }
        case 'text':
        default: {
            const prompt = `Escreva uma explicação concisa e fácil de entender para a lição "${lessonTitle}" do curso "${courseTopic}". 
            Use tom didático. Se houver fórmulas, use LaTeX. Responda em Português.`;
            
            const response = await this.ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            return { type: 'text', content: response.text };
        }
    }
  }

  private async generateCodeExercise(lessonTitle: string, courseTopic: string): Promise<Pick<Lesson, 'type' | 'content' | 'exercise'>> {
    const codeExerciseSchema = {
        type: Type.OBJECT,
        properties: {
            instructions: { type: Type.STRING },
            initialCode: { type: Type.STRING },
            solution: { type: Type.STRING },
            tests: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        code: { type: Type.STRING }
                    },
                    required: ['description', 'code']
                }
            }
        },
        required: ['instructions', 'initialCode', 'solution', 'tests']
    };

    const prompt = `Crie um exercício de programação em JavaScript para a lição "${lessonTitle}". Responda em Português.`;
    
    const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: codeExerciseSchema
        }
    });

    const exerciseData = JSON.parse(response.text);

    return {
        type: 'code-exercise',
        content: exerciseData.instructions,
        exercise: {
            initialCode: exerciseData.initialCode,
            solution: exerciseData.solution,
            tests: exerciseData.tests,
        }
    };
  }

  // Added: generateCodeHint to provide AI-powered tips for coding exercises
  async generateCodeHint(instructions: string, userCode: string, failedTest: string): Promise<string> {
    const prompt = `Você é um tutor de programação amigável. Um estudante está com dificuldades em um exercício de JavaScript.
    O teste que falhou foi: "${failedTest}".
    Instruções do exercício: "${instructions}".
    Código atual do estudante:
    \`\`\`javascript
    ${userCode}
    \`\`\`
    
    Forneça uma dica curta e útil em Português que ajude o estudante a encontrar o erro por conta própria. Não dê a solução completa. Use tom encorajador.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Tente revisar a lógica do seu código.";
    } catch (error) {
      console.error("Erro ao gerar dica de código:", error);
      return "Dica: Revise a lógica do seu código e compare com os requisitos do exercício.";
    }
  }
  
  async generateReviewQuiz(lessonTitle: string, courseTopic: string): Promise<QuizQuestion[]> {
      const prompt = `Crie um quiz de revisão desafiador com 3 questões para a lição "${lessonTitle}".`
      return this.generateQuizFromPrompt(prompt);
  }

  private async generateQuiz(lessonTitle: string, courseTopic: string): Promise<QuizQuestion[]> {
      const prompt = `Crie um quiz de múltipla escolha with 2 questões sobre "${lessonTitle}". Responda em Português.`
      return this.generateQuizFromPrompt(prompt);
  }

  private async generateQuizFromPrompt(prompt: string): Promise<QuizQuestion[]> {
      const quizSchema = {
          type: Type.ARRAY,
          items: {
              type: Type.OBJECT,
              properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  hint: { type: Type.STRING },
                  explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctAnswerIndex', 'hint', 'explanation']
          }
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: quizSchema
        }
      });
      const quizData = JSON.parse(response.text);

      return quizData.map((q: any, index: number): QuizQuestion => {
        const questionId = `q-${Date.now()}-${index}`;
        return {
            id: questionId,
            type: 'multiple-choice',
            question: q.question,
            options: q.options.map((optText: string, optIndex: number) => ({
                id: `${questionId}-opt-${optIndex}`,
                text: optText,
            })),
            correctOptionId: `${questionId}-opt-${q.correctAnswerIndex}`,
            hint: q.hint,
            explanation: q.explanation,
        };
      });
  }

  async analyzeAndSummarizeSubject(subjectName: string): Promise<{ difficulty: 'Beginner' | 'Intermediate' | 'Advanced', summary: string }> {
    const schema = {
        type: Type.OBJECT,
        properties: {
            difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
            summary: { type: Type.STRING }
        },
        required: ['difficulty', 'summary']
    };

    const prompt = `Analise o tópico "${subjectName}". Dê um resumo em Português.`;

    const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema
        }
    });

    return JSON.parse(response.text);
  }

  async generateWeeklySchedule(user: User, subjects: Subject[]): Promise<ScheduleSlot[]> {
    const scheduleSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                day: { type: Type.STRING, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                subjectId: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['fixed', 'rotating'] }
            },
            required: ['day', 'startTime', 'endTime', 'subjectId', 'type']
        }
    };
    
    const prompt = `Crie um cronograma de estudos equilibrado baseado nos interesses do usuário.`;
    
    const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: scheduleSchema,
        },
    });

    return JSON.parse(response.text);
  }

  async generateMockTest(examType: string, subject: string): Promise<{ questions: MockTestQuestion[] }> {
    const quizSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswerIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                    },
                    required: ['question', 'subject', 'options', 'correctAnswerIndex', 'explanation']
                }
            }
        },
        required: ['questions']
    }

    const prompt = `Gere um simulado de 5 questões para a prova "${examType}" focado em "${subject}". Responda em Português.`;

    const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: quizSchema }
    });

    const quizData = JSON.parse(response.text);

    return {
        questions: quizData.questions.map((q: any, index: number): MockTestQuestion => {
            const questionId = `mq-${Date.now()}-${index}`;
            return {
                id: questionId,
                type: 'multiple-choice',
                question: q.question,
                subject: q.subject,
                options: q.options.map((optText: string, optIndex: number) => ({
                    id: `${questionId}-opt-${optIndex}`,
                    text: optText,
                })),
                correctOptionId: `${questionId}-opt-${q.correctAnswerIndex}`,
                explanation: q.explanation,
            };
        })
    };
  }
  
  async analyzeMockTestPerformance(questions: MockTestQuestion[], userAnswers: Record<string, string>): Promise<string> {
      const prompt = `Analise o desempenho do aluno no simulado e dê feedback em Português usando Markdown.`;
      const response = await this.ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
      });
      return response.text;
  }
  
  private determineDifficulty(lessonIndex: number, totalLessons: number): Lesson['difficulty'] {
      const ratio = lessonIndex / totalLessons;
      if (ratio < 0.3) return 'Beginner';
      if (ratio < 0.7) return 'Intermediate';
      return 'Advanced';
  }

  private determineLessonType(lessonTitle: string): 'video' | 'text' | 'quiz' | 'code-exercise' {
    const title = lessonTitle.toLowerCase();
    if (title.includes('quiz') || title.includes('teste')) return 'quiz';
    if (title.includes('exercício') || title.includes('prática') || title.includes('projeto') || title.includes('código')) return 'code-exercise';
    return 'text';
  }

}

export const geminiService = new GeminiService();
