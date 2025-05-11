
import React, { useState } from 'react';
import { Building } from "lucide-react";

interface ClientSelectorProps {
  onSelectClient?: (clientId: string) => void;
  defaultValue?: string;
}

export function ClientSelector({ onSelectClient, defaultValue = 'Visão Geral' }: ClientSelectorProps) {
  const [selectedClient, setSelectedClient] = useState(defaultValue);
  const clients = ['Visão Geral', 'Empresa ABC Ltda', 'XYZ Comércio S.A.', 'Tech Solutions'];
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClient(value);
    if (onSelectClient) {
      onSelectClient(value);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-muted-foreground" />
      <select 
        value={selectedClient}
        onChange={handleChange}
        className="bg-transparent border-none text-lg font-medium focus:outline-none focus:ring-0"
      >
        {clients.map(client => (
          <option key={client} value={client}>
            {client}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ClientSelector;
