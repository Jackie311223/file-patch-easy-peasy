import React, { useEffect } from 'react'; 
import classNames from 'classnames';
import { XIcon } from 'lucide-react'; 

export interface DialogProps {
  open: boolean; 
  onOpenChange?: (open: boolean) => void; 
  children: React.ReactNode;
  title?: string; // Vẫn giữ title ở đây nếu Dialog chính có thể hiển thị title trực tiếp
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  closeButtonClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fit'; 
  hideCloseButton?: boolean; 
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  title, // title prop có thể không cần nếu DialogHeader/DialogTitle luôn được dùng trong children
  className,
  contentClassName,
  overlayClassName,
  closeButtonClassName,
  size = 'md',
  hideCloseButton = false,
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false);
      }
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sizeClasses: Record<NonNullable<DialogProps['size']>, string> = { 
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full w-full h-full sm:rounded-none sm:max-h-full sm:m-0', // Full screen điều chỉnh
    fit: 'max-w-fit w-auto', 
  };

  return (
    <div
      className={classNames(
        'fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto', 
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-main-title' : undefined} // Nếu Dialog chính có title
      aria-describedby="dialog-main-content" // Nếu children chứa nội dung chính
    >
      <div
        className={classNames(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out', 
          overlayClassName
        )}
        onClick={() => onOpenChange?.(false)} 
        aria-hidden="true"
      ></div>

      <div
        className={classNames(
          'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out w-full my-8 flex flex-col', // Thêm flex flex-col
          sizeClasses[size],
          contentClassName
        )}
        role="document" 
      >
        {!hideCloseButton && (
          <button
            type="button"
            className={classNames(
              'absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 z-10', // Thêm z-10
              closeButtonClassName
            )}
            onClick={() => onOpenChange?.(false)} 
            aria-label="Close dialog" 
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        
        {/* Children sẽ bao gồm DialogHeader, DialogContent, DialogFooter */}
        {/* Nếu Dialog có prop 'title', bạn có thể render nó ở đây HOẶC để DialogHeader xử lý */}
        {/* {title && !childrenContainsHeader(children) && ( // Logic kiểm tra children phức tạp
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )} */}
        {children}
      </div>
    </div>
  );
};

// Các sub-components này giúp cấu trúc nội dung Dialog từ bên ngoài.
export const DialogContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  // Thêm overflow-y-auto nếu nội dung có thể dài
  <div className={classNames("p-6 text-sm text-gray-700 dark:text-gray-300 flex-grow overflow-y-auto", className)} id="dialog-main-content"> {/* Thêm flex-grow */}
    {children}
  </div>
);

export const DialogHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={classNames("px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0", className)}> {/* Thêm flex-shrink-0 */}
    {children}
  </div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  // Đảm bảo id này là duy nhất nếu có nhiều DialogTitle hoặc dùng aria-labelledby trỏ tới nó
  <h3 id="dialog-main-title" className={classNames("text-xl font-semibold leading-6 text-gray-900 dark:text-white", className)}> 
    {children}
  </h3>
);

export const DialogDescription: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <p className={classNames("text-sm text-gray-500 dark:text-gray-400 mt-1", className)}> 
    {children}
  </p>
);

export const DialogFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={classNames("px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-row-reverse space-x-2 space-x-reverse flex-shrink-0", className)}> {/* Thêm flex-shrink-0 */}
    {children}
  </div>
);

export default Dialog;