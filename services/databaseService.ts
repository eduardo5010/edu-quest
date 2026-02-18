
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Course, Post, StudyCycle, Subject, SubscriptionPlan } from '../types';

// Utilitário para ler variáveis de ambiente com fallback para nomes com e sem prefixo VITE_
const getEnv = (name: string): string | undefined => {
    const prefixedName = `VITE_${name}`;
    
    // Tenta import.meta.env (Vite standard)
    // @ts-ignore
    const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env[prefixedName] || import.meta.env[name]) : undefined;
    
    // Tenta process.env (Node standard / Vercel default)
    const procEnv = typeof process !== 'undefined' && process.env ? (process.env[prefixedName] || process.env[name]) : undefined;
    
    return viteEnv || procEnv;
};

// Se não houver variável definida, usamos os fallbacks para garantir que o app abra
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://khljmmwguczsiwgqxskh.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGptbXdndWN6c2l3Z3F4c2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQ1MTgsImV4cCI6MjA4Njk1MDUxOH0.COlSn4nKhdum_OQz1C6TZNLqkQYsD7uOLnjlwVA7XPI';

class DatabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    async getPlans(): Promise<SubscriptionPlan[]> {
        try {
            const { data, error } = await this.supabase
                .from('plans')
                .select('*')
                .order('price', { ascending: true });
            
            if (error) return [];
            return data || [];
        } catch (e) {
            return [];
        }
    }

    async getUsers(): Promise<User[]> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*');
            
            if (error) {
                console.warn("Database Connection Error. Mocking data.");
                return [];
            }
            return data || [];
        } catch (e) {
            return [];
        }
    }

    async saveUsers(users: User[]): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('users')
                .upsert(users, { onConflict: 'id' });
            if (error) throw error;
        } catch (e: any) {
            console.error("Erro ao salvar usuários:", e.message);
        }
    }

    async updateUser(user: User): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('users')
                .update(user)
                .eq('id', user.id);
            if (error) throw error;
        } catch (e) {
            console.error("Erro ao atualizar usuário no banco.");
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
