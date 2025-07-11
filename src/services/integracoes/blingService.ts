import { supabase } from "@/integrations/supabase/client";

export interface BlingCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface BlingProduct {
  id: string;
  name: string;
  price: number;
  sku: string;
  category?: string;
  stock?: number;
}

export interface BlingCustomer {
  id: string;
  name: string;
  email?: string;
  document: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface BlingOrder {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  status: string;
  total: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

class BlingService {
  private baseUrl = 'https://bling.com.br/Api/v3';
  
  /**
   * Salva as credenciais do Bling para um cliente
   */
  async saveCredentials(clientId: string, credentials: BlingCredentials): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('upsert_integracao_externa', {
          p_client_id: clientId,
          p_tipo_integracao: 'bling',
          p_credenciais: credentials,
          p_status: 'configurado'
        });

      if (error) {
        console.error('Erro ao salvar credenciais Bling:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar credenciais Bling:', error);
      return false;
    }
  }

  /**
   * Obtém as credenciais do Bling para um cliente
   */
  async getCredentials(clientId: string): Promise<BlingCredentials | null> {
    try {
      // Por enquanto, simular as credenciais - será implementado após atualização dos tipos
      console.log(`Buscando credenciais Bling para cliente ${clientId}`);
      
      // Implementação temporária - substituir por consulta real após tipos atualizados
      return null;
    } catch (error) {
      console.error('Erro ao obter credenciais Bling:', error);
      return null;
    }
  }

  /**
   * Obtém token de acesso OAuth2 do Bling
   */
  async getAccessToken(clientId: string, clientSecret: string, code?: string): Promise<string | null> {
    try {
      const body = code 
        ? {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: code
          }
        : {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
          };

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Erro ao obter token de acesso:', error);
      return null;
    }
  }

  /**
   * Testa a conexão com a API do Bling
   */
  async testConnection(credentials: BlingCredentials): Promise<boolean> {
    try {
      const token = await this.getAccessToken(credentials.clientId, credentials.clientSecret);
      
      if (!token) {
        return false;
      }

      // Testa fazendo uma requisição simples para produtos
      const response = await fetch(`${this.baseUrl}/produtos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão Bling:', error);
      return false;
    }
  }

  /**
   * Sincroniza produtos do Bling
   */
  async syncProducts(clientId: string): Promise<BlingProduct[]> {
    try {
      const credentials = await this.getCredentials(clientId);
      if (!credentials) {
        throw new Error('Credenciais não encontradas');
      }

      const token = await this.getAccessToken(credentials.clientId, credentials.clientSecret);
      if (!token) {
        throw new Error('Não foi possível obter token de acesso');
      }

      const response = await fetch(`${this.baseUrl}/produtos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }

      const data = await response.json();
      
      // Mapear produtos do formato Bling para nosso formato
      const products: BlingProduct[] = data.data?.map((produto: any) => ({
        id: produto.id.toString(),
        name: produto.nome,
        price: parseFloat(produto.preco || '0'),
        sku: produto.codigo,
        category: produto.categoria?.nome,
        stock: produto.estoque?.saldoFisico || 0
      })) || [];

      // Salvar produtos sincronizados
      await this.saveProductsToDatabase(clientId, products);

      return products;
    } catch (error) {
      console.error('Erro ao sincronizar produtos:', error);
      return [];
    }
  }

  /**
   * Sincroniza clientes do Bling
   */
  async syncCustomers(clientId: string): Promise<BlingCustomer[]> {
    try {
      const credentials = await this.getCredentials(clientId);
      if (!credentials) {
        throw new Error('Credenciais não encontradas');
      }

      const token = await this.getAccessToken(credentials.clientId, credentials.clientSecret);
      if (!token) {
        throw new Error('Não foi possível obter token de acesso');
      }

      const response = await fetch(`${this.baseUrl}/contatos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar clientes: ${response.status}`);
      }

      const data = await response.json();
      
      const customers: BlingCustomer[] = data.data?.map((contato: any) => ({
        id: contato.id.toString(),
        name: contato.nome,
        email: contato.email,
        document: contato.numeroDocumento,
        phone: contato.telefone,
        address: contato.endereco ? {
          street: contato.endereco.endereco,
          city: contato.endereco.cidade,
          state: contato.endereco.uf,
          zipCode: contato.endereco.cep
        } : undefined
      })) || [];

      // Salvar clientes sincronizados
      await this.saveCustomersToDatabase(clientId, customers);

      return customers;
    } catch (error) {
      console.error('Erro ao sincronizar clientes:', error);
      return [];
    }
  }

  /**
   * Sincroniza pedidos do Bling
   */
  async syncOrders(clientId: string, dateFrom?: string, dateTo?: string): Promise<BlingOrder[]> {
    try {
      const credentials = await this.getCredentials(clientId);
      if (!credentials) {
        throw new Error('Credenciais não encontradas');
      }

      const token = await this.getAccessToken(credentials.clientId, credentials.clientSecret);
      if (!token) {
        throw new Error('Não foi possível obter token de acesso');
      }

      const params = new URLSearchParams();
      if (dateFrom) params.append('dataInicial', dateFrom);
      if (dateTo) params.append('dataFinal', dateTo);

      const response = await fetch(`${this.baseUrl}/pedidos?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.status}`);
      }

      const data = await response.json();
      
      const orders: BlingOrder[] = data.data?.map((pedido: any) => ({
        id: pedido.id.toString(),
        customerId: pedido.contato?.id?.toString() || '',
        customerName: pedido.contato?.nome || '',
        date: pedido.data,
        status: pedido.situacao?.nome || '',
        total: parseFloat(pedido.total || '0'),
        items: pedido.itens?.map((item: any) => ({
          productId: item.produto?.id?.toString() || '',
          productName: item.produto?.nome || '',
          quantity: item.quantidade || 0,
          unitPrice: parseFloat(item.valor || '0'),
          total: parseFloat(item.valorTotal || '0')
        })) || []
      })) || [];

      // Salvar pedidos sincronizados
      await this.saveOrdersToDatabase(clientId, orders);

      return orders;
    } catch (error) {
      console.error('Erro ao sincronizar pedidos:', error);
      return [];
    }
  }

  /**
   * Salva produtos no banco de dados
   */
  private async saveProductsToDatabase(clientId: string, products: BlingProduct[]): Promise<void> {
    try {
      // Implementar salvamento dos produtos sincronizados
      console.log(`Salvando ${products.length} produtos para cliente ${clientId}`);
      
      // Por enquanto, apenas log - implementar conforme estrutura do banco
      // await supabase.from('produtos_sincronizados').upsert(...)
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  }

  /**
   * Salva clientes no banco de dados
   */
  private async saveCustomersToDatabase(clientId: string, customers: BlingCustomer[]): Promise<void> {
    try {
      console.log(`Salvando ${customers.length} clientes para cliente ${clientId}`);
      // Implementar conforme estrutura do banco
    } catch (error) {
      console.error('Erro ao salvar clientes:', error);
    }
  }

  /**
   * Salva pedidos no banco de dados
   */
  private async saveOrdersToDatabase(clientId: string, orders: BlingOrder[]): Promise<void> {
    try {
      console.log(`Salvando ${orders.length} pedidos para cliente ${clientId}`);
      // Implementar conforme estrutura do banco
    } catch (error) {
      console.error('Erro ao salvar pedidos:', error);
    }
  }

  /**
   * Executa sincronização completa
   */
  async fullSync(clientId: string): Promise<{
    products: number;
    customers: number;
    orders: number;
    success: boolean;
  }> {
    try {
      console.log(`Iniciando sincronização completa para cliente ${clientId}`);

      const [products, customers, orders] = await Promise.all([
        this.syncProducts(clientId),
        this.syncCustomers(clientId),
        this.syncOrders(clientId)
      ]);

      return {
        products: products.length,
        customers: customers.length,
        orders: orders.length,
        success: true
      };
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
      return {
        products: 0,
        customers: 0,
        orders: 0,
        success: false
      };
    }
  }
}

export const blingService = new BlingService();