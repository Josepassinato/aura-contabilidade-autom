# 🧪 Sistema de Testes Completo

Sistema de testes unitários, integração e E2E configurado com **Vitest**, **React Testing Library**, **Jest DOM** e **Playwright**.

## 🚀 Comandos Disponíveis

### Testes Unitários e de Integração
```bash
npm run test          # Executar todos os testes unitários
npm run test:watch    # Modo watch
npm run test:ui       # Interface gráfica
npm run test:coverage # Com cobertura
```

### Testes E2E e de Carga
```bash
npm run test:e2e       # Executar todos os testes E2E
npm run test:e2e:ui    # Interface gráfica do Playwright
npm run test:e2e:headed # Com navegador visível
npm run test:e2e:debug # Modo debug
npm run test:critical  # Apenas testes críticos
npm run test:load      # Apenas testes de carga
```

## 📁 Estrutura

- `src/test/setup.ts` - Configuração global do Vitest
- `src/test/utils.tsx` - Providers para testes unitários
- `**/__tests__/` - Arquivos de teste unitários
- `e2e/` - Testes End-to-End com Playwright
- `e2e/fixtures/` - Arquivos de exemplo para testes
- `playwright.config.ts` - Configuração do Playwright

## ✅ Testes Implementados

### Testes Unitários
- ✅ Componente Button (UI)
- ✅ Utilitários básicos
- ✅ Configuração completa do Vitest

### Testes E2E Críticos
- ✅ **Login + RLS**: Autenticação e verificação de Row Level Security
- ✅ **Upload/Download**: Gestão completa de documentos
- ✅ **Lançamentos Contábeis**: Criação e geração de relatórios
- ✅ **Fechamento Mensal**: Processo automatizado completo
- ✅ **Performance**: Testes de tempo de carregamento
- ✅ **Tolerância a Falhas**: Resiliência de rede

### Testes de Carga
- ✅ **process-daily-accounting**: Teste de carga com múltiplas requisições simultâneas
- ✅ **security-monitor**: Verificação de performance sob carga
- ✅ **stress-test-automation**: Teste de estresse combinado
- ✅ **Resiliência**: Recuperação após sobrecarga

## 🎯 Métricas e SLAs

### Testes E2E
- **Taxa de Sucesso**: > 95%
- **Tempo de Carregamento**: < 3s para páginas principais
- **Upload/Download**: < 30s para arquivos até 10MB

### Testes de Carga
- **process-daily-accounting**: 
  - Taxa de sucesso > 95%
  - Tempo médio < 5s
  - Tempo máximo < 15s
- **security-monitor**: 
  - Taxa de sucesso > 98%
  - Tempo médio < 2s
  - Tempo máximo < 8s

### Teste de Estresse
- **Combinado**: Taxa de sucesso > 90% sob carga máxima
- **Recuperação**: < 3s após sobrecarga

## 🔧 Configuração para CI/CD

O sistema está configurado para execução em pipelines de CI/CD com:
- Retry automático (2x) em ambiente CI
- Workers otimizados para CI
- Screenshots e vídeos apenas em falhas
- Relatórios HTML gerados automaticamente

## 📊 Monitoramento

Os testes de carga geram logs detalhados incluindo:
- Tempo de resposta por requisição
- Taxa de sucesso/falha
- Análise de throughput
- Métricas de performance

Execute `npm run test:load` para monitorar a performance das Edge Functions em tempo real.