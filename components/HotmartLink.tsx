
import React, { useState, useEffect } from 'react';
import { hotmartService } from '../services/hotmartService';
import { authService } from '../services/authService';

interface HotmartLinkProps {
    onSuccess: (user: any) => void;
    onCancel: () => void;
}

const HotmartLink: React.FC<HotmartLinkProps> = ({ onSuccess, onCancel }) => {
    const [email, setEmail] = useState('');
    const [transaction, setTransaction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const isFormatValid = await hotmartService.validateTransactionFormat(transaction);
        if (!isFormatValid) {
            setError("Código inválido. Use o código HP... enviado no seu e-mail de compra.");
            setIsLoading(false);
            return;
        }

        try {
            // Tenta logar/sincronizar
            const user = await authService.login(email, transaction.substring(0, 8)); // Tentativa com senha padrão
            
            if (user && user.subscription === 'premium') {
                setSuccessMsg("Assinatura Identificada! Liberando seu acesso...");
                setTimeout(() => onSuccess(user), 2000);
            } else {
                // Se o usuário existe mas não é premium, o Webhook ainda não processou
                setRetryCount(prev => prev + 1);
                if (retryCount > 0) {
                   setError("A Hotmart ainda não notificou nosso sistema. Isso pode levar até 5 minutos após a aprovação do pagamento.");
                } else {
                   setError("Pagamento em processamento. Aguarde 2 minutos e tente novamente.");
                }
            }
        } catch (err) {
            setError("Não encontramos sua conta. Você já se cadastrou no EduQuest com este mesmo e-mail?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md mx-auto border-2 border-orange-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-8xl">🔥</span>
            </div>

            <div className="text-center mb-8">
                <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
                    <span className="text-3xl text-white">✓</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Ativar Premium</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Use os dados da sua compra na Hotmart para liberar os recursos ilimitados.</p>
            </div>

            {successMsg ? (
                <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-2xl text-center animate-bounce">
                    <p className="text-green-600 dark:text-green-400 font-black">{successMsg}</p>
                </div>
            ) : (
                <form onSubmit={handleClaim} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-1 ml-1">E-mail da Compra</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-1 ml-1">Código da Transação</label>
                        <input 
                            type="text" 
                            required
                            value={transaction}
                            onChange={e => setTransaction(e.target.value)}
                            placeholder="Ex: HP1234567890"
                            className="w-full p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none transition-all font-bold"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl hover:-translate-y-1 disabled:opacity-50"
                    >
                        {isLoading ? "Verificando na Hotmart..." : "Vincular Assinatura 🔥"}
                    </button>

                    <button 
                        type="button"
                        onClick={onCancel}
                        className="w-full text-slate-400 text-sm font-black hover:text-slate-600"
                    >
                        Voltar
                    </button>
                </form>
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                    Integração Oficial Hotmart API
                </p>
            </div>
        </div>
    );
};

export default HotmartLink;
