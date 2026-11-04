import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrders, placeOrder, resetAccount } from '@/api/ordersApi';
import { queryKeys } from '@/api/queryKeys';
import type { Order } from '@/schemas/order';
import { useSessionStore } from '@/store/session';
import { hasSettled } from '@/utils/orders';

const PENDING_POLL_MS = 15_000;

export const useOrders = () => {
  const queryClient = useQueryClient();
  const candidateId = useSessionStore((s) => s.candidateId);
  const queryKey = queryKeys.orders(candidateId);
  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const previous = queryClient.getQueryData<Order[]>(queryKey);
      const orders = await getOrders(candidateId, signal);
      // A settled LIMIT order moved cash and shares server-side: the cached portfolio is now wrong.
      if (previous && hasSettled(previous, orders)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(candidateId) });
      }
      return orders;
    },
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
  // Never retried (queryClient default): a retried POST can double an order. Reload on error too:
  // a timed-out POST may still have created the order.
  return useMutation({ mutationFn: placeOrder, onSettled: () => invalidate() });
};

export const useResetAccount = () => {
  const invalidate = useInvalidateAccount();
  return useMutation({ mutationFn: resetAccount, onSuccess: () => invalidate() });
};
