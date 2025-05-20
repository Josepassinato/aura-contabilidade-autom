
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { FileText, FilePlus2, RefreshCcw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProcuracaoEletronica {
  id: string;
  clienteId: string;
  tipo: 'receber-documentos' | 'assinar-documentos' | 'completa';
  dataEmissao: string;
  dataValidade: string;
  status: 'ativa' | 'pendente' | 'vencida' | 'cancelada';
  documentos: string[];
}

interface ProcuracoesEletronicasProps {
  clientId: string;
  clientName?: string;
}

export function ProcuracoesEletronicas({ clientId, clientName }: ProcuracoesEletronicasProps) {
  const [activeTab, setActiveTab] = useState("procuracoes");
  const [loading, setLoading] = useState(false);
  const [procuracoes, setProcuracoes] = useState<ProcuracaoEletronica[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'completa',
    duracao: '12'
  });

  // Simulação de carregamento das procurações eletrônicas
  useEffect(() => {
    if (clientId) {
      loadProcuracoes();
    }
  }, [clientId]);

  const loadProcuracoes = () => {
    // Simular carregamento de procurações
    setLoading(true);
    
    // Dados simulados para demonstração
    setTimeout(() => {
      const mockProcuracoes: ProcuracaoEletronica[] = [
        {
          id: '1',
          clienteId: clientId,
          tipo: 'completa',
          dataEmissao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dataValidade: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'ativa',
          documentos: ['IRPJ', 'COFINS', 'PIS', 'IPI']
        },
        {
          id: '2',
          clienteId: clientId,
          tipo: 'receber-documentos',
          dataEmissao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dataValidade: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'vencida',
          documentos: ['IRPJ', 'COFINS']
        }
      ];
      
      setProcuracoes(mockProcuracoes);
      setLoading(false);
    }, 1000);
  };

  const handleSolicitarProcuracao = async () => {
    setLoading(true);
    
    try {
      // Simulação de emissão de procuração eletrônica
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Adicionar nova procuração na lista
      const novaProcuracao: ProcuracaoEletronica = {
        id: Date.now().toString(),
        clienteId: clientId,
        tipo: formData.tipo as any,
        dataEmissao: new Date().toISOString().split('T')[0],
        dataValidade: new Date(Date.now() + parseInt(formData.duracao) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pendente',
        documentos: ['IRPJ', 'COFINS', 'PIS', 'CSLL']
      };
      
      setProcuracoes(prev => [...prev, novaProcuracao]);
      
      toast({
        title: "Procuração solicitada",
        description: "A procuração eletrônica foi solicitada com sucesso e está aguardando ativação."
      });
      
      // Alternar para a guia de procurações
      setActiveTab("procuracoes");
      
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Ativa</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'vencida':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" /> Vencida</Badge>;
      case 'cancelada':
        return <Badge className="bg-slate-500">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTipoDescricao = (tipo: string) => {
    switch (tipo) {
      case 'completa':
        return "Acesso Completo";
      case 'receber-documentos':
        return "Receber Documentos";
      case 'assinar-documentos':
        return "Assinar Documentos";
      default:
        return tipo;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Procurações Eletrônicas e-CAC
          {clientName && <span className="text-sm font-normal">- {clientName}</span>}
        </CardTitle>
        <CardDescription>
          Gerencie as procurações eletrônicas do e-CAC para este cliente
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="procuracoes">
              <FileText className="h-4 w-4 mr-2" />
              Procurações Existentes
            </TabsTrigger>
            <TabsTrigger value="nova">
              <FilePlus2 className="h-4 w-4 mr-2" />
              Nova Procuração
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="procuracoes" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">Carregando procurações...</p>
              </div>
            ) : procuracoes.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data de Emissão</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Documentos</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procuracoes.map((proc) => (
                      <TableRow key={proc.id}>
                        <TableCell>{getTipoDescricao(proc.tipo)}</TableCell>
                        <TableCell>{proc.dataEmissao}</TableCell>
                        <TableCell>{proc.dataValidade}</TableCell>
                        <TableCell>{getStatusBadge(proc.status)}</TableCell>
                        <TableCell>{proc.documentos.join(', ')}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Detalhes</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Sem procurações</h3>
                <p className="text-sm text-gray-500">Este cliente não possui procurações eletrônicas.</p>
                <Button className="mt-4" onClick={() => setActiveTab("nova")}>
                  Solicitar Procuração
                </Button>
              </div>
            )}
            
            {procuracoes.length > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={loadProcuracoes}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nova" className="space-y-6 mt-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-medium">Solicitar Nova Procuração Eletrônica</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os parâmetros da procuração eletrônica para o e-CAC
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tipo de Procuração</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="completa">Acesso Completo</option>
                    <option value="receber-documentos">Receber Documentos</option>
                    <option value="assinar-documentos">Assinar Documentos</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Defina o nível de acesso que a procuração concederá
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Duração (meses)</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.duracao}
                    onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                  >
                    <option value="6">6 meses</option>
                    <option value="12">1 ano</option>
                    <option value="24">2 anos</option>
                    <option value="36">3 anos</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Selecione por quanto tempo a procuração ficará ativa
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Certificado Digital</label>
                  <div className="flex items-center">
                    <Input type="file" className="flex-1" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione o certificado digital para assinar a procuração
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Senha do Certificado</label>
                  <Input type="password" placeholder="Digite a senha do certificado" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        {activeTab === "nova" ? (
          <div className="flex justify-end w-full">
            <Button variant="outline" className="mr-2" onClick={() => setActiveTab("procuracoes")}>
              Cancelar
            </Button>
            <Button onClick={handleSolicitarProcuracao} disabled={loading}>
              {loading ? "Processando..." : "Solicitar Procuração"}
            </Button>
          </div>
        ) : (
          <div className="flex w-full justify-end">
            <Button variant="outline" onClick={() => setActiveTab("nova")}>
              Nova Procuração
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
