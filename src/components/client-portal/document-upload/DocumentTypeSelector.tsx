
import React from "react";

interface DocumentTypeSelectorProps {
  documentType: string;
  onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({ 
  documentType, 
  onTypeChange 
}) => {
  return (
    <div className="col-span-4">
      <label htmlFor="document-type" className="text-sm font-medium">
        Tipo de Documento
      </label>
      <select
        id="document-type"
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        value={documentType}
        onChange={onTypeChange}
      >
        <option value="nota-fiscal">Nota Fiscal</option>
        <option value="recibo">Recibo</option>
        <option value="contrato">Contrato</option>
        <option value="extrato">Extrato Bancário</option>
        <option value="outro">Outros Documentos</option>
      </select>
    </div>
  );
};
