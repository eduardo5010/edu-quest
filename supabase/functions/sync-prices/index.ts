// Fix: Declare Deno global to fix Property 'env' does not exist on type 'typeof Deno' in Edge Functions environment
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const HOTMART_TOKEN_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials";
const HOTMART_OFFERS_URL = "https://developers.hotmart.com/payments/api/v1/offers";

serve(async (req) => {
  // Inicializa o cliente do Supabase com Service Role para poder editar a tabela public.plans
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const client_id = Deno.env.get('HOTMART_CLIENT_ID');
    const client_secret = Deno.env.get('HOTMART_CLIENT_SECRET');

    if (!client_id || !client_secret) {
      throw new Error("Credenciais da Hotmart não configuradas nos Secrets do Supabase.");
    }

    // 1. Obter Token de Acesso da Hotmart
    const authHeader = btoa(`${client_id}:${client_secret}`);
    const tokenRes = await fetch(HOTMART_TOKEN_URL, {
      method: "POST",
      headers: { 
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json"
      }
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.text();
      throw new Error(`Erro na autenticação Hotmart: ${errorData}`);
    }

    const { access_token } = await tokenRes.json();

    // 2. Buscar Ofertas do seu Produto
    // Nota: Você pode precisar passar o 'product_id' nos parâmetros se tiver muitos produtos
    const offerRes = await fetch(HOTMART_OFFERS_URL, {
      headers: { "Authorization": `Bearer ${access_token}` }
    });

    if (!offerRes.ok) {
      throw new Error("Erro ao buscar ofertas na Hotmart.");
    }

    const offersData = await offerRes.json();
    const offers = offersData.data || [];

    // 3. Atualizar a tabela 'plans' no Supabase
    // Mapeamos as ofertas da Hotmart para os nossos tiers de plano (pro/premium)
    let updatedCount = 0;
    for (const offer of offers) {
        // Exemplo de lógica: se a oferta contiver "PRO" no nome ou tiver preço X, vira Pro
        const tier = offer.price > 40 ? 'premium' : 'pro';
        
        const { error } = await supabase
          .from('plans')
          .update({ 
            price: offer.price,
            currency: offer.currency_code || 'BRL',
            hotmart_link: `https://pay.hotmart.com/${offer.code}` // Link direto de checkout
          })
          .eq('tier', tier);
        
        if (!error) updatedCount++;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${updatedCount} planos atualizados com sucesso.`,
      timestamp: new Date().toISOString()
    }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    console.error("Erro na sincronização:", err.message);
    return new Response(JSON.stringify({ 
      error: err.message,
      hint: "Verifique os Secrets HOTMART_CLIENT_ID e HOTMART_CLIENT_SECRET"
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
})
