import React from 'react';
import classNames from 'classnames';
import { XIcon } from 'lucide-react'; // Assuming lucide-react is installed

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  closeButtonClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className,
  contentClassName,
  overlayClassName,
  closeButtonClassName,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full',
  };

  return (
    <div
      className={classNames(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      {/* Overlay */}
      <div
        className={classNames(
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
          overlayClassName
        )}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Dialog Content */}
      <div
        className={classNames(
          'relative bg-white rounded-lg shadow-xl transform transition-all w-full',
          sizeClasses[size],
          contentClassName
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          className={classNames(
            'absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none',
            closeButtonClassName
          )}
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <XIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Title (Optional) */}
        {title && (
          <div className="px-6 pt-6">
            <h3 id="dialog-title" className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Exporting individual components often used with Shadcn/ui style dialogs
export const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>{children}</div>
);

export const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={classNames("px-6 pt-6", className)}>{children}</div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h3 id="dialog-title" className={classNames("text-lg font-medium leading-6 text-gray-900", className)}>{children}</h3>
);

export const DialogDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <p className={classNames("text-sm text-gray-500", className)}>{children}</p>
);

export const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={classNames("px-6 pb-6 pt-4 flex justify-end space-x-2", className)}>{children}</div>
);

// Default export for the main Dialog component
export default Dialog;

