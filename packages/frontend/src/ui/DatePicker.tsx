import React from 'react';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  min,
  max,
  className,
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && onChange) {
      onChange(new Date(e.target.value));
    }
  };

  return (
    <input
      type="date"
      value={formatDate(value)}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min ? formatDate(min) : undefined}
      max={max ? formatDate(max) : undefined}
      className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      } ${className || ''}`}
    />
  );
};

export default DatePicker;
