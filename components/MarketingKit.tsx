
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Logo from './Logo';

interface MarketingKitProps {
  onApplyLogo?: (logoUrl: string) => void;
}

const MarketingKit: React.FC<MarketingKitProps> = ({ onApplyLogo }) => {
  const [banner, setBanner] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [affiliateCopy, setAffiliateCopy] = useState<string | null>(null);
  
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  
  const [affiliateProfile, setAffiliateProfile] = useState('');
  const [affiliateAdvantages, setAffiliateAdvantages] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateProductImage = async () => {
    setIsGeneratingBanner(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: "A high-quality 3D isometric marketing illustration for an educational app named 'EduQuest'. The style is vibrant and friendly. It features a futuristic book with sparkles, floating 3D icons like a graduation cap, a lightning bolt, and a friendly holographic AI robot. Colors: Indigo, Purple, and Amber. Soft professional lighting, clean background, 16:9 aspect ratio.",
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setBanner(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      setError("Erro ao gerar banner. Tente novamente.");
    } finally {
      setIsGeneratingBanner(false);
    }
  };

  const generateLogoImage = async () => {
    setIsGeneratingLogo(true);
    setError(null);
    setApplied(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: "A professional, minimalist 3D app icon logo for 'EduQuest'. A stylized, vibrant shield combined with a futuristic book and a small gold lightning bolt. Vibrant indigo and gold colors. 3D render style with soft shadows, clean white background, centered composition, high quality icon design.",
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setLogo(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      setError("Erro ao gerar logo. Tente novamente.");
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const generateAffiliateCopy = async () => {
    if (!affiliateProfile || !affiliateAdvantages) {
      setError("Por favor, preencha o perfil e as vantagens para gerar o texto.");
      return;
    }

    setIsGeneratingCopy(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Você é um mestre em copywriting e marketing de afiliados. Escreva um texto altamente persuasivo para atrair afiliados na Hotmart para o produto 'EduQuest'.
        
        DETALHES DO CRIADOR:
        - Perfil de Afiliado que busco: ${affiliateProfile}
        - Vantagens exclusivas do meu produto: ${affiliateAdvantages}
        
        ESTRUTURA DO TEXTO:
        1. Gancho inicial impactante sobre o potencial de lucro.
        2. Descrição curta do produto (EduQuest: Plataforma de Educação Gamificada com IA).
        3. Por que se afiliar a nós (focar nas vantagens listadas).
        4. O perfil de parceiro ideal.
        5. Chamada para ação (CTA).
        
        Use um tom profissional, entusiasmado e direto ao ponto. Responda em Português do Brasil usando Markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAffiliateCopy(response.text);
    } catch (err) {
      setError("Erro ao gerar copy. Tente novamente.");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleApply = () => {
    if (logo && onApplyLogo) {
      onApplyLogo(logo);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    }
  };

  const copyToClipboard = () => {
    if (affiliateCopy) {
      navigator.clipboard.writeText(affiliateCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Visual Identity Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-xl">
          <h3 className="text-2xl font-black flex items-center space-x-2">
              <span>🚀</span>
              <span>Identidade Visual do Curso</span>
          </h3>
          <p className="mt-2 opacity-90 font-medium">Gere artes de alta qualidade para sua página de vendas na Hotmart.</p>
          
          <div className="mt-6 flex flex-wrap gap-4">
              <button 
                onClick={generateProductImage}
                disabled={isGeneratingBanner}
                className="bg-white text-indigo-600 font-black py-3 px-6 rounded-2xl shadow-lg hover:bg-indigo-50 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isGeneratingBanner ? "Criando Banner..." : "✨ Gerar Banner (16:9)"}
              </button>
              
              <button 
                onClick={generateLogoImage}
                disabled={isGeneratingLogo}
                className="bg-amber-400 text-amber-900 font-black py-3 px-6 rounded-2xl shadow-lg hover:bg-amber-300 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isGeneratingLogo ? "Criando Logo..." : "🎨 Gerar Logo/Ícone (1:1)"}
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logo View */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center">
              <h4 className="text-lg font-black mb-6 text-slate-800 dark:text-white uppercase tracking-widest text-center">Logo do Produto</h4>
              <div className="relative group">
                  <div className="w-[100px] h-[100px] bg-slate-100 dark:bg-slate-700 rounded-[22%] overflow-hidden shadow-2xl border-2 border-white dark:border-slate-600 flex items-center justify-center">
                      {logo ? (
                          <img src={logo} alt="EduQuest Logo" className="w-full h-full object-cover" />
                      ) : (
                          <Logo className="w-full h-full text-indigo-500 p-4" />
                      )}
                  </div>
                  {isGeneratingLogo && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 rounded-[22%] flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                      </div>
                  )}
              </div>
              <div className="mt-8 w-full space-y-3">
                  {logo && (
                      <>
                        <button onClick={handleApply} className={`block w-full font-black py-3 rounded-xl text-center transition-all shadow-md text-sm ${applied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{applied ? '✓ Aplicado ao App!' : '🖼️ Aplicar no Header'}</button>
                        <a href={logo} download="logo-hotmart.png" className="block w-full bg-amber-500 text-white font-black py-3 rounded-xl text-center hover:bg-amber-600 transition-all shadow-md text-sm">Baixar PNG</a>
                      </>
                  )}
              </div>
          </div>

          {/* Banner View */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-700 flex flex-col">
              <h4 className="text-lg font-black mb-6 text-slate-800 dark:text-white uppercase tracking-widest text-center">Banner de Vendas</h4>
              <div className="flex-grow bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 aspect-video relative">
                  {banner ? <img src={banner} alt="EduQuest Banner" className="w-full h-full object-cover" /> : <div className="h-full flex flex-col items-center justify-center opacity-20"><Logo className="w-16 h-16 mb-2" /><span className="text-xs font-black uppercase tracking-tighter">Preview 16:9</span></div>}
                  {isGeneratingBanner && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>}
              </div>
              {banner && <a href={banner} download="banner-hotmart.png" className="mt-4 block w-full bg-indigo-500 text-white font-black py-3 rounded-xl text-center hover:bg-indigo-600 transition-all shadow-md text-sm">Baixar Banner</a>}
          </div>
      </div>

      {/* Affiliate Section */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border-t-8 border-orange-500">
          <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl">🤝</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Vitrine de Afiliados</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-black text-slate-400 uppercase mb-1">Quem é seu Afiliado Ideal?</label>
                      <textarea 
                        value={affiliateProfile}
                        onChange={e => setAffiliateProfile(e.target.value)}
                        placeholder="Ex: Profissionais de tráfego pago (FB/Google Ads), Influenciadores no nicho de concursos ou TI..."
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none transition-all h-32 text-sm"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-black text-slate-400 uppercase mb-1">Quais as Vantagens do Produto?</label>
                      <textarea 
                        value={affiliateAdvantages}
                        onChange={e => setAffiliateAdvantages(e.target.value)}
                        placeholder="Ex: Comissão de 60%, Cookieless, Suporte no WhatsApp, Criativos que convertem, Baixa taxa de reembolso..."
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none transition-all h-32 text-sm"
                      />
                  </div>
                  <button 
                    onClick={generateAffiliateCopy}
                    disabled={isGeneratingCopy}
                    className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isGeneratingCopy ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "✨ Gerar Texto Magnético"}
                  </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 relative min-h-[300px]">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-4 text-center tracking-widest">Resultado do Recrutamento</h4>
                  {affiliateCopy ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none max-h-[400px] overflow-y-auto">
                          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {affiliateCopy}
                          </div>
                          <button 
                            onClick={copyToClipboard}
                            className={`mt-6 w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center space-x-2 ${copied ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'}`}
                          >
                             <span>{copied ? '✓ Copiado!' : '📋 Copiar Texto'}</span>
                          </button>
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 mt-12">
                          <span className="text-5xl">📄</span>
                          <p className="text-sm font-bold">Preencha os campos ao lado para que a IA crie seu convite para afiliados.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {error && <p className="text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl">{error}</p>}
    </div>
  );
};

export default MarketingKit;
