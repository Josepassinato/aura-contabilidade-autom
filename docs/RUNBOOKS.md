# Runbooks de Emergência

## 🚨 Procedimentos de Incident Response

### 1. Falha de Autenticação

#### Sintomas
- Usuários não conseguem fazer login
- Tokens JWT expirados
- Erro 401/403 em massa

#### Diagnóstico
```bash
# Verificar status do Supabase Auth
curl -H "apikey: <anon_key>" https://projeto.supabase.co/auth/v1/settings

# Verificar logs de auth
supabase functions logs auth
```

#### Ações Imediatas
1. **Verificar status do Supabase**
   - Acessar https://status.supabase.com/
   - Verificar incidentes regionais

2. **Limpeza de auth state**
   ```typescript
   // Executar no console do navegador
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

3. **Reset global de sessões**
   ```sql
   -- No SQL Editor do Supabase
   SELECT public.secure_global_logout();
   ```

#### Escalação
- **Nível 1**: 5 minutos - Verificações básicas
- **Nível 2**: 15 minutos - Contatar Supabase Support
- **Nível 3**: 30 minutos - Implementar auth alternativo

#### Rollback
```bash
# Reverter para versão anterior se necessário
git revert <commit-hash>
# Redeploy Edge Functions
supabase functions deploy
```

---

### 2. Workers Offline / Fila Congestionada

#### Sintomas
- Alertas de workers offline
- Fila `processing_queue` crescendo
- Automações não executando

#### Diagnóstico
```sql
-- Verificar status dos workers
SELECT * FROM worker_instances 
WHERE last_heartbeat < now() - interval '10 minutes';

-- Verificar fila
SELECT status, count(*) 
FROM processing_queue 
GROUP BY status;
```

#### Ações Imediatas
1. **Restart dos workers**
   ```bash
   # Invocar worker manualmente
   curl -X POST https://projeto.supabase.co/functions/v1/queue-worker \
     -H "Authorization: Bearer <service_role_key>" \
     -d '{"action": "register"}'
   ```

2. **Limpeza de workers offline**
   ```sql
   SELECT cleanup_offline_workers();
   ```

3. **Processar fila manualmente**
   ```sql
   -- Re-agendar tarefas pendentes
   UPDATE processing_queue 
   SET status = 'pending', scheduled_at = now()
   WHERE status = 'processing' 
   AND timeout_at < now();
   ```

#### Prevenção
- Monitoramento ativo a cada 5 minutos
- Alertas automáticos no dashboard
- Redundância de workers

---

### 3. Falha na Ingestão Bancária

#### Sintomas
- Transações não aparecendo
- Erro na Edge Function `bank-ingest`
- Alertas de falha no Belvo

#### Diagnóstico
```bash
# Verificar logs da função
supabase functions logs bank-ingest

# Testar API Belvo manualmente
curl -X GET "https://api.belvo.com/api/accounts/" \
  -H "Authorization: Basic <belvo_key>"
```

#### Ações Imediatas
1. **Verificar credenciais Belvo**
   ```sql
   -- Verificar último sucesso
   SELECT * FROM automation_logs 
   WHERE process_type = 'bank_ingest' 
   ORDER BY created_at DESC LIMIT 5;
   ```

2. **Ingestão manual**
   ```bash
   # Forçar execução
   curl -X POST https://projeto.supabase.co/functions/v1/bank-ingest \
     -H "Authorization: Bearer <anon_key>" \
     -d '{"clientId": "client-id", "forceSync": true}'
   ```

3. **Fallback para upload manual**
   - Orientar usuários para upload de OFX/CSV
   - Ativar modo de contingência

#### Escalação
- **Imediato**: Verificar status Belvo
- **15 min**: Contatar suporte Belvo
- **30 min**: Ativar modo manual

---

### 4. Violação de Segurança

#### Sintomas
- Acessos não autorizados nos logs
- RLS bypass detectado
- Alertas de security scanner

#### Ações Imediatas - **NÃO DEMORA!**

1. **Isolar o sistema**
   ```sql
   -- Desabilitar políticas RLS suspeitas
   ALTER TABLE tabela_afetada DISABLE ROW LEVEL SECURITY;
   
   -- Bloquear usuários suspeitos
   UPDATE auth.users SET banned_until = now() + interval '24 hours'
   WHERE id IN ('user-ids-suspeitos');
   ```

2. **Audit completo**
   ```sql
   -- Verificar acessos suspeitos
   SELECT * FROM audit_logs 
   WHERE severity = 'critical'
   AND created_at > now() - interval '24 hours'
   ORDER BY created_at DESC;
   ```

3. **Notificar stakeholders**
   - LGPD Officer (se aplicável)
   - Usuários afetados
   - Autoridades (se necessário)

#### Investigação
1. Preservar evidências
2. Mapear extensão do comprometimento
3. Identificar vetor de ataque
4. Implementar correções

---

### 5. Falha de Compliance

#### Sintomas
- Dados não anonimizados no prazo
- Políticas de retenção falhando
- Alertas LGPD

#### Ações Imediatas
1. **Executar compliance manual**
   ```bash
   curl -X POST https://projeto.supabase.co/functions/v1/compliance-automation \
     -H "Authorization: Bearer <service_role_key>" \
     -d '{"action": "process", "dryRun": false}'
   ```

2. **Verificar dados expostos**
   ```sql
   -- Verificar PII não anonimizada
   SELECT table_name, count(*) 
   FROM information_schema.columns 
   WHERE column_name IN ('email', 'cpf', 'nome')
   GROUP BY table_name;
   ```

3. **Gerar relatório de compliance**
   - Documentar ações tomadas
   - Notificar DPO se necessário

---

## 📋 Checklist de Recovery

### Pós-Incidente
- [ ] Sistema estabilizado
- [ ] Usuários notificados
- [ ] Logs preservados
- [ ] Relatório de incidente criado
- [ ] Postmortem agendado
- [ ] Melhorias implementadas

### Comunicação
- [ ] Status interno atualizado
- [ ] Usuários notificados
- [ ] SLA reportado
- [ ] Documentação atualizada

---

## 🔧 Ferramentas de Diagnóstico

### Supabase Dashboard
- Auth: Monitoramento de usuários
- Database: Performance e locks
- Edge Functions: Logs e métricas
- Storage: Uso e performance

### SQL Queries Úteis
```sql
-- Performance geral
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables ORDER BY n_tup_ins DESC;

-- Locks ativos
SELECT * FROM pg_locks WHERE NOT granted;

-- Conexões ativas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- RLS policies
SELECT tablename, policyname, permissive, cmd
FROM pg_policies WHERE schemaname = 'public';
```

### Monitoramento Externo
- Uptime: Pingdom/DataDog
- Performance: New Relic/Sentry
- Logs: CloudWatch/LogDNA

---

## 📞 Contatos de Emergência

### Interno
- **Tech Lead**: [emergência]
- **DevOps**: [plantão]
- **Product**: [comunicação]

### Externo
- **Supabase Support**: support@supabase.com
- **Belvo Support**: support@belvo.com
- **Hosting**: [provedor de infraestrutura]

### Escalação
1. **Nível 1** (0-15 min): Dev de plantão
2. **Nível 2** (15-30 min): Tech Lead
3. **Nível 3** (30+ min): CTO/Founder

---

**Última atualização**: Janeiro 2025
**Revisão**: Trimestral
**Próxima revisão**: Abril 2025