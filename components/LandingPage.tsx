
import React, { useState, useMemo } from 'react';
import Logo from './Logo';
import { SubscriptionPlan, AffiliateLink } from '../types';

interface LandingPageProps {
  plans: SubscriptionPlan[];
  affiliateLinks?: AffiliateLink[];
  onNavigateToLogin: () => void;
  onNavigateToRegister: (tier?: 'pro' | 'premium' | 'free') => void;
}

type Currency = 'BRL' | 'USD';
type BillingCycle = 'monthly' | 'annual';

const PricingCard: React.FC<{ 
    plan: SubscriptionPlan;
    activeCurrency: Currency;
    affiliateLink?: string;
    onSelect: (method: 'hotmart' | 'free') => void;
}> = ({ plan, activeCurrency, affiliateLink, onSelect }) => {
    if (plan.currency !== activeCurrency) return null;

    const finalLink = affiliateLink || plan.hotmart_link;

    return (
        <div className={`relative p-8 rounded-[3rem] transition-all duration-700 flex flex-col h-full group ${
            plan.is_premium 
            ? 'bg-slate-900 text-white border-4 border-indigo-500 shadow-[0_20px_60px_rgba(79,70,229,0.4)] scale-105 z-20' 
            : plan.is_featured
            ? 'bg-white dark:bg-slate-800 border-4 border-orange-500 shadow-2xl z-10'
            : 'bg-white/90 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 opacity-95'
        }`}>
            {plan.is_premium && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse whitespace-nowrap">
                    RECOMENDADO PARA EXPERTS
                </div>
            )}
            {plan.is_featured && !plan.is_premium && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    MELHOR CUSTO-BENEFÍCIO
                </div>
            )}

            <div className="mb-6">
                <h3 className={`text-3xl font-black mb-1 tracking-tighter ${plan.is_premium ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${plan.is_premium ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {plan.billing_cycle === 'annual' ? 'Pagamento Anual (Mais Barato)' : 'Pagamento Mensal'}
                </p>
            </div>

            <div className="flex items-baseline space-x-2 mb-2">
                <span className={`text-6xl font-black tracking-tighter ${plan.is_premium ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.currency === 'BRL' ? 'R$' : '$'}{plan.price}
                </span>
            </div>
            
            <div className="mb-10">
                {plan.billing_cycle === 'annual' && plan.price > 0 && (
                    <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                        <span className="text-xs font-black uppercase tracking-widest">
                            {plan.currency === 'BRL' ? 'R$' : '$'}{(plan.price / 12).toFixed(2)} / mês
                        </span>
                    </div>
                )}
                {plan.billing_cycle === 'monthly' && plan.price > 0 && (
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        cobre conforme o uso
                     </span>
                )}
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
                {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-start space-x-3 text-sm font-bold ${plan.is_premium ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        <div className={`mt-0.5 p-1 rounded-lg ${plan.is_premium ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className="leading-tight">{f}</span>
                    </li>
                ))}
            </ul>
            
            <div className="mt-auto">
                <button 
                    onClick={() => {
                        if (plan.price === 0) {
                            onSelect('free');
                        } else {
                            if (finalLink) window.open(finalLink, '_blank');
                            onSelect('hotmart');
                        }
                    }}
                    className={`w-full py-6 rounded-[2rem] font-black shadow-2xl transform group-hover:-translate-y-1 transition-all flex flex-col items-center justify-center leading-tight ring-offset-4 ${
                        plan.price === 0
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
                        : plan.is_premium 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:ring-4 ring-indigo-500/30' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:ring-4 ring-orange-500/30'
                    }`}
                >
                    <span className="text-[10px] uppercase opacity-70 mb-1 font-black tracking-widest">
                        {plan.price === 0 ? 'Começar Jornada' : 'Garantir Acesso via'}
                    </span>
                    <span className="text-xl flex items-center gap-2">
                        {plan.price === 0 ? '✨ Grátis' : <><span className="text-2xl">🔥</span> Hotmart</>}
                    </span>
                </button>
            </div>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ plans, affiliateLinks = [], onNavigateToLogin, onNavigateToRegister }) => {
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [cycle, setCycle] = useState<BillingCycle>('annual');

  const handleSelectPlan = (plan: SubscriptionPlan, method: 'hotmart' | 'free') => {
      onNavigateToRegister(method === 'free' ? 'free' : plan.tier);
  };

  const displayPlans = useMemo(() => {
    return plans.filter(p => p.currency === currency && p.billing_cycle === cycle);
  }, [plans, currency, cycle]);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen selection:bg-indigo-500 selection:text-white overflow-x-hidden">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-6 py-10 flex justify-between items-center relative z-20">
            <div className="flex items-center space-x-3">
                <Logo className="h-12 w-12 text-indigo-500" />
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">EduQuest</h1>
            </div>
            <div className="flex items-center space-x-8">
                <div className="hidden sm:flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button onClick={() => setCurrency('BRL')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${currency === 'BRL' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-md' : 'text-slate-400'}`}>BRL</button>
                    <button onClick={() => setCurrency('USD')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${currency === 'USD' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-md' : 'text-slate-400'}`}>USD</button>
                </div>
                <button onClick={onNavigateToLogin} className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors">Entrar</button>
                <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:block px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Começar Agora</button>
            </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-40 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="text-center lg:text-left">
                <div className="inline-flex items-center space-x-3 bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-full mb-10 border border-indigo-100 dark:border-indigo-800">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em]">Inteligência Artificial Nativa</span>
                </div>
                <h1 className="text-7xl sm:text-9xl font-black text-slate-900 dark:text-white leading-[0.82] tracking-tighter mb-10">
                    Aprenda <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500">qualquer coisa</span> <br/> hoje mesmo.
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-14 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    A primeira plataforma gamificada que utiliza o modelo Gemini Pro 2.5 para criar cursos, simulados e trilhas de estudo personalizadas para o seu objetivo.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                    <button 
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} 
                        className="px-16 py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(79,70,229,0.4)] hover:scale-105 transition-all"
                    >
                        Ver Planos e Preços ✨
                    </button>
                </div>
            </div>
            
            <div className="relative group perspective-1000">
                <div className="absolute -inset-10 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[5rem] blur-3xl opacity-50 group-hover:opacity-100 transition-all duration-1000"></div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[4.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] dark:shadow-none border-8 border-slate-50 dark:border-slate-900 relative overflow-hidden transition-transform duration-700 group-hover:rotate-y-6">
                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000" alt="Plataforma EduQuest" className="rounded-[3.5rem] w-full aspect-square object-cover shadow-inner grayscale group-hover:grayscale-0 transition-all duration-1000" />
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-slate-50 dark:bg-slate-900 py-40 px-6 relative">
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white dark:from-slate-950 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
                <h2 className="text-6xl sm:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">Escolha o seu nível.</h2>
                
                {/* Billing Cycle Switcher */}
                <div className="flex items-center justify-center">
                    <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-[2rem] flex items-center relative shadow-inner">
                        <button 
                            onClick={() => setCycle('monthly')}
                            className={`px-10 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${cycle === 'monthly' ? 'text-indigo-600' : 'text-slate-500'}`}
                        >
                            Mensal
                        </button>
                        <button 
                            onClick={() => setCycle('annual')}
                            className={`px-10 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${cycle === 'annual' ? 'text-indigo-600' : 'text-slate-500'}`}
                        >
                            Anual 
                            <span className="ml-2 bg-green-500 text-white text-[8px] px-2.5 py-1 rounded-full animate-bounce">2 MESES OFF</span>
                        </button>
                        <div 
                            className={`absolute top-2 bottom-2 bg-white dark:bg-slate-700 rounded-[1.6rem] shadow-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${cycle === 'monthly' ? 'left-2 w-[calc(50%-8px)]' : 'left-[calc(50%)] w-[calc(50%-8px)]'}`}
                        ></div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch relative z-10">
                {displayPlans.length > 0 ? (
                    displayPlans.map(plan => {
                        const affLink = affiliateLinks.find(l => l.plan_tier === plan.tier)?.affiliate_url;
                        return (
                          <PricingCard 
                              key={plan.id}
                              plan={plan}
                              activeCurrency={currency}
                              affiliateLink={affLink}
                              onSelect={(method) => handleSelectPlan(plan, method)}
                          />
                        );
                    })
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-40 bg-white dark:bg-slate-800 rounded-[4rem] shadow-2xl border-4 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="relative w-20 h-20 mx-auto mb-10">
                            <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-4 border-t-4 border-orange-500 rounded-full animate-spin-reverse"></div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Sincronizando com Hotmart...</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Preparando as melhores condições mensais e anuais para você.</p>
                    </div>
                )}
            </div>

            {/* Security Notice */}
            <div className="mt-32 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 p-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[3rem] border border-white dark:border-slate-700 shadow-xl relative z-10">
                <div className="flex items-center space-x-6">
                    <span className="text-5xl">🔒</span>
                    <div>
                        <h4 className="text-xl font-black tracking-tight">Pagamento Protegido</h4>
                        <p className="text-sm text-slate-500 font-medium">Sua transação é processada em ambiente criptografado pela Hotmart.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center font-black italic text-[10px] opacity-50">VISA</div>
                    <div className="h-10 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center font-black italic text-[10px] opacity-50">PIX</div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 py-24 px-6 border-t border-slate-900">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex items-center space-x-3">
                    <Logo className="h-10 w-10 text-indigo-500" />
                    <span className="text-2xl font-black text-white tracking-tighter">EduQuest</span>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                        EduQuest Cloud Learning Saga &copy; 2024. <br/>
                        Todos os preços estão sujeitos a alterações sem aviso prévio. <br/>
                        Hotmart é uma marca registrada de seus respectivos proprietários.
                    </p>
                </div>
            </div>
        </footer>
    </div>
  );
};

export default LandingPage;
