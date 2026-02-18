
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: (planType?: 'pro' | 'premium' | 'free') => void;
}

type Currency = 'BRL' | 'USD';

const PricingCard: React.FC<{ 
    title: string; 
    price: string; 
    features: string[]; 
    isFeatured?: boolean; 
    isPremium?: boolean;
    currency: Currency;
    onSelect: (method: 'hotmart' | 'stripe' | 'pix' | 'free') => void;
}> = ({ title, price, features, isFeatured, isPremium, currency, onSelect }) => (
    <div className={`relative p-8 rounded-3xl transition-all duration-500 flex flex-col h-full ${
        isPremium 
        ? 'bg-slate-900 text-white border-4 border-indigo-500 shadow-2xl scale-105 z-20' 
        : isFeatured
        ? 'bg-white dark:bg-slate-800 border-4 border-orange-500 shadow-xl z-10'
        : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 opacity-90'
    }`}>
        {isPremium && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                Acesso Total & VIP
            </div>
        )}
        {isFeatured && !isPremium && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Mais Vendido
            </div>
        )}

        <h3 className={`text-xl font-black mb-2 ${isPremium ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h3>
        <div className="flex items-baseline space-x-1 mb-6">
            <span className={`text-4xl font-black ${isPremium ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {currency === 'BRL' ? 'R$' : '$'}{price}
            </span>
            {price !== '0' && <span className="text-slate-500 font-bold">/mês</span>}
        </div>

        <ul className="space-y-4 mb-8 flex-grow">
            {features.map((f, i) => (
                <li key={i} className={`flex items-start space-x-3 text-sm font-bold ${isPremium ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="leading-tight">{f}</span>
                </li>
            ))}
        </ul>
        
        {price === '0' ? (
            <button 
                onClick={() => onSelect('free')}
                className="w-full py-4 rounded-xl font-black text-slate-500 border-2 border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
                Começar Grátis
            </button>
        ) : (
            <div className="space-y-4">
                {/* HOTMART CTA - PRIMARY FOCUS */}
                <button 
                    onClick={() => onSelect('hotmart')}
                    className={`w-full py-5 rounded-2xl font-black shadow-xl transform hover:-translate-y-1 transition-all flex flex-col items-center justify-center leading-tight ring-4 ${
                        isPremium 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-indigo-500/20' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white ring-orange-500/20'
                    }`}
                >
                    <span className="text-xs uppercase opacity-80 mb-1">Pagamento Seguro via</span>
                    <span className="text-lg">🔥 Comprar na Hotmart</span>
                </button>
                
                {/* Secondary payment methods - Less visible, bottom focus */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Outras Formas</p>
                    <div className="flex space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <button onClick={() => onSelect('pix')} className="text-xs font-black hover:text-emerald-500 transition-colors uppercase">Pix</button>
                        <button onClick={() => onSelect('stripe')} className="text-xs font-black hover:text-indigo-500 transition-colors uppercase">Stripe</button>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const [currency, setCurrency] = useState<Currency>('BRL');

  const handleSelectPlan = (plan: 'pro' | 'premium' | 'free', method: 'hotmart' | 'stripe' | 'pix' | 'free') => {
      if (method === 'free') {
          onNavigateToRegister('free');
      } else if (method === 'hotmart') {
          // Utilizando o seu link real da Hotmart fornecido
          window.open('https://pay.hotmart.com/G104507186B?checkoutMode=2', '_blank'); 
          onNavigateToRegister(plan);
      } else {
          onNavigateToRegister(plan);
      }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
            <div className="flex items-center space-x-2">
                <Logo className="h-10 w-10 text-indigo-500" />
                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">EduQuest</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setCurrency('BRL')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currency === 'BRL' ? 'bg-white dark:bg-slate-600 text-indigo-500 shadow-sm' : 'text-slate-400'}`}>🇧🇷 BRL</button>
                    <button onClick={() => setCurrency('USD')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currency === 'USD' ? 'bg-white dark:bg-slate-600 text-indigo-500 shadow-sm' : 'text-slate-400'}`}>🌎 USD</button>
                </div>
                <button onClick={onNavigateToLogin} className="text-sm font-black text-indigo-500 uppercase tracking-widest hover:underline px-4">Entrar</button>
            </div>
        </nav>

        {/* Hero Section Otimizada para Vendas */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in slide-in-from-left duration-700 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full mb-6">
                    <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">🔥 Oferta de Lançamento Ativa</span>
                </div>
                <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-8">
                    Sua Jornada <span className="text-indigo-500">Inteligente</span> Começa Agora.
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    A plataforma que utiliza a IA do Google para criar cursos sob medida para você. Gamificação, comunidade e resultados reais.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-indigo-500 text-white rounded-3xl font-black text-lg shadow-2xl hover:bg-indigo-600 transform hover:-translate-y-1 transition-all">Ver Planos e Assinar ✨</button>
                    <div className="flex items-center justify-center space-x-2 px-4">
                        <span className="text-amber-500 text-lg">★★★★★</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">4.9/5 por 10k alunos</span>
                    </div>
                </div>
            </div>
            
            <div className="hidden lg:block relative animate-in zoom-in duration-1000">
                <div className="bg-gradient-to-tr from-indigo-500/10 to-orange-500/10 w-full aspect-video rounded-[3rem] absolute -z-10 blur-3xl"></div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-700">
                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" alt="Learning" className="rounded-2xl w-full h-64 object-cover mb-6 shadow-md" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-2xl font-black text-indigo-500">100%</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">Foco na IA</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-2xl font-black text-orange-500">Gamificado</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">Estilo Duolingo</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Pricing Section - 3 Planos Brasil / Internacionais */}
        <section id="pricing" className="bg-slate-50 dark:bg-slate-900/50 py-32 px-6">
            <div className="max-w-7xl mx-auto text-center mb-20">
                <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-6">Escolha Seu Caminho</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto uppercase text-sm tracking-widest">
                    Acesso imediato após a confirmação do pagamento.
                </p>
            </div>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {/* PLANO FREE */}
                <PricingCard 
                    title="EduQuest Free"
                    price="0"
                    currency={currency}
                    onSelect={(m) => handleSelectPlan('free', m)}
                    features={[
                        "Acesso a 2 cursos por mês",
                        "IA Básica (Gemini Flash)",
                        "Sistema de Streaks & XP",
                        "Comunidade Pública"
                    ]}
                />

                {/* PLANO PRO */}
                <PricingCard 
                    title="EduQuest Pro"
                    price={currency === 'BRL' ? '30' : '9'}
                    isFeatured={true}
                    currency={currency}
                    onSelect={(m) => handleSelectPlan('pro', m)}
                    features={[
                        "IA Ilimitada para Cursos",
                        "Certificados Verificados",
                        "Ligas Competitivas Gold",
                        "Repetição Espaçada (SRS)",
                        "Fundo de Premiação",
                        "Sem Anúncios"
                    ]}
                />

                {/* PLANO PREMIUM */}
                <PricingCard 
                    title="EduQuest Premium"
                    price={currency === 'BRL' ? '60' : '19'}
                    isPremium={true}
                    currency={currency}
                    onSelect={(m) => handleSelectPlan('premium', m)}
                    features={[
                        "Tudo do Plano Pro",
                        "IA Avançada (Gemini Pro)",
                        "Mentoria Individual IA",
                        "Cursos de Especialistas",
                        "Suporte Prioritário VIP",
                        "Certificados com Selo de Ouro"
                    ]}
                />
            </div>

            <div className="mt-20 flex flex-col items-center">
                 <div className="flex flex-wrap justify-center gap-8 opacity-40 items-center grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-xl font-black italic">HOTMART SAFE</span>
                    <span className="text-xl font-black italic">STRIPE SECURE</span>
                    <span className="text-xl font-black italic">PIX INSTANT</span>
                 </div>
                 <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-[0.3em]">Ambiente 100% Criptografado & Seguro</p>
            </div>
        </section>

        {/* Affiliate Footer Section */}
        <section className="bg-indigo-600 py-24 px-6 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-700 rotate-2 transform scale-150 -translate-y-12"></div>
            <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-black mb-6">Pronto para a Evolução?</h2>
                <p className="text-xl text-indigo-100 mb-10 font-medium">Não importa onde você esteja, a EduQuest é a sua melhor ferramenta de estudos.</p>
                <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-xl shadow-2xl hover:bg-slate-50 transition-all transform hover:scale-105">Quero Começar Agora 🔥</button>
            </div>
        </section>

        <footer className="bg-slate-900 py-12 px-6 text-center text-slate-500">
            <p className="text-xs font-bold uppercase tracking-widest leading-loose">
                &copy; 2024 EduQuest Cloud Learning Saga <br/>
                O uso desta plataforma está sujeito aos termos de serviço. <br/>
                EduQuest não garante resultados específicos, o sucesso depende do esforço individual.
            </p>
        </footer>
    </div>
  );
};

export default LandingPage;
