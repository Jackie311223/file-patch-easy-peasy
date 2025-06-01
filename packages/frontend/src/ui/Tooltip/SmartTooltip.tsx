import React from 'react';

interface SmartTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef<HTMLElement | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = React.useCallback(() => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 8;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 8;
        break;
      case 'bottom':
        top = targetRect.bottom + 8;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 8;
        break;
    }

    // Adjust for viewport boundaries
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 0;
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width;
    if (top < 0) top = 0;
    if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height;

    setTooltipPosition({ top, left });
  }, [position]);

  const showTooltip = React.useCallback(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setTimeout(calculatePosition, 0);
      }, delay);
    } else {
      setIsVisible(true);
      setTimeout(calculatePosition, 0);
    }
  }, [calculatePosition, delay]);

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isVisible, calculatePosition]);

  // Clone the child element to attach our event handlers
  const childElement = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      targetRef.current = node;
      
      // Forward the ref if the child has one
      const childRef = (children as any).ref;
      if (childRef) {
        if (typeof childRef === 'function') {
          childRef(node);
        } else if (childRef.hasOwnProperty('current')) {
          childRef.current = node;
        }
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    },
  });

  return (
    <>
      {childElement}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-sm"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

export default SmartTooltip;