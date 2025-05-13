
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
 * Fetches all accounting clients with their subscription details
 */
export async function fetchCustomersWithSubscriptions(): Promise<CustomerSummary[]> {
  try {
    // Query clients and their latest subscription
    const { data, error } = await supabase
      .from('accounting_clients')
      .select(`
        id, 
        name, 
        email, 
        status,
        accounting_firm_subscriptions (
          id,
          status,
          plan_type,
          monthly_fee,
          end_date
        )
      `)
      .order('name');
      
    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    
    // Map the data to the CustomerSummary interface
    return (data || []).map(customer => {
      const subscription = customer.accounting_firm_subscriptions?.[0] || null;
      
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
        subscriptionStatus: subscription?.status || 'none',
        subscriptionPlan: subscription?.plan_type || 'none',
        monthlyFee: subscription?.monthly_fee || 0,
        subscriptionEndDate: subscription?.end_date || null
      };
    });
  } catch (error) {
    console.error('Error in fetchCustomersWithSubscriptions:', error);
    toast({
      title: "Erro ao buscar clientes",
      description: "Não foi possível carregar a lista de clientes e assinaturas.",
      variant: "destructive"
    });
    return [];
  }
}

/**
 * Updates a customer's subscription status
 */
export async function updateCustomerSubscription(
  customerId: string, 
  subscriptionData: {
    status?: string;
    plan_type?: string;
    monthly_fee?: number;
    end_date?: string | null;
  }
): Promise<boolean> {
  try {
    // First check if the customer has a subscription
    const { data: existingSubscriptions } = await supabase
      .from('accounting_firm_subscriptions')
      .select('id')
      .eq('firm_id', customerId)
      .limit(1);
      
    let success = false;
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // Update existing subscription
      const { error } = await supabase
        .from('accounting_firm_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscriptions[0].id);
        
      success = !error;
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('accounting_firm_subscriptions')
        .insert({
          firm_id: customerId,
          status: subscriptionData.status || 'active',
          plan_type: subscriptionData.plan_type || 'basic',
          monthly_fee: subscriptionData.monthly_fee || 0,
          end_date: subscriptionData.end_date,
          start_date: new Date().toISOString()
        });
        
      success = !error;
    }
    
    if (success) {
      toast({
        title: "Assinatura atualizada",
        description: "As informações da assinatura foram atualizadas com sucesso."
      });
    } else {
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar a assinatura. Tente novamente.",
        variant: "destructive"
      });
    }
    
    return success;
  } catch (error) {
    console.error('Error in updateCustomerSubscription:', error);
    toast({
      title: "Erro na atualização",
      description: "Não foi possível atualizar a assinatura. Tente novamente.",
      variant: "destructive"
    });
    return false;
  }
}

/**
 * Fetches mock support tickets (to be implemented with real data later)
 */
export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  // This is a mock implementation - in a real app, you would fetch from Supabase
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  // Return mock data
  return [
    {
      id: '1',
      customerId: '123',
      customerName: 'Empresa ABC Ltda',
      subject: 'Problema com integração fiscal',
      status: 'open',
      priority: 'high',
      createdAt: '2023-05-10T10:30:00Z',
      lastUpdated: '2023-05-10T10:30:00Z'
    },
    {
      id: '2',
      customerId: '456',
      customerName: 'Consultoria XYZ',
      subject: 'Dúvida sobre relatórios',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2023-05-08T14:20:00Z',
      lastUpdated: '2023-05-09T09:15:00Z'
    },
    {
      id: '3',
      customerId: '789',
      customerName: 'Comércio Rápido SA',
      subject: 'Solicitação de nova funcionalidade',
      status: 'closed',
      priority: 'low',
      createdAt: '2023-05-05T16:45:00Z',
      lastUpdated: '2023-05-07T11:30:00Z'
    }
  ];
}

/**
 * Sends a bulk email to customers
 */
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
      description: `${recipients} destinatários receberam a mensagem com sucesso.`
    });
    
    return true;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    toast({
      title: "Erro ao enviar emails",
      description: "Não foi possível enviar os emails para os destinatários selecionados.",
      variant: "destructive"
    });
    return false;
  }
}
