
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
            console.log("Iniciando requisição para Edge Function...");
            
            const { data, error } = await this.supabase.functions.invoke('sync-prices', {
                method: 'POST'
            });

            if (error) {
                console.error("Erro retornado pelo Supabase invoke:", error);
                return { 
                    success: false, 
                    message: `Erro na Função: ${error.message || 'Falha na comunicação'}` 
                };
            }
            
            if (!data) {
                return { success: false, message: "A função não retornou nenhum dado (Corpo vazio)." };
            }

            return data;
        } catch (e: any) {
            console.error("Erro capturado no DatabaseService:", e);
            
            if (e.message && e.message.includes('Unexpected end of JSON input')) {
                return { 
                    success: false, 
                    message: "A sincronização falhou: O servidor retornou uma resposta vazia ou inválida. Verifique se você fez o deploy da função 'sync-prices' corretamente no terminal com 'supabase functions deploy sync-prices'." 
                };
            }

            return { 
                success: false, 
                message: `Falha técnica: ${e.message || 'Erro de rede'}` 
            };
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
            
            if (error) {
                await this.supabase.from('users').update({ roles: user.roles }).eq('id', user.id);
            }
        } catch (e: any) {
            console.error("Falha crítica ao atualizar usuário:", e.message);
            throw e;
        }
    }

    async getCourses(): Promise<Course[]> {
        try {
            const { data, error } = await this.supabase.from('courses').select('*');
            if (error) return [];
            return data || [];
        } catch(e) { return []; }
    }

    async saveCourse(course: Course): Promise<void> {
        try { await this.supabase.from('courses').insert(course); } catch(e) {}
    }

    async getPosts(): Promise<Post[]> {
        try {
            const { data, error } = await this.supabase.from('posts').select('*').order('timestamp', { ascending: false });
            if (error) return [];
            return data || [];
        } catch(e) { return []; }
    }

    async savePosts(posts: Post[]): Promise<void> {
        try { await this.supabase.from('posts').upsert(posts, { onConflict: 'id' }); } catch(e) {}
    }

    async getCycles(): Promise<StudyCycle[]> {
        try {
            const { data, error } = await this.supabase.from('study_cycles').select('*');
            return data || [];
        } catch(e) { return []; }
    }

    async saveCycles(cycles: StudyCycle[]): Promise<void> {
        try { await this.supabase.from('study_cycles').upsert(cycles, { onConflict: 'id' }); } catch(e) {}
    }

    async getSubjects(): Promise<Subject[]> {
        try {
            const { data, error } = await this.supabase.from('subjects').select('*');
            return data || [];
        } catch(e) { return []; }
    }

    async saveSubjects(subjects: Subject[]): Promise<void> {
        try { await this.supabase.from('subjects').upsert(subjects, { onConflict: 'id' }); } catch(e) {}
    }
}

export const databaseService = new DatabaseService();
