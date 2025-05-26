
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { uploadSefazXmlManual } from "@/services/governamental/sefaz/xmlUploadService";

interface SefazXmlUploaderProps {
  clientId: string;
  clientName?: string;
  onUploadComplete?: () => void;
}

export function SefazXmlUploader({ clientId, clientName, onUploadComplete }: SefazXmlUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUf, setSelectedUf] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const ufs = [
    'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'ES', 'DF',
    'PE', 'CE', 'PA', 'MT', 'MS', 'PB', 'RN', 'AL', 'PI', 'TO',
    'AC', 'AM', 'AP', 'RO', 'RR', 'SE', 'MA'
  ];

  const tiposDocumento = [
    'guia_pagamento',
    'declaracao',
    'certidao_negativa',
    'parcelamento',
    'consulta_debitos',
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
    if (!selectedFile || !selectedUf || !tipoDocumento) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o arquivo XML, UF e tipo de documento",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const result = await uploadSefazXmlManual({
        clientId,
        file: selectedFile,
        uf: selectedUf,
        tipoDocumento,
        descricao: description
      });

      if (result.success) {
        toast({
          title: "Upload realizado",
          description: `Arquivo XML processado com sucesso para SEFAZ-${selectedUf}`,
        });

        // Limpar form
        setSelectedFile(null);
        setSelectedUf('');
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
      } else {
        throw new Error(result.error || 'Falha no upload');
      }
    } catch (error: any) {
      console.error('Erro no upload XML:', error);
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
          <Upload className="h-5 w-5" />
          Upload Manual de XML SEFAZ
          {clientName && <span className="text-sm font-normal">- {clientName}</span>}
        </CardTitle>
        <CardDescription>
          Envie arquivos XML manualmente quando as APIs da SEFAZ estiverem offline
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta funcionalidade deve ser usada apenas quando as integrações automáticas 
            com a SEFAZ estiverem indisponíveis. Os dados serão processados e armazenados localmente.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="xml-file">Arquivo XML *</Label>
            <Input
              id="xml-file"
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
            <Label htmlFor="uf-select">Estado (UF) *</Label>
            <Select value={selectedUf} onValueChange={setSelectedUf} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {ufs.map(uf => (
                  <SelectItem key={uf} value={uf}>
                    SEFAZ-{uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo-documento">Tipo de Documento *</Label>
            <Select value={tipoDocumento} onValueChange={setTipoDocumento} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guia_pagamento">Guia de Pagamento</SelectItem>
                <SelectItem value="declaracao">Declaração</SelectItem>
                <SelectItem value="certidao_negativa">Certidão Negativa</SelectItem>
                <SelectItem value="parcelamento">Parcelamento</SelectItem>
                <SelectItem value="consulta_debitos">Consulta de Débitos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o conteúdo do arquivo XML..."
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
            disabled={uploading || !selectedFile || !selectedUf || !tipoDocumento}
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
