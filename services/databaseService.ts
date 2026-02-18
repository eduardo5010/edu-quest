
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Course, Post, StudyCycle, Subject } from '../types';

// As chaves agora são lidas das variáveis de ambiente do sistema (Vercel/Local)
// Se não existirem, usamos valores de fallback apenas para desenvolvimento local inicial
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://khljmmwguczsiwgqxskh.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGptbXdndWN6c2l3Z3F4c2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQ1MTgsImV4cCI6MjA4Njk1MDUxOH0.COlSn4nKhdum_OQz1C6TZNLqkQYsD7uOLnjlwVA7XPI';

class DatabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // --- Gerenciamento de Usuários ---
    async getUsers(): Promise<User[]> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*');
            
            if (error) {
                console.warn("Aviso: Tabela 'users' inacessível. Verifique as credenciais no Vercel.", error.message);
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
            localStorage.setItem('eduquest_fallback_users', JSON.stringify(users));
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

    // --- Gerenciamento de Cursos ---
    async getCourses(): Promise<Course[]> {
        const { data, error } = await this.supabase.from('courses').select('*');
        if (error) return [];
        return data || [];
    }

    async saveCourse(course: Course): Promise<void> {
        await this.supabase.from('courses').insert(course);
    }

    // --- Social ---
    async getPosts(): Promise<Post[]> {
        const { data, error } = await this.supabase.from('posts').select('*').order('timestamp', { ascending: false });
        if (error) return [];
        return data || [];
    }

    async savePosts(posts: Post[]): Promise<void> {
        await this.supabase.from('posts').upsert(posts, { onConflict: 'id' });
    }

    // --- Ciclos e Assuntos ---
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
