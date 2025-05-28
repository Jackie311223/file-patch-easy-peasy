import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestProviders, testResponsiveness } from '../../utils/testUtils';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

// Test component to trigger theme changes
const ThemeTester = () => {
  const { theme, setTheme, isDark } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="is-dark">{isDark ? 'dark' : 'light'}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('Theme System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset document classes
    document.documentElement.classList.remove('dark');
  });
  
  test('ThemeProvider initializes with default theme', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );
    
    // Default should be 'system'
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
  });
  
  test('ThemeProvider loads theme from localStorage', () => {
    // Set theme in localStorage
    localStorage.setItem('theme', 'dark');
    
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });
  
  test('Theme can be changed', async () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );
    
    // Change to dark theme
    fireEvent.click(screen.getByText('Set Dark'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    // Change to light theme
    fireEvent.click(screen.getByText('Set Light'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
    
    // Verify localStorage is updated
    expect(localStorage.getItem('theme')).toBe('light');
  });
  
  test('System theme responds to system preference', async () => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    );
    
    // Set to system theme
    fireEvent.click(screen.getByText('Set System'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      // Since our mock returns true for dark mode
      expect(screen.getByTestId('is-dark')).toHaveTextContent('dark');
    });
  });
  
  test('Theme is responsive across breakpoints', async () => {
    await testResponsiveness(<ThemeTester />);
    // This test would include specific assertions for theme behavior at different breakpoints
  });
});
