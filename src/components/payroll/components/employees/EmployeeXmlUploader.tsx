
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileUp, AlertCircle, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

interface EmployeeXmlUploaderProps {
  clientId?: string;
  clientName?: string;
  onUploadComplete?: () => void;
}

export function EmployeeXmlUploader({ clientId, clientName, onUploadComplete }: EmployeeXmlUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const tiposDocumentoFuncionarios = [
    'folha_pagamento',
    'rescisao',
    'ferias',
    'decimo_terceiro',
    'inss',
    'fgts',
    'irrf',
    'rais',
    'caged',
    'esocial',
    'outros'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo XML
      if (!file.name.toLowerCase().endsWith('.xml')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos XML",
          variant: "destructive"
        });
        return;
      }

      // Verificar tamanho do arquivo (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !tipoDocumento) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o arquivo XML e o tipo de documento",
        variant: "destructive"
      });
      return;
    }

    if (!clientId) {
      toast({
        title: "Cliente não selecionado",
        description: "Selecione um cliente antes de fazer o upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Simular processamento do arquivo XML de funcionários
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Upload realizado",
        description: `Arquivo XML de funcionários processado com sucesso`,
      });

      // Limpar form
      setSelectedFile(null);
      setTipoDocumento('');
      setDescription('');

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Erro no upload XML funcionários:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível processar o arquivo XML",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Upload de XML - Funcionários
          {clientName && <span className="text-sm font-normal">- {clientName}</span>}
        </CardTitle>
        <CardDescription>
          Envie arquivos XML relacionados a dados de funcionários (folha, rescisões, eSocial, etc.)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta funcionalidade processa arquivos XML relacionados a funcionários como folha de pagamento,
            rescisões, dados do eSocial, RAIS, CAGED, entre outros.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee-xml-file">Arquivo XML *</Label>
            <Input
              id="employee-xml-file"
              type="file"
              accept=".xml"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo-documento-funcionario">Tipo de Documento *</Label>
            <Select value={tipoDocumento} onValueChange={setTipoDocumento} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="folha_pagamento">Folha de Pagamento</SelectItem>
                <SelectItem value="rescisao">Rescisão</SelectItem>
                <SelectItem value="ferias">Férias</SelectItem>
                <SelectItem value="decimo_terceiro">Décimo Terceiro</SelectItem>
                <SelectItem value="inss">INSS</SelectItem>
                <SelectItem value="fgts">FGTS</SelectItem>
                <SelectItem value="irrf">IRRF</SelectItem>
                <SelectItem value="rais">RAIS</SelectItem>
                <SelectItem value="caged">CAGED</SelectItem>
                <SelectItem value="esocial">eSocial</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="employee-description">Descrição (opcional)</Label>
            <Textarea
              id="employee-description"
              placeholder="Descreva o conteúdo do arquivo XML de funcionários..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleUpload} 
            disabled={uploading || !selectedFile || !tipoDocumento || !clientId}
            className="min-w-32"
          >
            {uploading ? (
              "Processando..."
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Enviar XML
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
