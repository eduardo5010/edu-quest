
// EducatorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { User, AffiliateLink } from '../types';
import MarketingKit from './MarketingKit';
import { hotmartService } from '../services/hotmartService';
import { databaseService } from '../services/databaseService';

interface EducatorDashboardProps {
  user: User;
  allUsers: User[];
  onApplyLogo: (logoUrl: string) => void;
}

const EducatorDashboard: React.FC<EducatorDashboardProps> = ({ user, allUsers, onApplyLogo }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'marketing' | 'setup' | 'hotmart' | 'affiliate'>('setup');
  const [copied, setCopied] = useState(false);
  const [proLink, setProLink] = useState('');
  const [premiumLink, setPremiumLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const students = user.studentIds?.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
  const webhookUrl = hotmartService.getWebhookUrl();

  useEffect(() => {
    async function loadAffLinks() {
      const links = await databaseService.getAffiliateLinks(user.id);
      const pro = links.find(l => l.plan_tier === 'pro');
      const premium = links.find(l => l.plan_tier === 'premium');
      if (pro) setProLink(pro.affiliate_url);
      if (premium) setPremiumLink(premium.affiliate_url);
    }
    loadAffLinks();
  }, [user.id]);

  const handleSyncHotmartPlans = async () => {
      setIsSyncing(true);
      setSyncStatus("⏳ Conectando com Hotmart API...");
      try {
          const result = await databaseService.syncPlansWithHotmart();
          if (result.success) {
              setSyncStatus("✅ " + result.message);
              // Feedback sonoro opcional ou visual forte
              setTimeout(() => {
                  setSyncStatus("🚀 Recarregando aplicação para aplicar novos preços...");
                  setTimeout(() => window.location.reload(), 1500);
              }, 1000);
          } else {
              setSyncStatus("❌ " + result.message);
          }
      } catch (e: any) {
          setSyncStatus("❌ Erro fatal: " + (e.message || "Falha na rede"));
      } finally {
          setIsSyncing(false);
      }
  };

  const handleSaveAffLinks = async () => {
    setIsSaving(true);
    try {
      const links: AffiliateLink[] = ([
        { user_id: user.id, plan_tier: 'pro' as const, affiliate_url: proLink },
        { user_id: user.id, plan_tier: 'premium' as const, affiliate_url: premiumLink }
      ] as AffiliateLink[]).filter(l => l.affiliate_url.trim() !== '');
      
      await databaseService.saveAffiliateLinks(links);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralUrl = `${window.location.origin}/?ref=${user.id}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Painel Administrativo</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Gestão de Alunos e Automação de Vendas.</p>
            </div>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1.5 rounded-2xl shadow-inner overflow-x-auto">
                <button onClick={() => setActiveTab('students')} className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'students' ? 'bg-white dark:bg-slate-600 shadow-md text-indigo-600' : 'text-slate-500'}`}>👥 Alunos</button>
                <button onClick={() => setActiveTab('affiliate')} className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'affiliate' ? 'bg-white dark:bg-slate-600 shadow-md text-purple-600' : 'text-slate-500'}`}>🔗 Links</button>
                <button onClick={() => setActiveTab('hotmart')} className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'hotmart' ? 'bg-white dark:bg-slate-600 shadow-md text-orange-600' : 'text-slate-500'}`}>🔥 Hotmart</button>
                <button onClick={() => setActiveTab('marketing')} className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'marketing' ? 'bg-white dark:bg-slate-600 shadow-md text-blue-600' : 'text-slate-500'}`}>🎨 Branding</button>
                <button onClick={() => setActiveTab('setup')} className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${activeTab === 'setup' ? 'bg-white dark:bg-slate-600 shadow-md text-emerald-600' : 'text-slate-500'}`}>🚀 Setup</button>
            </div>
        </div>

        {activeTab === 'affiliate' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-b-8 border-purple-500">
                    <h2 className="text-2xl font-black mb-6">Seus Links de Afiliado</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Configure aqui seus Hotlinks para que as vendas sejam atribuídas a você.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Link Plano PRO (Hotmart)</label>
                            <input 
                                type="text"
                                value={proLink}
                                onChange={e => setProLink(e.target.value)}
                                placeholder="https://go.hotmart.com/..."
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Link Plano PREMIUM (Hotmart)</label>
                            <input 
                                type="text"
                                value={premiumLink}
                                onChange={e => setPremiumLink(e.target.value)}
                                placeholder="https://go.hotmart.com/..."
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none font-bold"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveAffLinks}
                        disabled={isSaving}
                        className={`w-full py-4 rounded-xl font-black text-sm shadow-lg transition-all ${saveSuccess ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    >
                        {isSaving ? 'Salvando...' : saveSuccess ? '✓ Links Salvos!' : '💾 Salvar Meus Links'}
                    </button>
                </div>

                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl">
                    <h2 className="text-2xl font-black mb-4">Seu Link de Divulgação</h2>
                    <p className="text-slate-400 font-medium mb-6">Divulgue este link para seus alunos. Ele ativará seus links de afiliado automaticamente.</p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <code className="text-purple-400 font-bold break-all">{referralUrl}</code>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(referralUrl);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            {copied ? '✓ Copiado' : '📋 Copiar Link'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'hotmart' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-orange-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-black">SYNC</div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-black mb-4">Sincronizar Ofertas Hotmart</h2>
                            <p className="text-indigo-200 font-medium mb-6 leading-relaxed">
                                Esta ação busca os preços (BRL/USD) e checkouts diretamente da sua conta Hotmart e atualiza a landing page automaticamente.
                            </p>
                            {syncStatus && (
                                <div className={`p-5 rounded-2xl font-bold text-sm mb-6 flex items-center gap-3 transition-all ${syncStatus.includes('❌') ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
                                    <span className="text-xl shrink-0">{syncStatus.includes('✅') ? '✨' : syncStatus.includes('⏳') ? '⚙️' : '⚠️'}</span>
                                    {syncStatus}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleSyncHotmartPlans}
                            disabled={isSyncing}
                            className="bg-orange-500 hover:bg-orange-600 px-12 py-6 rounded-[2rem] font-black shadow-[0_15px_40px_rgba(249,115,22,0.4)] transform hover:-translate-y-1 transition-all disabled:opacity-50 shrink-0 text-white uppercase tracking-widest text-xs"
                        >
                            {isSyncing ? "Sincronizando..." : "🚀 Puxar Planos Agora"}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-b-8 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3 mb-6">
                        <span className="text-4xl">🔥</span>
                        <h2 className="text-2xl font-black">Automação de Vendas (Webhook)</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Configure o Webhook para liberar acesso instantâneo:</p>
                            <ol className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <span className="bg-orange-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                                    <span className="text-sm font-bold">Na Hotmart: Vá em Ferramentas &gt; Webhook (V2.0.0).</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-orange-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">2</span>
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
                            O app já está na Vercel! Adicione as chaves abaixo nas variáveis de ambiente do seu projeto.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                        <div className="bg-white/10 rounded-3xl p-8 border border-white/20 lg:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Onde achar no Supabase</h4>
                            <div className="space-y-6 text-sm">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white/20 p-2 rounded-lg">⚙️</div>
                                    <div>
                                        <p className="font-black">Settings &gt; API</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 border border-indigo-400/30 lg:col-span-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Variáveis Necessárias</h4>
                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">HOTMART_CLIENT_ID</code>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">HOTMART_CLIENT_SECRET</code>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/10">
                                    <code className="text-indigo-400 font-mono text-xs">SUPABASE_URL</code>
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
