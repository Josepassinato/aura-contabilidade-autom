export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[] | null;
  error: any;
  count: number | null;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}