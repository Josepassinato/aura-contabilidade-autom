
import React, { useState } from 'react';
import { Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
}

interface ClientSelectorProps {
  onClientSelect?: (client: Client) => void;
  defaultValue?: string;
}

export function ClientSelector({ onClientSelect, defaultValue = 'Visão Geral' }: ClientSelectorProps) {
  const [selectedClient, setSelectedClient] = useState(defaultValue);
  const clients: Client[] = [
    { id: '', name: 'Visão Geral' },
    { id: '1', name: 'Empresa ABC Ltda' },
    { id: '2', name: 'XYZ Comércio S.A.' },
    { id: '3', name: 'Tech Solutions' }
  ];
  
  const handleChange = (value: string) => {
    setSelectedClient(value);
    
    if (onClientSelect) {
      const selectedClientData = clients.find(c => c.name === value) || { id: '', name: value };
      onClientSelect(selectedClientData);
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
