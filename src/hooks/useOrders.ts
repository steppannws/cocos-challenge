import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrders, placeOrder, resetAccount } from '@/api/ordersApi';
import { queryKeys } from '@/api/queryKeys';
import { useSessionStore } from '@/store/session';

const PENDING_POLL_MS = 15_000;

export const useOrders = () => {
  const candidateId = useSessionStore((s) => s.candidateId);
  return useQuery({
    queryKey: queryKeys.orders(candidateId),
    queryFn: ({ signal }) => getOrders(signal),
    // LIMIT orders resolve server-side at random; poll only while one is still PENDING.
    refetchInterval: (query) =>
      query.state.data?.some((order) => order.status === 'PENDING') ? PENDING_POLL_MS : false,
  });
};

const useInvalidateAccount = () => {
  const queryClient = useQueryClient();
  const candidateId = useSessionStore((s) => s.candidateId);
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(candidateId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(candidateId) }),
    ]);
};

export const usePlaceOrder = () => {
  const invalidate = useInvalidateAccount();
  // Never retried (queryClient default): a retried POST can double an order.
  return useMutation({ mutationFn: placeOrder, onSuccess: () => invalidate() });
};

export const useResetAccount = () => {
  const invalidate = useInvalidateAccount();
  return useMutation({ mutationFn: resetAccount, onSuccess: () => invalidate() });
};
