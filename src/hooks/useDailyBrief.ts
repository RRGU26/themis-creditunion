import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useDailyBrief() {
  return useQuery({
    queryKey: ['daily-brief'],
    queryFn: () => api.getDailyBrief(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}
