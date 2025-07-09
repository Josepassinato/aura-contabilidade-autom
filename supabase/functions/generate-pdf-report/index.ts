import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generatePDFByType } from './pdf-generators.ts';
import { getReportTitle, getReportDescription } from './pdf-utils.ts';
import { sendReportByEmail } from './email-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: string;
  clientId: string;
  templateId?: string;
  parameters?: any;
  clientEmail?: string;
  sendEmail?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reportType, clientId, templateId, parameters, clientEmail, sendEmail }: ReportRequest = await req.json();

    console.log('📊 Gerando relatório:', { reportType, clientId, templateId });

    // Obter o usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar dados do usuário e sua contabilidade
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !userProfile) {
      throw new Error('Perfil do usuário não encontrado');
    }

    // Buscar dados do cliente e da contabilidade baseado no usuário
    let clientQuery = supabase
      .from('accounting_clients')
      .select(`
        *,
        accounting_firms (
          name,
          cnpj,
          phone,
          email
        )
      `);

    // Se o usuário é contador/admin, pode acessar qualquer cliente
    // Se é cliente, só pode acessar sua própria empresa
    if (userProfile.role === 'client') {
      if (!userProfile.company_id) {
        throw new Error('Cliente não possui empresa associada');
      }
      clientQuery = clientQuery.eq('id', userProfile.company_id);
    } else {
      // Para contadores/admins, usar o clientId fornecido
      clientQuery = clientQuery.eq('id', clientId);
    }

    const { data: client, error: clientError } = await clientQuery.maybeSingle();

    if (clientError || !client) {
      console.error('Erro ao buscar cliente:', { clientError, userProfile, clientId });
      throw new Error('Cliente não encontrado ou usuário não autorizado');
    }

    // Validar se as informações da contabilidade estão presentes
    if (!client.accounting_firms) {
      console.error('Contabilidade não encontrada para o cliente:', { clientId: client.id, clientName: client.name });
      throw new Error('Dados da contabilidade não encontrados');
    }

    console.log('✅ Cliente e contabilidade encontrados:', {
      clientId: client.id,
      clientName: client.name,
      firmName: client.accounting_firms.name,
      firmCnpj: client.accounting_firms.cnpj,
      userRole: userProfile.role
    });

    // Buscar template se especificado
    let template = null;
    if (templateId) {
      const { data: templateData } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      template = templateData;
    }

    // Gerar PDF baseado no tipo
    const pdfBuffer = await generatePDFByType(reportType, client, parameters, template, supabase);

    // Salvar no storage
    const fileName = `${reportType}_${client.name}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const filePath = `reports/${clientId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar PDF: ${uploadError.message}`);
    }

    // Gerar URL assinada válida por 7 dias
    const { data: urlData } = await supabase.storage
      .from('reports')
      .createSignedUrl(filePath, 7 * 24 * 60 * 60);

    // Registrar relatório gerado
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: reportRecord, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        title: getReportTitle(reportType, client.name),
        description: getReportDescription(reportType),
        report_type: reportType,
        client_id: clientId,
        template_id: templateId,
        file_path: filePath,
        file_url: urlData?.signedUrl,
        file_size: pdfBuffer.byteLength,
        generation_status: 'completed',
        expires_at: expiresAt.toISOString(),
        client_email: clientEmail,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (reportError) {
      console.error('Erro ao registrar relatório:', reportError);
    }

    // Enviar por email se solicitado
    if (sendEmail && clientEmail && Deno.env.get('RESEND_API_KEY')) {
      try {
        await sendReportByEmail(clientEmail, client.name, reportType, urlData?.signedUrl || '', supabase);
        
        // Marcar como enviado por email
        await supabase
          .from('generated_reports')
          .update({ email_sent: true })
          .eq('id', reportRecord?.id);
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportId: reportRecord?.id,
        downloadUrl: urlData?.signedUrl,
        fileName,
        expiresAt,
        emailSent: sendEmail && clientEmail ? true : false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na geração de PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});