import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoading } from '@/ui/Loading/LoadingProvider'; // Giả sử đây là named export
// Sửa import Spinner thành LoadingSpinner (named import) và cập nhật tên sử dụng
import { LoadingSpinner } from "@/ui/Loading/Spinner"; 

interface InfiniteScrollProps<T> {
  fetchData: (page: number, pageSize: number) => Promise<T[]>; // Thêm pageSize vào fetchData
  renderItem: (item: T, index: number) => React.ReactNode;
  itemKey: (item: T) => string | number;
  initialPage?: number; // Thêm initialPage
  pageSize?: number;
  threshold?: number; // Khoảng cách từ cuối trang để bắt đầu load thêm (pixels)
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: ((error: Error, onRetry: () => void) => React.ReactNode); // Cho phép truyền hàm retry vào errorComponent
  className?: string;
  scrollContainer?: Window | HTMLElement | null; // Cho phép custom scroll container
  hasMoreInitial?: boolean; // Trạng thái ban đầu của hasMore
}

export function InfiniteScroll<T>({
  fetchData,
  renderItem,
  itemKey,
  initialPage = 1, // Bắt đầu từ trang 1
  pageSize = 20,
  threshold = 300, // Tăng threshold
  emptyComponent = <div className="text-center py-8 text-gray-500">No items to display.</div>,
  loadingComponent = <div className="flex justify-center py-4"><LoadingSpinner size="md" /></div>, // Sử dụng LoadingSpinner
  errorComponent = (error, onRetry) => (
    <div className="text-center py-8 text-red-500">
      <p>Error loading data: {error.message}</p>
      <button 
        onClick={onRetry} 
        className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  ),
  className = '',
  scrollContainer = window,
  hasMoreInitial = true,
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'idle' | 'loadingInitial' | 'loadingMore' | 'error' | 'success'>('idle');
  
  const { setLoadingState } = useLoading(); // Hook này có thể dùng để quản lý state loading toàn cục nếu cần

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (status === 'loadingMore' || status === 'loadingInitial') return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreData();
      }
    }, { threshold: 0.8 }); // Tùy chỉnh threshold của IntersectionObserver

    if (node) observer.current.observe(node);
  }, [status, hasMore]); // Thêm các dependency cần thiết


  const loadInitialData = useCallback(async () => {
    if (status === 'loadingInitial') return;
    setStatus('loadingInitial');
    setError(null);
    setLoadingState('infiniteScrollInitial', true); // Ví dụ key cho global loading

    try {
      const initialData = await fetchData(initialPage, pageSize);
      setItems(initialData);
      setPage(initialPage);
      setHasMore(initialData.length === pageSize);
      setStatus(initialData.length > 0 ? 'success' : 'idle'); // Nếu không có data thì vẫn là idle (để hiện emptyComponent)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load initial data'));
      setStatus('error');
    } finally {
      setLoadingState('infiniteScrollInitial', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, initialPage, pageSize, setLoadingState]); // Không nên bỏ qua dependencies, fetchData cần được bọc trong useCallback ở component cha

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Chạy khi loadInitialData thay đổi (thường là chỉ một lần nếu deps của nó ổn định)

  const loadMoreData = useCallback(async () => {
    if (!hasMore || status === 'loadingMore' || status === 'loadingInitial') return;

    setStatus('loadingMore');
    setError(null);
    setLoadingState('infiniteScrollMore', true); // Ví dụ key cho global loading

    try {
      const nextPageToFetch = page + 1;
      const newData = await fetchData(nextPageToFetch, pageSize);
      
      setItems(prevItems => [...prevItems, ...newData]);
      setPage(nextPageToFetch);
      setHasMore(newData.length === pageSize);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more data'));
      setStatus('error');
    } finally {
      setLoadingState('infiniteScrollMore', false);
    }
  }, [fetchData, hasMore, page, pageSize, setLoadingState, status]);

  // Bỏ scroll event listener, thay bằng IntersectionObserver cho hiệu suất tốt hơn
  // useEffect(() => { ... });

  if (status === 'loadingInitial' && items.length === 0) { // Chỉ hiện full loading cho lần đầu tiên và chưa có item nào
    return <>{loadingComponent}</>;
  }

  if (status === 'error' && error) {
    return <>{errorComponent(error, loadInitialData)}</>; // Truyền hàm retry
  }

  if (items.length === 0 && (status === 'idle' || status === 'success') && !hasMore ) { // Điều kiện hiện emptyComponent rõ ràng hơn
    return <>{emptyComponent}</>;
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        // Gắn ref vào phần tử cuối cùng để trigger IntersectionObserver
        if (items.length === index + 1) {
          return (
            <div ref={lastElementRef} key={itemKey(item)}>
              {renderItem(item, index)}
            </div>
          );
        }
        return (
          <React.Fragment key={itemKey(item)}>
            {renderItem(item, index)}
          </React.Fragment>
        );
      })}
      {status === 'loadingMore' && loadingComponent}
      {!hasMore && items.length > 0 && ( // Hiển thị thông báo khi đã hết dữ liệu
        <div className="text-center py-4 text-gray-500">No more items to load.</div>
      )}
    </div>
  );
}