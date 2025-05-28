import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../types/property';
import Button from '../common/Button'; // Import the refactored Button
import BookingsModal from '../common/BookingsModal';
import { useBookings } from '../../hooks/useBookings';
import { useFilter } from '../../contexts/FilterContext';

// Import icons (assuming you have an icon library or SVGs)
// Example using placeholder icons
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
const CollectionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>; // Placeholder for Room Types
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>; // Placeholder for Bookings

interface PropertyTableProps {
  properties: Property[];
}

const PropertyTable: React.FC<PropertyTableProps> = ({ properties }) => {
  const navigate = useNavigate();
  const { getBookings } = useBookings();
  const { setFilters } = useFilter();
  const [showBookingsModal, setShowBookingsModal] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPropertyName, setSelectedPropertyName] = useState<string>('');
  const [propertyBookings, setPropertyBookings] = useState<any[]>([]);

  const handleViewProperty = (id: string) => {
    navigate(`/properties/${id}`); // Assuming HashRouter: navigate(`/#/properties/${id}`)
  };

  const handleEditProperty = (id: string) => {
    navigate(`/properties/${id}/edit`); // Assuming HashRouter: navigate(`/#/properties/${id}/edit`)
  };

  const handleViewRoomTypes = (id: string) => {
    navigate(`/properties/${id}/room-types`); // Assuming HashRouter: navigate(`/#/properties/${id}/room-types`)
  };

  const handleViewBookings = async (id: string, propertyName: string) => {
    try {
      setSelectedPropertyId(id);
      setSelectedPropertyName(propertyName);
      
      // Set filter for this property - use direct object instead of updater function
      setFilters({ propertyId: id });
      
      // Fetch bookings with the updated filter
      const bookings = await getBookings();
      setPropertyBookings(bookings);
      
      // Show modal with bookings
      setShowBookingsModal(true);
    } catch (error) {
      console.error('Error fetching bookings for property:', error);
      // Could show error notification here
    }
  };

  return (
    <div className="overflow-x-auto bg-background rounded-lg shadow-md">
      {/* Add BookingsModal */}
      <BookingsModal
        isOpen={showBookingsModal}
        onClose={() => setShowBookingsModal(false)}
        title={`Bookings for ${selectedPropertyName}`}
        bookings={propertyBookings}
        propertyName={selectedPropertyName}
      />
      
      <table className="min-w-full divide-y divide-background-muted">
        <thead className="bg-background-subtle">
          <tr>
            <th scope="col" className="px-lg py-md text-left text-body-sm font-semibold text-text-secondary uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-lg py-md text-left text-body-sm font-semibold text-text-secondary uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-lg py-md text-left text-body-sm font-semibold text-text-secondary uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-lg py-md text-right text-body-sm font-semibold text-text-secondary uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-background-muted">
          {properties.map((property) => (
            <tr key={property.id} className="hover:bg-background-subtle transition-colors duration-150">
              <td className="px-lg py-md whitespace-nowrap text-body-md font-medium text-text">
                {property.name}
              </td>
              <td className="px-lg py-md whitespace-nowrap text-body-md text-text-secondary">
                {property.location}
              </td>
              <td className="px-lg py-md text-body-md text-text-secondary max-w-xs truncate">
                {property.description}
              </td>
              <td className="px-lg py-md whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-sm">
                  {/* Use the refactored Button component */}
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleViewProperty(property.id)}
                    title="View Details"
                  >
                    <EyeIcon />
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleEditProperty(property.id)}
                    title="Edit"
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleViewRoomTypes(property.id)}
                    title="Room Types"
                    className="text-success hover:bg-success/10 focus:ring-success/50"
                  >
                    <CollectionIcon />
                  </Button>                    <Button
                    variant="text"
                    size="small"
                    onClick={() => handleViewBookings(property.id, property.name)}
                    title="Bookings"
                    className="text-secondary hover:bg-secondary/10 focus:ring-secondary/50" // Example using secondary color
                  >
                    <CalendarIcon />
                  </Button>                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTable;
