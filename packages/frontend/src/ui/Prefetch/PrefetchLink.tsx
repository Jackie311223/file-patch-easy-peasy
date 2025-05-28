import React, { useEffect, useRef, useState } from 'react';
import { Link, LinkProps } from 'react-router-dom';

// Renamed 'prefetch' prop to 'enablePrefetch' to avoid conflict with LinkProps
interface PrefetchLinkProps extends Omit<LinkProps, 'prefetch'> { // Omit the conflicting prop
  enablePrefetch?: boolean;
  prefetchTimeout?: number;
  onPrefetch?: () => Promise<any>;
}

export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  children,
  enablePrefetch = true, // Use the renamed prop
  prefetchTimeout = 300,
  onPrefetch,
  ...props
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPrefetched, setIsPrefetched] = useState(false);

  const prefetchData = async () => {
    if (!isPrefetched && onPrefetch) {
      try {
        await onPrefetch();
        setIsPrefetched(true);
      } catch (error) {
        console.error('Error prefetching data:', error);
      }
    }
  };

  const handleMouseEnter = () => {
    // Use the renamed prop
    if (enablePrefetch && !isPrefetched && onPrefetch) {
      timeoutRef.current = setTimeout(() => {
        prefetchData();
      }, prefetchTimeout);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Use IntersectionObserver to prefetch when link becomes visible
  useEffect(() => {
    // Use the renamed prop
    if (!enablePrefetch || isPrefetched || !onPrefetch || !linkRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetchData();
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(linkRef.current);

    return () => {
      observer.disconnect();
    };
    // Use the renamed prop in dependency array
  }, [enablePrefetch, isPrefetched, onPrefetch]);

  return (
    <Link
      ref={linkRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
};
