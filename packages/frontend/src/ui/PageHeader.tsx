import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children, className }) => {
  return (
    <div className={`flex justify-between items-center mb-6 ${className || ''}`}>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {children && <div className="flex space-x-2">{children}</div>}
    </div>
  );
};

export default PageHeader;

