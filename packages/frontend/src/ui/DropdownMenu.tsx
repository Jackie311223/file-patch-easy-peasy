import React from 'react';

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  disabled?: boolean;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className,
  icon,
  disabled = false,
  onClick,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    if (onClick) {
      // Type assertion to handle the event type mismatch
      onClick(event as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>);
    }
  };

  return (
    <div
      className={`flex items-center px-3 py-2 text-sm cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
      } ${className || ''}`}
      onClick={handleClick}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </div>
  );
};

const DropdownMenu: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}> = ({ trigger, children, align = 'left', className }) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const triggerProps = {
    onClick: handleToggle,
    'aria-haspopup': 'true' as any, // Type assertion to fix TypeScript error
    'aria-expanded': open,
    className: open ? 'bg-gray-100' : '',
  };

  return (
    <div className={`relative inline-block text-left ${className || ''}`} ref={menuRef}>
      {React.cloneElement(trigger as React.ReactElement, triggerProps)}
      
      {open && (
        <div
          className={`absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
export { DropdownMenuItem };
