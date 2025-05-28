import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import apiClient from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';

interface RoomType {
  id: string;
  name: string;
  occupancy: number;
  price: number; // Consider using string for display if dealing with currency formatting
  quantity: number;
  description?: string;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
}

type RoomTypeFormData = Omit<RoomType, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>;

const RoomTypesPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { token } = useAuth(); // Get token for API calls
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomTypeFormData>();

  const fetchRoomTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/properties/${propertyId}/room-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoomTypes(response.data);
    } catch (err: any) {
      console.error('Failed to fetch room types:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch room types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId && token) {
      fetchRoomTypes();
    }
  }, [propertyId, token]);

  const openModal = (roomType: RoomType | null = null) => {
    setEditingRoomType(roomType);
    reset(roomType ? { ...roomType, price: Number(roomType.price) } : {}); // Pre-fill form if editing
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoomType(null);
    reset(); // Clear form
  };

  const onSubmit = async (data: RoomTypeFormData) => {
    const payload = {
        ...data,
        // Ensure numeric types are correctly formatted if needed by backend
        occupancy: Number(data.occupancy),
        price: Number(data.price),
        quantity: Number(data.quantity),
    };

    try {
      if (editingRoomType) {
        // Update existing room type
        await apiClient.put(`/properties/${propertyId}/room-types/${editingRoomType.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new room type
        await apiClient.post(`/properties/${propertyId}/room-types`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchRoomTypes(); // Refresh list
      closeModal();
    } catch (err: any) {
      console.error('Failed to save room type:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save room type');
      // Keep modal open on error to show feedback or allow retry?
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room type?')) {
      try {
        await apiClient.delete(`/properties/${propertyId}/room-types/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchRoomTypes(); // Refresh list
      } catch (err: any) {
        console.error('Failed to delete room type:', err);
        setError(err.response?.data?.message || err.message || 'Failed to delete room type');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý loại phòng cho cơ sở {propertyId}</h1>
      <Link to="/properties" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Quay lại danh sách cơ sở</Link>

      <button
        onClick={() => openModal()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Thêm loại phòng mới
      </button>

      {loading && <p>Đang tải dữ liệu loại phòng...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}

      {!loading && !error && (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Tên loại phòng</th>
              <th className="py-2 px-4 border-b">Sức chứa</th>
              <th className="py-2 px-4 border-b">Giá</th>
              <th className="py-2 px-4 border-b">Số lượng</th>
              <th className="py-2 px-4 border-b">Mô tả</th>
              <th className="py-2 px-4 border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map((rt) => (
              <tr key={rt.id}>
                <td className="py-2 px-4 border-b">{rt.name}</td>
                <td className="py-2 px-4 border-b text-center">{rt.occupancy}</td>
                <td className="py-2 px-4 border-b text-right">{rt.price}</td> {/* Format currency as needed */}
                <td className="py-2 px-4 border-b text-center">{rt.quantity}</td>
                <td className="py-2 px-4 border-b">{rt.description}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => openModal(rt)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rt.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {roomTypes.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">Không tìm thấy loại phòng nào cho cơ sở này.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingRoomType ? 'Edit Room Type' : 'Add New Room Type'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="occupancy" className="block text-sm font-medium text-gray-700">Occupancy</label>
                <input
                  type="number"
                  id="occupancy"
                  {...register('occupancy', { required: 'Occupancy is required', min: { value: 1, message: 'Occupancy must be at least 1' } })}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.occupancy ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.occupancy && <p className="text-red-500 text-xs mt-1">{errors.occupancy.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (per night)</label>
                <input
                  type="number"
                  id="price"
                  step="0.01" // Allow decimals
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price cannot be negative' } })}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity Available</label>
                <input
                  type="number"
                  id="quantity"
                  {...register('quantity', { required: 'Quantity is required', min: { value: 0, message: 'Quantity cannot be negative' } })}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4">Error: {error}</p>} {/* Display submit error here */}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingRoomType ? 'Save Changes' : 'Add Room Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypesPage;

