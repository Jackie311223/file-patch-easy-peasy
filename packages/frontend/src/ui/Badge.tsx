import React from 'react';
import classNames from 'classnames';

// Basic Badge component, similar to what might be found in Shadcn/ui
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; // Thêm các variant khác nếu cần
}

const badgeVariantStyles: Record<NonNullable<BadgeProps['variant']>, string> = { // Sử dụng NonNullable để đảm bảo variant có giá trị
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground border-border', // Thêm border-border cho outline
  success: 'border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700', // Thêm dark mode
  warning: 'border-transparent bg-yellow-500 text-black hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700', // Thêm dark mode
  // Thêm style cho các variant khác nếu có
};

// Thay đổi ở đây: export trực tiếp const Badge
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          badgeVariantStyles[variant], // Truy cập style của variant
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

// Bỏ dòng 'export default Badge;' nếu bạn muốn sử dụng named export như trên
// export default Badge;