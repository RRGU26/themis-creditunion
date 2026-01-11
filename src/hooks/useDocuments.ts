import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useDocuments(params?: {
  limit?: number;
  offset?: number;
  priority?: string;
  agency?: string;
  since?: string;
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => api.getDocuments(params),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => api.getDocument(id),
    enabled: !!id,
  });
}
