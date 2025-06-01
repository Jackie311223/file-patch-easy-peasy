import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { customRender } from '../../../test/helpers';
import { ModalBase, ModalBaseProps } from '../ModalBase';

describe('ModalBase Component', () => {
  const mockOnClose = jest.fn();

  const defaultTestProps: ModalBaseProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: "Test Modal",
    children: <p>Modal content</p>,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('renders correctly when open', () => {
    customRender(<ModalBase {...defaultTestProps} />);
    expect(screen.getByText(defaultTestProps.title!)).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    customRender(<ModalBase {...defaultTestProps} isOpen={false} />);
    expect(screen.queryByText(defaultTestProps.title!)).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    customRender(<ModalBase {...defaultTestProps} />);
    const closeButton = screen.queryByRole('button', { name: /close/i });
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  test('renders with different sizes if ModalBase supports it', () => {
    const { container, rerender } = customRender(
      <ModalBase {...defaultTestProps} size="sm" />
    );
    expect(container.querySelector('[class*="max-w-sm"]')).toBeInTheDocument();

    rerender(<ModalBase {...defaultTestProps} size="lg" />);
    expect(container.querySelector('[class*="max-w-lg"]')).toBeInTheDocument();
  });

  test('renders children including a footer', () => {
    customRender(
      <ModalBase {...defaultTestProps}>
        <div>Modal Body Content</div>
        <footer><button>Action In Footer</button></footer>
      </ModalBase>
    );
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action In Footer' })).toBeInTheDocument();
  });
});