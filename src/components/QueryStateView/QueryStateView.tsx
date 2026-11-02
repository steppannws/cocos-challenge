import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';

type Props = {
  isLoading: boolean;
  error: unknown;
  emptyTitle: string;
  emptyHint?: string;
  onRetry: () => void;
  testID?: string;
};

// Drop-in ListEmptyComponent: the list is empty, so show why (loading, failed, or really empty).
export function QueryStateView({
  isLoading,
  error,
  emptyTitle,
  emptyHint,
  onRetry,
  testID,
}: Props) {
  if (isLoading) {
    return <LoadingState testID={testID ? `${testID}-loading` : undefined} />;
  }
  if (error) {
    return (
      <ErrorState error={error} onRetry={onRetry} testID={testID ? `${testID}-error` : undefined} />
    );
  }
  return (
    <EmptyState
      title={emptyTitle}
      hint={emptyHint}
      testID={testID ? `${testID}-empty` : undefined}
    />
  );
}
