
import { databaseService } from './databaseService';
import { User } from '../types';

class HotmartService {
    /**
     * Extrai o ID do projeto da URL do Supabase para montar a URL do Webhook
     */
    getSupabaseProjectId(): string {
        try {
            // @ts-ignore
            const url = (import.meta.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL || "");
            if (url) {
                const match = url.match(/https:\/\/(.*?)\.supabase\.co/);
                if (match && match[1]) return match[1];
            }
            // ID Padrão fallback baseado no seu screenshot
            return "khljmmwguczsiwgqxskh";
        } catch (e) {
            return "khljmmwguczsiwgqxskh";
        }
    }

    /**
     * Retorna a URL correta no formato oficial: https://[ref].supabase.co/functions/v1/[name]
     */
    getWebhookUrl(): string {
        const projectId = this.getSupabaseProjectId();
        // A URL final deve ser exatamente como esta para evitar o 404
        return `https://${projectId}.supabase.co/functions/v1/hotmart-webhook`;
    }

    async syncUserWithHotmart(user: User): Promise<User | null> {
        try {
            const dbUsers = await databaseService.getUsers();
            if (!dbUsers || dbUsers.length === 0) return null;
            
            const freshUser = dbUsers.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
            
            if (freshUser && freshUser.subscription === 'premium' && user.subscription !== 'premium') {
                return freshUser;
            }
        } catch (e) {
            console.error("Erro ao sincronizar com banco de dados:", e);
        }
        return null;
    }

    async validateTransactionFormat(transaction: string): Promise<boolean> {
        if (!transaction) return false;
        const cleanTransaction = transaction.trim().toUpperCase();
        return /^HP[A-Z0-9]+$/.test(cleanTransaction) || cleanTransaction.startsWith("TEST");
    }
}

export const hotmartService = new HotmartService();
