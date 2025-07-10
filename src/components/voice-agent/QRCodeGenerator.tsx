import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

const QRCodeGenerator: React.FC = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('accounting_clients')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = async () => {
    if (!selectedClientId) {
      toast({
        title: "Selecione um cliente",
        description: "É necessário selecionar um cliente para gerar o QR Code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedClient = clients.find(c => c.id === selectedClientId);
      
      // Create secure token with expiration
      const tokenData = {
        clientId: selectedClientId,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        firmId: 'current-firm-id', // Get from current user context
      };

      // Encode the data
      const encodedData = btoa(JSON.stringify(tokenData));
      setQrCodeData(encodedData);

      // Generate QR code URL using a QR code service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(encodedData)}`;
      setQrCodeUrl(qrUrl);

      // Log the generation
      await supabase.from('client_access_tokens').insert({
        client_id: selectedClientId,
        token: encodedData,
        description: 'QR Code para agente de voz',
        expires_at: new Date(tokenData.expires).toISOString(),
      });

      toast({
        title: "QR Code gerado!",
        description: `Código criado para ${selectedClient?.name}`,
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrCodeData);
    toast({
      title: "Copiado!",
      description: "Dados do QR Code copiados para a área de transferência",
    });
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${clients.find(c => c.id === selectedClientId)?.name || 'cliente'}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Gerar QR Code para Agente de Voz</span>
          </CardTitle>
          <CardDescription>
            Gere QR Codes para que os clientes configurem o agente de voz em seus dispositivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Cliente</label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateQRCode} 
            disabled={!selectedClientId || loading}
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="h-4 w-4 mr-2" />
            )}
            Gerar QR Code
          </Button>

          {/* QR Code Display */}
          {qrCodeUrl && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto"
                />
                <div className="mt-4 space-y-2">
                  <Badge variant="outline">
                    Cliente: {clients.find(c => c.id === selectedClientId)?.name}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    QR Code válido por 24 horas
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" onClick={copyQRData} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Dados
                </Button>
                <Button variant="outline" onClick={downloadQRCode} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Gere o QR Code</h4>
            <p className="text-sm text-muted-foreground">
              Selecione o cliente e clique em "Gerar QR Code"
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Envie para o cliente</h4>
            <p className="text-sm text-muted-foreground">
              Envie o QR Code por WhatsApp, email ou imprima
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Cliente escaneia</h4>
            <p className="text-sm text-muted-foreground">
              O cliente acessa o link e segue o processo de configuração
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">4. App instalado</h4>
            <p className="text-sm text-muted-foreground">
              Cliente terá acesso direto ao agente de voz pela tela inicial
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;