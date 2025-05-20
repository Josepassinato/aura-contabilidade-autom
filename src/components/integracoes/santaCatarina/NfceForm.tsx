
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { NfceScConfig } from "@/services/governamental/sefazScraperService";

interface NfceFormProps {
  onSubmit: (config: NfceScConfig) => Promise<void>;
  loading: boolean;
}

export function NfceForm({ onSubmit, loading }: NfceFormProps) {
  const [nfceConfig, setNfceConfig] = useState<NfceScConfig>({
    dtecUsuario: '',
    dtecSenha: '',
    tipoTTD: '706',
    cscCodigo: '',
    cscToken: ''
  });
  
  // Handle form submission
  const handleSubmit = async () => {
    await onSubmit(nfceConfig);
  };
  
  return (
    <>
      {/* Information box */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Configuração NFC-e de Santa Catarina</h4>
            <p className="text-sm text-amber-700 mt-1">
              Para acessar ou emitir a Nota Fiscal do Consumidor Eletrônica (NFC-e) em SC, é necessário:
            </p>
            <ul className="mt-2 text-sm text-amber-700 list-decimal list-inside">
              <li>Cadastro no Domicílio Tributário Eletrônico do Contribuinte (DTEC)</li>
              <li>Requerer o Tratamento Tributário Diferenciado (TTD) no SAT</li>
              <li>Gerar o Código de Segurança do Contribuinte (CSC)</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* NFC-e form fields */}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="dtecUsuario">Usuário DTEC</Label>
          <Input
            id="dtecUsuario"
            value={nfceConfig.dtecUsuario}
            onChange={(e) => setNfceConfig(prev => ({
              ...prev,
              dtecUsuario: e.target.value
            }))}
            placeholder="Usuário do DTEC"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="dtecSenha">Senha DTEC</Label>
          <Input
            id="dtecSenha"
            type="password"
            value={nfceConfig.dtecSenha}
            onChange={(e) => setNfceConfig(prev => ({
              ...prev,
              dtecSenha: e.target.value
            }))}
            placeholder="Senha do DTEC"
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Tipo de TTD</Label>
          <RadioGroup 
            value={nfceConfig.tipoTTD} 
            onValueChange={(value: '706' | '707') => setNfceConfig(prev => ({
              ...prev,
              tipoTTD: value
            }))}
          >
            <div className="flex items-center space-x-2">
              <RadioItem value="706" id="ttd-706" />
              <Label htmlFor="ttd-706">TTD 706 - Emissão Normal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioItem value="707" id="ttd-707" />
              <Label htmlFor="ttd-707">TTD 707 - Contingência</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="cscCodigo">Código CSC (opcional)</Label>
          <Input
            id="cscCodigo"
            value={nfceConfig.cscCodigo}
            onChange={(e) => setNfceConfig(prev => ({
              ...prev,
              cscCodigo: e.target.value
            }))}
            placeholder="Código de Segurança do Contribuinte"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="cscToken">Token CSC (opcional)</Label>
          <Input
            id="cscToken"
            value={nfceConfig.cscToken}
            onChange={(e) => setNfceConfig(prev => ({
              ...prev,
              cscToken: e.target.value
            }))}
            placeholder="Token do CSC"
          />
        </div>
      </div>
      
      {/* Submit NFC-e configuration */}
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Configurando..." : "Configurar NFC-e"}
        </Button>
      </div>
    </>
  );
}
