# 🔐 Configuração de Segurança do Supabase Auth

## 📋 Checklist de Configurações Obrigatórias

### 🛡️ **1. Proteção contra Senhas Vazadas**

**Localização**: Dashboard Supabase → Authentication → Settings → Security

| Configuração | Status | Recomendação |
|-------------|--------|--------------|
| **Password breach protection** | ⚠️ Desabilitado | ✅ Habilitar |
| **Block sign-ups with breached passwords** | ⚠️ Desabilitado | ✅ Habilitar |
| **Block sign-ins with breached passwords** | ⚠️ Desabilitado | ⚠️ Opcional* |

\* Pode causar inconvenientes para usuários existentes com senhas comprometidas

### ⏰ **2. Configurações OTP**

**Localização**: Dashboard Supabase → Authentication → Settings → Auth

| Configuração | Valor Atual | Recomendado |
|-------------|-------------|-------------|
| **OTP Expiry** | ⚠️ > 10 min | ✅ 600s (10 min) |
| **OTP Length** | 6 digits | ✅ 6 digits |
| **Rate Limiting** | Habilitado | ✅ Manter |

### 🌐 **3. URLs de Redirecionamento**

**Localização**: Dashboard Supabase → Authentication → URL Configuration

| Configuração | Valor |
|-------------|-------|
| **Site URL** | `https://seu-dominio.lovable.app` |
| **Redirect URLs** | `https://seu-dominio.lovable.app/**` |

## 🚀 **Passos para Configuração**

### **Passo 1: Proteção contra Senhas Vazadas**

1. **Acesse o Dashboard**:
   ```
   https://supabase.com/dashboard/project/watophocqlcyimirzrpe
   ```

2. **Navegue para Authentication**:
   ```
   Authentication → Settings → Security
   ```

3. **Configure Proteção de Senhas**:
   ```
   ✅ Enable password breach protection
   ✅ Block sign-ups with breached passwords
   ⚠️ Block sign-ins with breached passwords (opcional)
   ```

### **Passo 2: Configurar OTP**

1. **Vá para Auth Settings**:
   ```
   Authentication → Settings → Auth
   ```

2. **Ajustar Configurações OTP**:
   ```
   OTP expiry time: 600 (segundos)
   OTP length: 6 (dígitos)
   Rate limiting: Enabled
   ```

### **Passo 3: Validar URLs**

1. **URL Configuration**:
   ```
   Authentication → URL Configuration
   ```

2. **Site URL**:
   ```
   https://watophocqlcyimirzrpe.lovable.app
   ```

3. **Redirect URLs** (adicionar todas):
   ```
   https://watophocqlcyimirzrpe.lovable.app/**
   http://localhost:8080/**
   https://seu-dominio-customizado.com/** (se aplicável)
   ```

## 🧪 **Teste das Configurações**

### **Teste 1: Proteção contra Senhas Vazadas**
```typescript
// Tentar criar conta com senha comum
const testPassword = "123456"; // Senha conhecidamente vazada
const { error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: testPassword
});

// Deve retornar erro se proteção estiver ativa
console.log(error?.message); // "Password found in breach database"
```

### **Teste 2: OTP Expiry**
```typescript
// Solicitar OTP
const { error } = await supabase.auth.signInWithOtp({
  email: "user@example.com"
});

// Aguardar mais de 10 minutos e tentar usar o código
// Deve falhar se expiração estiver configurada corretamente
```

## ⚠️ **Considerações Importantes**

### **Senhas Vazadas**
- **Pros**: Maior segurança, previne uso de senhas comprometidas
- **Contras**: Pode frustrar usuários com senhas fracas
- **Recomendação**: Habilitar para novos cadastros, opcional para logins

### **OTP Expiry**
- **Muito curto** (< 5 min): Frustra usuários
- **Muito longo** (> 15 min): Risco de segurança
- **Ideal**: 10 minutos (600 segundos)

### **Rate Limiting**
- Previne ataques de força bruta
- Limita tentativas por IP/usuário
- **Nunca desabilitar** em produção

## 🔍 **Monitoramento**

### **Métricas para Acompanhar**
- Taxa de rejeição por senhas vazadas
- Tempo médio de uso do OTP
- Tentativas de autenticação bloqueadas

### **Logs de Auditoria**
```sql
-- Ver tentativas de login bloqueadas
SELECT * FROM auth.audit_log_entries 
WHERE error_code = 'weak_password'
ORDER BY created_at DESC;
```

## 🆘 **Solução de Problemas**

### **Problema**: Usuários não conseguem fazer login
**Causa**: Proteção de senhas muito restritiva
**Solução**: Permitir login com senhas vazadas temporariamente

### **Problema**: OTP expira muito rápido
**Causa**: Tempo de expiração muito baixo
**Solução**: Aumentar para 10-15 minutos

### **Problema**: URLs de redirecionamento inválidas
**Causa**: Site URL não configurada corretamente
**Solução**: Configurar todas as URLs possíveis

---

## 📞 **Suporte**

Para problemas específicos:
1. Verificar logs de Auth no Supabase
2. Testar em ambiente de desenvolvimento
3. Documentar comportamento inesperado
4. Contatar suporte do Supabase se necessário

**Status**: ⚠️ **Configuração manual necessária no dashboard do Supabase**