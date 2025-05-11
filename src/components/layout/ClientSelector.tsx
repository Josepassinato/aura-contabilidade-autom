
import React, { useState } from 'react';
import { Building } from "lucide-react";

export function ClientSelector() {
  const [selectedClient, setSelectedClient] = useState('Visão Geral');
  const clients = ['Visão Geral', 'Empresa ABC Ltda', 'XYZ Comércio S.A.', 'Tech Solutions'];
  
  return (
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-muted-foreground" />
      <select 
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
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
