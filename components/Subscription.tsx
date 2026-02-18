
import React, { useState } from 'react';
import HotmartLink from './HotmartLink';

interface SubscriptionProps {
  onSubscribe: () => void;
  onHotmartSuccess: (user: any) => void;
}

const FundCard: React.FC<{ icon: string; title: string; amount: string; children: React.ReactNode; color: string }> = ({ icon, title, amount, children, color }) => (
    <div className={`border-l-4 ${color} bg-slate-100 dark:bg-slate-800 p-4 rounded-r-lg rounded-l-sm`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-bold text-lg">{title}</h3>
            </div>
            <p className="font-extrabold text-xl">{amount}</p>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 pl-9">{children}</p>
    </div>
);

const Subscription: React.FC<SubscriptionProps> = ({ onSubscribe, onHotmartSuccess }) => {
  const [showHotmartLink, setShowHotmartLink] = useState(false);

  const handleHotmartPurchase = () => {
    window.open('https://pay.hotmart.com/G104507186B?checkoutMode=2', '_blank');
  };

  if (showHotmartLink) {
      return <div className="py-12"><HotmartLink onSuccess={onHotmartSuccess} onCancel={() => setShowHotmartLink(false)} /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl text-center border-b-8 border-indigo-500">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Seja EduQuest Premium</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Desbloqueie cursos ilimitados, IA avançada e suporte à comunidade.</p>
        
        <div className="my-8 flex items-center justify-center space-x-2">
            <span className="text-sm font-bold text-slate-400 line-through">R$47</span>
            <span className="text-5xl font-black text-indigo-500">R$30</span>
            <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">/ mês</span>
        </div>

        <div className="space-y-3">
            <button onClick={handleHotmartPurchase} className="w-full py-4 text-lg font-black text-white bg-indigo-500 rounded-xl shadow-lg hover:bg-indigo-600 transform hover:-translate-y-1 transition-all duration-200">
                Assinar Agora (Cartão/Pix via Hotmart)
            </button>
            
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="px-4 text-xs font-bold text-slate-400 uppercase">Ou</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <button 
                onClick={() => setShowHotmartLink(true)} 
                className="w-full py-4 text-lg font-black text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-500 hover:bg-orange-100 transition-all flex items-center justify-center space-x-2"
            >
                <span>🔥</span>
                <span>Já comprei na Hotmart</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-2xl font-black text-center mb-2">Transparência EduQuest</h2>
        <p className="text-center text-slate-500 mb-4 px-4 text-sm font-medium">Sua assinatura financia o ecossistema. Dos R$30, R$10 são taxas e R$20 são distribuídos assim:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FundCard icon="⚙️" title="Infra & IA" amount="R$7" color="border-sky-500">
                Cobre os custos de servidores e APIs da Google Gemini.
            </FundCard>
             <FundCard icon="🧑‍🏫" title="Fundo de Criadores" amount="R$6" color="border-green-500">
                Remunera professores e criadores de cursos da rede.
            </FundCard>
             <FundCard icon="🏆" title="Premiação Alunos" amount="R$3" color="border-amber-500">
                Financia prêmios em dinheiro para o Top 3 das Ligas.
            </FundCard>
             <FundCard icon="🛡️" title="Reserva & Lucro" amount="R$4" color="border-purple-500">
                Garante a sustentabilidade e evolução do app.
            </FundCard>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
