# 🛡️ Edge Functions Security Hardening

## ✅ Implementações de Segurança

### 1. Separação de Funções por Categoria

#### **Funções Públicas** (Requerem JWT + CORS Restrito)
- `processar-procuracao` - Processamento de procurações eletrônicas
- `validation-service` - Serviço de validação 
- `generate-nlp-response` - Geração de respostas NLP

**Características:**
- ✅ Require JWT authentication via `auth.requireAuth()`
- ✅ CORS restrito ao domínio: `https://e70f8038-29c2-4a71-9941-5c0ea55d7369.lovableproject.com`
- ✅ Usam `SUPABASE_ANON_KEY` com RLS para segurança
- ✅ Retornam 401 Unauthorized se JWT ausente/inválido

#### **Funções Internas** (Jobs/Cron - Sem CORS)
- `security-monitor` - Monitoramento de segurança
- `scrape-sefaz` - Scraping de dados SEFAZ
- `metrics-collector` - Coleta de métricas
- `payment-alerts-processor` - Processamento de alertas
- `background-report-generator` - Geração de relatórios em background
- `process-scheduled-reports` - Processamento de relatórios agendados
- `queue-processor` - Processador de filas
- `automatic-bank-reconciliation` - Conciliação bancária automática
- `continuous-close-automation` - Automação de fechamento contínuo

**Características:**
- ✅ Sem CORS (não acessíveis via browser)
- ✅ Usam `SUPABASE_SERVICE_ROLE_KEY` para operações administrativas
- ✅ Headers de segurança internos via `internalHeaders`
- ✅ `verify_jwt = false` no config.toml

### 2. Configuração do config.toml

```toml
[functions]
# Public functions - require JWT authentication  
[functions.processar-procuracao]
verify_jwt = true

[functions.validation-service]
verify_jwt = true

[functions.generate-nlp-response]
verify_jwt = true

# Internal functions - no JWT needed (cron jobs and internal services)
[functions.security-monitor]
verify_jwt = false

[functions.scrape-sefaz]
verify_jwt = false

# ... outras funções internas
```

### 3. Headers de Segurança

#### CORS Headers (Funções Públicas)
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://e70f8038-29c2-4a71-9941-5c0ea55d7369.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

#### Internal Headers (Funções Internas)
```typescript
export const internalHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};
```

### 4. Autenticação JWT

#### Validação Obrigatória para Funções Públicas
```typescript
// Require JWT authentication
const authError = await auth.requireAuth(req);
if (authError) return authError;
```

#### Função de Validação
```typescript
export const auth = {
  requireAuth: async (req: Request): Promise<Response | null> => {
    const { user, error } = await auth.validateToken(req);
    
    if (!user || error) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: error || 'Token inválido' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return null; // Success - continue processing
  }
}
```

### 5. Uso Correto das Chaves Supabase

#### Funções Públicas
```typescript
// Use ANON_KEY with RLS for public functions
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);
```

#### Funções Internas  
```typescript
// Use SERVICE_ROLE_KEY for internal operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

## 🔒 Critérios de Aceite Atendidos

### ✅ 1. CORS Restrito
- **ANTES**: `'Access-Control-Allow-Origin': '*'` 
- **DEPOIS**: `'Access-Control-Allow-Origin': 'https://e70f8038-29c2-4a71-9941-5c0ea55d7369.lovableproject.com'`

### ✅ 2. Autenticação JWT Obrigatória
- Funções públicas retornam `401 Unauthorized` se não houver JWT válido
- Implementado via `auth.requireAuth()` em todas as funções públicas

### ✅ 3. Separação de Responsabilidades  
- **Funções Públicas**: Usam `SUPABASE_ANON_KEY` + RLS + JWT obrigatório
- **Jobs Internos**: Usam `SUPABASE_SERVICE_ROLE_KEY` + sem CORS + sem JWT

### ✅ 4. Service Role Key Protegida
- Service Role Key apenas em funções internas (cron/jobs)
- Nunca exposta em endpoints acessíveis externamente

## 🛠️ Implementação Técnica

### Arquivo Shared: `_shared/secure-api.ts`
- Utilitários centralizados de segurança
- Headers padronizados (CORS e internos)
- Funções de autenticação JWT
- Rate limiting e sanitização

### Padrão de Implementação

#### Para Função Pública:
```typescript
import { corsHeaders, auth } from '../_shared/secure-api.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authError = await auth.requireAuth(req);
  if (authError) return authError;

  // ... lógica da função
});
```

#### Para Função Interna:
```typescript
import { internalHeaders } from '../_shared/secure-api.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: internalHeaders }
    );
  }

  // ... lógica da função
});
```

## 🚨 Impacto na Segurança

### ANTES (Vulnerável):
- ❌ Qualquer origem podia chamar as funções
- ❌ Service Role Key exposta em endpoints públicos  
- ❌ Sem autenticação JWT obrigatória
- ❌ CORS `*` permitindo qualquer domínio

### DEPOIS (Seguro):
- ✅ Apenas domínio autorizado pode fazer requisições
- ✅ JWT obrigatório para funções públicas
- ✅ Service Role Key apenas em funções internas
- ✅ CORS restrito e headers de segurança implementados
- ✅ Separação clara entre funções públicas e internas

## 📋 Checklist de Verificação

- [x] Funções públicas exigem JWT válido
- [x] CORS restrito ao domínio de produção
- [x] Service Role Key apenas em funções internas
- [x] Headers de segurança implementados
- [x] Configuração correta no config.toml
- [x] Documentação atualizada
- [x] Padrões de implementação definidos