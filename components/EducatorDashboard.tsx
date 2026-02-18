
import React, { useState } from 'react';
import { User } from '../types';
import MarketingKit from './MarketingKit';

interface EducatorDashboardProps {
  user: User;
  allUsers: User[];
  onApplyLogo: (logoUrl: string) => void;
}

const LaunchStep: React.FC<{ 
    number: string; 
    title: string; 
    platform: string;
    icon: string;
    color: string;
    children: React.ReactNode;
    warning?: string;
    tip?: string;
}> = ({ number, title, platform, icon, color, children, warning, tip }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border-t-8 ${color} flex flex-col h-full`}>
        <div className="flex justify-between items-start mb-4">
            <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">{number}</span>
            <span className="text-3xl">{icon}</span>
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{platform}</h4>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 leading-tight">{title}</h3>
        <div className="text-sm text-slate-500 dark:text-slate-400 flex-grow space-y-3">
            {children}
        </div>
        {tip && (
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <p className="text-[10px] text-indigo-600 font-bold italic">💡 Dica: {tip}</p>
            </div>
        )}
        {warning && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                <p className="text-[10px] text-red-500 font-bold uppercase italic">⚠️ Atenção: {warning}</p>
            </div>
        )}
    </div>
);

const EducatorDashboard: React.FC<EducatorDashboardProps> = ({ user, allUsers, onApplyLogo }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'marketing' | 'setup'>('setup');
  const students = user.studentIds?.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Painel Administrativo</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Sua central de comando para o SaaS EduQuest.</p>
            </div>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1.5 rounded-2xl shadow-inner">
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'students' ? 'bg-white dark:bg-slate-600 shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    👥 Alunos
                </button>
                <button 
                    onClick={() => setActiveTab('marketing')}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'marketing' ? 'bg-white dark:bg-slate-600 shadow-md text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    🎨 Branding
                </button>
                <button 
                    onClick={() => setActiveTab('setup')}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'setup' ? 'bg-white dark:bg-slate-600 shadow-md text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    🚀 Mapa de Lançamento
                </button>
            </div>
        </div>

        {activeTab === 'students' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border-t-8 border-indigo-500">
                <h2 className="text-2xl font-black mb-6">Alunos Matriculados</h2>
                {students && students.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {students.map(student => (
                            <div key={student.id} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl flex items-center justify-between border-2 border-transparent hover:border-indigo-100 transition-all">
                                <div className="flex items-center space-x-4">
                                    <img src={student.avatarUrl} alt={student.name} className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
                                    <div>
                                        <p className="font-black text-lg text-slate-900 dark:text-white">{student.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.email}</p>
                                    </div>
                                </div>
                                <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-xs font-black uppercase">Ativo</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold">Nenhum aluno ainda. Divulgue seu link da Hotmart!</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'marketing' && (
            <MarketingKit onApplyLogo={onApplyLogo} />
        )}

        {activeTab === 'setup' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* GUIA DE LOCALIZAÇÃO VERCEL */}
                <div className="bg-indigo-600 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">▲</div>
                    <div className="max-w-3xl relative z-10">
                        <h2 className="text-3xl font-black mb-4">Ajuste Final na Vercel</h2>
                        <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
                            O erro de build aconteceu porque faltava o plugin do React para o Vite. Eu já adicionei nos arquivos agora. Para terminar, configure as chaves assim:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="bg-white/10 rounded-3xl p-8 border border-white/20">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Passo 1: Abrir Configurações</h4>
                            <ol className="space-y-4 font-bold text-sm">
                                <li className="flex items-start space-x-3">
                                    <span className="bg-white text-indigo-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0">1</span>
                                    <span>No painel da Vercel, clique no seu projeto (edu-quest).</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-white text-indigo-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0">2</span>
                                    <span>No menu superior (azul), clique na aba <strong>Settings</strong>.</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-white text-indigo-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0">3</span>
                                    <span>No menu à esquerda, procure por <strong>Environment Variables</strong>.</span>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 border border-indigo-400/30">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Passo 2: Adicionar Chaves</h4>
                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">API_KEY</code>
                                    <span className="text-[10px] opacity-40">Google AI Studio</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">SUPABASE_URL</code>
                                    <span className="text-[10px] opacity-40">Supabase API URL</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">SUPABASE_ANON_KEY</code>
                                    <span className="text-[10px] opacity-40">Supabase Anon Key</span>
                                </div>
                            </div>
                            <p className="mt-6 text-[10px] text-center text-indigo-300/60 font-medium">
                                Após salvar as 3, vá em <strong>Deployments</strong> e clique em <strong>Redeploy</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <LaunchStep 
                        number="01" 
                        title="Google API Key" 
                        platform="AI Studio" 
                        icon="🤖" 
                        color="border-blue-500"
                    >
                        <p>Pegue a chave que começa com <code>AIza...</code> no AI Studio.</p>
                    </LaunchStep>

                    <LaunchStep 
                        number="02" 
                        title="Vite Config" 
                        platform="GitHub" 
                        icon="📦" 
                        color="border-slate-900"
                    >
                        <p>O <code>vite.config.ts</code> agora está incluído para evitar erros de compilação.</p>
                    </LaunchStep>

                    <LaunchStep 
                        number="03" 
                        title="Variáveis" 
                        platform="Vercel" 
                        icon="🔑" 
                        color="border-indigo-500"
                    >
                        <p>Siga o guia acima para encontrar o menu oculto da Vercel.</p>
                    </LaunchStep>

                    <LaunchStep 
                        number="04" 
                        title="Redeploy" 
                        platform="Vercel" 
                        icon="🚀" 
                        color="border-emerald-500"
                    >
                        <p>Sempre dê Redeploy após mudar as variáveis de ambiente.</p>
                    </LaunchStep>
                </div>
            </div>
        )}
    </div>
  );
};

export default EducatorDashboard;
