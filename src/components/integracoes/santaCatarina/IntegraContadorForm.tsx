
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUp, Info } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CertificadoDigital } from "@/services/governamental/certificadosDigitaisService";

interface IntegraContadorFormProps {
  onSubmit: (config: any) => Promise<void>;
  loading: boolean;
}

export function IntegraContadorForm({ onSubmit, loading }: IntegraContadorFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serproConfig, setSerproConfig] = useState({
    certificadoDigital: '',
    senhaCertificado: '',
    procuracaoEletronica: false,
    procuracaoNumero: '',
    procuracaoValidade: '',
    procuracaoArquivo: null as File | null
  });
  
  // Handler for file upload (certificado)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSerproConfig(prev => ({ 
        ...prev, 
        certificadoDigital: e.target.files[0].name 
      }));
    }
  };
  
  // Handler for procuração file upload
  const handleProcuracaoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSerproConfig(prev => ({ 
        ...prev, 
        procuracaoArquivo: e.target.files[0]
      }));
      
      toast({
        title: "Arquivo recebido",
        description: "Comprovante de procuração carregado com sucesso"
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!serproConfig.certificadoDigital) {
      toast({
        title: "Certificado necessário",
        description: "É necessário fornecer um certificado digital para autenticação",
        variant: "destructive"
      });
      return;
    }
    
    if (serproConfig.procuracaoEletronica && !serproConfig.procuracaoNumero) {
      toast({
        title: "Número da procuração necessário",
        description: "Forneça o número da procuração eletrônica para validação",
        variant: "destructive"
      });
      return;
    }
    
    await onSubmit(serproConfig);
  };
  
  return (
    <>
      {/* Information box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Sobre o Integra Contador</h4>
            <p className="text-sm text-blue-700 mt-1">
              O Integra Contador é uma solução do Serpro que oferece acesso automatizado a 
              diversos dados fiscais dos seus clientes, como notas fiscais eletrônicas, 
              certidões negativas e informações cadastrais.
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>Para utilizar, é necessário contratar o serviço na Loja do Serpro</li>
              <li>Utilize um certificado digital e-CNPJ para autenticação</li>
              <li>É necessária procuração eletrônica dos seus clientes no portal e-CAC</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Form fields */}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="certificado">Certificado Digital e-CNPJ</Label>
          <div className="flex gap-2">
            <Input
              id="certificado-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <Input
              id="certificado"
              value={serproConfig.certificadoDigital}
              readOnly
              placeholder="Nenhum arquivo selecionado"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => document.getElementById('certificado-upload')?.click()}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Selecionar
            </Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="senhaCertificado">Senha do Certificado</Label>
          <Input
            id="senhaCertificado"
            type="password"
            value={serproConfig.senhaCertificado}
            onChange={(e) => setSerproConfig(prev => ({ 
              ...prev, 
              senhaCertificado: e.target.value 
            }))}
            placeholder="Digite a senha do certificado digital"
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="procuracao" 
            checked={serproConfig.procuracaoEletronica}
            onCheckedChange={(checked) => setSerproConfig(prev => ({
              ...prev,
              procuracaoEletronica: checked === true
            }))}
          />
          <Label 
            htmlFor="procuracao" 
            className="text-sm font-normal"
          >
            Confirmo que possuo procuração eletrônica dos clientes no e-CAC
          </Label>
        </div>
        
        {/* Campos adicionais para detalhes da procuração eletrônica */}
        {serproConfig.procuracaoEletronica && (
          <div className="border p-4 rounded-md mt-2 bg-gray-50">
            <h4 className="font-medium mb-3">Dados da Procuração Eletrônica</h4>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="numeroProcuracao">Número da Procuração</Label>
                <Input
                  id="numeroProcuracao"
                  value={serproConfig.procuracaoNumero}
                  onChange={(e) => setSerproConfig(prev => ({ 
                    ...prev, 
                    procuracaoNumero: e.target.value 
                  }))}
                  placeholder="Digite o número da procuração eletrônica"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="validadeProcuracao">Validade da Procuração</Label>
                <Select 
                  value={serproConfig.procuracaoValidade}
                  onValueChange={(value) => setSerproConfig(prev => ({
                    ...prev,
                    procuracaoValidade: value
                  }))}
                >
                  <SelectTrigger id="validadeProcuracao">
                    <SelectValue placeholder="Selecione a validade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">1 ano</SelectItem>
                    <SelectItem value="24">2 anos</SelectItem>
                    <SelectItem value="36">3 anos</SelectItem>
                    <SelectItem value="60">5 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="procuracaoUpload">Comprovante da Procuração (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="procuracao-upload"
                    type="file"
                    className="hidden"
                    onChange={handleProcuracaoFileChange}
                  />
                  <Input
                    readOnly
                    value={serproConfig.procuracaoArquivo ? serproConfig.procuracaoArquivo.name : ''}
                    placeholder="Nenhum arquivo selecionado"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('procuracao-upload')?.click()}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Anexar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anexe o PDF ou imagem da procuração para referência futura
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Submit button */}
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Configurando..." : "Configurar Integração"}
        </Button>
      </div>
    </>
  );
}
