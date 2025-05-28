import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-h2 font-semibold text-text mb-4">{title}</h1>
      <div className="bg-background rounded shadow p-6">
        <p className="text-text-secondary">
          This is a placeholder page for the "{title}" feature.
          Full functionality will be implemented in a future update.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;

