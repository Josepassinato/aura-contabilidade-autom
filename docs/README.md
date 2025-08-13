# Sistema de Gestão Fiscal e Contábil

## Visão Geral
Sistema completo de automação fiscal, contábil e bancária para escritórios de contabilidade e empresas.

## Arquitetura

### Frontend
- **Framework**: React + TypeScript + Vite
- **UI**: TailwindCSS + Shadcn/ui
- **Roteamento**: React Router DOM
- **Estado**: React Context + React Query
- **Tema**: Dark/Light mode suportado

### Backend
- **Plataforma**: Supabase
- **Banco de Dados**: PostgreSQL com RLS
- **Edge Functions**: Deno + TypeScript
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage

### Integrações Externas
- **OpenAI**: Classificação e processamento IA
- **Belvo**: Integração bancária
- **SEFAZ**: Scraping de guias (simulado)
- **PIX**: Processamento de pagamentos

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Shadcn)
│   ├── layout/         # Layout e navegação
│   ├── auth/           # Autenticação
│   ├── reports/        # Sistema de relatórios
│   ├── compliance/     # Compliance e auditoria
│   └── ...
├── pages/              # Páginas da aplicação
├── contexts/           # Contextos React
├── hooks/              # Custom hooks
├── lib/                # Utilitários
├── services/           # Serviços de integração
└── integrations/       # Configurações Supabase

supabase/
├── functions/          # Edge Functions
├── migrations/         # Migrações do banco
└── config.toml         # Configuração Supabase
```

## Módulos Principais

### 1. Autenticação e Autorização
- **Componentes**: Login, Signup, PasswordReset
- **Roles**: admin, accountant, client
- **RLS**: Políticas de segurança por tabela
- **Auditoria**: Logs de acesso e operações

### 2. Gestão de Clientes
- **CRUD**: Criar, editar, listar clientes
- **Dados**: CNPJ, regime tributário, configurações
- **Integração**: Portal do cliente

### 3. Automação Fiscal
- **SEFAZ**: Coleta automática de guias
- **Classificação IA**: OpenAI para categorização
- **Apuração**: Cálculos automáticos
- **Notificações**: Alertas de vencimento

### 4. Automação Bancária
- **Integração**: Belvo para dados bancários
- **Conciliação**: Matching automático
- **PIX**: Processamento de pagamentos
- **Relatórios**: Extratos e conciliações

### 5. Sistema de Filas
- **Workers**: Processamento em background
- **Heartbeat**: Monitoramento de saúde
- **Retry**: Re-tentativas automáticas
- **Alertas**: Notificações de falhas

### 6. Relatórios
- **Formatos**: PDF, CSV, Excel
- **Tipos**: Financeiro, Tributário, Performance
- **Agendamento**: Geração automática
- **Download**: Links seguros com expiração

### 7. Compliance
- **Retenção**: Políticas automáticas
- **Anonimização**: Proteção de PII
- **Auditoria**: Trilha completa
- **LGPD**: Conformidade regulatória

## Edge Functions

### 1. `scrape-sefaz`
**Propósito**: Coleta de guias tributárias
**Agendamento**: Diário às 06:00
**Entrada**: clientId, uf
**Saída**: Dados das guias ou simulação

### 2. `bank-ingest`
**Propósito**: Ingestão de dados bancários
**Agendamento**: Diário às 06:00
**Integração**: Belvo API
**Saída**: Transações bancárias

### 3. `automatic-bank-reconciliation`
**Propósito**: Conciliação automática
**Entrada**: Extratos bancários + lançamentos
**IA**: OpenAI para matching
**Saída**: Matches e ajustes

### 4. `queue-worker`
**Propósito**: Processamento de filas
**Agendamento**: A cada 5 minutos
**Funções**: Executar tarefas em background
**Monitoramento**: Heartbeat e timeouts

### 5. `generate-report`
**Propósito**: Geração de relatórios
**Formatos**: PDF, CSV, Excel
**Dados**: Financeiro, tributário, performance
**Storage**: Arquivos com expiração

### 6. `download-report`
**Propósito**: Download seguro de relatórios
**Controle**: Contagem de downloads
**Segurança**: Verificação de permissões
**Logs**: Auditoria de acessos

### 7. `compliance-automation`
**Propósito**: Automação de compliance
**Funções**: Retenção, anonimização, limpeza
**LGPD**: Proteção de dados pessoais
**Agendamento**: Mensal

## Banco de Dados

### Tabelas Principais

#### Usuários e Autenticação
- `user_profiles`: Perfis de usuários
- `user_role_audit`: Auditoria de mudanças de papel
- `user_invitations`: Convites de usuários

#### Clientes e Empresas
- `accounting_clients`: Dados dos clientes
- `accounting_firms`: Escritórios contábeis
- `employees`: Funcionários das empresas

#### Dados Fiscais
- `financial_transactions`: Transações financeiras
- `declaracoes_simples_nacional`: Declarações SN
- `sefaz_sp_scrapes`: Dados coletados SEFAZ
- `parametros_fiscais`: Parâmetros tributários

#### Automação e Processamento
- `processing_queue`: Fila de processamento
- `worker_instances`: Instâncias de workers
- `automation_logs`: Logs de automação
- `automation_rules`: Regras de automação

#### Relatórios e Compliance
- `generated_reports`: Relatórios gerados
- `audit_logs`: Trilha de auditoria
- `performance_alerts`: Alertas de performance

#### Integrações
- `integracoes_externas`: Configurações de APIs
- `certificados_digitais`: Certificados e-CNPJ
- `procuracoes_eletronicas`: Procurações digitais

### RLS (Row Level Security)
Todas as tabelas possuem políticas RLS baseadas em:
- **user_id**: Acesso aos próprios dados
- **role**: Permissões baseadas em papel
- **client_id**: Isolamento por cliente
- **company_id**: Acesso organizacional

### Auditoria
Sistema completo de auditoria com:
- **Triggers**: Captura automática de mudanças
- **Logs estruturados**: Operações, valores, metadados
- **Severidade**: Classificação por importância
- **Retenção**: 7 anos para compliance

## Configuração de Desenvolvimento

### Pré-requisitos
```bash
# Node.js 18+
# Supabase CLI
# Conta Supabase
```

### Instalação
```bash
# Clone o repositório
git clone <repo-url>
cd projeto

# Instale dependências
npm install

# Configure Supabase
supabase login
supabase init
supabase start

# Execute migrações
supabase db reset

# Inicie o desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Secrets Supabase
Configure via dashboard ou CLI:
- `OPENAI_API_KEY`: Para classificação IA
- `BELVO_SECRET_KEY`: Para integração bancária
- `RESEND_API_KEY`: Para envio de emails

## Deployment

### Supabase (Automático)
Edge Functions são deployadas automaticamente ao fazer push.

### Frontend
```bash
# Build de produção
npm run build

# Deploy via Lovable ou outro provedor
# Os arquivos estão em dist/
```

### Configuração de Produção
1. Configure domínio personalizado
2. Ative SSL/TLS
3. Configure variáveis de ambiente
4. Execute testes de segurança
5. Configure monitoramento

## Monitoramento e Logs

### Logs de Edge Functions
Acesse via dashboard Supabase:
- Logs de execução
- Métricas de performance
- Alertas de erro

### Métricas do Sistema
- Performance de queries
- Uso de recursos
- Taxa de sucesso de operações
- Compliance status

### Alertas Configurados
- Workers offline
- Fila congestionada
- Falhas na ingestão bancária
- Violações de compliance

## Segurança

### Autenticação
- JWT tokens
- Refresh automático
- MFA disponível
- Políticas de senha

### Autorização
- RLS em todas as tabelas
- Funções SECURITY DEFINER
- Validação de permissões
- Auditoria de acessos

### Proteção de Dados
- Criptografia em trânsito
- Anonimização automática
- Retenção configurável
- Backup seguro

### Compliance LGPD
- Mapeamento de PII
- Consentimento de uso
- Direito ao esquecimento
- Trilha de auditoria

## Suporte e Manutenção

### Runbooks de Emergência
- Falha de autenticação
- Workers offline
- Falha na ingestão de dados
- Violação de segurança

### Backup e Recuperação
- Backup automático diário
- Point-in-time recovery
- Testes de restauração mensais
- DR (Disaster Recovery) documentado

### Atualizações
- Dependências: Mensalmente
- Patches de segurança: Imediatamente
- Features: Sprint de 2 semanas
- Migrações: Versionadas e testadas

## Contato e Suporte

Para dúvidas técnicas ou suporte:
- Documentação: Este arquivo
- Issues: Via repositório Git
- Suporte emergencial: Contate o administrador

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0