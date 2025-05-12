
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ErpTabContentProps {
  erpUrl: string;
  setErpUrl: (value: string) => void;
  erpUsuario: string;
  setErpUsuario: (value: string) => void;
  erpSenha: string;
  setErpSenha: (value: string) => void;
  erpToken: string;
  setErpToken: (value: string) => void;
}

export const ErpTabContent: React.FC<ErpTabContentProps> = ({
  erpUrl,
  setErpUrl,
  erpUsuario,
  setErpUsuario,
  erpSenha,
  setErpSenha,
  erpToken,
  setErpToken,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="erp_url">URL da API</Label>
        <Input 
          id="erp_url" 
          placeholder="https://api.seuerppreferido.com.br/v1" 
          value={erpUrl}
          onChange={(e) => setErpUrl(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="erp_usuario">Usuário</Label>
          <Input 
            id="erp_usuario" 
            placeholder="usuario_api" 
            value={erpUsuario}
            onChange={(e) => setErpUsuario(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="erp_senha">Senha</Label>
          <Input 
            id="erp_senha" 
            type="password" 
            placeholder="********" 
            value={erpSenha}
            onChange={(e) => setErpSenha(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="erp_token">Token de API (se necessário)</Label>
        <Input 
          id="erp_token" 
          placeholder="Token de acesso" 
          value={erpToken}
          onChange={(e) => setErpToken(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ErpTabContent;
