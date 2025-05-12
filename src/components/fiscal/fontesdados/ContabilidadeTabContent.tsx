
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContabilidadeTabContentProps {
  contabilidadeUrl: string;
  setContabilidadeUrl: (value: string) => void;
  contabilidadeUsuario: string;
  setContabilidadeUsuario: (value: string) => void;
  contabilidadeSenha: string;
  setContabilidadeSenha: (value: string) => void;
  contabilidadeIntegracao: string;
  setContabilidadeIntegracao: (value: string) => void;
}

export const ContabilidadeTabContent: React.FC<ContabilidadeTabContentProps> = ({
  contabilidadeUrl,
  setContabilidadeUrl,
  contabilidadeUsuario,
  setContabilidadeUsuario,
  contabilidadeSenha,
  setContabilidadeSenha,
  contabilidadeIntegracao,
  setContabilidadeIntegracao,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="contabilidade_url">URL do Sistema Contábil</Label>
        <Input 
          id="contabilidade_url" 
          placeholder="https://sistema.contabilidade.com.br/api" 
          value={contabilidadeUrl}
          onChange={(e) => setContabilidadeUrl(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contabilidade_usuario">Usuário</Label>
          <Input 
            id="contabilidade_usuario" 
            placeholder="Usuario do sistema contábil" 
            value={contabilidadeUsuario}
            onChange={(e) => setContabilidadeUsuario(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contabilidade_senha">Senha</Label>
          <Input 
            id="contabilidade_senha" 
            type="password" 
            placeholder="********" 
            value={contabilidadeSenha}
            onChange={(e) => setContabilidadeSenha(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contabilidade_integracao">Tipo de Integração</Label>
        <Select 
          value={contabilidadeIntegracao} 
          onValueChange={setContabilidadeIntegracao}
        >
          <SelectTrigger id="contabilidade_integracao">
            <SelectValue placeholder="Selecione o tipo de integração" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="api">API Direta</SelectItem>
            <SelectItem value="importacao">Importação de Arquivos</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ContabilidadeTabContent;
