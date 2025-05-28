import React from 'react';
import classNames from 'classnames';
import { ChevronDown } from 'lucide-react'; // Assuming lucide-react is installed

// Basic Select component structure - Placeholder for build purposes
// A real implementation would use a library like Radix UI or Headless UI
// and handle positioning, accessibility, keyboard navigation, etc.

interface SelectContextProps {
  value: string | number | undefined;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const SelectContext = React.createContext<SelectContextProps | undefined>(undefined);

interface SelectProps {
  children: React.ReactNode;
  value?: string | number;
  onValueChange?: (value: string) => void;
  defaultValue?: string | number;
}

const Select: React.FC<SelectProps> = ({ children, value: controlledValue, onValueChange, defaultValue }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | number | undefined>(defaultValue);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    setIsOpen(false); // Close dropdown on selection
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        contentRef.current && !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, isOpen, setIsOpen, triggerRef, contentRef }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(({ children, className, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within a Select');

  return (
    <button
      ref={context.triggerRef} // Use context ref
      type="button"
      onClick={() => context.setIsOpen(prev => !prev)}
      className={classNames(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={context.isOpen}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within a Select');

  // Find the label corresponding to the current value
  // This requires access to the options, which isn't directly available here.
  // For a placeholder, we'll just display the value or placeholder.
  const displayValue = context.value !== undefined ? String(context.value) : placeholder;

  return (
    <span className={classNames(className, { 'text-muted-foreground': !context.value })}>
      {displayValue || placeholder || 'Select...'}
    </span>
  );
};

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  position?: 'popper'; // For potential future Radix-like positioning
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(({ children, className, position = 'popper', ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within a Select');

  if (!context.isOpen) return null;

  return (
    <div
      ref={context.contentRef} // Use context ref
      className={classNames(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1 w-full',
        // Basic positioning, a real implementation needs Popper.js or similar
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({ value, children, className, disabled, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within a Select');

  const isSelected = context.value === value;

  return (
    <div
      ref={ref}
      className={classNames(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        { 'font-semibold': isSelected },
        className
      )}
      onClick={() => !disabled && context.onValueChange(value)}
      aria-selected={isSelected}
      role="option"
      data-disabled={disabled ? '' : undefined}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {/* Checkmark placeholder */}
        {isSelected && <span className="h-2 w-2 rounded-full bg-primary"></span>}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};

