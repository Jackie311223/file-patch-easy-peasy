import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertiesContext';
import { Tab } from '@headlessui/react';

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getProperty(id);
        setProperty(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load property details');
        console.error('Error loading property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, getProperty]);

  const handleEditProperty = () => {
    if (id) {
      navigate(`/properties/${id}/edit`);
    }
  };

  const handleViewRoomTypes = () => {
    if (id) {
      navigate(`/properties/${id}/room-types`);
    }
  };

  const handleViewBookings = () => {
    if (id) {
      navigate(`/properties/${id}/bookings`);
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
          onClick={() => navigate('/properties')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Property not found
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
            <span className="text-gray-700">{property.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{property.name}</h1>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <button
            onClick={handleEditProperty}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Edit Property
          </button>
        </div>
      </div>

      {/* Property details card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Image gallery */}
        {property.images && property.images.length > 0 ? (
          <div className="relative h-64 bg-gray-200">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image+Available';
              }}
            />
            {property.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-white bg-opacity-75 px-3 py-1 rounded-full text-sm">
                +{property.images.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}

        {/* Tabs */}
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex border-b">
            <Tab className={({ selected }) => 
              `px-6 py-3 text-sm font-medium focus:outline-none ${
                selected 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }>
              Details
            </Tab>
            <Tab className={({ selected }) => 
              `px-6 py-3 text-sm font-medium focus:outline-none ${
                selected 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }>
              Room Types
            </Tab>
            <Tab className={({ selected }) => 
              `px-6 py-3 text-sm font-medium focus:outline-none ${
                selected 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }>
              Bookings
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Details Panel */}
            <Tab.Panel className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Property Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Location:</span>
                      <p className="text-gray-800">{property.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Description:</span>
                      <p className="text-gray-800 whitespace-pre-line">{property.description || 'No description available'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                  <div className="space-y-3">
                    {property.createdAt && (
                      <div>
                        <span className="text-gray-600 font-medium">Created:</span>
                        <p className="text-gray-800">{new Date(property.createdAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {property.updatedAt && (
                      <div>
                        <span className="text-gray-600 font-medium">Last Updated:</span>
                        <p className="text-gray-800">{new Date(property.updatedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* All Images */}
              {property.images && property.images.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">All Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {property.images.map((image, index) => (
                      <div key={index} className="bg-gray-100 rounded-lg overflow-hidden h-48">
                        <img
                          src={image}
                          alt={`${property.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Error';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Tab.Panel>
            
            {/* Room Types Panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Room Types</h3>
                <button
                  onClick={handleViewRoomTypes}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Room Type
                </button>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-600 mb-4">No room types have been added to this property yet.</p>
                <button
                  onClick={handleViewRoomTypes}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                >
                  Manage Room Types
                </button>
              </div>
            </Tab.Panel>
            
            {/* Bookings Panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Bookings</h3>
                <button
                  onClick={handleViewBookings}
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
                <p className="text-gray-600 mb-4">No bookings have been made for this property yet.</p>
                <button
                  onClick={handleViewBookings}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                >
                  Manage Bookings
                </button>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
