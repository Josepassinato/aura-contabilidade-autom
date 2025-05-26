import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { 
  ScrollText, 
  Loader2, 
  ChevronDown, 
  ChevronRight, 
  Gavel,
  Calendar,
  User,
  Shield
} from "lucide-react";
import { fetchCertificadosDigitais, CertificadoDigital } from "@/services/governamental/certificadosDigitaisService";
import { 
  emitirProcuracao, 
  fetchProcuracoes, 
  validarProcuracao 
} from "@/services/governamental/procuracaoService/procuracaoService";
import { ProcuracaoEletronica } from "@/services/governamental/procuracaoService/types";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Serviços autorizados que podem ser selecionados
const servicosDisponiveis = [
  { id: "declaracoes", label: "Consulta a Declarações e Demonstrativos" },
  { id: "arrecadacao", label: "Acompanhamento da Arrecadação" },
  { id: "certidoes", label: "Solicitação de Certidões" },
  { id: "parcelamentos", label: "Parcelamentos" },
  { id: "processos", label: "Consulta a Processos" },
  { id: "pagamentos", label: "Consulta a Pagamentos" },
  { id: "esocial", label: "eSocial" },
  { id: "consultas", label: "Consultas Básicas" },
];

// Schema de validação do formulário
const formSchema = z.object({
  certificadoId: z.string().min(1, {
    message: "Selecione um certificado digital",
  }),
  procuradorCpf: z.string().min(11, {
    message: "CPF do procurador é obrigatório",
  }),
  procuradorNome: z.string().min(3, {
    message: "Nome do procurador é obrigatório",
  }),
  servicosAutorizados: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um serviço",
  }),
  validadeDias: z.number().min(30).max(365),
});

interface ProcuracaoEletronicaFormProps {
  clientId: string;
  clientName?: string;
}

export function ProcuracaoEletronicaForm({ clientId, clientName }: ProcuracaoEletronicaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificados, setCertificados] = useState<CertificadoDigital[]>([]);
  const [isLoadingCertificados, setIsLoadingCertificados] = useState(false);
  const [procuracoes, setProcuracoes] = useState<ProcuracaoEletronica[]>([]);
  const [isLoadingProcuracoes, setIsLoadingProcuracoes] = useState(false);
  const [expandedProcuracaoId, setExpandedProcuracaoId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificadoId: "",
      procuradorCpf: "",
      procuradorNome: "",
      servicosAutorizados: [],
      validadeDias: 180,
    },
  });

  // Buscar certificados digitais do cliente
  useEffect(() => {
    const loadCertificados = async () => {
      if (!clientId) return;

      setIsLoadingCertificados(true);
      try {
        const response = await fetchCertificadosDigitais(clientId);
        if (response.success && response.data) {
          setCertificados(response.data);
        } else {
          toast({
            title: "Erro ao carregar certificados",
            description: response.error || "Não foi possível carregar os certificados do cliente",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar certificados:", error);
      } finally {
        setIsLoadingCertificados(false);
      }
    };

    loadCertificados();
  }, [clientId]);

  // Buscar procurações existentes
  useEffect(() => {
    const loadProcuracoes = async () => {
      if (!clientId) return;

      setIsLoadingProcuracoes(true);
      try {
        const response = await fetchProcuracoes(clientId);
        if (response.success && response.data) {
          setProcuracoes(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          console.error("Erro ao buscar procurações:", response.error);
        }
      } catch (error) {
        console.error("Erro ao buscar procurações:", error);
      } finally {
        setIsLoadingProcuracoes(false);
      }
    };

    loadProcuracoes();
  }, [clientId]);

  // Formatar CPF para exibição
  const formatCpf = (cpf: string) => {
    if (!cpf) return "";
    cpf = cpf.replace(/\D/g, "");
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Tratar CPF ao digitar
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    form.setValue("procuradorCpf", value);
  };

  // Função para lidar com a seleção de serviços
  const toggleServico = (checked: boolean, servicoId: string) => {
    const currentServicos = form.watch("servicosAutorizados");
    
    if (checked) {
      form.setValue("servicosAutorizados", [...currentServicos, servicoId]);
    } else {
      form.setValue(
        "servicosAutorizados",
        currentServicos.filter((id) => id !== servicoId)
      );
    }
  };

  // Lidar com o envio do formulário
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!clientId) {
      toast({
        title: "Erro de validação",
        description: "ID do cliente não encontrado",
        variant: "destructive",
      });
      return;
    }

    // Validar se clientId é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clientId)) {
      toast({
        title: "Erro de validação",
        description: "ID do cliente deve ser um UUID válido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Dados para emissão de procuração:', {
        client_id: clientId,
        certificado_id: data.certificadoId,
        procurador_cpf: data.procuradorCpf,
        procurador_nome: data.procuradorNome,
        servicos_autorizados: data.servicosAutorizados,
        validade_dias: data.validadeDias
      });

      const response = await emitirProcuracao({
        client_id: clientId,
        certificado_id: data.certificadoId,
        procurador_cpf: data.procuradorCpf,
        procurador_nome: data.procuradorNome,
        servicos_autorizados: data.servicosAutorizados,
        validade_dias: data.validadeDias
      });

      if (response.success) {
        toast({
          title: "Procuração iniciada",
          description: "O processo de emissão da procuração foi iniciado com sucesso",
        });

        // Adicionar procuração à lista ou atualizar se já existente
        if (response.data) {
          setProcuracoes((prev) => {
            const procuracao = response.data as ProcuracaoEletronica;
            const index = prev.findIndex((p) => p.id === procuracao.id);
            
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = procuracao;
              return updated;
            }
            
            return [procuracao, ...prev];
          });
        }

        // Resetar formulário
        form.reset({
          certificadoId: "",
          procuradorCpf: "",
          procuradorNome: "",
          servicosAutorizados: [],
          validadeDias: 180,
        });
      } else {
        toast({
          title: "Erro na emissão",
          description: response.error || "Não foi possível emitir a procuração",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro ao emitir procuração:', error);
      toast({
        title: "Erro na emissão",
        description: error.message || "Ocorreu um erro ao emitir a procuração",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validar procuração
  const handleValidarProcuracao = async (id: string) => {
    try {
      const response = await validarProcuracao(id);

      toast({
        title: `Procuração ${response.status === 'valida' ? 'Válida' : 'Inválida'}`,
        description: response.message,
        variant: response.status === 'valida' ? 'default' : 'destructive',
      });
    } catch (error: any) {
      toast({
        title: "Erro na validação",
        description: error.message || "Não foi possível validar a procuração",
        variant: "destructive",
      });
    }
  };

  // Função para obter a classe CSS do status
  const getStatusBadgeClass = (status: ProcuracaoEletronica['status']) => {
    switch (status) {
      case 'emitida':
        return "bg-green-100 text-green-800";
      case 'pendente':
        return "bg-yellow-100 text-yellow-800";
      case 'expirada':
        return "bg-gray-100 text-gray-800";
      case 'cancelada':
        return "bg-red-100 text-red-800";
      case 'erro':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            <CardTitle>Procurações Eletrônicas</CardTitle>
          </div>
          <CardDescription>
            Emissão e gerenciamento de procurações eletrônicas para o e-CAC
            {clientName ? ` de ${clientName}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="certificadoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificado Digital</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoadingCertificados}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um certificado digital" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCertificados ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Carregando certificados...</span>
                          </div>
                        ) : certificados.length === 0 ? (
                          <div className="p-2 text-center text-sm text-gray-500">
                            Nenhum certificado digital cadastrado
                          </div>
                        ) : (
                          certificados.map((cert) => (
                            <SelectItem key={cert.id} value={cert.id || ""}>
                              {cert.nome} ({cert.tipo})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o certificado digital que será utilizado para emitir a procuração
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="procuradorCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Procurador</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o CPF do procurador"
                          value={field.value}
                          onChange={handleCpfChange}
                          maxLength={11}
                        />
                      </FormControl>
                      <FormDescription>
                        CPF sem pontos ou traços
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="procuradorNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Procurador</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome completo do procurador" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Nome completo como consta no CPF
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="validadeDias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade (dias)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <Input 
                          type="number" 
                          min="30"
                          max="365"
                          className="w-32"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                        <div className="flex space-x-2">
                          {[30, 90, 180, 365].map((dias) => (
                            <Button 
                              key={dias} 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => form.setValue("validadeDias", dias)}
                            >
                              {dias} dias
                            </Button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Período de validade da procuração (entre 30 e 365 dias)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="block mb-2">Serviços Autorizados</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {servicosDisponiveis.map((servico) => (
                    <div key={servico.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`servico-${servico.id}`} 
                        onCheckedChange={(checked) => 
                          toggleServico(checked === true, servico.id)
                        }
                        checked={form.watch("servicosAutorizados").includes(servico.id)}
                      />
                      <label
                        htmlFor={`servico-${servico.id}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {servico.label}
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.servicosAutorizados && (
                  <p className="text-sm font-medium text-red-500 mt-2">
                    {form.formState.errors.servicosAutorizados.message}
                  </p>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={form.handleSubmit(handleSubmit)} 
            disabled={isSubmitting || !form.formState.isValid}
            className="ml-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Emitindo...
              </>
            ) : (
              <>
                <ScrollText className="mr-2 h-4 w-4" />
                Emitir Procuração
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Lista de Procurações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              <CardTitle>Procurações Existentes</CardTitle>
            </div>
            {isLoadingProcuracoes && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProcuracoes ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Carregando procurações...</p>
            </div>
          ) : procuracoes.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <ScrollText className="h-10 w-10 mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Nenhuma procuração emitida</p>
            </div>
          ) : (
            <div className="space-y-4">
              {procuracoes.map((procuracao) => (
                <div 
                  key={procuracao.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedProcuracaoId(
                      expandedProcuracaoId === procuracao.id ? null : procuracao.id
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-none">
                        {expandedProcuracaoId === procuracao.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{procuracao.procurador_nome}</p>
                        <p className="text-sm text-gray-500">CPF: {formatCpf(procuracao.procurador_cpf)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span 
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusBadgeClass(procuracao.status)
                        )}
                      >
                        {procuracao.status === 'emitida' && 'Ativa'}
                        {procuracao.status === 'pendente' && 'Pendente'}
                        {procuracao.status === 'expirada' && 'Expirada'}
                        {procuracao.status === 'cancelada' && 'Cancelada'}
                        {procuracao.status === 'erro' && 'Erro'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidarProcuracao(procuracao.id!);
                        }}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Validar
                      </Button>
                    </div>
                  </div>

                  {expandedProcuracaoId === procuracao.id && (
                    <div className="border-t p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium flex items-center mb-2">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            Procurador
                          </h4>
                          <p className="text-sm">{procuracao.procurador_nome}</p>
                          <p className="text-sm text-gray-500">CPF: {formatCpf(procuracao.procurador_cpf)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium flex items-center mb-2">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            Datas
                          </h4>
                          <p className="text-sm">
                            <span className="text-gray-500">Emissão:</span>{" "}
                            {procuracao.data_emissao 
                              ? format(new Date(procuracao.data_emissao), "dd/MM/yyyy", { locale: ptBR })
                              : "Pendente"
                            }
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Validade:</span>{" "}
                            {procuracao.data_validade 
                              ? format(new Date(procuracao.data_validade), "dd/MM/yyyy", { locale: ptBR })
                              : "Não definida"
                            }
                            {procuracao.data_validade && new Date(procuracao.data_validade) > new Date() && (
                              <span className="text-green-600 text-xs ml-1">
                                (Válida por mais {
                                  formatDistanceToNow(new Date(procuracao.data_validade), { 
                                    locale: ptBR,
                                    addSuffix: false
                                  })
                                })
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Serviços Autorizados</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {procuracao.servicos_autorizados.map((servicoId) => {
                            const servico = servicosDisponiveis.find(s => s.id === servicoId);
                            return (
                              <div key={servicoId} className="text-sm flex items-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                                {servico ? servico.label : servicoId}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {procuracao.log_processamento && procuracao.log_processamento.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Log de Processamento</h4>
                          <div className="bg-gray-100 rounded-md p-2 max-h-40 overflow-y-auto text-xs">
                            {procuracao.log_processamento.map((log, index) => {
                              try {
                                const parsedLog = JSON.parse(log);
                                return (
                                  <div key={index} className="mb-1">
                                    <span className="text-gray-500">
                                      {parsedLog.timestamp ? format(new Date(parsedLog.timestamp), "HH:mm:ss") : ""} -
                                    </span>{" "}
                                    <span className="font-medium">{parsedLog.acao}</span>:{" "}
                                    {parsedLog.resultado}
                                  </div>
                                );
                              } catch {
                                return (
                                  <div key={index} className="mb-1">{log}</div>
                                );
                              }
                            })}
                          </div>
                        </div>
                      )}

                      {procuracao.comprovante_url && (
                        <div className="mt-4">
                          <Button variant="secondary" size="sm">
                            <ScrollText className="h-4 w-4 mr-2" />
                            Baixar Comprovante
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
