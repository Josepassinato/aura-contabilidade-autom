
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenGenerator } from './TokenGenerator';
import { TokensList } from './TokensList';
import { ClientSelector } from '@/components/layout/ClientSelector';
import { KeyRound } from 'lucide-react';

export function ClientTokenManager() {
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string }>({ id: '', name: 'Selecione um cliente' });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClientSelect = (client: { id: string; name: string }) => {
    setSelectedClient(client);
  };

  const handleTokenGenerated = () => {
    setRefreshKey(prev => prev + 1); // Força o recarregamento da lista de tokens
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>Gerenciamento de Tokens de Acesso</CardTitle>
        </div>
        <CardDescription>
          Gere e gerencie tokens de acesso para seus clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Cliente</label>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>

        {selectedClient.id ? (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Tokens para {selectedClient.name}</h3>
              <TokenGenerator 
                clientId={selectedClient.id} 
                clientName={selectedClient.name}
                onTokenGenerated={handleTokenGenerated}
              />
            </div>
            
            <TokensList 
              clientId={selectedClient.id} 
              refreshKey={refreshKey}
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Selecione um cliente para gerenciar seus tokens de acesso.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
