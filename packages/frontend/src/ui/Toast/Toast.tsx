import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, action, onDismiss }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-error" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    info: <Info className="h-5 w-5 text-info" />,
  };

  const bgColors = {
    success: 'bg-success-light',
    error: 'bg-error-light',
    warning: 'bg-warning-light',
    info: 'bg-info-light',
  };

  return (
    <div
      className={`${bgColors[type]} rounded-md p-4 shadow-md flex items-start transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
        {action && (
          <div className="mt-2">
            <button
              type="button"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
        onClick={onDismiss}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};