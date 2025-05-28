import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ActionSuggestionProps {
  message: string;
  action: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
  autoHideDuration?: number;
  className?: string;
}

export const ActionSuggestion: React.FC<ActionSuggestionProps> = ({
  message,
  action,
  onDismiss,
  autoHideDuration = 10000,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`bg-primary-50 dark:bg-gray-800 border-l-4 border-primary-500 p-4 rounded-md shadow-md ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
          <div className="mt-2">
            <button
              type="button"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              onClick={() => {
                action.onClick();
                setIsVisible(false);
                onDismiss();
              }}
            >
              {action.label}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
