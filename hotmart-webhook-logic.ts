
/* 
  LOGICA PARA HOTMART WEBHOOK VERSÃO 2.0.0
  Instale no Supabase: supabase functions deploy hotmart-webhook
*/

declare const Deno: any;
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const HOTTOK = Deno.env.get('HOTMART_HOTTOK');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    // Na versão 2.0.0 a Hotmart pode enviar como JSON ou URL Encoded. 
    // Vamos tratar como JSON que é o padrão moderno do Supabase.
    const body = await req.json();

    // 1. Validar Hottok (Segurança) - O campo na 2.0.0 é 'hottok'
    if (body.hottok !== HOTTOK) {
      console.error("Hottok inválido recebido");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Extrair dados no formato da Versão 2.0.0
    // Os campos costumam ser: email, status, transaction, prod
    const buyerEmail = body.email;
    const transactionCode = body.transaction;
    const status = body.status?.toLowerCase(); // 'approved', 'completed', etc.

    console.log(`Webhook 2.0.0: Evento para ${buyerEmail} - Status: ${status}`);

    // 3. Verificar se a compra foi aprovada ou completa
    const isApproved = status === 'approved' || status === 'completed' || status === 'atrasada'; 
    // Nota: 'atrasada' as vezes é usada para assinaturas recorrentes ativas mas com boleto gerado, 
    // mas geralmente focamos em 'approved'.

    if (isApproved && buyerEmail) {
      
      // 4. Liberar o Premium no Banco de Dados
      const { error } = await supabase
        .from('users')
        .update({ 
          subscription: 'premium',
          last_transaction_id: transactionCode 
        })
        .eq('email', buyerEmail.toLowerCase());

      if (error) {
        console.error("Erro Supabase:", error.message);
        throw error;
      }

      return new Response(JSON.stringify({ success: true, message: 'Acesso Liberado' }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: 'Evento recebido mas não processado (status não-aprovado)' }), { status: 200 });

  } catch (err) {
    console.error("Erro no Webhook:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
