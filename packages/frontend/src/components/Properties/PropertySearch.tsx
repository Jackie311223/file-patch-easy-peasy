import React, { useState } from 'react';
import Button from '../common/Button'; // Import the refactored Button

// Placeholder Search Icon
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-text-muted" // Use design token color
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

interface PropertySearchProps {
  onSearch: (searchTerm: string) => void;
}

const PropertySearch: React.FC<PropertySearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-sm">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-md pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="search" // Use type="search" for better semantics
          className="block w-full h-9 pl-10 pr-md py-sm text-body-md text-text bg-background border border-background-muted rounded-md placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition duration-150 ease-in-out" // Apply design system styles
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        variant="primary" // Use the refactored Button component
        size="medium"
      >
        Search
      </Button>
    </form>
  );
};

export default PropertySearch;

