
import React, { useState, useEffect } from 'react';
import { Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllClients } from "@/services/supabase/clientsService";
import { Tables } from "@/integrations/supabase/types";

export interface ClientSelectorProps {
  onClientSelect?: (client: { id: string; name: string }) => void;
  onSelectClient?: (clientId: string) => void;
  onClientChange?: (client: any) => void; // Added this prop
  defaultValue?: string;
}

export function ClientSelector({ onClientSelect, onSelectClient, onClientChange, defaultValue = 'Visão Geral' }: ClientSelectorProps) {
  const [selectedClient, setSelectedClient] = useState(defaultValue);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([
    { id: '', name: 'Visão Geral' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Buscar clientes do Supabase quando o componente inicializar
  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllClients();
        
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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClients();
  }, []);
  
  const handleChange = (value: string) => {
    setSelectedClient(value);
    
    // Encontrar o cliente selecionado pelo nome
    const selectedClientData = clients.find(c => c.name === value) || { id: '', name: value };
    
    // Call all available callback handlers
    if (onClientSelect) {
      onClientSelect(selectedClientData);
    }

    if (onSelectClient && selectedClientData.id) {
      onSelectClient(selectedClientData.id);
    }
    
    if (onClientChange) {
      onClientChange(selectedClientData);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-muted-foreground" />
      <Select value={selectedClient} onValueChange={handleChange} disabled={isLoading}>
        <SelectTrigger className="border-none bg-transparent p-0 focus:ring-0 text-lg font-medium min-w-[200px]">
          <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um cliente"} />
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
