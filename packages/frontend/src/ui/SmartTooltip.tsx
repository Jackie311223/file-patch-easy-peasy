import React, { useState, useRef, useEffect } from 'react';

interface SmartTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement; // Expect a single React element
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Calculate tooltip position
  useEffect(() => {
    if (isVisible && targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top + scrollTop - tooltipRect.height - 8;
          left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'right':
          top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + scrollLeft + 8;
          break;
        case 'bottom':
          top = targetRect.bottom + scrollTop + 8;
          left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left + scrollLeft - tooltipRect.width - 8;
          break;
      }

      // Adjust if tooltip would go off screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 0) {
        left = 0;
      } else if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width;
      }

      if (top < 0) {
        top = 0;
      } else if (top + tooltipRect.height > viewportHeight + scrollTop) {
        top = viewportHeight + scrollTop - tooltipRect.height;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  // Ensure children is a single valid element before cloning
  if (!React.isValidElement(children)) {
    console.error("SmartTooltip requires a single React element as children.");
    // Return children as is, or null/error depending on desired strictness
    return children;
  }

  // Type-safe cloning of children with event handlers
  const originalProps = children.props as any; // Use 'as any' cautiously
  const propsToAdd: { [key: string]: any } = {};

  // Ref handling - Combine targetRef and potential original ref
  propsToAdd.ref = (node: HTMLElement | null) => {
    targetRef.current = node;
    const childRef = (children as any).ref;
    if (typeof childRef === 'function') {
      childRef(node);
    } else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
      (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  // Event handlers - Safely merge handlers
  propsToAdd.onMouseEnter = (e: React.MouseEvent) => {
    showTooltip();
    if (originalProps?.onMouseEnter && typeof originalProps.onMouseEnter === 'function') {
      originalProps.onMouseEnter(e);
    }
  };
  propsToAdd.onMouseLeave = (e: React.MouseEvent) => {
    hideTooltip();
    if (originalProps?.onMouseLeave && typeof originalProps.onMouseLeave === 'function') {
      originalProps.onMouseLeave(e);
    }
  };
  propsToAdd.onFocus = (e: React.FocusEvent) => {
    showTooltip();
    if (originalProps?.onFocus && typeof originalProps.onFocus === 'function') {
      originalProps.onFocus(e);
    }
  };
  propsToAdd.onBlur = (e: React.FocusEvent) => {
    hideTooltip();
    if (originalProps?.onBlur && typeof originalProps.onBlur === 'function') {
      originalProps.onBlur(e);
    }
  };

  const childrenWithProps = React.cloneElement(children, { ...originalProps, ...propsToAdd });

  return (
    <>
      {childrenWithProps}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-tooltip bg-gray-900 text-white text-sm rounded-md py-1 px-2 max-w-xs ${className}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
};
