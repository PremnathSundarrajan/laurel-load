import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useSessionQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: [key],
    queryFn,
    ...options,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
