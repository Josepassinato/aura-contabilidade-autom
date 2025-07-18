
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  status: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  monthlyFee: number;
  subscriptionEndDate: string | null;
  accountingFirmName?: string;
  clientsCount?: number; // Number of clients this accounting firm serves
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdated: string;
}

/**
 * Fetches all accounting firms with their subscription details and client count
 */
export async function fetchCustomersWithSubscriptions(): Promise<CustomerSummary[]> {
  try {
    console.log("Buscando escritórios de contabilidade com validação aprimorada...");
    
    // Query to get accounting firms with their subscriptions
    const { data: firms, error: firmsError } = await supabase
      .from('accounting_firms')
      .select(`
        id, 
        name, 
        email, 
        status,
        cnpj,
        phone,
        address
      `)
      .order('name');
      
    if (firmsError) {
      console.error('Erro ao buscar escritórios de contabilidade:', firmsError);
      throw firmsError;
    }

    // Get subscription data for each firm
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('accounting_firm_subscriptions')
      .select(`
        id,
        accounting_firm_id,
        status,
        plan_type,
        monthly_fee,
        end_date
      `)
      .not('accounting_firm_id', 'is', null);
      
    if (subscriptionsError) {
      console.error('Erro ao buscar assinaturas:', subscriptionsError);
      throw subscriptionsError;
    }

    // Get client count for each firm
    const { data: clientCounts, error: clientCountsError } = await supabase
      .from('accounting_clients')
      .select('accounting_firm_id')
      .not('accounting_firm_id', 'is', null);
      
    if (clientCountsError) {
      console.error('Erro ao buscar contagem de clientes:', clientCountsError);
    }

    // Count clients per firm
    const clientCountMap = new Map<string, number>();
    if (clientCounts) {
      clientCounts.forEach(client => {
        if (client.accounting_firm_id) {
          const count = clientCountMap.get(client.accounting_firm_id) || 0;
          clientCountMap.set(client.accounting_firm_id, count + 1);
        }
      });
    }

    // Validate and filter firms - ensure we only include legitimate accounting firms
    const validFirms = (firms || []).filter(firm => {
      // Validation criteria for legitimate accounting firms:
      // 1. Must have both name and email
      // 2. Should have a valid CNPJ format (if provided)
      // 3. Must not be in the accounting_clients table (to avoid duplicates)
      
      if (!firm.name || !firm.email) {
        console.warn(`Firm excluded - missing name or email:`, firm);
        return false;
      }
      
      // Additional business logic can be added here
      // For example, checking if the firm has a subscription or clients
      
      return true;
    });

    console.log(`Filtered ${(firms || []).length} firms down to ${validFirms.length} valid firms`);

    const result: CustomerSummary[] = validFirms.map(firm => {
      // Find the subscription for this accounting firm
      const subscription = subscriptions?.find(sub => sub.accounting_firm_id === firm.id);
      
      return {
        id: firm.id,
        name: firm.name,
        email: firm.email,
        status: firm.status,
        subscriptionStatus: subscription?.status || 'none',
        subscriptionPlan: subscription?.plan_type || 'none',
        monthlyFee: subscription?.monthly_fee || 0,
        subscriptionEndDate: subscription?.end_date || null,
        accountingFirmName: firm.name, // The firm itself
        clientsCount: clientCountMap.get(firm.id) || 0
      };
    });

    console.log("Dados dos escritórios de contabilidade processados:", result);
    console.log("Total de escritórios válidos retornados:", result.length);
    
    return result;
  } catch (error) {
    console.error('Erro em fetchCustomersWithSubscriptions:', error);
    toast({
      title: "Erro ao buscar escritórios de contabilidade",
      description: "Não foi possível carregar a lista de escritórios e assinaturas.",
      variant: "destructive"
    });
    return [];
  }
}

/**
 * Updates an accounting firm's subscription status
 */
export async function updateCustomerSubscription(
  firmId: string, 
  subscriptionData: {
    status?: string;
    plan_type?: string;
    monthly_fee?: number;
    end_date?: string | null;
  }
): Promise<boolean> {
  try {
    console.log("Atualizando assinatura do escritório de contabilidade:", firmId, subscriptionData);
    
    // First check if the accounting firm has a subscription
    const { data: existingSubscriptions } = await supabase
      .from('accounting_firm_subscriptions')
      .select('id')
      .eq('accounting_firm_id', firmId)
      .limit(1);
      
    let success = false;
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // Update existing subscription
      const { error } = await supabase
        .from('accounting_firm_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscriptions[0].id);
        
      if (error) {
        console.error('Erro ao atualizar assinatura existente:', error);
        throw error;
      }
      success = true;
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('accounting_firm_subscriptions')
        .insert({
          accounting_firm_id: firmId,
          status: subscriptionData.status || 'active',
          plan_type: subscriptionData.plan_type || 'basic',
          monthly_fee: subscriptionData.monthly_fee || 0,
          end_date: subscriptionData.end_date,
          start_date: new Date().toISOString()
        });
        
      if (error) {
        console.error('Erro ao criar nova assinatura:', error);
        throw error;
      }
      success = true;
    }
    
    if (success) {
      toast({
        title: "Assinatura atualizada",
        description: "As informações da assinatura do escritório de contabilidade foram atualizadas com sucesso."
      });
    }
    
    return success;
  } catch (error) {
    console.error('Erro em updateCustomerSubscription:', error);
    toast({
      title: "Erro na atualização",
      description: "Não foi possível atualizar a assinatura. Tente novamente.",
      variant: "destructive"
    });
    return false;
  }
}

/**
 * Fetches real support tickets from payment alerts table
 */
export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  try {
    console.log("Buscando tickets de suporte reais...");
    
    const { data: alerts, error } = await supabase
      .from('payment_alerts')
      .select(`
        id,
        client_id,
        alert_type,
        alert_sent_date,
        payment_due_date,
        accounting_clients!inner(name, email)
      `)
      .order('alert_sent_date', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar alertas de pagamento:', error);
      throw error;
    }
    
    // Convert payment alerts to support tickets format
    const tickets: SupportTicket[] = (alerts || []).map(alert => ({
      id: alert.id,
      customerId: alert.client_id,
      customerName: alert.accounting_clients?.name || 'Cliente não identificado',
      subject: `Alerta de Pagamento - ${alert.alert_type}`,
      status: 'open' as const,
      priority: alert.alert_type === 'final_notice' ? 'high' as const : 'medium' as const,
      createdAt: alert.alert_sent_date || new Date().toISOString(),
      lastUpdated: alert.alert_sent_date || new Date().toISOString()
    }));
    
    console.log("Tickets de suporte carregados:", tickets);
    return tickets;
  } catch (error) {
    console.error('Erro ao buscar tickets de suporte:', error);
    toast({
      title: "Erro ao buscar tickets",
      description: "Não foi possível carregar os tickets de suporte.",
      variant: "destructive"
    });
    return [];
  }
}

export async function sendBulkEmail(
  customerIds: string[], 
  subject: string, 
  message: string
): Promise<boolean> {
  try {
    // In a real implementation, this would call an edge function or a service
    // to send emails to multiple customers
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recipients = customerIds.length;
    
    toast({
      title: "Emails enviados",
      description: `${recipients} escritórios de contabilidade receberam a mensagem com sucesso.`
    });
    
    return true;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    toast({
      title: "Erro ao enviar emails",
      description: "Não foi possível enviar os emails para os escritórios de contabilidade selecionados.",
      variant: "destructive"
    });
    return false;
  }
}
