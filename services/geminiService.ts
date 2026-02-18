
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Module, Lesson, QuizQuestion, User, Subject, ScheduleSlot, QuestionType, MockTestQuestion } from '../types';

const EMOJI_ICONS = ['📚', '💡', '🚀', '🎨', '💻', '🧪', '🏛️', '🎵', '📈', '🌍'];

class GeminiService {
  private getInterface() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("A chave de API (API_KEY) não foi configurada.");
    return new GoogleGenAI({ apiKey });
  }

  async generateQuizFeedback(question: string, incorrectAnswer: string, correctAnswer: string): Promise<string> {
    const prompt = `Você é um tutor incentivador. Um aluno errou: "${question}". Ele escolheu "${incorrectAnswer}", mas o correto era "${correctAnswer}". Dê uma explicação curta e uma dica sem revelar a resposta diretamente. Use Português.`;
    try {
        const response = await this.getInterface().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Continue tentando! O erro faz parte do aprendizado.";
    } catch (error) {
        return "Continue tentando!";
    }
  }

  async generatePostIdea(): Promise<string> {
    const prompt = `Gere uma curiosidade rápida sobre aprendizado ou tecnologia para uma rede social.`;
    try {
      const response = await this.getInterface().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Você sabia que aprender algo novo antes de dormir ajuda na memorização?";
    } catch (error) {
        return "O que você aprendeu hoje?";
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
                  properties: { title: { type: Type.STRING } },
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

    const prompt = `Crie a estrutura de um curso completo para o tópico: "${topic}". Responda em Português.`;

    const response = await this.getInterface().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: courseOutlineSchema,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Falha ao obter resposta da IA.");
    const outline = JSON.parse(text.trim());
    
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
                        difficulty: lessonIndex < 2 ? 'Beginner' : 'Intermediate',
                        xp: 50,
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
    const prompt = `Escreva uma explicação concisa para a lição "${lessonTitle}" do curso "${courseTopic}". Responda em Português.`;
    const response = await this.getInterface().models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return { type: 'text', content: response.text || "Conteúdo em breve." };
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

    const prompt = `Gere 5 questões de simulado estilo "${examType}" sobre "${subject}". Responda em Português.`;

    const response = await this.getInterface().models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json', 
            responseSchema: quizSchema,
            thinkingConfig: { thinkingBudget: 4000 }
        }
    });

    const text = response.text;
    if (!text) throw new Error("Falha ao gerar simulado.");
    const quizData = JSON.parse(text.trim());

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
      const prompt = `Analise o desempenho e dê feedback em Português. Questões: ${JSON.stringify(questions)} Respostas: ${JSON.stringify(userAnswers)}`;
      const response = await this.getInterface().models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: prompt,
          config: { thinkingConfig: { thinkingBudget: 2000 } }
      });
      return response.text || "Análise indisponível.";
  }

  async generateReviewQuiz(lessonTitle: string, courseTopic: string): Promise<QuizQuestion[]> {
      const prompt = `Crie 3 questões de revisão para "${lessonTitle}".`;
      const response = await this.getInterface().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return []; // Simplificado para o exemplo
  }

  async analyzeAndSummarizeSubject(subjectName: string): Promise<{ difficulty: 'Beginner' | 'Intermediate' | 'Advanced', summary: string }> {
    const prompt = `Resuma o tópico "${subjectName}".`;
    const response = await this.getInterface().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return { difficulty: 'Beginner', summary: response.text || "" };
  }

  async generateWeeklySchedule(user: User, subjects: Subject[]): Promise<ScheduleSlot[]> {
    return [];
  }

  async generateCodeHint(instructions: string, userCode: string, failedTest: string): Promise<string> {
    const prompt = `Dê uma dica curta em Português para corrigir este código JS. Falha: ${failedTest}`;
    const response = await this.getInterface().models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Revise sua lógica.";
  }
}

export const geminiService = new GeminiService();
