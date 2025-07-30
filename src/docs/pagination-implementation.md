# Paginação em Consultas Supabase

Implementação completa de paginação para consultas Supabase com foco na tabela `user_invitations`.

## ✅ Implementações Realizadas

### 1. **Tipos Base** (`/types/pagination.ts`)
```typescript
interface PaginationOptions {
  page: number;
  pageSize: number;
}

interface PaginatedResponse<T> {
  data: T[] | null;
  error: any;
  count: number | null;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### 2. **Serviço Atualizado** (`UserInvitationService`)
- ✅ `getAllInvitations()` - Com paginação
- ✅ `getPendingInvitations()` - Com paginação  
- ✅ `getInvitationsByStatus()` - Filtro + paginação
- ✅ `searchInvitations()` - Busca + paginação

### 3. **Hook de Paginação** (`usePagination`)
- Gerenciamento de estado de página/tamanho
- Reset automático ao mudar filtros
- Função para obter opções atuais

### 4. **Hook de Convites** (`useInvitations`)
- Integração completa com paginação
- Debounce para busca
- Filtros por status
- Refresh automático

### 5. **Componentes UI**
- **DataPagination** - Componente reutilizável de paginação
- **InvitationsTable** - Exemplo completo de uso
- **useDebounce** - Hook para otimizar buscas

## 🔧 Como Usar

### Exemplo Básico:
```typescript
// Hook simples
const { invitations, currentPage, totalPages, handlePageChange } = useInvitations({
  pageSize: 10
});

// Com filtros
const { invitations } = useInvitations({
  status: 'pending',
  searchTerm: 'usuario@email.com',
  pageSize: 20
});
```

### Componente de Paginação:
```typescript
<DataPagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalCount}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  isLoading={isLoading}
/>
```

## 🚀 Funcionalidades

### **Paginação Inteligente:**
- Navegação por números de página
- Seleção de itens por página (5, 10, 20, 50)
- Indicador de range de itens
- Botões anterior/próximo
- Ellipsis para muitas páginas

### **Filtros Avançados:**
- Busca por email ou nome do convidante
- Filtro por status (todos, pendentes, aceitos, expirados)
- Debounce automático na busca
- Reset de página ao mudar filtros

### **Performance:**
- Consultas otimizadas com `.range()`
- Count exato com `{ count: 'exact' }`
- Debounce para evitar requests desnecessários
- Loading states adequados

## 📊 Exemplo de Consulta
```sql
-- Equivalente SQL gerado pelo Supabase
SELECT *, COUNT(*) OVER() as full_count
FROM user_invitations
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;
```

## 🎯 Benefícios

1. **Performance**: Carrega apenas os dados necessários
2. **UX**: Interface intuitiva de navegação
3. **Escalabilidade**: Funciona com milhares de registros
4. **Reutilização**: Componentes podem ser usados em outras tabelas
5. **Typescript**: Tipagem completa para maior segurança

A implementação está pronta para uso em produção e pode ser facilmente adaptada para outras tabelas do sistema.