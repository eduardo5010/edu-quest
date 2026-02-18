
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Course, Post, StudyCycle, Subject, SubscriptionPlan, AffiliateLink } from '../types';

const getEnv = (name: string): string | undefined => {
    const prefixedName = `VITE_${name}`;
    // @ts-ignore
    const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env[prefixedName] || import.meta.env[name]) : undefined;
    const procEnv = typeof process !== 'undefined' && process.env ? (process.env[prefixedName] || process.env[name]) : undefined;
    return viteEnv || procEnv;
};

const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://khljmmwguczsiwgqxskh.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGptbXdndWN6c2l3Z3F4c2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQ1MTgsImV4cCI6MjA4Njk1MDUxOH0.COlSn4nKhdum_OQz1C6TZNLqkQYsD7uOLnjlwVA7XPI';

class DatabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    async syncPlansWithHotmart(): Promise<{ success: boolean; message: string }> {
        try {
            console.log("DatabaseService: Solicitando sincronização à Edge Function...");
            
            const { data, error } = await this.supabase.functions.invoke('sync-prices', {
                method: 'POST'
            });

            if (error) {
                console.error("Erro no Invoke:", error);
                return { 
                    success: false, 
                    message: `Falha na função: ${error.message}` 
                };
            }
            
            return data || { success: false, message: "Resposta vazia do servidor." };
        } catch (e: any) {
            console.error("Erro na sincronização:", e);
            if (e.message?.includes('JSON')) {
                return { 
                    success: false, 
                    message: "Erro de Formato: A função retornou algo que não é JSON. Isso geralmente acontece se o HOTMART_PRODUCT_ID estiver errado (UUID em vez de Número)." 
                };
            }
            return { success: false, message: e.message || "Erro desconhecido na sincronização." };
        }
    }

    async getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
        const { data, error } = await this.supabase
            .from('affiliate_links')
            .select('*')
            .eq('user_id', affiliateId);
        if (error) return [];
        return data || [];
    }

    async saveAffiliateLinks(links: AffiliateLink[]): Promise<void> {
        const { error } = await this.supabase
            .from('affiliate_links')
            .upsert(links, { onConflict: 'user_id,plan_tier' });
        if (error) throw error;
    }

    async getPlans(): Promise<SubscriptionPlan[]> {
        try {
            const { data, error } = await this.supabase
                .from('plans')
                .select('*')
                .order('price', { ascending: true });
            if (error) return [];
            return data || [];
        } catch (e) { return []; }
    }

    async getUsers(): Promise<User[]> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*');
            if (error) return [];
            return data || [];
        } catch (e) { return []; }
    }

    async saveUsers(users: User[]): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('users')
                .upsert(users, { onConflict: 'id' });
            if (error) throw error;
        } catch (e: any) {
            console.error("Erro ao salvar lote de usuários:", e.message);
        }
    }

    async updateUser(user: User): Promise<void> {
        try {
            const allowedFields = [
                'name', 'email', 'password', 'avatarUrl', 'level', 'xp', 'streak', 
                'lastStudiedDate', 'enrolledCourseIds', 'studyCycleIds', 'progress', 
                'completedModuleIds', 'learningState', 'achievements', 'certifications', 
                'roles', 'bio', 'followers', 'following', 'subscription', 'wallet', 
                'weeklySchedule', 'mockTestResults', 'studentIds', 'teacherIds', 
                'weeklyXp', 'league'
            ];

            const updateData: any = {};
            allowedFields.forEach(field => {
                if ((user as any)[field] !== undefined) {
                    updateData[field] = (user as any)[field];
                }
            });

            const { error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('id', user.id);
            
            if (error) throw error;
        } catch (e: any) {
            console.error("Falha crítica ao atualizar usuário:", e.message);
            throw e;
        }
    }

    async getCourses(): Promise<Course[]> {
        const { data, error } = await this.supabase.from('courses').select('*');
        return data || [];
    }

    async saveCourse(course: Course): Promise<void> {
        await this.supabase.from('courses').insert(course);
    }

    async getPosts(): Promise<Post[]> {
        const { data, error } = await this.supabase.from('posts').select('*').order('timestamp', { ascending: false });
        return data || [];
    }

    async savePosts(posts: Post[]): Promise<void> {
        await this.supabase.from('posts').upsert(posts, { onConflict: 'id' });
    }

    async getCycles(): Promise<StudyCycle[]> {
        const { data, error } = await this.supabase.from('study_cycles').select('*');
        return data || [];
    }

    async saveCycles(cycles: StudyCycle[]): Promise<void> {
        await this.supabase.from('study_cycles').upsert(cycles, { onConflict: 'id' });
    }

    async getSubjects(): Promise<Subject[]> {
        const { data, error } = await this.supabase.from('subjects').select('*');
        return data || [];
    }

    async saveSubjects(subjects: Subject[]): Promise<void> {
        await this.supabase.from('subjects').upsert(subjects, { onConflict: 'id' });
    }
}

export const databaseService = new DatabaseService();
