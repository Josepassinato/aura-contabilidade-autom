import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Activity, Database, Zap } from 'lucide-react';

export function SecuritySetupComplete() {
  const implementedFeatures = [
    {
      title: 'Parâmetros Fiscais Configurados',
      description: 'Alíquotas do Simples Nacional, Lucro Presumido e obrigações acessórias',
      icon: Database,
      status: 'Implementado'
    },
    {
      title: 'Monitoramento de Segurança Ativo',
      description: 'Sistema automatizado de coleta de métricas e detecção de ameaças',
      icon: Shield,
      status: 'Implementado'
    },
    {
      title: 'Serviços de Validação',
      description: 'Validação fiscal, integridade de dados e auditoria de segurança',
      icon: Activity,
      status: 'Implementado'
    },
    {
      title: 'Regras de Escalação',
      description: 'Notificações automáticas para administradores em situações críticas',
      icon: Zap,
      status: 'Implementado'
    }
  ];

  const nextSteps = [
    'Fazer login como administrador (admin@contaflix.com.br)',
    'Acessar o Dashboard de Segurança (/admin/security)',
    'Executar validações iniciais do sistema',
    'Configurar alertas personalizados conforme necessário',
    'Monitorar métricas de segurança regularmente'
  ];

  return (
    <div className="space-y-6">
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">
          Plano de Segurança Implementado com Sucesso!
        </AlertTitle>
        <AlertDescription className="text-green-700">
          Todas as funcionalidades de segurança foram configuradas e estão prontas para uso.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Funcionalidades Implementadas
          </CardTitle>
          <CardDescription>
            Resumo das melhorias de segurança aplicadas ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {implementedFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <feature.icon className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
          <CardDescription>
            Ações recomendadas para finalizar a configuração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          O sistema está agora equipado com monitoramento ativo, validações automatizadas
          e configurações de segurança robustas.
        </p>
      </div>
    </div>
  );
}