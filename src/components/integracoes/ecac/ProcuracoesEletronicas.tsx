import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { FileText, FilePlus2, RefreshCcw, CheckCircle, AlertCircle, Clock, Shield, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  fetchProcuracoes, 
  emitirProcuracao, 
  validarProcuracao,
  cancelarProcuracao,
  cadastrarProcuracaoExistente
} from "@/services/governamental/procuracaoService/procuracaoService";
import { ProcuracaoEletronica } from "@/services/governamental/procuracaoService/types";
import { fetchCertificadosDigitais } from "@/services/governamental/certificadosDigitaisService";
import { Loader2 } from "lucide-react";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcuracoesEletronicasProps {
  clientId: string;
  clientName?: string;
}

export function ProcuracoesEletronicas({ clientId, clientName }: ProcuracoesEletronicasProps) {
  const [activeTab, setActiveTab] = useState("procuracoes");
  const [loading, setLoading] = useState(false);
  const [procuracoes, setProcuracoes] = useState<ProcuracaoEletronica[]>([]);
  const [loadingCertificados, setLoadingCertificados] = useState(false);
  const [certificados, setCertificados] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'completa',
    duracao: '180',
    certificadoId: '',
    procuradorNome: '',
    procuradorCpf: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Novo estado para o formulário de cadastro manual
  const [cadastroManualForm, setCadastroManualForm] = useState({
    procuradorNome: '',
    procuradorCpf: '',
    procuracaoNumero: '',
    dataEmissao: format(new Date(), 'yyyy-MM-dd'),
    dataValidade: format(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    servicos: [] as string[],
    certificadoId: ''
  });

  // Carregar procurações do cliente
  useEffect(() => {
    if (clientId) {
      loadProcuracoes();
      loadCertificados();
    }
  }, [clientId]);

  const loadProcuracoes = async () => {
    setLoading(true);
    try {
      const response = await fetchProcuracoes(clientId);
      if (response.success && response.data) {
        // Garantir que os dados sejam sempre um array
        const procuracoesData = Array.isArray(response.data) ? response.data : [response.data];
        setProcuracoes(procuracoesData);
      } else {
        toast({
          title: "Erro ao carregar procurações",
          description: response.error || "Não foi possível carregar as procurações eletrônicas",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar procurações:", error);
      toast({
        title: "Erro ao carregar procurações",
        description: error.message || "Ocorreu um erro ao carregar as procurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCertificados = async () => {
    setLoadingCertificados(true);
    try {
      const response = await fetchCertificadosDigitais(clientId);
      if (response.success && response.data) {
        setCertificados(response.data);
      } else {
        toast({
          title: "Erro ao carregar certificados",
          description: response.error || "Não foi possível carregar os certificados do cliente",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar certificados:", error);
    } finally {
      setLoadingCertificados(false);
    }
  };

  const handleSolicitarProcuracao = async () => {
    if (!formData.certificadoId) {
      toast({
        title: "Certificado não selecionado",
        description: "Selecione um certificado digital para continuar",
        variant: "destructive"
      });
      return;
    }

    if (!formData.procuradorCpf || !formData.procuradorNome) {
      toast({
        title: "Dados incompletos",
        description: "Preencha os dados do procurador",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mapear os serviços autorizados baseado no tipo selecionado
      let servicosAutorizados: string[] = [];
      switch(formData.tipo) {
        case 'completa':
          servicosAutorizados = ['declaracoes', 'arrecadacao', 'certidoes', 'parcelamentos', 'processos', 'pagamentos', 'esocial', 'consultas'];
          break;
        case 'receber-documentos':
          servicosAutorizados = ['declaracoes', 'certidoes', 'consultas'];
          break;
        case 'assinar-documentos':
          servicosAutorizados = ['declaracoes', 'parcelamentos', 'consultas'];
          break;
      }

      const response = await emitirProcuracao({
        client_id: clientId,
        certificado_id: formData.certificadoId,
        procurador_cpf: formData.procuradorCpf,
        procurador_nome: formData.procuradorNome,
        servicos_autorizados: servicosAutorizados,
        validade_dias: parseInt(formData.duracao)
      });
      
      if (response.success) {
        toast({
          title: "Procuração solicitada",
          description: "A procuração eletrônica foi solicitada com sucesso e está aguardando ativação."
        });
        
        // Alternar para a guia de procurações e recarregar a lista
        setActiveTab("procuracoes");
        loadProcuracoes();
        
        // Resetar o formulário
        setFormData({
          tipo: 'completa',
          duracao: '180',
          certificadoId: '',
          procuradorNome: '',
          procuradorCpf: ''
        });
      } else {
        toast({
          title: "Erro ao solicitar procuração",
          description: response.error || "Não foi possível solicitar a procuração eletrônica",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao solicitar procuração:", error);
      toast({
        title: "Erro ao solicitar procuração",
        description: error.message || "Ocorreu um erro ao solicitar a procuração",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidarProcuracao = async (procuracaoId: string) => {
    try {
      const response = await validarProcuracao(procuracaoId);
      
      toast({
        title: `Status da Procuração: ${response.status}`,
        description: response.message,
        variant: response.status === 'valida' ? 'default' : 'destructive'
      });
      
      // Recarregar a lista de procurações para atualizar o status
      loadProcuracoes();
    } catch (error: any) {
      console.error("Erro ao validar procuração:", error);
      toast({
        title: "Erro ao validar procuração",
        description: error.message || "Ocorreu um erro ao validar a procuração",
        variant: "destructive"
      });
    }
  };

  const handleCancelarProcuracao = async (procuracaoId: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta procuração?")) {
      return;
    }
    
    try {
      const response = await cancelarProcuracao(procuracaoId, "Cancelado pelo usuário");
      
      if (response.success) {
        toast({
          title: "Procuração cancelada",
          description: "A procuração foi cancelada com sucesso"
        });
        
        // Recarregar a lista de procurações
        loadProcuracoes();
      } else {
        toast({
          title: "Erro ao cancelar procuração",
          description: response.error || "Não foi possível cancelar a procuração",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao cancelar procuração:", error);
      toast({
        title: "Erro ao cancelar procuração",
        description: error.message || "Ocorreu um erro ao cancelar a procuração",
        variant: "destructive"
      });
    }
  };

  const handleCadastrarProcuracaoExistente = async () => {
    if (!cadastroManualForm.procuradorNome || !cadastroManualForm.procuradorCpf || !cadastroManualForm.procuracaoNumero) {
      toast({
        title: "Dados incompletos",
        description: "Preencha os dados obrigatórios da procuração",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mapear os serviços selecionados
      let servicosAutorizados: string[] = [];
      
      if (cadastroManualForm.servicos.includes('completa')) {
        servicosAutorizados = ['declaracoes', 'arrecadacao', 'certidoes', 'parcelamentos', 'processos', 'pagamentos', 'esocial', 'consultas'];
      } else {
        if (cadastroManualForm.servicos.includes('declaracoes')) servicosAutorizados.push('declaracoes');
        if (cadastroManualForm.servicos.includes('arrecadacao')) servicosAutorizados.push('arrecadacao');
        if (cadastroManualForm.servicos.includes('certidoes')) servicosAutorizados.push('certidoes');
        if (cadastroManualForm.servicos.includes('parcelamentos')) servicosAutorizados.push('parcelamentos');
        if (cadastroManualForm.servicos.includes('processos')) servicosAutorizados.push('processos');
        if (cadastroManualForm.servicos.includes('pagamentos')) servicosAutorizados.push('pagamentos');
        if (cadastroManualForm.servicos.includes('esocial')) servicosAutorizados.push('esocial');
        if (cadastroManualForm.servicos.includes('consultas')) servicosAutorizados.push('consultas');
      }

      // Certifique-se de que o CPF é tratado como string
      const response = await cadastrarProcuracaoExistente({
        client_id: clientId,
        procurador_cpf: cadastroManualForm.procuradorCpf.toString(),
        procurador_nome: cadastroManualForm.procuradorNome,
        procuracao_numero: cadastroManualForm.procuracaoNumero,
        data_emissao: new Date(cadastroManualForm.dataEmissao).toISOString(),
        data_validade: new Date(cadastroManualForm.dataValidade).toISOString(),
        servicos_autorizados: servicosAutorizados,
        certificado_id: cadastroManualForm.certificadoId || undefined,
        status: 'emitida'
      });
      
      if (response.success) {
        toast({
          title: "Procuração cadastrada",
          description: "A procuração existente foi cadastrada com sucesso."
        });
        
        // Alternar para a guia de procurações e recarregar a lista
        setActiveTab("procuracoes");
        loadProcuracoes();
        
        // Resetar o formulário
        setCadastroManualForm({
          procuradorNome: '',
          procuradorCpf: '',
          procuracaoNumero: '',
          dataEmissao: format(new Date(), 'yyyy-MM-dd'),
          dataValidade: format(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          servicos: [],
          certificadoId: ''
        });
      } else {
        toast({
          title: "Erro ao cadastrar procuração",
          description: response.error || "Não foi possível cadastrar a procuração eletrônica",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar procuração:", error);
      toast({
        title: "Erro ao cadastrar procuração",
        description: error.message || "Ocorreu um erro ao cadastrar a procuração",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'emitida':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Ativa</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'expirada':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" /> Vencida</Badge>;
      case 'cancelada':
        return <Badge className="bg-slate-500">Cancelada</Badge>;
      case 'erro':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" /> Erro</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTipoDescricao = (servicosAutorizados: string[]) => {
    if (!servicosAutorizados || servicosAutorizados.length === 0) {
      return "Não especificado";
    }
    
    const allServices = ['declaracoes', 'arrecadacao', 'certidoes', 'parcelamentos', 'processos', 'pagamentos', 'esocial', 'consultas'];
    const containsAll = allServices.every(service => servicosAutorizados.includes(service));
    
    if (containsAll) {
      return "Acesso Completo";
    } else if (servicosAutorizados.includes('declaracoes') && servicosAutorizados.includes('certidoes')) {
      return "Receber Documentos";
    } else if (servicosAutorizados.includes('declaracoes') && servicosAutorizados.includes('parcelamentos')) {
      return "Assinar Documentos";
    } else {
      return "Acesso Parcial";
    }
  };

  const formatCpf = (cpf: string) => {
    if (!cpf) return "";
    cpf = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    try {
      return isPast(new Date(dateString));
    } catch (e) {
      return false;
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
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="procuracoes">
              <FileText className="h-4 w-4 mr-2" />
              Procurações Existentes
            </TabsTrigger>
            <TabsTrigger value="nova">
              <FilePlus2 className="h-4 w-4 mr-2" />
              Solicitar Nova
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FileCheck className="h-4 w-4 mr-2" />
              Cadastrar Existente
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="procuracoes" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Carregando procurações...</p>
              </div>
            ) : procuracoes.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Procurador</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procuracoes.map((proc) => (
                      <TableRow key={proc.id} className={isExpired(proc.data_validade) ? "bg-gray-50" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{proc.procurador_nome}</p>
                            <p className="text-xs text-muted-foreground">{formatCpf(proc.procurador_cpf)}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTipoDescricao(proc.servicos_autorizados)}</TableCell>
                        <TableCell>{formatDate(proc.data_emissao)}</TableCell>
                        <TableCell>
                          <div className={isExpired(proc.data_validade) ? "text-red-500" : ""}>
                            {formatDate(proc.data_validade)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(proc.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleValidarProcuracao(proc.id!)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Validar
                            </Button>
                            {(proc.status === 'emitida' || proc.status === 'pendente') && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleCancelarProcuracao(proc.id!)}
                              >
                                Cancelar
                              </Button>
                            )}
                          </div>
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
                  <label className="text-sm font-medium">Duração (dias)</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.duracao}
                    onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                  >
                    <option value="30">30 dias</option>
                    <option value="90">90 dias</option>
                    <option value="180">180 dias</option>
                    <option value="365">365 dias</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Selecione por quanto tempo a procuração ficará ativa
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Certificado Digital</label>
                  {loadingCertificados ? (
                    <div className="flex items-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Carregando certificados...</span>
                    </div>
                  ) : certificados.length > 0 ? (
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={formData.certificadoId}
                      onChange={(e) => setFormData({...formData, certificadoId: e.target.value})}
                    >
                      <option value="">Selecione um certificado</option>
                      {certificados.map(cert => (
                        <option key={cert.id} value={cert.id}>
                          {cert.nome} ({cert.tipo}) - Válido até: {formatDate(cert.valido_ate)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 border rounded-md bg-yellow-50 text-yellow-700">
                      Nenhum certificado digital cadastrado para este cliente.
                      Cadastre um certificado digital antes de solicitar uma procuração.
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Selecione o certificado digital para assinar a procuração
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nome do Procurador</label>
                  <Input 
                    type="text" 
                    placeholder="Nome completo do procurador" 
                    value={formData.procuradorNome}
                    onChange={(e) => setFormData({...formData, procuradorNome: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome completo do procurador (como consta no CPF)
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">CPF do Procurador</label>
                  <Input 
                    type="text" 
                    placeholder="CPF do procurador (somente números)" 
                    value={formData.procuradorCpf}
                    onChange={(e) => {
                      // Aceitar apenas números
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({...formData, procuradorCpf: value});
                    }}
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite apenas números (sem pontos ou traços)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-6 mt-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-medium">Cadastrar Procuração Existente</h3>
                <p className="text-sm text-muted-foreground">
                  Cadastre uma procuração eletrônica que já foi emitida e está em sua posse
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Número da Procuração</label>
                  <Input 
                    type="text" 
                    placeholder="Digite o número da procuração" 
                    value={cadastroManualForm.procuracaoNumero}
                    onChange={(e) => setCadastroManualForm({...cadastroManualForm, procuracaoNumero: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número oficial da procuração emitida pelo sistema e-CAC
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Data de Emissão</label>
                    <Input 
                      type="date" 
                      value={cadastroManualForm.dataEmissao}
                      onChange={(e) => setCadastroManualForm({...cadastroManualForm, dataEmissao: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Data de Validade</label>
                    <Input 
                      type="date" 
                      value={cadastroManualForm.dataValidade}
                      onChange={(e) => setCadastroManualForm({...cadastroManualForm, dataValidade: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nome do Procurador</label>
                    <Input 
                      type="text" 
                      placeholder="Nome completo do procurador" 
                      value={cadastroManualForm.procuradorNome}
                      onChange={(e) => setCadastroManualForm({...cadastroManualForm, procuradorNome: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">CPF do Procurador</label>
                    <Input 
                      type="text" 
                      placeholder="CPF do procurador (somente números)" 
                      value={cadastroManualForm.procuradorCpf}
                      onChange={(e) => {
                        // Aceitar apenas números
                        const value = e.target.value.replace(/\D/g, "");
                        setCadastroManualForm({...cadastroManualForm, procuradorCpf: value});
                      }}
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite apenas números (sem pontos ou traços)
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Certificado Digital (Opcional)</label>
                  {loadingCertificados ? (
                    <div className="flex items-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Carregando certificados...</span>
                    </div>
                  ) : certificados.length > 0 ? (
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={cadastroManualForm.certificadoId}
                      onChange={(e) => setCadastroManualForm({...cadastroManualForm, certificadoId: e.target.value})}
                    >
                      <option value="">Selecione um certificado (opcional)</option>
                      {certificados.map(cert => (
                        <option key={cert.id} value={cert.id}>
                          {cert.nome} ({cert.tipo}) - Válido até: {formatDate(cert.valido_ate)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 border rounded-md bg-yellow-50 text-yellow-700">
                      Nenhum certificado digital cadastrado para este cliente.
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Selecione o certificado digital associado à procuração (opcional)
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Serviços Autorizados</label>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="servico-completa"
                        checked={cadastroManualForm.servicos.includes('completa')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCadastroManualForm({
                              ...cadastroManualForm, 
                              servicos: ['completa']
                            });
                          } else {
                            setCadastroManualForm({
                              ...cadastroManualForm, 
                              servicos: []
                            });
                          }
                        }}
                      />
                      <label htmlFor="servico-completa">Acesso Completo (todos os serviços)</label>
                    </div>
                    
                    {!cadastroManualForm.servicos.includes('completa') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4 mt-2">
                        {[
                          { id: 'declaracoes', label: 'Consulta a Declarações' },
                          { id: 'arrecadacao', label: 'Acompanhamento da Arrecadação' },
                          { id: 'certidoes', label: 'Solicitação de Certidões' },
                          { id: 'parcelamentos', label: 'Parcelamentos' },
                          { id: 'processos', label: 'Consulta a Processos' },
                          { id: 'pagamentos', label: 'Consulta a Pagamentos' },
                          { id: 'esocial', label: 'eSocial' },
                          { id: 'consultas', label: 'Consultas Básicas' }
                        ].map(servico => (
                          <div key={servico.id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`servico-${servico.id}`}
                              checked={cadastroManualForm.servicos.includes(servico.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCadastroManualForm({
                                    ...cadastroManualForm, 
                                    servicos: [...cadastroManualForm.servicos, servico.id]
                                  });
                                } else {
                                  setCadastroManualForm({
                                    ...cadastroManualForm, 
                                    servicos: cadastroManualForm.servicos.filter(s => s !== servico.id)
                                  });
                                }
                              }}
                            />
                            <label htmlFor={`servico-${servico.id}`}>{servico.label}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
            <Button 
              onClick={handleSolicitarProcuracao} 
              disabled={isSubmitting || !formData.certificadoId || !formData.procuradorNome || !formData.procuradorCpf}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Solicitar Procuração"
              )}
            </Button>
          </div>
        ) : activeTab === "manual" ? (
          <div className="flex justify-end w-full">
            <Button variant="outline" className="mr-2" onClick={() => setActiveTab("procuracoes")}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCadastrarProcuracaoExistente} 
              disabled={isSubmitting || !cadastroManualForm.procuracaoNumero || !cadastroManualForm.procuradorNome || !cadastroManualForm.procuradorCpf}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Cadastrar Procuração"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex w-full justify-end">
            <Button variant="outline" onClick={() => setActiveTab("nova")} className="mr-2">
              Solicitar Nova
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("manual")}>
              Cadastrar Existente
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
