import React from 'react';
import classNames from 'classnames';

// Đổi tên interface props cho nhất quán nếu component đổi tên
export interface LoadingSpinnerProps { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Thay đổi ở đây: đổi tên component thành LoadingSpinner và export trực tiếp const
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <svg 
        className={`animate-spin ${sizeClasses[size]} text-primary`} // Giả sử bạn có class 'text-primary' trong CSS/Tailwind
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};
LoadingSpinner.displayName = 'LoadingSpinner'; // Cập nhật displayName

// Bỏ dòng 'export default Spinner;' nếu bạn muốn sử dụng named export như trên
// export default Spinner;