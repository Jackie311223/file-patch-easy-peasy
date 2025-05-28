import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { ToastProvider } from '@/ui/Toast/ToastProvider';
import { LoadingProvider } from '@/ui/Loading/LoadingProvider';
import { ErrorBoundary } from '@/ui/ErrorBoundary/ErrorBoundary';

// Test wrapper for components that need providers
export const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Helper function to render components with all providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

// Helper function to test responsive behavior
export async function testResponsiveness(component: React.ReactElement, breakpoints = [375, 768, 1024, 1440]) {
  const { container } = renderWithProviders(component);
  
  // Test at different viewport widths
  for (const width of breakpoints) {
    // Resize viewport
    global.innerWidth = width;
    global.dispatchEvent(new Event('resize'));
    
    // Wait for any resize handlers to complete
    await waitFor(() => {}, { timeout: 100 });
    
    // Take a snapshot or perform specific assertions
    // This is where you would add specific checks for each breakpoint
    console.log(`Testing at width: ${width}px`);
  }
  
  return { container };
}

// Helper function to test theme switching
export async function testThemeSwitching(component: React.ReactElement) {
  const { container } = renderWithProviders(component);
  
  // Find theme toggle if it exists
  const themeToggle = screen.queryByRole('button', { name: /toggle theme/i });
  
  if (themeToggle) {
    // Test light theme (default)
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
  }
  
  return { container };
}

// Helper function to test accessibility
export function testAccessibility(container: HTMLElement) {
  // This would use axe-core or similar in a real implementation
  const hasAriaLabels = container.querySelectorAll('[aria-label]').length > 0;
  const hasTabIndex = container.querySelectorAll('[tabindex]').length > 0;
  
  return {
    hasAriaLabels,
    hasTabIndex,
    // Other accessibility checks would go here
  };
}
