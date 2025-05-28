import React, { ReactNode } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onSubmit?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideFooter?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  onSubmit,
  size = 'md',
  hideFooter = false
}) => {
  // Determine modal width based on size prop
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-2xl';
      case 'lg': return 'max-w-4xl';
      case 'xl': return 'max-w-6xl';
      default: return 'max-w-2xl';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className={`w-full ${getModalWidth()} rounded-lg bg-white shadow-xl max-h-[90vh] flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {title}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content - with overflow scrolling */}
          <div className="px-6 py-4 overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {!hideFooter && (
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 shrink-0">
              <Button 
                onClick={onClose} 
                variant="secondary"
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              {onSubmit && (
                <Button 
                  onClick={onSubmit} 
                  variant="primary"
                  isLoading={isLoading}
                >
                  {submitText}
                </Button>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FormModal;
