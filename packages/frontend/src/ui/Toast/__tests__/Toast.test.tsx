import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestProviders } from '../../utils/testUtils';
import { Toast } from '@/ui/Toast/Toast';
import { ToastProvider, useToast } from '@/ui/Toast/ToastProvider';

// Test component to trigger toast
const ToastTester = () => {
  const { toast } = useToast();
  
  return (
    <div>
      <button onClick={() => toast('Success message', { type: 'success' })}>
        Show Success Toast
      </button>
      <button onClick={() => toast('Error message', { type: 'error' })}>
        Show Error Toast
      </button>
      <button onClick={() => 
        toast('Action message', { 
          type: 'info',
          action: {
            label: 'Undo',
            onClick: jest.fn()
          }
        })
      }>
        Show Action Toast
      </button>
    </div>
  );
};

describe('Toast System', () => {
  test('Toast component renders correctly with different types', () => {
    const onDismiss = jest.fn();
    
    const { rerender } = render(
      <Toast 
        message="Success message" 
        type="success" 
        onDismiss={onDismiss} 
      />
    );
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(document.querySelector('.bg-success-light')).toBeInTheDocument();
    
    rerender(
      <Toast 
        message="Error message" 
        type="error" 
        onDismiss={onDismiss} 
      />
    );
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(document.querySelector('.bg-error-light')).toBeInTheDocument();
  });
  
  test('Toast dismisses when close button is clicked', () => {
    const onDismiss = jest.fn();
    
    render(
      <Toast 
        message="Test message" 
        type="info" 
        onDismiss={onDismiss} 
      />
    );
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
  
  test('Toast with action renders action button', () => {
    const onDismiss = jest.fn();
    const onAction = jest.fn();
    
    render(
      <Toast 
        message="Action message" 
        type="info" 
        onDismiss={onDismiss}
        action={{
          label: 'Undo',
          onClick: onAction
        }}
      />
    );
    
    const actionButton = screen.getByText('Undo');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
  
  test('ToastProvider shows toasts when triggered', async () => {
    render(
      <TestProviders>
        <ToastTester />
      </TestProviders>
    );
    
    // Show success toast
    fireEvent.click(screen.getByText('Show Success Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
    
    // Show error toast
    fireEvent.click(screen.getByText('Show Error Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    
    // Show action toast
    fireEvent.click(screen.getByText('Show Action Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Action message')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });
  });
});
