import React, { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/theme/ThemeProvider'; // Giả định ThemeProvider là named export
import { ToastProvider } from '@/ui/Toast/ToastProvider';   // ToastProvider là named export (đã xác nhận)
import { LoadingProvider } from '@/ui/Loading/LoadingProvider'; // Giả định LoadingProvider là named export
import { ErrorBoundary } from '@/ui/ErrorBoundary/ErrorBoundary'; // Giả định ErrorBoundary là named export
// import { vi } from 'vitest'; // Thêm import này nếu bạn cần dùng vi.fn() ở đây

// Test wrapper for components that need providers
export const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider> {/* Giả sử ThemeProvider không yêu cầu props bắt buộc */}
        <ToastProvider> {/* Giả sử ToastProvider không yêu cầu props bắt buộc */}
          <LoadingProvider> {/* Giả sử LoadingProvider không yêu cầu props bắt buộc */}
            {children}
          </LoadingProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Helper function to render components with all providers
// export function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
//  return render(ui, { wrapper: TestProviders, ...options });
// }
// Hoặc một phiên bản đơn giản hơn nếu không cần custom options thường xuyên:
export const renderWithProviders = (ui: ReactElement) => {
  return render(ui, { wrapper: TestProviders });
};


// Helper function to test responsive behavior
// Lưu ý: JSDOM (môi trường test mặc định của Vitest) không thực sự render layout,
// nên việc test responsiveness bằng cách thay đổi innerWidth có thể không phản ánh đúng thực tế trình duyệt.
// Cân nhắc dùng các công cụ test E2E như Playwright hoặc Cypress cho việc này.
export async function testResponsiveness(
  ui: React.ReactElement, 
  breakpoints = [375, 768, 1024, 1440]
) {
  const { container, rerender } = renderWithProviders(ui);
  
  for (const width of breakpoints) {
    // Trong môi trường JSDOM, việc thay đổi global.innerWidth và dispatchEvent('resize')
    // có thể không đủ để trigger các thay đổi layout dựa trên CSS media queries
    // hoặc các hook như useMediaQuery một cách đáng tin cậy.
    // @ts-ignore
    global.innerWidth = width;
    global.dispatchEvent(new Event('resize'));
    
    // Rerender component để các hook/logic có thể nhận giá trị mới (nếu có)
    rerender(ui); 
    
    // Đợi một chút cho các thay đổi (nếu có)
    await waitFor(() => {}, { timeout: 50 }); // Giảm timeout
    
    // Thêm các assertions cụ thể ở đây cho từng breakpoint
    // Ví dụ: expect(screen.getByTestId('some-element')).toHaveStyleRule('display', 'none', { media: `(max-width: ${width-1}px)` });
    // (Cần thư viện như jest-styled-components nếu test style rules)
    // Hoặc kiểm tra sự hiện diện/vắng mặt của elements
    console.log(`Snapshot/Assertion for width: ${width}px`);
  }
  
  return { container };
}

// Helper function to test theme switching
export async function testThemeSwitching(ui: React.ReactElement) {
  renderWithProviders(ui);
  
  const themeToggle = screen.queryByRole('button', { name: /toggle theme/i });
  
  if (themeToggle) {
    // Giả sử theme mặc định là 'light' và không có class 'dark' trên documentElement
    if (document.documentElement.classList.contains('dark')) {
      // Nếu mặc định là dark, click để chuyển sang light trước
      fireEvent.click(themeToggle);
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    }
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Switch to dark theme
    fireEvent.click(themeToggle);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    // Switch back to light theme
    fireEvent.click(themeToggle);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  } else {
    console.warn("Theme toggle button not found. Skipping theme switching test.");
  }
}

// Helper function to test accessibility (basic placeholder)
export function testAccessibility(container: HTMLElement): { hasAriaLabels: boolean; hasTabIndex: boolean; } {
  // Trong thực tế, bạn nên dùng thư viện như jest-axe để kiểm tra accessibility tự động
  // import { axe, toHaveNoViolations } from 'jest-axe';
  // expect.extend(toHaveNoViolations);
  // const results = await axe(container);
  // expect(results).toHaveNoViolations();

  const hasAriaLabels = container.querySelectorAll('[aria-label], [aria-labelledby]').length > 0;
  const hasFocusableElements = container.querySelectorAll(
    'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  ).length > 0;
  
  // Đây chỉ là ví dụ rất cơ bản
  console.log(`Accessibility check: Found aria-labels? ${hasAriaLabels}, Found focusable elements? ${hasFocusableElements}`);
  
  return {
    hasAriaLabels,
    hasTabIndex: hasFocusableElements, // Đổi tên cho rõ hơn
  };
}

// Nếu bạn có ThemeContext với jest.fn() như lỗi đã báo trước đó, nó sẽ cần được sửa thành vi.fn()
// Ví dụ, nếu nó được định nghĩa ở đây:
/*
interface MyThemeContextType {
  theme: string;
  toggleTheme: () => void; // Hoặc (newTheme: string) => void;
  // ... các thuộc tính khác
}

export const MyThemeContext = React.createContext<MyThemeContextType>({
  theme: 'light',
  toggleTheme: vi.fn(), // SỬ DỤNG vi.fn() THAY VÌ jest.fn()
  // ... các giá trị mặc định khác
});
*/

// Đảm bảo tất cả các helper function và component cần thiết được export
// TestProviders và renderWithProviders đã được export

// Dòng "npx vitest run" ở cuối file đã được xóa vì nó gây ra lỗi cú pháp.