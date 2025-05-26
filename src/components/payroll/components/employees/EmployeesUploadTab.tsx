
import React from 'react';
import { EmployeeXmlUploader } from './EmployeeXmlUploader';

interface EmployeesUploadTabProps {
  selectedClientId?: string;
  clientName?: string;
  onUploadComplete?: () => void;
}

export function EmployeesUploadTab({ selectedClientId, clientName, onUploadComplete }: EmployeesUploadTabProps) {
  if (!selectedClientId) {
    return (
      <div className="border rounded-md py-8 text-center">
        <h3 className="text-lg font-medium mb-1">Selecione um cliente</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um cliente para fazer upload de arquivos XML de funcionários.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeXmlUploader 
        clientId={selectedClientId}
        clientName={clientName}
        onUploadComplete={onUploadComplete}
      />
    </div>
  );
}
