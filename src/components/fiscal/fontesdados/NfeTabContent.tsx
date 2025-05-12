
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NfeTabContentProps {
  nfeToken: string;
  setNfeToken: (value: string) => void;
  nfeCertificado: File | null;
  setNfeCertificado: (value: File | null) => void;
  nfeSenhaCertificado: string;
  setNfeSenhaCertificado: (value: string) => void;
}

export const NfeTabContent: React.FC<NfeTabContentProps> = ({
  nfeToken,
  setNfeToken,
  nfeCertificado,
  setNfeCertificado,
  nfeSenhaCertificado,
  setNfeSenhaCertificado,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="nfe_token">Token de acesso</Label>
        <Input 
          id="nfe_token" 
          placeholder="Token de API da SEFAZ ou provedor" 
          value={nfeToken}
          onChange={(e) => setNfeToken(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nfe_certificado">Certificado Digital</Label>
        <Input 
          id="nfe_certificado" 
          type="file" 
          accept=".pfx,.p12"
          onChange={(e) => setNfeCertificado(e.target.files ? e.target.files[0] : null)}
        />
        <p className="text-xs text-muted-foreground">Certificado digital no formato PFX ou P12</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nfe_senha_certificado">Senha do Certificado</Label>
        <Input 
          id="nfe_senha_certificado" 
          type="password" 
          placeholder="********" 
          value={nfeSenhaCertificado}
          onChange={(e) => setNfeSenhaCertificado(e.target.value)}
        />
      </div>
    </div>
  );
};

export default NfeTabContent;
