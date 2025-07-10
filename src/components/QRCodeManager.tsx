import React from 'react';
import QRCodeGenerator from './voice-agent/QRCodeGenerator';

const QRCodeManager: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gerenciador de QR Codes</h1>
        <p className="text-muted-foreground">
          Gere QR Codes para configuração do agente de voz dos clientes
        </p>
      </div>
      <QRCodeGenerator />
    </div>
  );
};

export default QRCodeManager;