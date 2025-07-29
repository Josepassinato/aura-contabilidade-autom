import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Settings, 
  Copy, 
  ExternalLink,
  Clock,
  Shield,
  Mic,
  Volume2,
  Users,
  MessageSquare,
  Calendar,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/utils/logger";

interface VoiceToken {
  id: string;
  token: string;
  description: string;
  client_id: string;
  client_name: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface VoiceAgentConfig {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  language: 'pt-BR' | 'en-US';
  response_length: 'short' | 'medium' | 'detailed';
  permissions: string[];
  working_hours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  auto_escalation: boolean;
  conversation_timeout: number;
}

const defaultConfig: VoiceAgentConfig = {
  voice: 'nova',
  language: 'pt-BR',
  response_length: 'short',
  permissions: ['obligations', 'taxes', 'deadlines'],
  working_hours: {
    enabled: true,
    start: '08:00',
    end: '18:00',
    timezone: 'America/Sao_Paulo'
  },
  auto_escalation: true,
  conversation_timeout: 30
};

const availablePermissions = [
  { id: 'obligations', label: 'Consultar Obrigações', description: 'Vencimentos e prazos fiscais' },
  { id: 'taxes', label: 'Informações Tributárias', description: 'DAS, impostos e regimes' },
  { id: 'deadlines', label: 'Prazos e Calendário', description: 'Datas importantes e lembretes' },
  { id: 'documents', label: 'Documentos', description: 'Status de documentos enviados' },
  { id: 'meetings', label: 'Agendamentos', description: 'Solicitar reuniões com contador' },
  { id: 'calculations', label: 'Cálculos Básicos', description: 'Simulações simples de impostos' }
];

export function VoiceAgentConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<VoiceAgentConfig>(defaultConfig);
  const [tokens, setTokens] = useState<VoiceToken[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadVoiceTokens(),
        loadClients(),
        loadConfig()
      ]);
    } catch (error) {
      logger.error('Erro ao carregar dados:', error, 'VoiceAgentConfig');
    } finally {
      setLoading(false);
    }
  };

  const loadVoiceTokens = async () => {
    const { data, error } = await supabase
      .from('client_access_tokens')
      .select(`
        *,
        accounting_clients (name)
      `)
      .eq('description', 'voice_agent')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Erro ao carregar tokens:', error, 'VoiceAgentConfig');
      return;
    }

    setTokens((data || []).map(token => ({
      ...token,
      client_name: token.accounting_clients?.name || 'Cliente não encontrado'
    })));
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select('id, name, cnpj')
      .eq('status', 'active')
      .order('name');

    if (error) {
      logger.error('Erro ao carregar clientes:', error, 'VoiceAgentConfig');
      return;
    }

    setClients(data || []);
  };

  const loadConfig = async () => {
    // Carregar configuração salva do banco (implementar se necessário)
    // Por agora, usar configuração padrão
  };

  const generateVoiceToken = async () => {
    if (!selectedClient || !tokenDescription.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um cliente e adicione uma descrição.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const token = `va_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6); // Expira em 6 meses

      const { error } = await supabase
        .from('client_access_tokens')
        .insert({
          client_id: selectedClient,
          token,
          description: JSON.stringify({
            type: 'voice_agent',
            description: tokenDescription,
            permissions: config.permissions,
            config: config
          }),
          expires_at: expiresAt.toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Token gerado",
        description: "Token de acesso para agente de voz criado com sucesso.",
      });

      setSelectedClient('');
      setTokenDescription('');
      await loadVoiceTokens();

    } catch (error) {
      logger.error('Erro ao gerar token:', error, 'VoiceAgentConfig');
      toast({
        title: "Erro",
        description: "Não foi possível gerar o token de acesso.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyTokenLink = (token: string) => {
    const link = `${window.location.origin}/voice-agent?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado",
      description: "Link do agente de voz copiado para a área de transferência.",
    });
  };

  const revokeToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('client_access_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);

      if (error) throw error;

      toast({
        title: "Token revogado",
        description: "Token de acesso foi desativado com sucesso.",
      });

      await loadVoiceTokens();

    } catch (error) {
      logger.error('Erro ao revogar token:', error, 'VoiceAgentConfig');
      toast({
        title: "Erro",
        description: "Não foi possível revogar o token.",
        variant: "destructive",
      });
    }
  };

  const updatePermissions = (permission: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      permissions: enabled 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração do Agente de Voz</h1>
          <p className="text-muted-foreground">
            Configure e gerencie o assistente de voz para seus clientes
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Bot className="h-4 w-4" />
          {tokens.filter(t => t.is_active).length} Ativos
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Personalize o comportamento do agente de voz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Voz */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voz do Assistente
              </Label>
              <Select 
                value={config.voice} 
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, voice: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nova">Nova (Feminina - BR)</SelectItem>
                  <SelectItem value="alloy">Alloy (Neutra)</SelectItem>
                  <SelectItem value="echo">Echo (Masculina)</SelectItem>
                  <SelectItem value="fable">Fable (Feminina)</SelectItem>
                  <SelectItem value="onyx">Onyx (Masculina - Grave)</SelectItem>
                  <SelectItem value="shimmer">Shimmer (Feminina - Suave)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tamanho das Respostas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Tamanho das Respostas
              </Label>
              <Select 
                value={config.response_length} 
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, response_length: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Curta (1-2 frases)</SelectItem>
                  <SelectItem value="medium">Média (1 parágrafo)</SelectItem>
                  <SelectItem value="detailed">Detalhada (2+ parágrafos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Horário de Funcionamento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário de Funcionamento
                </Label>
                <Switch
                  checked={config.working_hours.enabled}
                  onCheckedChange={(enabled) => 
                    setConfig(prev => ({ 
                      ...prev, 
                      working_hours: { ...prev.working_hours, enabled } 
                    }))
                  }
                />
              </div>
              
              {config.working_hours.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Início</Label>
                    <Input
                      type="time"
                      value={config.working_hours.start}
                      onChange={(e) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          working_hours: { ...prev.working_hours, start: e.target.value } 
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fim</Label>
                    <Input
                      type="time"
                      value={config.working_hours.end}
                      onChange={(e) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          working_hours: { ...prev.working_hours, end: e.target.value } 
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Auto Escalação */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Escalação Automática
                </Label>
                <p className="text-xs text-muted-foreground">
                  Transferir para contador quando necessário
                </p>
              </div>
              <Switch
                checked={config.auto_escalation}
                onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, auto_escalation: enabled }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissões do Agente
            </CardTitle>
            <CardDescription>
              Defina o que o agente pode responder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availablePermissions.map(permission => (
                <div key={permission.id} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      {permission.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                  <Switch
                    checked={config.permissions.includes(permission.id)}
                    onCheckedChange={(enabled) => updatePermissions(permission.id, enabled)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geração de Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Gerar Novo Token de Acesso
          </CardTitle>
          <CardDescription>
            Crie um link de acesso ao agente de voz para um cliente específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Acesso principal do cliente"
                value={tokenDescription}
                onChange={(e) => setTokenDescription(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={generateVoiceToken}
            disabled={isGenerating || !selectedClient || !tokenDescription.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando Token...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Token de Acesso
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tokens Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Tokens Ativos
          </CardTitle>
          <CardDescription>
            Gerencie os acessos existentes ao agente de voz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum token ativo</h3>
              <p className="text-muted-foreground">
                Gere o primeiro token de acesso para começar a usar o agente de voz
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map(token => (
                <div key={token.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{token.client_name}</h3>
                        <Badge variant={token.is_active ? "default" : "secondary"}>
                          {token.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {JSON.parse(token.description || '{}').description || 'Sem descrição'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Criado: {new Date(token.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {token.expires_at && (
                          <span>
                            Expira: {new Date(token.expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyTokenLink(token.token)}
                        disabled={!token.is_active}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/voice-agent?token=${token.token}`, '_blank')}
                        disabled={!token.is_active}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeToken(token.id)}
                        disabled={!token.is_active}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}