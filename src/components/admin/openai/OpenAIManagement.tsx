import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, Database, Settings } from 'lucide-react';
import { useOpenAIConfig } from '@/hooks/useOpenAIConfig';
import { 
  getEnhancedTokenUsageStats, 
  resetAllTokenUsage, 
  setTokenUsageLimit,
  getTokenUsageLimit
} from '@/hooks/nlp/tokenUsageService';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OpenAIManagement() {
  const { isConfigured, config } = useOpenAIConfig();
  const [tokenStats, setTokenStats] = useState(getEnhancedTokenUsageStats());
  const [tokenLimit, setTokenLimit] = useState(getTokenUsageLimit());
  const [newLimit, setNewLimit] = useState(tokenLimit.toString());
  
  // Mock data for customer usage breakdown
  const [customerUsage] = useState([
    { name: 'Cliente A', tokens: 42500, cost: 12.75 },
    { name: 'Cliente B', tokens: 31200, cost: 9.36 },
    { name: 'Cliente C', tokens: 24800, cost: 7.44 },
    { name: 'Cliente D', tokens: 18900, cost: 5.67 },
    { name: 'Cliente E', tokens: 9200, cost: 2.76 },
    { name: 'Outros', tokens: 23700, cost: 7.11 }
  ]);
  
  // Mock data for usage over time
  const [usageOverTime] = useState([
    { date: '01/05', tokens: 12500 },
    { date: '02/05', tokens: 14200 },
    { date: '03/05', tokens: 11800 },
    { date: '04/05', tokens: 13400 },
    { date: '05/05', tokens: 9800 },
    { date: '06/05', tokens: 7600 },
    { date: '07/05', tokens: 10300 },
    { date: '08/05', tokens: 15700 },
    { date: '09/05', tokens: 16900 },
    { date: '10/05', tokens: 18200 },
    { date: '11/05', tokens: 19400 },
    { date: '12/05', tokens: 21800 },
    { date: '13/05', tokens: 24600 }
  ]);
  
  // Mock data for model usage
  const [modelUsage] = useState([
    { name: 'gpt-4o-mini', value: 68, tokens: 85000, cost: 12.75 },
    { name: 'gpt-4o', value: 24, tokens: 30000, cost: 90.00 },
    { name: 'gpt-4.5-preview', value: 8, tokens: 10000, cost: 50.00 }
  ]);
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenStats(getEnhancedTokenUsageStats());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle token limit update
  const handleUpdateLimit = () => {
    const limit = parseInt(newLimit);
    if (isNaN(limit) || limit <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um número válido maior que zero.",
        variant: "destructive"
      });
      return;
    }
    
    setTokenLimit(limit);
    setTokenUsageLimit(limit);
  };
  
  // Handle reset stats
  const handleResetStats = () => {
    if (confirm("Tem certeza de que deseja redefinir todas as estatísticas de uso de tokens? Esta ação não pode ser desfeita.")) {
      resetAllTokenUsage();
      setTokenStats(getEnhancedTokenUsageStats());
    }
  };
  
  // Format date string
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return "Data desconhecida";
    }
  };
  
  // Calculate token usage percentage
  const usagePercentage = Math.min(100, Math.round((tokenStats.totalTokens / tokenLimit) * 100));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de OpenAI</h2>
          <p className="text-muted-foreground mt-1">
            Monitore e gerencie o uso de tokens, custos e limites da API OpenAI
          </p>
        </div>
        
        {!isConfigured && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/settings?openai=true'}
          >
            <Settings className="h-4 w-4" />
            Configurar OpenAI
          </Button>
        )}
      </div>
      
      {!isConfigured ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OpenAI não configurada</AlertTitle>
          <AlertDescription>
            A API OpenAI não está configurada. Configure-a nas configurações antes de usar os recursos de IA.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Resumo de uso de tokens */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Tokens Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold">
                    {tokenStats.totalTokens.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Custo estimado: ${tokenStats.estimatedCost?.toFixed(2)}
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        usagePercentage < 80 ? 'bg-green-500' : 
                        usagePercentage < 95 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 flex justify-between">
                    <span>{usagePercentage}% do limite</span>
                    <span>{tokenLimit.toLocaleString()} tokens</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Número de requisições */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Requisições Processadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tokenStats.requests.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Desde {formatDate(tokenStats.lastReset)}
                </div>
              </CardContent>
            </Card>
            
            {/* Configuração atual */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Configuração da API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Modelo:</span> {config?.model || "Não definido"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Temperatura:</span> {config?.temperature || "0.7"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Max Tokens:</span> {config?.maxTokens || "4000"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="usage" className="space-y-4">
            <TabsList>
              <TabsTrigger value="usage">Uso por Cliente</TabsTrigger>
              <TabsTrigger value="trends">Tendências de Uso</TabsTrigger>
              <TabsTrigger value="models">Uso por Modelo</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Uso de Tokens por Cliente</CardTitle>
                  <CardDescription>
                    Distribuição do uso de tokens e custos entre clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={customerUsage}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="tokens" name="Tokens" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="cost" name="Custo ($)" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Clientes por Uso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customerUsage.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span>{item.name}</span>
                          </div>
                          <div className="text-sm font-medium">{item.tokens.toLocaleString()} tokens</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Clientes por Custo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...customerUsage]
                        .sort((a, b) => b.cost - a.cost)
                        .slice(0, 5)
                        .map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span>{item.name}</span>
                            </div>
                            <div className="text-sm font-medium">${item.cost.toFixed(2)}</div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Uso de Tokens</CardTitle>
                  <CardDescription>
                    Uso de tokens ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={usageOverTime}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="tokens" name="Tokens" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Picos de Uso</CardTitle>
                  <CardDescription>
                    Períodos com maior consumo de tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...usageOverTime]
                      .sort((a, b) => b.tokens - a.tokens)
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded" />
                            <span>{item.date}</span>
                          </div>
                          <div className="text-sm font-medium">{item.tokens.toLocaleString()} tokens</div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Modelo</CardTitle>
                    <CardDescription>
                      Proporção de uso entre diferentes modelos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={modelUsage}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {modelUsage.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Custo por Modelo</CardTitle>
                    <CardDescription>
                      Detalhamento de custo por modelo de IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {modelUsage.map((model, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="font-medium">{model.name}</span>
                            </div>
                            <div className="text-sm font-medium">${model.cost.toFixed(2)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-muted h-2 rounded-full">
                              <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                  width: `${model.value}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }} 
                              />
                            </div>
                            <span className="text-xs w-12 text-right">{model.tokens.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-2 border-t mt-4">
                        <div className="flex items-center justify-between font-medium">
                          <span>Custo total</span>
                          <span>${modelUsage.reduce((sum, model) => sum + model.cost, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Custo-Benefício</CardTitle>
                  <CardDescription>
                    Análise comparativa de eficiência entre modelos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Modelo</th>
                          <th className="text-left py-2 px-4">Tokens Processados</th>
                          <th className="text-left py-2 px-4">Custo ($)</th>
                          <th className="text-left py-2 px-4">Custo por 1K Tokens</th>
                          <th className="text-left py-2 px-4">% do Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelUsage.map((model, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4">{model.name}</td>
                            <td className="py-2 px-4">{model.tokens.toLocaleString()}</td>
                            <td className="py-2 px-4">${model.cost.toFixed(2)}</td>
                            <td className="py-2 px-4">${(model.cost / (model.tokens / 1000)).toFixed(3)}</td>
                            <td className="py-2 px-4">{model.value}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Limites de Uso</CardTitle>
                  <CardDescription>
                    Configure alertas e limites para controlar custos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tokenLimit">Limite de tokens</Label>
                    <div className="flex gap-2 items-center mt-1.5">
                      <Input 
                        id="tokenLimit" 
                        type="number" 
                        min="1000"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button onClick={handleUpdateLimit}>Atualizar</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      O sistema alertará quando o uso de tokens atingir 80% deste limite.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Ações</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="destructive" 
                        onClick={handleResetStats}
                      >
                        Redefinir estatísticas
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/settings?openai=true'}
                      >
                        Configuração da OpenAI
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Explicação dos Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Os custos da API OpenAI são calculados com base no número de tokens processados. 
                      Cada token representa aproximadamente 4 caracteres de texto em português.
                    </p>
                    <div className="space-y-1 pt-2">
                      <p className="font-medium">Preços aproximados por modelo (por 1K tokens):</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>GPT-4o Mini: $0.15 por 1K tokens ($0.00015 por token)</li>
                        <li>GPT-4o: $3.00 por 1K tokens ($0.003 por token)</li>
                        <li>GPT-4.5 Preview: $5.00 por 1K tokens ($0.005 por token)</li>
                      </ul>
                    </div>
                    <p className="pt-2">
                      Observação: Os valores apresentados são aproximados e podem mudar conforme as 
                      atualizações de preço da OpenAI. Para valores precisos, consulte a 
                      <a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                        página de preços da OpenAI
                      </a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
