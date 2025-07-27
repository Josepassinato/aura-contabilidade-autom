
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Copy, Link2, Send, Share2 } from "lucide-react";
import { criarLinkCompartilhado, gerarUrlChatIA } from "@/services/chatia/linkCompartilhado";
import { logger } from "@/utils/logger";

interface CompartilharLinkClienteProps {
  clienteId: string;
  clienteNome: string;
  escritorioId: string;
}

export const CompartilharLinkCliente: React.FC<CompartilharLinkClienteProps> = ({
  clienteId,
  clienteNome,
  escritorioId
}) => {
  const [diasValidade, setDiasValidade] = useState(30);
  const [permissoes, setPermissoes] = useState({
    acessoRelatorios: true,
    acessoGuias: true,
    acessoCertidoes: true,
    acessoDadosEmpresa: true
  });
  const [envioPorEmail, setEnvioPorEmail] = useState(false);
  const [emailCliente, setEmailCliente] = useState('');
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  
  const handleCriarLink = () => {
    try {
      const link = criarLinkCompartilhado(
        clienteId,
        clienteNome,
        escritorioId,
        diasValidade,
        permissoes
      );
      
      const url = gerarUrlChatIA(link.id);
      setLinkGerado(url);
      
      // Se a opção de envio por email estiver ativa
      if (envioPorEmail && emailCliente) {
        // Simulação de envio de email
        logger.info(`Enviando link para ${emailCliente}: ${url}`, undefined, "CompartilharLinkCliente");
        setTimeout(() => {
          toast({
            title: 'Link enviado por email',
            description: `O link de acesso foi enviado para ${emailCliente}`,
          });
        }, 1500);
      }
    } catch (error) {
      logger.error('Erro ao criar link compartilhado:', error, "CompartilharLinkCliente");
    }
  };
  
  const copiarLink = () => {
    if (!linkGerado) return;
    
    navigator.clipboard.writeText(linkGerado).then(() => {
      toast({
        title: 'Link copiado',
        description: 'O link foi copiado para a área de transferência',
      });
    }).catch(err => {
      logger.error('Erro ao copiar link:', err, "CompartilharLinkCliente");
      toast({
        title: 'Erro ao copiar link',
        description: 'Não foi possível copiar o link',
        variant: 'destructive'
      });
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Compartilhar Acesso com Cliente
        </CardTitle>
        <CardDescription>
          Gere um link para que o cliente {clienteNome} possa acessar o Chat IA e seus documentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="diasValidade">Validade do Link</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="diasValidade" 
              type="number" 
              min={1} 
              max={365} 
              value={diasValidade} 
              onChange={(e) => setDiasValidade(parseInt(e.target.value) || 30)} 
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">dias</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Permissões de Acesso</Label>
          <div className="space-y-2 ml-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="relatorios" 
                checked={permissoes.acessoRelatorios}
                onCheckedChange={(checked) => 
                  setPermissoes({...permissoes, acessoRelatorios: !!checked})
                }
              />
              <label htmlFor="relatorios" className="text-sm">Acesso a relatórios financeiros</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="guias" 
                checked={permissoes.acessoGuias}
                onCheckedChange={(checked) => 
                  setPermissoes({...permissoes, acessoGuias: !!checked})
                }
              />
              <label htmlFor="guias" className="text-sm">Acesso a guias de pagamento</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="certidoes" 
                checked={permissoes.acessoCertidoes}
                onCheckedChange={(checked) => 
                  setPermissoes({...permissoes, acessoCertidoes: !!checked})
                }
              />
              <label htmlFor="certidoes" className="text-sm">Acesso a certidões</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dadosEmpresa" 
                checked={permissoes.acessoDadosEmpresa}
                onCheckedChange={(checked) => 
                  setPermissoes({...permissoes, acessoDadosEmpresa: !!checked})
                }
              />
              <label htmlFor="dadosEmpresa" className="text-sm">Acesso a dados da empresa</label>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="envioPorEmail" className="cursor-pointer">Enviar link por email</Label>
            <Switch 
              id="envioPorEmail" 
              checked={envioPorEmail}
              onCheckedChange={setEnvioPorEmail}
            />
          </div>
          
          {envioPorEmail && (
            <div className="mt-2">
              <Label htmlFor="emailCliente">Email do Cliente</Label>
              <Input 
                id="emailCliente" 
                type="email" 
                placeholder="cliente@empresa.com" 
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        {linkGerado && (
          <div className="mt-4 pt-4 border-t">
            <Label>Link Gerado</Label>
            <div className="flex gap-2 mt-1">
              <Input value={linkGerado} readOnly className="flex-1" />
              <Button variant="outline" size="icon" onClick={copiarLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleCriarLink} className="gap-2">
          {linkGerado ? <Link2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {linkGerado ? 'Gerar Novo Link' : 'Gerar Link de Acesso'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompartilharLinkCliente;
