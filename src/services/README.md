# Services - Consultas Supabase Centralizadas

Esta pasta contém os serviços centralizados para organizar todas as consultas ao banco Supabase, extraindo-as dos componentes para melhor manutenibilidade e reutilização.

## Estrutura dos Serviços

### 🔐 Auth Services (`/auth`)
**Arquivo**: `authService.ts`

Gerencia todas as operações de autenticação:
- `signInWithPassword()` - Login com email/senha
- `signUp()` - Cadastro de novos usuários  
- `getSession()` - Obter sessão atual
- `signOut()` - Logout do usuário
- `resetPasswordForEmail()` - Redefinição de senha
- `onAuthStateChange()` - Listener para mudanças de autenticação

### 👤 User Services (`/user`)

#### UserProfileService (`userProfileService.ts`)
Operações relacionadas aos perfis de usuário:
- `getUserProfile()` - Buscar perfil por ID do usuário
- `createUserProfile()` - Criar novo perfil
- `updateUserProfile()` - Atualizar dados do perfil
- `getAllUserProfiles()` - Listar todos os perfis (admins)
- `getUserProfilesByRole()` - Buscar perfis por role

#### UserInvitationService (`userInvitationService.ts`)
Gerenciamento de convites de usuários:
- `validateInvitation()` - Validar convite por token
- `getInvitationById()` - Buscar convite específico
- `updateInvitationStatus()` - Atualizar status do convite
- `createInvitation()` - Criar novo convite
- `getPendingInvitations()` - Listar convites pendentes
- `cleanupExpiredInvitations()` - Remover convites expirados

### 🔒 Security Services (`/security`)
**Arquivo**: `securityService.ts`

Controle de acesso e validações de segurança:
- `hasRole()` - Verificar se usuário tem role específica
- `isAdmin()` / `isAccountant()` - Verificação de roles
- `canAccessClient()` - Validar acesso a cliente específico
- `getCurrentUserRole()` - Obter role do usuário atual
- `generateClientAccessToken()` - Gerar tokens de acesso
- `validateClientAccessToken()` - Validar tokens
- `revokeClientAccessToken()` - Revogar tokens

### 🏢 Client Services (`/clients`)
**Arquivo**: `clientsQueryService.ts`

Operações com dados de clientes:
- `getAccountantClients()` - Clientes de um contador
- `getAllClients()` - Todos os clientes (admins)
- `getClientById()` / `getClientByCnpj()` - Busca específica
- `createClient()` / `updateClient()` / `deleteClient()` - CRUD
- `getClientsByStatus()` / `getClientsByRegime()` - Filtros
- `getClientStats()` - Estatísticas de clientes

### 📊 Report Services (`/reports`)
**Arquivo**: `reportsQueryService.ts`

Gerenciamento de relatórios:
- `getClientReports()` - Relatórios de cliente específico
- `getAllReports()` - Todos os relatórios
- `getReportById()` - Buscar relatório específico
- `createReport()` - Criar novo relatório
- `updateReportStatus()` - Atualizar status
- `incrementDownloadCount()` - Incrementar downloads
- `getExpiringReports()` - Relatórios próximos do vencimento
- `cleanupExpiredReports()` - Limpar expirados

### 📄 Document Services (`/documents`)
**Arquivo**: `documentsQueryService.ts`

Operações com documentos:
- `getClientDocuments()` - Documentos de cliente
- `getAllDocuments()` - Todos os documentos
- `getDocumentById()` - Buscar documento específico
- `createDocument()` / `updateDocument()` / `deleteDocument()` - CRUD
- `getDocumentsByType()` / `getDocumentsByTags()` - Filtros
- `getDocumentStats()` - Estatísticas de documentos

## Como Usar

### Importação Simplificada
```typescript
import { AuthService, UserProfileService, SecurityService } from '@/services';
```

### Exemplos de Uso

#### Autenticação
```typescript
// Login
const { data, error } = await AuthService.signInWithPassword(email, password);

// Cadastro
const { data, error } = await AuthService.signUp(email, password, {
  full_name: 'Nome do Usuário',
  role: 'client'
});
```

#### Buscar Dados de Cliente
```typescript
// Buscar cliente específico
const { data, error } = await ClientsQueryService.getClientById(clientId);

// Listar clientes do contador
const { data, error } = await ClientsQueryService.getAccountantClients(accountantId);
```

#### Verificação de Segurança
```typescript
// Verificar se usuário pode acessar cliente
const canAccess = await SecurityService.canAccessClient(userId, clientId);

// Verificar role
const isAdmin = await SecurityService.isAdmin(userId);
```

## Benefícios da Refatoração

1. **Manutenibilidade**: Consultas centralizadas em um local
2. **Reutilização**: Funções podem ser usadas em múltiplos componentes
3. **Tipagem**: TypeScript oferece melhor autocomplete e validação
4. **Testabilidade**: Serviços podem ser facilmente testados
5. **Organização**: Separação clara de responsabilidades
6. **Performance**: Evita duplicação de código

## Migração de Componentes

### Antes (consulta direta no componente):
```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Depois (usando serviço):
```typescript
const { data, error } = await UserProfileService.getUserProfile(userId);
```

## Compatibilidade

Os hooks existentes (`useSecureDataAccess`, etc.) foram atualizados para usar os novos serviços internamente, mantendo compatibilidade com componentes existentes que ainda não foram migrados.

## Próximos Passos

1. ✅ Criação da estrutura de serviços
2. ✅ Migração de consultas principais
3. ⏳ Migração gradual dos componentes restantes
4. ⏳ Adição de testes unitários para os serviços
5. ⏳ Documentação completa das APIs