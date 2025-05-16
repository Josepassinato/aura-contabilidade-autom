
import React from 'react';

export interface IndexesFinanceirosProps {
  clientId?: string;
  periodo?: string;
}

export const IndexesFinanceiros = ({ clientId = '', periodo = '' }: IndexesFinanceirosProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Índices Financeiros</h2>
      
      {/* Conteúdo do componente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Liquidez Corrente</h3>
          <div className="text-2xl font-bold text-blue-600">1.45</div>
          <p className="text-sm text-muted-foreground">Ativo Circulante / Passivo Circulante</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Margem Líquida</h3>
          <div className="text-2xl font-bold text-green-600">12.3%</div>
          <p className="text-sm text-muted-foreground">Lucro Líquido / Receita Líquida</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">ROI</h3>
          <div className="text-2xl font-bold text-purple-600">8.7%</div>
          <p className="text-sm text-muted-foreground">Lucro Líquido / Investimento Total</p>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mt-4">
        {clientId && <p>Cliente: {clientId}</p>}
        {periodo && <p>Período: {periodo}</p>}
      </div>
    </div>
  );
};
