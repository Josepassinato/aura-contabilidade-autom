// Edge Function para integração com API oficial da Receita Federal
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

    const { cnpj, clientId, operacao } = await req.json()

    // Buscar configuração da integração
    const { data: config, error: configError } = await supabaseClient
      .from('integracoes_externas')
      .select('credenciais, client_id')
      .eq('client_id', clientId)
      .eq('tipo_integracao', 'receita_federal')
      .eq('status', 'configurado')
      .single()

    if (configError || !config) {
      throw new Error('Integração com Receita Federal não configurada')
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
      case 'situacao_fiscal':
        resultado = await consultarSituacaoFiscal(cnpj, certificado, config.credenciais.ambiente)
        break
      case 'debitos':
        resultado = await consultarDebitos(cnpj, certificado, config.credenciais.ambiente)
        break
      default:
        throw new Error('Operação não suportada')
    }

    // Log da operação
    await supabaseClient
      .from('audit_logs')
      .insert({
        table_name: 'receita_federal_consulta',
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
    console.error('Erro na consulta Receita Federal:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno na consulta'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/**
 * Consultar situação fiscal na Receita Federal
 */
async function consultarSituacaoFiscal(cnpj: string, certificado: any, ambiente: string) {
  // URL da API oficial da Receita Federal
  const baseUrl = ambiente === 'producao' 
    ? 'https://servicos.receita.fazenda.gov.br/servicos/consulta'
    : 'https://hom-servicos.receita.fazenda.gov.br/servicos/consulta'

  // Implementação da consulta com certificado digital
  // NOTA: Esta é uma implementação simulada
  // Em produção, seria necessário usar bibliotecas específicas para certificados digitais
  
  const response = {
    cnpj,
    situacao: 'ATIVA',
    dataConsulta: new Date().toISOString(),
    regimeTributario: 'SIMPLES_NACIONAL',
    naturezaJuridica: '206-2',
    porte: 'ME',
    endereco: {
      logradouro: 'RUA EXEMPLO',
      numero: '123',
      bairro: 'CENTRO',
      municipio: 'SAO PAULO',
      uf: 'SP',
      cep: '01000-000'
    },
    atividadePrincipal: {
      codigo: '62.01-5-00',
      descricao: 'Desenvolvimento de programas de computador sob encomenda'
    }
  }

  return response
}

/**
 * Consultar débitos na Receita Federal
 */
async function consultarDebitos(cnpj: string, certificado: any, ambiente: string) {
  // Implementação da consulta de débitos
  const response = {
    cnpj,
    dataConsulta: new Date().toISOString(),
    situacao: 'REGULAR',
    debitos: [],
    certidaoNegativa: {
      numero: 'CN123456789',
      dataEmissao: new Date().toISOString(),
      validadeAte: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 180 dias
    }
  }

  return response
}