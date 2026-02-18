
import { databaseService } from './databaseService';
import { User } from '../types';

class HotmartService {
    /**
     * Sincroniza o status do usuário consultando o banco de dados.
     * Se o Webhook da Hotmart já tiver rodado, o status no DB estará como 'premium'.
     */
    async syncUserWithHotmart(user: User): Promise<User | null> {
        try {
            const dbUsers = await databaseService.getUsers();
            const freshUser = dbUsers.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
            
            // Se no banco ele já for premium e no app local não for, retorna o usuário atualizado
            if (freshUser && freshUser.subscription === 'premium' && user.subscription !== 'premium') {
                return freshUser;
            }
        } catch (e) {
            console.error("Erro ao sincronizar com banco de dados:", e);
        }
        return null;
    }

    /**
     * Validação visual do formato da transação da Hotmart (HP...)
     */
    async validateTransactionFormat(transaction: string): Promise<boolean> {
        if (!transaction) return false;
        const cleanTransaction = transaction.trim().toUpperCase();
        // Formato padrão Hotmart: HP + números/letras
        return /^HP[A-Z0-9]+$/.test(cleanTransaction) || cleanTransaction.startsWith("TEST");
    }

    /**
     * Retorna a URL que o usuário deve colar na Hotmart (Exemplo para documentação)
     */
    getWebhookHelpUrl(supabaseProjectId: string): string {
        return `https://${supabaseProjectId}.functions.supabase.co/hotmart-webhook`;
    }
}

export const hotmartService = new HotmartService();
