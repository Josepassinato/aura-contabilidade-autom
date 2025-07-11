import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLATFORM_KNOWLEDGE = `
# Plataforma ContaFlix - Guia Completo

## Visão Geral
A plataforma ContaFlix é um sistema completo de gestão contábil e fiscal para contadores e empresas.

## Funcionalidades Principais:

### 1. Dashboard Principal
- Visão geral dos clientes e métricas
- Cards de resumo financeiro
- Calendário fiscal
- Documentos recentes

### 2. Gestão de Clientes
- Cadastro e edição de clientes
- Visualização de informações detalhadas
- Portal do cliente
- Documentos por cliente

### 3. Contabilidade
- Lançamentos contábeis
- Plano de contas
- Balancetes
- Centro de custos
- Relatórios contábeis (DRE, Balanço Patrimonial)
- Análises financeiras

### 4. Obrigações Fiscais
- Calendário de obrigações
- Guias fiscais
- Declarações
- Alertas de vencimento

### 5. Integrações Governamentais
- Simples Nacional
- Sefaz Estadual
- eSocial
- SPED

### 6. Automação
- Processamento automático de documentos
- Apuração automática
- Classificação de documentos
- Reconciliação bancária

### 7. Relatórios e Análises
- Relatórios financeiros
- Análises preditivas
- Dashboard de fechamento mensal
- Relatórios personalizados

### 8. Colaboradores
- Gestão de funcionários
- Folha de pagamento
- Controle de ponto

## Como usar cada funcionalidade:

### Seletor de Cliente
- Sempre selecione o cliente antes de trabalhar com dados específicos
- Localizado no canto superior direito da maioria das páginas

### Lançamentos Contábeis
1. Acesse Contabilidade > Lançamentos
2. Clique em "Novo Lançamento"
3. Preencha os dados obrigatórios
4. Adicione itens de débito e crédito (devem estar balanceados)
5. Salve o lançamento

### Upload de Documentos
1. Vá para a página do cliente
2. Use a seção "Upload de Documentos"
3. Arraste e solte os arquivos ou clique para selecionar
4. O sistema processará automaticamente

### Integrações
1. Acesse "Integrações Governamentais"
2. Configure as credenciais necessárias
3. Ative as integrações desejadas
4. O sistema sincronizará automaticamente

### Fechamento Mensal
1. Acesse "Dashboard de Fechamento"
2. Selecione o período
3. Monitore o progresso dos clientes
4. Execute ações em lote se necessário
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, context } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado na plataforma ContaFlix. Sua função é ajudar usuários (contadores e empresas) a navegar e usar a plataforma de forma eficiente.

${PLATFORM_KNOWLEDGE}

## Instruções:
- Seja preciso e direto nas respostas
- Use termos técnicos contábeis quando apropriado
- Ofereça passos específicos quando o usuário pedir ajuda
- Se não souber sobre algo específico, diga que precisa de mais detalhes
- Seja amigável e profissional
- Contextualize suas respostas para contadores brasileiros
- Use exemplos práticos quando possível

Contexto atual da página: ${context || 'Dashboard Principal'}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});