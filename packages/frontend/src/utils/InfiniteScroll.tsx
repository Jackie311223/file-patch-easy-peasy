import React, { useState, useEffect, useCallback } from 'react';
import { useLoading } from '@/ui/Loading/LoadingProvider';
import Spinner from "@/ui/Loading/Spinner";

interface InfiniteScrollProps<T> {
  fetchData: (page: number) => Promise<T[]>;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemKey: (item: T) => string | number;
  pageSize?: number;
  threshold?: number;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
}

export function InfiniteScroll<T>({
  fetchData,
  renderItem,
  itemKey,
  pageSize = 20,
  threshold = 200,
  emptyComponent = <div className="text-center py-8">No items to display</div>,
  loadingComponent = <div className="flex justify-center py-4"><Spinner size="md" /></div>,
  errorComponent = <div className="text-center py-4 text-error">Error loading data. Please try again.</div>,
  className = '',
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { setLoadingState } = useLoading();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        setLoadingState('infiniteScroll', true);
        const data = await fetchData(1);
        setItems(data);
        setHasMore(data.length === pageSize);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setInitialLoading(false);
        setLoadingState('infiniteScroll', false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more data when scrolling
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || initialLoading) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const newData = await fetchData(nextPage);
      
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setItems(prevItems => [...prevItems, ...newData]);
        setPage(nextPage);
        setHasMore(newData.length === pageSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more data'));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchData, hasMore, initialLoading, loadingMore, page, pageSize]);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + threshold >= document.documentElement.offsetHeight) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, threshold]);

  if (initialLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent}</>;
  }

  if (items.length === 0) {
    return <>{emptyComponent}</>;
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <React.Fragment key={itemKey(item)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
      {loadingMore && loadingComponent}
    </div>
  );
}
