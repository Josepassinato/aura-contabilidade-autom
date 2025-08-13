import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
}

interface BankTransaction {
  id: string;
  account_id: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  type: string;
  reference: string;
  counterparty?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const belvoSecretKey = Deno.env.get('BELVO_SECRET_KEY');
    
    if (!belvoSecretKey) {
      console.log('Belvo API key não configurada - executando simulação');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { clientId, forceSync = false } = await req.json();

    console.log(`Iniciando ingestão bancária para cliente ${clientId}`);

    // 1. LOG DE INICIO
    const { data: logData, error: logError } = await supabase
      .from('automation_logs')
      .insert({
        process_type: 'bank_ingest',
        client_id: clientId,
        status: 'running',
        metadata: {
          force_sync: forceSync,
          belvo_configured: !!belvoSecretKey
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Erro ao criar log:', logError);
      throw logError;
    }

    let transactions: BankTransaction[] = [];
    let accounts: BankAccount[] = [];

    if (belvoSecretKey) {
      // 2. INTEGRAÇÃO COM BELVO
      try {
        console.log('Integrando com Belvo...');
        
        // Buscar contas bancárias
        const accountsResponse = await fetch('https://api.belvo.com/api/accounts/', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(belvoSecretKey + ':')}`,
            'Content-Type': 'application/json',
          },
        });

        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          accounts = accountsData.results || [];
        }

        // Buscar transações dos últimos 30 dias
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const transactionsResponse = await fetch(`https://api.belvo.com/api/transactions/?date_from=${startDate}&date_to=${endDate}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(belvoSecretKey + ':')}`,
            'Content-Type': 'application/json',
          },
        });

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          transactions = transactionsData.results || [];
        }

      } catch (error) {
        console.error('Erro na integração Belvo:', error);
        throw error;
      }
    } else {
      // 3. SIMULAÇÃO DE DADOS BANCÁRIOS
      console.log('Simulando dados bancários...');
      
      accounts = [
        {
          id: 'acc_001',
          name: 'Conta Corrente Principal',
          balance: 125000.50,
          currency: 'BRL',
          type: 'checking'
        },
        {
          id: 'acc_002', 
          name: 'Conta Poupança',
          balance: 50000.00,
          currency: 'BRL',
          type: 'savings'
        }
      ];

      // Gerar transações simuladas dos últimos 7 dias
      transactions = [];
      for (let i = 0; i < 15; i++) {
        const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const isCredit = Math.random() > 0.6;
        const amount = Math.random() * 5000 + 100;
        
        transactions.push({
          id: `tx_${Date.now()}_${i}`,
          account_id: accounts[Math.floor(Math.random() * accounts.length)].id,
          amount: isCredit ? amount : -amount,
          currency: 'BRL',
          description: isCredit ? 
            ['Recebimento Cliente', 'Transferência Recebida', 'Depósito'][Math.floor(Math.random() * 3)] :
            ['Pagamento Fornecedor', 'Taxa Bancária', 'Transferência Enviada'][Math.floor(Math.random() * 3)],
          date: date.toISOString().split('T')[0],
          type: isCredit ? 'credit' : 'debit',
          reference: `REF${Date.now()}${i}`,
          counterparty: isCredit ? 'Cliente XYZ' : 'Fornecedor ABC'
        });
      }
    }

    // 4. PERSISTIR TRANSAÇÕES
    let recordsProcessed = 0;
    let errors = 0;

    for (const transaction of transactions) {
      try {
        const { error: insertError } = await supabase
          .from('financial_transactions')
          .insert({
            client_id: clientId,
            date: transaction.date,
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type,
            category: 'banking',
            status: 'processado',
            reference: transaction.reference,
            account: transaction.account_id
          });

        if (insertError) {
          console.error('Erro ao inserir transação:', insertError);
          errors++;
        } else {
          recordsProcessed++;
        }
      } catch (error) {
        console.error('Erro no processamento:', error);
        errors++;
      }
    }

    // 5. EXECUTAR CONCILIAÇÃO AUTOMÁTICA
    console.log('Executando conciliação automática...');
    
    try {
      // Chamar edge function de conciliação
      const reconciliationResponse = await fetch(`${supabaseUrl}/functions/v1/automatic-bank-reconciliation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          bankStatements: transactions.map(t => ({
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.amount > 0 ? 'credit' : 'debit'
          })),
          accountingEntries: [] // Por enquanto vazio - seria buscado do sistema contábil
        }),
      });

      if (!reconciliationResponse.ok) {
        console.log('Conciliação não executada - função pode não estar disponível');
      }
    } catch (error) {
      console.log('Erro na conciliação:', error.message);
    }

    // 6. ATUALIZAR LOG
    await supabase
      .from('automation_logs')
      .update({
        status: errors > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed,
        errors_count: errors,
        metadata: {
          accounts_found: accounts.length,
          transactions_processed: recordsProcessed,
          errors_count: errors,
          belvo_configured: !!belvoSecretKey
        }
      })
      .eq('id', logData.id);

    return new Response(JSON.stringify({
      success: true,
      data: {
        accounts_found: accounts.length,
        transactions_processed: recordsProcessed,
        errors_count: errors,
        belvo_configured: !!belvoSecretKey
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na ingestão bancária:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});