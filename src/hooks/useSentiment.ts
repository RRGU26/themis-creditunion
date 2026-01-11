import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useSentiment() {
  return useQuery({
    queryKey: ['sentiment'],
    queryFn: () => api.getSentiment(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
