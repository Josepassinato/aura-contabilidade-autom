import { useState, useCallback } from 'react';
import { PaginationOptions, PaginatedResponse } from '@/types/pagination';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;
  getPaginationOptions: () => PaginationOptions;
}

export function usePagination({ 
  initialPage = 1, 
  initialPageSize = 10 
}: UsePaginationProps = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  const getPaginationOptions = useCallback((): PaginationOptions => ({
    page: currentPage,
    pageSize: pageSize
  }), [currentPage, pageSize]);

  return {
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    resetPagination,
    getPaginationOptions
  };
}