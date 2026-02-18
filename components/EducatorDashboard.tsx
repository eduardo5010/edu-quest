
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
  const [activeTab, setActiveTab] = useState<'students' | 'marketing' | 'setup'>('students');
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
            <div className="space-y-12">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-black mb-4">Como colocar seu App no ar hoje</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Siga estes passos para que o deploy na Vercel funcione de primeira.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <LaunchStep 
                        number="01" 
                        title="Pegar apenas a Chave (API_KEY)" 
                        platform="Google AI Studio" 
                        icon="🤖" 
                        color="border-blue-500"
                        warning="NÃO use a opção de 'Create Repo' aqui. Pegue apenas a Key."
                    >
                        <p>Acesse <a href="https://aistudio.google.com" target="_blank" className="text-blue-500 underline">AI Studio</a>.</p>
                        <p>Clique em <strong>"Get API Key"</strong>.</p>
                        <p>Crie uma chave e copie o código que começa com <code>AIza...</code></p>
                    </LaunchStep>

                    <LaunchStep 
                        number="02" 
                        title="Hospedar o Código Fonte" 
                        platform="GitHub" 
                        icon="🐙" 
                        color="border-slate-900"
                    >
                        <p>Crie um repositório no GitHub.</p>
                        <p>Certifique-se que o arquivo <code>.npmrc</code> está na pasta raiz do seu projeto antes de subir.</p>
                    </LaunchStep>

                    <LaunchStep 
                        number="03" 
                        title="Colocar o Site Online" 
                        platform="Vercel" 
                        icon="▲" 
                        color="border-indigo-500"
                        tip="Mantenha o banco no seu perfil PESSOAL do Supabase. Copie as chaves para cá."
                    >
                        <p>No Vercel, importe seu projeto do GitHub.</p>
                        <p>Em <strong>Environment Variables</strong>, adicione:</p>
                        <div className="space-y-1 mt-2">
                            <p className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-[9px] font-mono break-all">API_KEY = [Key do Google]</p>
                            <p className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-[9px] font-mono break-all">SUPABASE_URL = [URL do seu projeto]</p>
                            <p className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-[9px] font-mono break-all">SUPABASE_ANON_KEY = [Sua Anon Key]</p>
                        </div>
                    </LaunchStep>

                    <LaunchStep 
                        number="04" 
                        title="Vincular Pagamentos" 
                        platform="Supabase + Hotmart" 
                        icon="🔥" 
                        color="border-orange-500"
                    >
                        <p>No Supabase, dê deploy no <code>hotmart-webhook</code>.</p>
                        <p>Cole a URL resultante na Hotmart (Versão 2.0.0).</p>
                    </LaunchStep>

                </div>

                {/* SEÇÃO DE AJUDA PARA ERRO DE BUILD */}
                <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2rem] border-2 border-red-100 dark:border-red-900/30">
                    <div className="flex items-center space-x-3 mb-6">
                        <span className="text-3xl">🆘</span>
                        <h3 className="text-xl font-black text-red-700 dark:text-red-400">Socorro! Deu erro "ERESOLVE" na Vercel?</h3>
                    </div>
                    <p className="text-red-600/80 dark:text-red-400/80 font-medium leading-relaxed mb-6">
                        Esse erro acontece porque alguns pacotes (como o de fórmulas matemáticas) ainda não "conhecem" o React 19. 
                        Para resolver, você deve garantir que o arquivo <strong>.npmrc</strong> foi criado na raiz do projeto com o conteúdo:
                        <br/>
                        <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded font-bold text-red-800 dark:text-red-200">legacy-peer-deps=true</code>
                    </p>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-inner border border-red-100 dark:border-red-900/20">
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Outra solução: Configuração na Vercel</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Se não quiser criar o arquivo, você pode mudar o comando de instalação na Vercel:</p>
                        <ol className="text-sm space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-400">
                            <li>Vá em <strong>Settings</strong> > <strong>General</strong> na Vercel.</li>
                            <li>Procure por <strong>"Install Command"</strong>.</li>
                            <li>Ative o botão "Override" e cole: <code className="bg-slate-100 dark:bg-slate-700 p-1 rounded font-mono">npm install --legacy-peer-deps</code></li>
                            <li>Salve e clique em <strong>Redeploy</strong> na aba Deployments.</li>
                        </ol>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default EducatorDashboard;
