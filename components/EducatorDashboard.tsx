
import React, { useState } from 'react';
import { User } from '../types';
import MarketingKit from './MarketingKit';
import { hotmartService } from '../services/hotmartService';

interface EducatorDashboardProps {
  user: User;
  allUsers: User[];
  onApplyLogo: (logoUrl: string) => void;
}

const EducatorDashboard: React.FC<EducatorDashboardProps> = ({ user, allUsers, onApplyLogo }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'marketing' | 'setup' | 'hotmart'>('setup');
  const [copied, setCopied] = useState(false);
  const students = user.studentIds?.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];

  const webhookUrl = hotmartService.getWebhookUrl();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Painel Administrativo</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Gestão de Alunos e Automação de Vendas.</p>
            </div>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1.5 rounded-2xl shadow-inner overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'students' ? 'bg-white dark:bg-slate-600 shadow-md text-indigo-600' : 'text-slate-500'}`}
                >
                    👥 Alunos
                </button>
                <button 
                    onClick={() => setActiveTab('hotmart')}
                    className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'hotmart' ? 'bg-white dark:bg-slate-600 shadow-md text-orange-600' : 'text-slate-500'}`}
                >
                    🔥 Hotmart
                </button>
                <button 
                    onClick={() => setActiveTab('marketing')}
                    className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'marketing' ? 'bg-white dark:bg-slate-600 shadow-md text-blue-600' : 'text-slate-500'}`}
                >
                    🎨 Branding
                </button>
                <button 
                    onClick={() => setActiveTab('setup')}
                    className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'setup' ? 'bg-white dark:bg-slate-600 shadow-md text-emerald-600' : 'text-slate-500'}`}
                >
                    🚀 Setup
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

        {activeTab === 'hotmart' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-b-8 border-orange-500">
                    <div className="flex items-center space-x-3 mb-6">
                        <span className="text-4xl">🔥</span>
                        <h2 className="text-2xl font-black">Automação de Vendas</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Siga este passo a passo para configurar a Hotmart:</p>
                            <ol className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <span className="bg-orange-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                                    <span className="text-sm font-bold">Na Hotmart: Vá em Ferramentas &gt; Webhook (V2.0.0).</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-orange-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                                    <span className="text-sm font-bold">Na Hotmart: Selecione "Compra Aprovada" e "Completa".</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-orange-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                                    <span className="text-sm font-bold">Cole a URL ao lado no campo "URL de envio".</span>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border-2 border-orange-100 dark:border-orange-900/30 flex flex-col justify-center text-center">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em]">Sua URL de Webhook</h4>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 font-mono text-xs break-all text-orange-600 dark:text-orange-400 font-bold select-all">
                                {webhookUrl}
                            </div>
                            <button 
                                onClick={copyToClipboard}
                                className={`py-4 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center space-x-2 ${copied ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                            >
                                <span>{copied ? '✓ URL Copiada!' : '📋 Copiar URL'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">⚡</div>
                    <div className="max-w-3xl relative z-10">
                        <h2 className="text-2xl font-black mb-4">Onde encontrar no Supabase?</h2>
                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                            A URL do Webhook não fica nas configurações de API. Ela fica na aba de <strong>Edge Functions</strong>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400 mb-6">Localização no Painel</h4>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-slate-800 p-2 rounded-lg text-xl">⚡</div>
                                    <div>
                                        <p className="font-bold">Edge Functions</p>
                                        <p className="text-[10px] opacity-60">Ícone de raio no menu lateral esquerdo.</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl">
                                    <p className="text-xs">Após abrir, clique na função <strong>hotmart-webhook</strong>. A URL aparecerá no topo da tela.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400 mb-6">Como Ativar (Deploy)</h4>
                            <p className="text-xs mb-4 opacity-70">Para evitar erros de permissão de pasta no Linux/macOS, use o comando <strong>npx</strong>:</p>
                            <div className="bg-black p-4 rounded-xl font-mono text-[11px] text-emerald-400 border border-emerald-900/30 space-y-2">
                                <p className="opacity-50 text-[9px] text-white"># 1. Faça Login no navegador</p>
                                <p>$ npx supabase login</p>
                                <p className="opacity-50 text-[9px] text-white"># 2. Vincule seu projeto (ID: {hotmartService.getSupabaseProjectId()})</p>
                                <p>$ npx supabase link --project-ref {hotmartService.getSupabaseProjectId()}</p>
                                <p className="opacity-50 text-[9px] text-white"># 3. Envie a função sem precisar instalar a CLI globalmente</p>
                                <p>$ npx supabase functions deploy hotmart-webhook</p>
                                <p>$ npx supabase functions deploy sync-prices</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'marketing' && (
            <MarketingKit onApplyLogo={onApplyLogo} />
        )}

        {activeTab === 'setup' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-indigo-600 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">▲</div>
                    <div className="max-w-3xl relative z-10">
                        <h2 className="text-3xl font-black mb-4">Configurações do Projeto</h2>
                        <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
                            O app já está na Vercel! Agora, para que ele funcione com o seu banco de dados, você deve adicionar as chaves abaixo nas configurações da Vercel.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        <div className="bg-white/10 rounded-3xl p-8 border border-white/20 lg:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Onde achar no Supabase</h4>
                            <div className="space-y-6 text-sm">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white/20 p-2 rounded-lg">⚙️</div>
                                    <div>
                                        <p className="font-black">Settings</p>
                                        <p className="text-[10px] opacity-60">Ícone de engrenagem no menu lateral.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white/20 p-2 rounded-lg">🔌</div>
                                    <div>
                                        <p className="font-black">API</p>
                                        <p className="text-[10px] opacity-60">Aba onde ficam as chaves do projeto.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-3xl p-8 border border-white/20 lg:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Onde colar na Vercel</h4>
                            <ol className="space-y-4 font-bold text-sm">
                                <li className="flex items-start space-x-3">
                                    <span className="bg-white text-indigo-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0">1</span>
                                    <span>Vá na aba <strong>Settings</strong> do projeto.</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-white text-indigo-600 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0">2</span>
                                    <span>Clique em <strong>Environment Variables</strong>.</span>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 border border-indigo-400/30 lg:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Variáveis Necessárias</h4>
                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">API_KEY</code>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">SUPABASE_URL</code>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">SUPABASE_ANON_KEY</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default EducatorDashboard;
