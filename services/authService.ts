
import { User } from '../types';
import { databaseService } from './databaseService';

const LOGGED_IN_USER_KEY = 'eduquest_user_email';

class AuthService {
    async getCurrentUser(): Promise<User | null> {
        const email = sessionStorage.getItem(LOGGED_IN_USER_KEY);
        if (!email) return null;
        
        const dbUsers = await databaseService.getUsers();
        const foundUser = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        return foundUser ? { ...foundUser } : null;
    }

    async login(email: string, password_input: string): Promise<User | null> {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password_input.trim();
        
        const dbUsers = await databaseService.getUsers();
        
        const user = dbUsers.find(u => 
            u.email.toLowerCase() === trimmedEmail && 
            u.password === trimmedPassword
        );
        
        if (user) {
            sessionStorage.setItem(LOGGED_IN_USER_KEY, user.email);
            return { ...user };
        }
        return null;
    }

    async register(name: string, email: string, password_input: string): Promise<User | null> {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password_input.trim();
        const dbUsers = await databaseService.getUsers();
        
        if (dbUsers.some(u => u.email.toLowerCase() === trimmedEmail)) {
            return null;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: name.trim(),
            email: trimmedEmail,
            password: trimmedPassword,
            avatarUrl: `https://i.pravatar.cc/150?u=${trimmedEmail}`,
            level: 1,
            xp: 0,
            streak: 0,
            lastStudiedDate: null,
            enrolledCourseIds: [],
            studyCycleIds: [],
            progress: {},
            completedModuleIds: [],
            learningState: {},
            achievements: [],
            certifications: [],
            roles: ['student'],
            followers: [],
            following: [],
            subscription: 'free',
            wallet: {
              globalCredits: 0,
              individualCredits: 0,
            },
            sleepSchedule: { minBedtime: '23:00', maxWakeup: '07:00' },
            unavailableSlots: [],
            weeklySchedule: [],
            mockTestResults: [],
        };

        try {
            await databaseService.saveUsers([...dbUsers, newUser]);
            sessionStorage.setItem(LOGGED_IN_USER_KEY, newUser.email);
            return { ...newUser };
        } catch (e) {
            console.error("Erro ao registrar usuário no Supabase.");
            return null;
        }
    }

    logout(): void {
        sessionStorage.removeItem(LOGGED_IN_USER_KEY);
    }
}

export const authService = new AuthService();
