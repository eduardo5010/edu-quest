
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// @ts-ignore
Deno.serve(async (req: Request) => {
  // 1. Trata a requisição "prévia" do navegador (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Busca as variáveis de ambiente configuradas no Supabase
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    // @ts-ignore
    const client_id = Deno.env.get('HOTMART_CLIENT_ID');
    // @ts-ignore
    const client_secret = Deno.env.get('HOTMART_CLIENT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis SUPABASE_URL ou SERVICE_ROLE_KEY não encontradas.");
    }

    if (!client_id || !client_secret) {
      throw new Error("Segredos da Hotmart (HOTMART_CLIENT_ID/SECRET) não configurados no Painel do Supabase.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Autenticação na API da Hotmart
    const authHeader = btoa(`${client_id}:${client_secret}`);
    const tokenRes = await fetch("https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials", {
      method: "POST",
      headers: { 
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json"
      }
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      throw new Error(`Erro Auth Hotmart: ${tokenRes.status} - ${errorText}`);
    }
    
    const { access_token } = await tokenRes.json();

    // 3. Busca Ofertas Ativas
    const offerRes = await fetch("https://developers.hotmart.com/payments/api/v1/offers", {
      headers: { "Authorization": `Bearer ${access_token}` }
    });

    if (!offerRes.ok) throw new Error("Não foi possível buscar as ofertas na Hotmart.");
    
    const offersData = await offerRes.json();
    const offers = offersData.data || [];

    // 4. Mapeia e Salva os Planos
    const processedPlans = offers.map((offer: any) => {
        const tier = offer.price > 40 ? 'premium' : 'pro';
        return {
            name: offer.name || `Plano ${tier.toUpperCase()}`,
            tier: tier,
            price: offer.price,
            currency: offer.currency_code || 'BRL',
            hotmart_link: `https://pay.hotmart.com/${offer.code}`,
            features: tier === 'premium' ? ["IA Avançada", "Cursos Ilimitados", "Suporte VIP"] : ["IA Básica", "3 Cursos/mês"],
            is_premium: tier === 'premium',
            is_featured: tier === 'pro'
        };
    });

    if (processedPlans.length > 0) {
      const { error: upsertError } = await supabase
        .from('plans')
        .upsert(processedPlans, { onConflict: 'tier,currency' });

      if (upsertError) throw upsertError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${processedPlans.length} planos atualizados com sucesso.` 
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("Erro na Execução:", err.message);
    // IMPORTANTE: Retornar corsHeaders mesmo no erro para o navegador não bloquear a mensagem
    return new Response(JSON.stringify({ 
      success: false, 
      message: err.message || "Erro interno na Edge Function."
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
})
