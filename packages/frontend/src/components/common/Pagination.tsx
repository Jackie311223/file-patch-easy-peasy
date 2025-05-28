import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5; // Max number of page links shown (excluding prev/next/ellipsis)

    if (totalPages <= maxPagesToShow + 2) { // Show all if total is small enough
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1); // Always show first page

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust window based on current page position
      if (currentPage <= 3) {
        startPage = 2;
        endPage = Math.min(totalPages - 1, maxPagesToShow -1); // Show first few pages
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 1);
        endPage = totalPages - 1; // Show last few pages
      }

      if (startPage > 2) {
        pageNumbers.push('...'); // Ellipsis before middle pages
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...'); // Ellipsis after middle pages
      }

      pageNumbers.push(totalPages); // Always show last page
    }

    return pageNumbers;
  };

  const buttonBaseClasses = "relative inline-flex items-center justify-center px-md py-sm border border-background-muted text-body-md font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
  const buttonDefaultClasses = "bg-white text-text-secondary hover:bg-background-subtle";
  const buttonActiveClasses = "z-10 bg-primary/10 border-primary text-primary";
  const buttonDisabledClasses = "text-text-muted cursor-not-allowed bg-background-subtle";
  const buttonEllipsisClasses = "text-text-secondary bg-white"; // Non-interactive ellipsis

  return (
    <div className="flex justify-center mt-lg">
      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonBaseClasses} rounded-l-md ${
            currentPage === 1 ? buttonDisabledClasses : buttonDefaultClasses
          }`}
        >
          <span className="sr-only">Previous</span>
          {/* Heroicon: chevron-left */}
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Page Number Buttons */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...' || page === currentPage}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${buttonBaseClasses} ${
              page === currentPage
                ? buttonActiveClasses
                : page === '...'
                ? buttonEllipsisClasses // Non-interactive ellipsis
                : buttonDefaultClasses
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonBaseClasses} rounded-r-md ${
            currentPage === totalPages ? buttonDisabledClasses : buttonDefaultClasses
          }`}
        >
          <span className="sr-only">Next</span>
          {/* Heroicon: chevron-right */}
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;

