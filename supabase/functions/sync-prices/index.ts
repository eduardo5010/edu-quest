
// @ts-ignore
import { createClient } from "npm:@supabase/supabase-js@2.45.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log("LOG: Iniciando sincronização de preços v10 (Foco em Mensal + Anual)...");

  try {
    const supabaseUrl = (Deno as any).env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = (Deno as any).env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const client_id = (Deno as any).env.get('HOTMART_CLIENT_ID');
    const client_secret = (Deno as any).env.get('HOTMART_CLIENT_SECRET');
    const product_id_env = (Deno as any).env.get('HOTMART_PRODUCT_ID');

    if (!client_id || !client_secret || !product_id_env) {
        throw new Error("Configurações incompletas nos Secrets do Supabase (ID, Secret ou Product ID).");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Autenticação OAuth2
    const authHeader = btoa(`${client_id}:${client_secret}`);
    const tokenRes = await fetch("https://api-sec-vlc.hotmart.com/security/oauth/token", {
      method: "POST",
      headers: { 
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ "grant_type": "client_credentials" })
    });

    if (!tokenRes.ok) throw new Error(`Falha na autenticação Hotmart.`);
    const { access_token } = await tokenRes.json();

    // 2. Coleta de dados de múltiplos Endpoints para garantir Mensal + Anual
    // Endpoint A: Assinaturas (Planos específicos)
    // Endpoint B: Ofertas (Checkouts diretos)
    // Endpoint C: Planos de Produto (Sugestão do usuário)
    const [subRes, offerRes, prodPlansRes] = await Promise.all([
      fetch(`https://developers.hotmart.com/subscriptions/api/v1/plans?product_id=${product_id_env}`, {
        headers: { "Authorization": `Bearer ${access_token}`, "Accept": "application/json" }
      }),
      fetch(`https://developers.hotmart.com/payments/api/v1/offers?product_id=${product_id_env}`, {
        headers: { "Authorization": `Bearer ${access_token}`, "Accept": "application/json" }
      }),
      fetch(`https://developers.hotmart.com/products/api/v1/products/${product_id_env}/plans`, {
        headers: { "Authorization": `Bearer ${access_token}`, "Accept": "application/json" }
      })
    ]);

    let rawItems = [];

    if (subRes.ok) {
      const json = await subRes.json();
      if (json.data) rawItems.push(...json.data);
    }
    if (offerRes.ok) {
      const json = await offerRes.json();
      if (json.data) rawItems.push(...json.data);
    }
    if (prodPlansRes.ok) {
      const json = await prodPlansRes.json();
      if (json.data) rawItems.push(...json.data);
    }

    if (rawItems.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Nenhuma oferta ou plano encontrado na Hotmart para este ID." 
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Mapeamento Inteligente com detecção de Ciclo
    const processedPlans = rawItems.map((item: any) => {
      const price = item.amount || (item.price?.value || item.price) || 0;
      const currency = item.currency_code || (item.price?.currency_code) || 'BRL';
      const name = item.name || "";
      const code = item.code || item.id;

      // Lógica de detecção de ciclo:
      // - Se recurrence_period for 12 -> Anual
      // - Se o nome contiver termos de anualidade
      // - Caso contrário -> Mensal
      const isAnnual = item.recurrence_period === 12 || 
                       name.toLowerCase().includes("anual") || 
                       name.toLowerCase().includes("yearly") || 
                       name.toLowerCase().includes("12 meses") ||
                       name.toLowerCase().includes("ano");

      const billing_cycle = isAnnual ? 'annual' : 'monthly';
      
      // Definição de Tier baseada no preço (ajustável)
      const isPremium = (isAnnual && price > 150) || (!isAnnual && price > 40);

      return {
        name: name || (isPremium ? `EduQuest Premium (${isAnnual ? 'Anual' : 'Mensal'})` : `EduQuest Pro (${isAnnual ? 'Anual' : 'Mensal'})`),
        tier: isPremium ? 'premium' : 'pro',
        billing_cycle: billing_cycle,
        price: price,
        currency: currency,
        hotmart_link: `https://pay.hotmart.com/${code}`,
        features: isPremium 
          ? ["IA Gemini Ilimitada", "Cursos VIP", "Certificados", "Suporte 24h", isAnnual ? "Economia de 2 meses" : "Sem fidelidade"] 
          : ["IA Básica", "Acesso aos Cursos", "Comunidade"],
        is_premium: isPremium,
        is_featured: !isPremium && isAnnual // Destaque para o Pro Anual como melhor custo-benefício
      };
    });

    // 4. Upsert no Supabase
    // Importante: A tabela 'plans' deve ter uma constraint de unicidade em (tier, currency, billing_cycle)
    const { error: upsertError } = await supabase
      .from('plans')
      .upsert(processedPlans, { onConflict: 'tier,currency,billing_cycle' });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sincronização concluída! ${processedPlans.length} planos (Mensais e Anuais) atualizados.` 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("Erro na Sync Function:", err.message);
    return new Response(JSON.stringify({ success: false, message: err.message }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
})
