import { useCallback, useState } from 'react';

export type PaginationOptions = {
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
};

type PaginationResult = {
  count: number;
  page: number;
  paginate: <T,>(items: Array<T>) => Array<T>;
  reset: () => void;
  rowsPerPage: number;
  setCount: (c: number) => void;
  limit: number;
  offset: number;
};

export const DEFAULT_ROWS_PER_PAGE = 20;

function usePagination(options?: PaginationOptions): PaginationResult {
  const [count, setCount] = useState(0);
  const [rowsPerPage] = useState(options?.rowsPerPage ?? DEFAULT_ROWS_PER_PAGE);
  const [page, setPage] = useState(0);


  const reset = useCallback(() => {
    setPage(0);
  }, [])

  const paginate = useCallback<PaginationResult['paginate']>(
    (items) => items.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [page, rowsPerPage]
  );
  
  return {
    count,
    rowsPerPage,
    page,
    paginate,
    setCount,
    reset,
    limit: rowsPerPage,
    offset: page * rowsPerPage
  };
}

export default usePagination;
