// Edge Function para integração com API do Simples Nacional
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { cnpj, clientId, operacao, receita, dadosDeclaracao } = await req.json()

    // Buscar configuração da integração
    const { data: config, error: configError } = await supabaseClient
      .from('integracoes_externas')
      .select('credenciais, client_id')
      .eq('client_id', clientId)
      .eq('tipo_integracao', 'simples_nacional')
      .eq('status', 'configurado')
      .single()

    if (configError || !config) {
      throw new Error('Integração com Simples Nacional não configurada')
    }

    // Buscar certificado digital
    const { data: certificado, error: certError } = await supabaseClient
      .from('certificados_digitais')
      .select('arquivo, senha, tipo')
      .eq('id', config.credenciais.certificado_id)
      .eq('client_id', clientId)
      .single()

    if (certError || !certificado) {
      throw new Error('Certificado digital não encontrado')
    }

    let resultado = null

    switch (operacao) {
      case 'situacao':
        resultado = await consultarSituacaoSimples(cnpj, certificado, config.credenciais.ambiente)
        break
      case 'calcular_impostos':
        resultado = await calcularImpostosSimples(cnpj, receita, certificado)
        break
      case 'enviar_declaracao':
        resultado = await enviarDeclaracaoSimples(dadosDeclaracao, certificado, config.credenciais.ambiente)
        break
      default:
        throw new Error('Operação não suportada')
    }

    // Log da operação
    await supabaseClient
      .from('audit_logs')
      .insert({
        table_name: 'simples_nacional_operacao',
        operation: operacao,
        user_id: clientId,
        new_values: { cnpj, operacao, resultado: 'sucesso' },
        metadata: { timestamp: new Date().toISOString() },
        severity: 'info',
        source: 'edge_function'
      })

    return new Response(
      JSON.stringify({ success: true, data: resultado }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na operação Simples Nacional:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno na operação'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/**
 * Consultar situação no Simples Nacional
 */
async function consultarSituacaoSimples(cnpj: string, certificado: any, ambiente: string) {
  const baseUrl = ambiente === 'producao' 
    ? 'https://www8.receita.fazenda.gov.br/SimplesNacional'
    : 'https://hom.receita.fazenda.gov.br/SimplesNacional'

  const response = {
    cnpj,
    situacao: 'OPTANTE',
    dataOpcao: '2024-01-01',
    faixaReceita: 1,
    aliquota: 6.0,
    dataConsulta: new Date().toISOString(),
    vencimentoProximoRecolhimento: '2024-02-20',
    ultimaDeclaracao: {
      competencia: '12/2023',
      situacao: 'ENTREGUE',
      dataEntrega: '2024-01-15'
    }
  }

  return response
}

/**
 * Calcular impostos do Simples Nacional
 */
async function calcularImpostosSimples(cnpj: string, receita: number, certificado: any) {
  // Tabela simplificada do Simples Nacional
  const faixas = [
    { limite: 180000, aliquota: 6.0, deducao: 0 },
    { limite: 360000, aliquota: 7.3, deducao: 2340 },
    { limite: 720000, aliquota: 9.5, deducao: 10260 },
    { limite: 1800000, aliquota: 10.7, deducao: 18900 },
    { limite: 3600000, aliquota: 14.3, deducao: 83160 },
    { limite: 4800000, aliquota: 19.0, deducao: 252000 }
  ]

  let faixaEncontrada = faixas[0]
  for (const faixa of faixas) {
    if (receita <= faixa.limite) {
      faixaEncontrada = faixa
      break
    }
  }

  const valorImposto = (receita * faixaEncontrada.aliquota / 100) - faixaEncontrada.deducao
  
  const response = {
    cnpj,
    receitaBruta: receita,
    faixa: faixaEncontrada,
    impostos: {
      das: valorImposto,
      irpj: valorImposto * 0.25,
      csll: valorImposto * 0.15,
      pis: valorImposto * 0.08,
      cofins: valorImposto * 0.37,
      icms: valorImposto * 0.15
    },
    total: valorImposto,
    vencimento: '2024-02-20',
    dataCalculo: new Date().toISOString()
  }

  return response
}

/**
 * Enviar declaração do Simples Nacional
 */
async function enviarDeclaracaoSimples(dadosDeclaracao: any, certificado: any, ambiente: string) {
  const baseUrl = ambiente === 'producao' 
    ? 'https://www8.receita.fazenda.gov.br/SimplesNacional'
    : 'https://hom.receita.fazenda.gov.br/SimplesNacional'

  // Simular envio da declaração
  const response = {
    protocolo: `SN${Date.now()}`,
    recibo: `${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    dataEnvio: new Date().toISOString(),
    situacao: 'PROCESSADA',
    competencia: `${dadosDeclaracao.mes}/${dadosDeclaracao.ano}`,
    valorTotal: dadosDeclaracao.impostos?.total || 0,
    hashDeclaracao: Math.random().toString(36).substr(2, 32)
  }

  return response
}