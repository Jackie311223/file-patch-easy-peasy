import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertiesContext';

interface PropertyFormData {
  name: string;
  location: string;
  description: string;
  images: string[];
}

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProperty, createProperty, updateProperty } = useProperties();
  const [loading, setLoading] = React.useState(id ? true : false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = React.useState('');
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PropertyFormData>({
    defaultValues: {
      name: '',
      location: '',
      description: '',
      images: []
    }
  });

  React.useEffect(() => {
    if (isEditMode && id) {
      const fetchPropertyData = async () => {
        try {
          setLoading(true);
          const property = await getProperty(id);
          
          if (property) {
            setValue('name', property.name);
            setValue('location', property.location);
            setValue('description', property.description);
            
            if (property.images && Array.isArray(property.images)) {
              setImageUrls(property.images);
            }
          }
        } catch (err) {
          setError('Failed to load property data. Please try again.');
          console.error('Error loading property:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPropertyData();
    }
  }, [id, isEditMode, getProperty, setValue]);

  const onSubmit = async (data: PropertyFormData) => {
    try {
      // Include the image URLs in the form data
      const propertyData = {
        ...data,
        images: imageUrls
      };
      
      if (isEditMode && id) {
        await updateProperty(id, propertyData);
      } else {
        await createProperty(propertyData);
      }
      
      navigate('/properties');
    } catch (err) {
      setError('Failed to save property. Please try again.');
      console.error('Error saving property:', err);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
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
          {isEditMode ? 'Edit Property' : 'Add New Property'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Property Name *
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register('name', { required: 'Property name is required' })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              id="location"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              {...register('location', { required: 'Location is required' })}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('description')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300"
              >
                Add
              </button>
            </div>

            {imageUrls.length > 0 && (
              <div className="mt-2 space-y-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="truncate flex-grow mr-2">{url}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/properties')}
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
