import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useBriefHistory(limit: number = 10) {
  return useQuery({
    queryKey: ['brief-history', limit],
    queryFn: () => api.getBriefHistory(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
