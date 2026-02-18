
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// @ts-ignore
Deno.serve(async (req: Request) => {
  // Trata o preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log("LOG: Iniciando execução da função sync-prices");

  try {
    // 1. Validar Variáveis de Ambiente
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    // @ts-ignore
    const client_id = Deno.env.get('HOTMART_CLIENT_ID');
    // @ts-ignore
    const client_secret = Deno.env.get('HOTMART_CLIENT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Configuração do Supabase ausente (URL/KEY).");
    }
    if (!client_id || !client_secret) {
      throw new Error("Credenciais Hotmart não configuradas nos Secrets da Função.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Autenticação na Hotmart
    console.log("LOG: Autenticando na Hotmart...");
    const authHeader = btoa(`${client_id}:${client_secret}`);
    
    const tokenRes = await fetch("https://api-sec-vlc.hotmart.com/security/oauth/token", {
      method: "POST",
      headers: { 
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ "grant_type": "client_credentials" })
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text();
      throw new Error(`Hotmart Auth Error (${tokenRes.status}): ${errorBody}`);
    }

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      throw new Error("Token de acesso não retornado pela Hotmart.");
    }

    // 3. Buscar Ofertas
    console.log("LOG: Buscando ofertas...");
    const offerRes = await fetch("https://developers.hotmart.com/payments/api/v1/offers", {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      }
    });

    if (!offerRes.ok) {
      throw new Error(`Erro ao buscar ofertas Hotmart: ${offerRes.status}`);
    }

    const offersData = await offerRes.json();
    const offers = offersData.data || [];
    console.log(`LOG: ${offers.length} ofertas recebidas.`);

    // 4. Mapear e Salvar no Banco
    const processedPlans = offers.map((offer: any) => {
      // Regra simples: se preço > 40 assume Premium, senão Pro
      const tier = offer.price > 40 ? 'premium' : 'pro';
      return {
        name: offer.name || `Plano ${tier.toUpperCase()}`,
        tier: tier,
        price: offer.price,
        currency: offer.currency_code || 'BRL',
        hotmart_link: `https://pay.hotmart.com/${offer.code}`,
        features: tier === 'premium' 
          ? ["IA Ilimitada", "Cursos VIP", "Suporte 24h"] 
          : ["IA Básica", "Acesso aos Cursos", "Comunidade"],
        is_premium: tier === 'premium',
        is_featured: tier === 'pro'
      };
    });

    if (processedPlans.length > 0) {
      console.log("LOG: Fazendo Upsert dos planos...");
      const { error: upsertError } = await supabase
        .from('plans')
        .upsert(processedPlans, { onConflict: 'tier,currency' });

      if (upsertError) throw upsertError;
    }

    // 5. Resposta de Sucesso
    return new Response(JSON.stringify({ 
      success: true, 
      message: `${processedPlans.length} planos sincronizados com sucesso.` 
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("ERRO CRÍTICO NA EDGE FUNCTION:", err.message);
    
    // Garantir que sempre retornamos um JSON, mesmo no erro
    return new Response(JSON.stringify({ 
      success: false, 
      message: err.message || "Erro desconhecido na execução da função."
    }), { 
      status: 200, // Usamos 200 para que o fetch do navegador consiga ler o JSON de erro
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
})
