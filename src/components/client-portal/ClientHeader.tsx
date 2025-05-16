
import React from "react";
import { Building } from "lucide-react";

interface ClientHeaderProps {
  clientName: string;
  clientCNPJ?: string;  // Made optional to maintain backward compatibility
  onLogout?: () => void; // Made optional to maintain backward compatibility
}

export const ClientHeader = ({ clientName, clientCNPJ, onLogout }: ClientHeaderProps) => (
  <div className="flex items-center space-x-2">
    <Building className="h-5 w-5 text-primary" />
    <div>
      <h1 className="text-lg font-medium">{clientName}</h1>
      {clientCNPJ && <p className="text-xs text-muted-foreground">CNPJ: {clientCNPJ}</p>}
    </div>
  </div>
);
