import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRoomTypes } from '../../contexts/RoomTypesContext';
import { useProperties } from '../../contexts/PropertiesContext';
import { RoomType } from '../../types/roomType';
import { Property } from '../../types/property';

const RoomTypeDetailPage: React.FC = () => {
  const { propertyId, id } = useParams<{ propertyId: string; id: string }>();
  const navigate = useNavigate();
  const { getRoomType } = useRoomTypes();
  const { getProperty } = useProperties();
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId || !id) return;
      
      try {
        setLoading(true);
        
        // Fetch property and room type in parallel
        const [propertyData, roomTypeData] = await Promise.all([
          getProperty(propertyId),
          getRoomType(id)
        ]);
        
        setProperty(propertyData);
        setRoomType(roomTypeData);
      } catch (err: any) {
        setError(err.message || 'Failed to load room type details');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, id, getProperty, getRoomType]);

  const handleEditRoomType = () => {
    if (propertyId && id) {
      navigate(`/properties/${propertyId}/room-types/${id}/edit`);
    }
  };

  const handleBackToRoomTypes = () => {
    if (propertyId) {
      navigate(`/properties/${propertyId}/room-types`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={handleBackToRoomTypes}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
        >
          Back to Room Types
        </button>
      </div>
    );
  }

  if (!roomType || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Room type or property not found
        </div>
        <button
          onClick={() => navigate('/properties')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link 
              to="/properties" 
              className="text-blue-500 hover:text-blue-700 mr-2"
            >
              Properties
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link 
              to={`/properties/${propertyId}`} 
              className="text-blue-500 hover:text-blue-700 mr-2"
            >
              {property.name}
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link 
              to={`/properties/${propertyId}/room-types`} 
              className="text-blue-500 hover:text-blue-700 mr-2"
            >
              Room Types
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-gray-700">{roomType.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{roomType.name}</h1>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <button
            onClick={handleEditRoomType}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Edit Room Type
          </button>
        </div>
      </div>

      {/* Room Type details card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Room Type Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-medium">Property:</span>
                  <p className="text-gray-800">{property.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Description:</span>
                  <p className="text-gray-800 whitespace-pre-line">{roomType.description || 'No description available'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Room Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-medium">Occupancy:</span>
                  <p className="text-gray-800">{roomType.occupancy} person(s)</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Price per Night:</span>
                  <p className="text-gray-800">${roomType.price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Quantity Available:</span>
                  <p className="text-gray-800">{roomType.quantity} room(s)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Calendar (Placeholder) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Availability Calendar</h3>
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 mb-4">Availability calendar will be implemented in the Bookings module.</p>
          </div>
        </div>
      </div>

      {/* Bookings for this Room Type (Placeholder) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Bookings for this Room Type</h3>
            <button
              onClick={() => navigate(`/properties/${propertyId}/bookings/new?roomTypeId=${id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Booking
            </button>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 mb-4">No bookings have been made for this room type yet.</p>
            <p className="text-gray-500">Bookings functionality will be implemented in the next sprint phase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeDetailPage;
