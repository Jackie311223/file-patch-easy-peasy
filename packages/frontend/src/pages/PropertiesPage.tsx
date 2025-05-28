import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Add this line
import { useForm } from 'react-hook-form';
import api from '../api/axios'; // Assuming axios instance is configured

// Define the Property type based on Prisma schema (adjust if needed)
interface Property {
  id: string;
  name: string;
  location: string;
  images: string[];
  description?: string;
  ownerId: number;
  createdAt: string; // Assuming string representation from API
  updatedAt: string;
}

// Define form data structure
type PropertyFormData = {
  name: string;
  location: string;
  images: string; // Input as comma-separated string, convert later
  description?: string;
};

const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>();

  // Fetch properties
  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Property[]>('/properties');
      setProperties(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch properties');
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle form submission (Create/Update)
  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);
    setError(null);
    const payload = {
        ...data,
        // Convert comma-separated string to array, trim whitespace
        images: data.images ? data.images.split(',').map(img => img.trim()).filter(img => img !== '') : [],
    };

    try {
      if (editingProperty) {
        // Update
        await api.put(`/properties/${editingProperty.id}`, payload);
      } else {
        // Create
        await api.post('/properties', payload);
      }
      fetchProperties(); // Refresh list
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || (editingProperty ? 'Failed to update property' : 'Failed to create property'));
      console.error("Submit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/properties/${id}`);
      fetchProperties(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete property');
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Modal handling
  const openModal = (property: Property | null = null) => {
    reset(); // Clear previous form data
    setEditingProperty(property);
    if (property) {
      setValue('name', property.name);
      setValue('location', property.location);
      setValue('images', property.images.join(', ')); // Convert array back to comma-separated string
      setValue('description', property.description || '');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
    reset();
    setError(null); // Clear error on close
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Properties</h1>

      <button
        onClick={() => openModal()}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={isLoading}
      >
        Add New Property
      </button>

      {isLoading && <p>Loading...</p>}
      {error && !isModalOpen && <p className="text-red-500 mb-4">Error: {error}</p>} {/* Show table error only when modal is closed */}

      {/* Properties Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Location</th>
              <th className="py-2 px-4 border-b text-left">Description</th>
              <th className="py-2 px-4 border-b text-left">Images</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => (
              <tr key={prop.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{prop.name}</td>
                <td className="py-2 px-4 border-b">{prop.location}</td>
                <td className="py-2 px-4 border-b">{prop.description?.substring(0, 50)}{prop.description && prop.description.length > 50 ? '...' : ''}</td>
                <td className="py-2 px-4 border-b">{prop.images.length} image(s)</td>
                <td className="py-2 px-4 border-b">
                  <Link
                    to={`/properties/${prop.id}/room-types`}
                    className="text-green-500 hover:underline mr-2 disabled:opacity-50"
                  >
                    Manage Rooms
                  </Link>
                  <button
                    onClick={() => openModal(prop)}
                    className="text-blue-500 hover:underline mr-2 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="text-red-500 hover:underline disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {properties.length === 0 && !isLoading && (
                <tr>
                    <td colSpan={5} className="text-center py-4">No properties found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingProperty ? 'Edit Property' : 'Add New Property'}</h2>
            {error && <p className="text-red-500 mb-4">Error: {error}</p>} {/* Show modal error */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  id="location"
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images (comma-separated URLs)</label>
                <input
                  id="images"
                  type="text"
                  {...register('images')}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                 <p className="text-xs text-gray-500 mt-1">Enter image URLs separated by commas.</p>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (editingProperty ? 'Update Property' : 'Create Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;

