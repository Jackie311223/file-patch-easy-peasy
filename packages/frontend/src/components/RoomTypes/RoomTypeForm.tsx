import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoomTypes } from '../../contexts/RoomTypesContext';
import { useProperties } from '../../contexts/PropertiesContext';
import { RoomTypeData } from '../../types/roomType';

const RoomTypeForm: React.FC = () => {
  const { propertyId, id } = useParams<{ propertyId: string; id: string }>();
  const navigate = useNavigate();
  const { getRoomType, createRoomType, updateRoomType } = useRoomTypes();
  const { getProperty } = useProperties();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>('');
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RoomTypeData>({
    defaultValues: {
      name: '',
      description: '',
      occupancy: 2,
      price: 0,
      quantity: 1
    }
  });

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) return;
      
      try {
        const property = await getProperty(propertyId);
        if (property) {
          setPropertyName(property.name);
        }
      } catch (err) {
        console.error('Error loading property:', err);
      }
    };
    
    fetchPropertyData();
  }, [propertyId, getProperty]);

  useEffect(() => {
    if (isEditMode && id && propertyId) {
      const fetchRoomTypeData = async () => {
        try {
          setLoading(true);
          const roomType = await getRoomType(id);
          
          if (roomType) {
            setValue('name', roomType.name);
            setValue('description', roomType.description || '');
            setValue('occupancy', roomType.occupancy);
            setValue('price', roomType.price);
            setValue('quantity', roomType.quantity);
          }
        } catch (err) {
          setError('Failed to load room type data. Please try again.');
          console.error('Error loading room type:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRoomTypeData();
    }
  }, [id, isEditMode, propertyId, getRoomType, setValue]);

  const onSubmit = async (data: RoomTypeData) => {
    if (!propertyId) {
      setError('Property ID is missing. Please try again.');
      return;
    }

    try {
      if (isEditMode && id) {
        await updateRoomType(id, data);
      } else {
        await createRoomType(propertyId, data);
      }
      
      navigate(`/properties/${propertyId}/room-types`);
    } catch (err) {
      setError('Failed to save room type. Please try again.');
      console.error('Error saving room type:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Edit Room Type' : 'Add New Room Type'}
          {propertyName && <span className="text-gray-600 text-lg ml-2">for {propertyName}</span>}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Room Type Name *
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register('name', { required: 'Room type name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="occupancy" className="block text-sm font-medium text-gray-700 mb-1">
                Occupancy *
              </label>
              <input
                id="occupancy"
                type="number"
                min="1"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.occupancy ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register('occupancy', { 
                  required: 'Occupancy is required',
                  min: { value: 1, message: 'Occupancy must be at least 1' },
                  valueAsNumber: true
                })}
              />
              {errors.occupancy && (
                <p className="mt-1 text-sm text-red-600">{errors.occupancy.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price per Night *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-full pl-7 px-3 py-2 border rounded-md ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' },
                    valueAsNumber: true
                  })}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' },
                  valueAsNumber: true
                })}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/properties/${propertyId}/room-types`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Room Type' : 'Create Room Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomTypeForm;
