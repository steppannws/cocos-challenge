import { useQuery } from '@tanstack/react-query';
import { getPortfolio } from '@/api/portfolioApi';
import { queryKeys } from '@/api/queryKeys';
import { useSessionStore } from '@/store/session';

export const usePortfolio = () => {
  const candidateId = useSessionStore((s) => s.candidateId);
  return useQuery({
    queryKey: queryKeys.portfolio(candidateId),
    queryFn: ({ signal }) => getPortfolio(signal),
  });
};
