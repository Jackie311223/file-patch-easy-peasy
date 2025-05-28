import React from 'react';
import classNames from 'classnames';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  error,
  className,
  disabled,
  ...props
}) => {
  const id = React.useId();
  
  return (
    <div className={classNames('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className={classNames(
            'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
            error && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label
              htmlFor={id}
              className={classNames(
                'font-medium text-gray-700',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkbox;
