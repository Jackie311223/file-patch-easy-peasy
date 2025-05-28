import React, { useMemo } from 'react';

// Higher-order component for memoizing expensive components
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, propsAreEqual);
}

// Hook for memoizing expensive calculations
export function useDeepMemo<T>(factory: () => T, dependencies: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, dependencies);
}

// Hook for memoizing expensive callbacks
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(callback, dependencies);
}

// Example of a memoized component
export const MemoizedComponent = withMemo(
  ({ data, onAction }: { data: any[]; onAction: () => void }) => {
    // Expensive rendering logic here
    return (
      <div>
        {data.map((item, index) => (
          <div key={index} onClick={onAction}>
            {JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.data.length === nextProps.data.length &&
      prevProps.data.every((item, index) => 
        JSON.stringify(item) === JSON.stringify(nextProps.data[index])
      ) &&
      prevProps.onAction === nextProps.onAction
    );
  }
);
