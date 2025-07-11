import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Package, 
  Users, 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { blingService, BlingProduct, BlingCustomer, BlingOrder } from "@/services/integracoes/blingService";

interface BlingDashboardProps {
  clientId: string;
}

export const BlingDashboard = ({ clientId }: BlingDashboardProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState({
    products: 0,
    customers: 0,
    orders: 0
  });
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    checkConnection();
  }, [clientId]);

  const checkConnection = async () => {
    try {
      const credentials = await blingService.getCredentials(clientId);
      setIsConnected(!!credentials);
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  };

  const handleFullSync = async () => {
    setIsLoading(true);
    setSyncProgress(0);

    try {
      toast({
        title: "Iniciando sincronização",
        description: "Conectando com o Bling e sincronizando dados...",
      });

      // Simular progresso
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await blingService.fullSync(clientId);

      clearInterval(progressInterval);
      setSyncProgress(100);

      if (result.success) {
        setSyncStats({
          products: result.products,
          customers: result.customers,
          orders: result.orders
        });
        setLastSync(new Date());

        toast({
          title: "Sincronização concluída",
          description: `${result.products} produtos, ${result.customers} clientes e ${result.orders} pedidos sincronizados.`,
        });
      } else {
        throw new Error("Falha na sincronização");
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados. Verifique sua conexão.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setSyncProgress(0), 2000);
    }
  };

  const handlePartialSync = async (type: 'products' | 'customers' | 'orders') => {
    setIsLoading(true);

    try {
      let result;
      switch (type) {
        case 'products':
          result = await blingService.syncProducts(clientId);
          setSyncStats(prev => ({ ...prev, products: result.length }));
          break;
        case 'customers':
          result = await blingService.syncCustomers(clientId);
          setSyncStats(prev => ({ ...prev, customers: result.length }));
          break;
        case 'orders':
          result = await blingService.syncOrders(clientId);
          setSyncStats(prev => ({ ...prev, orders: result.length }));
          break;
      }

      toast({
        title: "Sincronização parcial concluída",
        description: `${result.length} ${type === 'products' ? 'produtos' : type === 'customers' ? 'clientes' : 'pedidos'} sincronizados.`,
      });
    } catch (error) {
      console.error(`Erro ao sincronizar ${type}:`, error);
      toast({
        title: "Erro na sincronização",
        description: `Não foi possível sincronizar ${type}.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Bling não conectado</h3>
              <p className="text-sm text-muted-foreground">
                Configure suas credenciais do Bling para começar a sincronizar dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status da Integração Bling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Conectado ao Bling</span>
            </div>
            <Badge variant="secondary">Ativo</Badge>
          </div>

          {lastSync && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última sincronização: {lastSync.toLocaleString('pt-BR')}</span>
            </div>
          )}

          {isLoading && syncProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Sincronizando dados...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Sincronização */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{syncStats.products}</p>
                <p className="text-sm text-muted-foreground">Produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{syncStats.customers}</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <ShoppingCart className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{syncStats.orders}</p>
                <p className="text-sm text-muted-foreground">Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle>Sincronização de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleFullSync} 
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Sincronização Completa'}
          </Button>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline"
              onClick={() => handlePartialSync('products')}
              disabled={isLoading}
            >
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </Button>

            <Button 
              variant="outline"
              onClick={() => handlePartialSync('customers')}
              disabled={isLoading}
            >
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </Button>

            <Button 
              variant="outline"
              onClick={() => handlePartialSync('orders')}
              disabled={isLoading}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pedidos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};