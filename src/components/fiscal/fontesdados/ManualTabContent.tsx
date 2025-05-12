
import React from "react";

const ManualTabContent: React.FC = () => {
  return (
    <div className="border rounded-md p-4 bg-muted/50">
      <p className="text-sm">
        Na configuração manual, os dados fiscais e contábeis serão inseridos diretamente no sistema
        ou importados através de planilhas. Configure abaixo o período para busca inicial dos dados.
      </p>
    </div>
  );
};

export default ManualTabContent;
