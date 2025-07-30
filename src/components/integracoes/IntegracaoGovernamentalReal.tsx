import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { configurarReceitaFederal, consultarSituacaoFiscal, consultarDebitosReceita } from '@/services/governamental/receitaFederalService';
import { configurarSimplesNacional, consultarSituacaoSimples, calcularImpostosSimples } from '@/services/governamental/simplesNacionalService';
import { fetchCertificadosDigitais, CertificadoDigital } from '@/services/governamental/certificadosDigitaisService';
import { getStatusIntegracoes, IntegracaoGovernamental } from '@/services/governamental/integracoesStatus';
import { toast } from '@/hooks/use-toast';

export function IntegracaoGovernamentalReal() {
  const { userProfile } = useAuth();
  const [integracoes, setIntegracoes] = useState<IntegracaoGovernamental[]>([]);
  const [certificados, setCertificados] = useState<CertificadoDigital[]>([]);
  const [loading, setLoading] = useState(false);
  const [testeResultado, setTesteResultado] = useState<any>(null);

  // Estados para configuração
  const [receitaConfig, setReceitaConfig] = useState({
    certificadoId: '',
    ambiente: 'homologacao' as 'producao' | 'homologacao',
    servicos: ['situacao_fiscal', 'debitos']
  });

  const [simplesConfig, setSimplesConfig] = useState({
    cnpj: '',
    certificadoId: '',
    codigoAcesso: '',
    ambiente: 'homologacao' as 'producao' | 'homologacao'
  });

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);
      
      // Carregar status das integrações
      const statusIntegracoes = await getStatusIntegracoes();
      setIntegracoes(statusIntegracoes);

      // Carregar certificados disponíveis
      const certResult = await fetchCertificadosDigitais(userProfile.company_id);
      if (certResult.success && certResult.data) {
        setCertificados(certResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurarReceita = async () => {
    if (!userProfile?.company_id || !receitaConfig.certificadoId) return;

    setLoading(true);
    try {
      const success = await configurarReceitaFederal({
        clientId: userProfile.company_id,
        certificadoId: receitaConfig.certificadoId,
        ambiente: receitaConfig.ambiente,
        servicos: receitaConfig.servicos
      });

      if (success) {
        await loadData();
      }
    } catch (error) {
      console.error('Erro ao configurar Receita Federal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurarSimples = async () => {
    if (!userProfile?.company_id || !simplesConfig.certificadoId || !simplesConfig.cnpj) return;

    setLoading(true);
    try {
      const success = await configurarSimplesNacional({
        clientId: userProfile.company_id,
        cnpj: simplesConfig.cnpj,
        certificadoId: simplesConfig.certificadoId,
        codigoAcesso: simplesConfig.codigoAcesso,
        ambiente: simplesConfig.ambiente
      });

      if (success) {
        await loadData();
      }
    } catch (error) {
      console.error('Erro ao configurar Simples Nacional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestarIntegracao = async (tipo: string) => {
    if (!userProfile?.company_id) return;

    setLoading(true);
    try {
      let resultado;
      
      if (tipo === 'receita_federal') {
        resultado = await consultarSituacaoFiscal('12345678000195', userProfile.company_id);
      } else if (tipo === 'simples_nacional') {
        resultado = await consultarSituacaoSimples('12345678000195', userProfile.company_id);
      }

      setTesteResultado({ tipo, resultado });
      
      if (resultado.success) {
        toast({
          title: "Teste realizado com sucesso",
          description: `Integração com ${tipo} está funcionando`,
        });
      }
    } catch (error) {
      console.error('Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'configurando':
        return <Badge variant="outline"><Settings className="w-3 h-3 mr-1" />Configurando</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Inativo</Badge>;
    }
  };

  if (!userProfile?.company_id) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar vinculado a uma empresa para configurar integrações governamentais.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integrações Governamentais</h2>
          <p className="text-muted-foreground">
            Configure integrações oficiais com órgãos governamentais
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status das Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integracoes.map((integracao) => (
              <Card key={integracao.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{integracao.nome}</h4>
                    <p className="text-sm text-muted-foreground">{integracao.orgao}</p>
                  </div>
                  {getStatusBadge(integracao.status)}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleTestarIntegracao(integracao.id)}
                    disabled={loading || integracao.status !== 'ativo'}
                  >
                    Testar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Tabs defaultValue="receita-federal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receita-federal">Receita Federal</TabsTrigger>
          <TabsTrigger value="simples-nacional">Simples Nacional</TabsTrigger>
          <TabsTrigger value="certificados">Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="receita-federal">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Receita Federal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Certificado Digital</Label>
                <Select 
                  value={receitaConfig.certificadoId} 
                  onValueChange={(value) => setReceitaConfig(prev => ({ ...prev, certificadoId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um certificado" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificados.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id!}>
                        {cert.nome} ({cert.tipo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ambiente</Label>
                <Select 
                  value={receitaConfig.ambiente} 
                  onValueChange={(value: 'producao' | 'homologacao') => 
                    setReceitaConfig(prev => ({ ...prev, ambiente: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homologacao">Homologação</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleConfigurarReceita}
                disabled={loading || !receitaConfig.certificadoId}
                className="w-full"
              >
                {loading ? 'Configurando...' : 'Configurar Receita Federal'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simples-nacional">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Simples Nacional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={simplesConfig.cnpj}
                  onChange={(e) => setSimplesConfig(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label>Certificado Digital</Label>
                <Select 
                  value={simplesConfig.certificadoId} 
                  onValueChange={(value) => setSimplesConfig(prev => ({ ...prev, certificadoId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um certificado" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificados.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id!}>
                        {cert.nome} ({cert.tipo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Código de Acesso (opcional)</Label>
                <Input
                  value={simplesConfig.codigoAcesso}
                  onChange={(e) => setSimplesConfig(prev => ({ ...prev, codigoAcesso: e.target.value }))}
                  placeholder="Código alternativo"
                />
              </div>

              <div className="space-y-2">
                <Label>Ambiente</Label>
                <Select 
                  value={simplesConfig.ambiente} 
                  onValueChange={(value: 'producao' | 'homologacao') => 
                    setSimplesConfig(prev => ({ ...prev, ambiente: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homologacao">Homologação</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleConfigurarSimples}
                disabled={loading || !simplesConfig.certificadoId || !simplesConfig.cnpj}
                className="w-full"
              >
                {loading ? 'Configurando...' : 'Configurar Simples Nacional'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificados">
          <Card>
            <CardHeader>
              <CardTitle>Certificados Digitais Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              {certificados.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum certificado digital encontrado. Configure um certificado primeiro.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {certificados.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{cert.nome}</h4>
                        <p className="text-sm text-muted-foreground">Tipo: {cert.tipo}</p>
                        {cert.valido_ate && (
                          <p className="text-sm text-muted-foreground">
                            Válido até: {new Date(cert.valido_ate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">Disponível</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resultado do Teste */}
      {testeResultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Teste - {testeResultado.tipo}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(testeResultado.resultado, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}