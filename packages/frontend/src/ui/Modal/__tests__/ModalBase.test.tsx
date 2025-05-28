import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestProviders } from '../../utils/testUtils';
import { ModalBase } from '@/ui/Modal/ModalBase';

describe('ModalBase Component', () => {
  test('renders correctly when open', () => {
    render(
      <TestProviders>
        <ModalBase isOpen={true} onClose={jest.fn()} title="Test Modal">
          <p>Modal content</p>
        </ModalBase>
      </TestProviders>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <TestProviders>
        <ModalBase isOpen={false} onClose={jest.fn()} title="Test Modal">
          <p>Modal content</p>
        </ModalBase>
      </TestProviders>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(
      <TestProviders>
        <ModalBase isOpen={true} onClose={onCloseMock} title="Test Modal">
          <p>Modal content</p>
        </ModalBase>
      </TestProviders>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('renders with different sizes', () => {
    const { container, rerender } = render(
      <TestProviders>
        <ModalBase isOpen={true} onClose={jest.fn()} title="Test Modal" size="sm">
          <p>Modal content</p>
        </ModalBase>
      </TestProviders>
    );

    expect(container.querySelector('.max-w-sm')).toBeInTheDocument();

    rerender(
      <TestProviders>
        <ModalBase isOpen={true} onClose={jest.fn()} title="Test Modal" size="lg">
          <p>Modal content</p>
        </ModalBase>
      </TestProviders>
    );

    expect(container.querySelector('.max-w-lg')).toBeInTheDocument();
  });

  test('renders with footer when provided', () => {
    render(
      <TestProviders>
        <ModalBase 
          isOpen={true} 
          onClose={jest.fn()} 
          title="Test Modal"
          footer={<button>Save</button>}
        >
          <p>Modal content</p>
        </ModalBase>
      </TestProviders>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
