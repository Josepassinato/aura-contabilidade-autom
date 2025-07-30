import { useState, useEffect, useCallback } from 'react';
import { UserInvitationService } from '@/services/user/userInvitationService';
import { PaginatedResponse } from '@/types/pagination';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/hooks/use-toast';

interface UseInvitationsProps {
  status?: 'pending' | 'accepted' | 'expired' | 'all';
  searchTerm?: string;
  pageSize?: number;
}

export function useInvitations({ 
  status = 'all', 
  searchTerm = '',
  pageSize = 10 
}: UseInvitationsProps = {}) {
  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const pagination = usePagination({ 
    initialPageSize: pageSize 
  });

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const options = pagination.getPaginationOptions();
      let result: PaginatedResponse<any>;

      if (searchTerm.trim()) {
        result = await UserInvitationService.searchInvitations(searchTerm, options);
      } else if (status === 'all') {
        result = await UserInvitationService.getAllInvitations(options);
      } else if (status === 'pending') {
        result = await UserInvitationService.getPendingInvitations(options);
      } else {
        result = await UserInvitationService.getInvitationsByStatus(status, options);
      }

      if (result.error) {
        throw new Error(result.error.message || 'Erro ao carregar convites');
      }

      setData(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar convites';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [status, searchTerm, pagination.getPaginationOptions, toast]);

  // Reload data when dependencies change
  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  // Reset to first page when status or search changes
  useEffect(() => {
    pagination.setPage(1);
  }, [status, searchTerm]);

  const handlePageChange = useCallback((page: number) => {
    pagination.setPage(page);
  }, [pagination]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    pagination.setPageSize(newPageSize);
  }, [pagination]);

  const refresh = useCallback(() => {
    loadInvitations();
  }, [loadInvitations]);

  return {
    // Data
    invitations: data?.data || [],
    totalCount: data?.count || 0,
    
    // Pagination
    currentPage: data?.currentPage || 1,
    totalPages: data?.totalPages || 0,
    pageSize: pagination.pageSize,
    hasNextPage: data?.hasNextPage || false,
    hasPreviousPage: data?.hasPreviousPage || false,
    
    // State
    isLoading,
    error,
    
    // Actions
    handlePageChange,
    handlePageSizeChange,
    refresh,
    resetPagination: pagination.resetPagination
  };
}