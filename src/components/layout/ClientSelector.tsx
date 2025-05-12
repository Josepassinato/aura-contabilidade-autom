
import React, { useState, useEffect } from 'react';
import { Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export interface ClientSelectorProps {
  onClientSelect?: (client: { id: string; name: string }) => void;
  onSelectClient?: (clientId: string) => void;
  defaultValue?: string;
}

export function ClientSelector({ onClientSelect, onSelectClient, defaultValue = 'Visão Geral' }: ClientSelectorProps) {
  const [selectedClient, setSelectedClient] = useState(defaultValue);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([
    { id: '', name: 'Visão Geral' }
  ]);
  
  // Buscar clientes do Supabase quando o componente inicializar
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('accounting_clients')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Erro ao buscar clientes:', error);
          return;
        }
        
        // Adicionar os clientes do banco aos existentes, mantendo "Visão Geral"
        if (data && data.length > 0) {
          const clientsData = [
            { id: '', name: 'Visão Geral' },
            ...data.map(client => ({
              id: client.id,
              name: client.name
            }))
          ];
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };
    
    fetchClients();
  }, []);
  
  const handleChange = (value: string) => {
    setSelectedClient(value);
    
    // Encontrar o cliente selecionado pelo nome
    const selectedClientData = clients.find(c => c.name === value) || { id: '', name: value };
    
    if (onClientSelect) {
      onClientSelect(selectedClientData);
    }

    if (onSelectClient && selectedClientData.id) {
      onSelectClient(selectedClientData.id);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-muted-foreground" />
      <Select value={selectedClient} onValueChange={handleChange}>
        <SelectTrigger className="border-none bg-transparent p-0 focus:ring-0 text-lg font-medium min-w-[200px]">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients.map(client => (
            <SelectItem key={client.id || client.name} value={client.name}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ClientSelector;
