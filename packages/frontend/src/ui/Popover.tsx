import React from 'react';
import classNames from 'classnames';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  open,
  onOpenChange,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const handleOpen = React.useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  }, [isOpen, onOpenChange]);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const triggerProps = {
    onClick: handleOpen,
    'aria-haspopup': 'true' as any, // Type assertion to fix TypeScript error
    'aria-expanded': isOpen,
    className: classNames(isOpen && 'bg-accent', className),
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {React.cloneElement(trigger as React.ReactElement, triggerProps)}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {content}
        </div>
      )}
    </div>
  );
};

export default Popover;
