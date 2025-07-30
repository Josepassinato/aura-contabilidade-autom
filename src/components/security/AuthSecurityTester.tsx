import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthSecurityValidation } from '@/services/security/authSecurityValidator';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function AuthSecurityTester() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const { runSecurityTests, getRecommendations, validateURLs } = useAuthSecurityValidation();
  
  const handleRunTests = async () => {
    setIsLoading(true);
    try {
      const results = await runSecurityTests(testEmail || undefined);
      setTestResults(results);
    } catch (error) {
      console.error('Erro ao executar testes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const recommendations = getRecommendations();
  const urlConfig = validateURLs();
  
  const getStatusIcon = (enabled: boolean, status?: string) => {
    if (status === 'PASS') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'FAIL') return <XCircle className="h-4 w-4 text-red-500" />;
    if (enabled) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };
  
  const getStatusBadge = (enabled: boolean, status?: string) => {
    if (status === 'PASS') return <Badge variant="default" className="bg-green-500">PASS</Badge>;
    if (status === 'FAIL') return <Badge variant="destructive">FAIL</Badge>;
    if (enabled) return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
    return <Badge variant="destructive">Inativo</Badge>;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Teste de Configurações de Segurança Auth
          </CardTitle>
          <CardDescription>
            Valide se as configurações de segurança do Supabase Auth estão corretas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Email para teste OTP (opcional)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleRunTests} disabled={isLoading}>
              {isLoading ? 'Testando...' : 'Executar Testes'}
            </Button>
          </div>
          
          {testResults && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Testes executados em {new Date(testResults.timestamp).toLocaleString()}
                </AlertDescription>
              </Alert>
              
              {/* Resultado da Proteção contra Senhas Vazadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(testResults.passwordProtection.enabled, testResults.passwordProtection.testResult.split(' - ')[0])}
                      Proteção contra Senhas Vazadas
                    </span>
                    {getStatusBadge(testResults.passwordProtection.enabled, testResults.passwordProtection.testResult.split(' - ')[0])}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {testResults.passwordProtection.testResult}
                  </p>
                  {testResults.passwordProtection.error && (
                    <p className="text-xs text-red-500 mt-2">
                      {testResults.passwordProtection.error}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Resultado do Teste OTP */}
              {testResults.otpTest && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(testResults.otpTest.otpSent)}
                        Configuração OTP
                      </span>
                      {getStatusBadge(testResults.otpTest.otpSent)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {testResults.otpTest.otpSent 
                        ? 'OTP enviado com sucesso' 
                        : 'Falha ao enviar OTP'}
                    </p>
                    {testResults.otpTest.error && (
                      <p className="text-xs text-red-500 mt-2">
                        {testResults.otpTest.error}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Configuração de URLs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(testResults.urlConfig.isValid)}
                      Configuração de URLs
                    </span>
                    {getStatusBadge(testResults.urlConfig.isValid)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Origem atual:</strong> {testResults.urlConfig.currentOrigin}</p>
                    <p><strong>Site URL esperada:</strong> {testResults.urlConfig.expectedSiteURL}</p>
                    <div>
                      <strong>Redirect URLs esperadas:</strong>
                      <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">
                        {testResults.urlConfig.expectedRedirectURLs.map((url: string, index: number) => (
                          <li key={index}>{url}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recomendações de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Configuração</CardTitle>
          <CardDescription>
            Configure estas opções no Dashboard do Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">🔐 Segurança de Senhas</h4>
            <ul className="space-y-1 text-sm">
              {recommendations.passwordSecurity.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-xs">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">⏰ Configurações OTP</h4>
            <ul className="space-y-1 text-sm">
              {recommendations.otpSettings.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-xs">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">🌐 URLs de Redirecionamento</h4>
            <ul className="space-y-1 text-sm">
              {recommendations.urlConfiguration.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-xs">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Como configurar:</strong> Acesse o Dashboard do Supabase → Authentication → Settings
              <br />
              <a 
                href="https://supabase.com/dashboard/project/watophocqlcyimirzrpe/auth/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Ir para configurações do Auth →
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}