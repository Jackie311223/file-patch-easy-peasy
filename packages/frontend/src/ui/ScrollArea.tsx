import { cn } from '@/utils/cn';
import React from 'react';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
  orientation?: 'vertical' | 'horizontal';
  maxHeight?: string;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, viewportClassName, orientation = 'vertical', maxHeight, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          orientation === 'horizontal' ? 'h-full' : '',
          className
        )}
        style={maxHeight ? { maxHeight } : undefined}
        {...props}
      >
        <div
          className={cn(
            'h-full overflow-auto',
            orientation === 'horizontal' ? 'flex' : '',
            viewportClassName
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

export default ScrollArea;
