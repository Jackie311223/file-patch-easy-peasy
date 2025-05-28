import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '@/api/axios';
import { RoomType, RoomTypeData } from '../types/roomType';
import { mockRoomTypes, getRoomTypesByPropertyId } from '../mock/mockData';

// Context interface
interface RoomTypesContextType {
  roomTypes: RoomType[];
  loading: boolean;
  error: string | null;
  getRoomTypesByProperty: (propertyId: string) => Promise<RoomType[]>;
  getRoomType: (id: string) => Promise<RoomType | null>;
  createRoomType: (propertyId: string, data: RoomTypeData) => Promise<RoomType>;
  updateRoomType: (id: string, data: RoomTypeData) => Promise<RoomType>;
  deleteRoomType: (id: string) => Promise<void>;
  isDemoMode: boolean;
}

// Create context
const RoomTypesContext = createContext<RoomTypesContextType | undefined>(undefined);

// Provider component
export const RoomTypesProvider = ({ children }: { children: ReactNode }) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Initialize demo mode
  useEffect(() => {
    // Always enable demo mode for deployed environments
    const isDemo = true; // Force demo mode for all environments
    
    if (isDemo) {
      console.log("[RoomTypesProvider] Running in demo mode");
      setIsDemoMode(true);
      // Initial room types can be empty or loaded based on a default property if needed
      // setRoomTypes(getRoomTypesByPropertyId('prop-001')); // Example: Load for first mock property
    }
  }, []);

  // Fetch room types by property ID
  const getRoomTypesByProperty = async (propertyId: string): Promise<RoomType[]> => {
    setLoading(true);
    setError(null);
    
    // Return mock data in demo mode
    if (isDemoMode) {
      console.log(`[RoomTypesProvider] Demo mode - returning mock room types for property: ${propertyId}`);
      const mockData = getRoomTypesByPropertyId(propertyId);
      setRoomTypes(mockData);
      setLoading(false);
      return mockData;
    }
    
    try {
      const response = await apiClient.get(`/properties/${propertyId}/room-types`);
      const fetchedRoomTypes = response.data;
      setRoomTypes(fetchedRoomTypes);
      return fetchedRoomTypes;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch room types';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single room type by ID
  const getRoomType = async (id: string): Promise<RoomType | null> => {
    setLoading(true);
    setError(null);
    
    // Return mock data in demo mode
    if (isDemoMode) {
      console.log(`[RoomTypesProvider] Demo mode - returning mock room type with ID: ${id}`);
      const roomType = mockRoomTypes.find(rt => rt.id === id) || null;
      setLoading(false);
      return roomType;
    }
    
    try {
      const response = await apiClient.get(`/room-types/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to fetch room type with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new room type
  const createRoomType = async (propertyId: string, data: RoomTypeData): Promise<RoomType> => {
    setLoading(true);
    setError(null);
    
    // Simulate creation in demo mode
    if (isDemoMode) {
      console.log(`[RoomTypesProvider] Demo mode - simulating room type creation for property: ${propertyId}`);
      const newRoomType: RoomType = {
        id: `room-${Date.now()}`,
        propertyId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to the global mock list (for getRoomType later)
      mockRoomTypes.push(newRoomType);
      // Update local state if needed (e.g., if viewing all room types)
      setRoomTypes(prevRoomTypes => [...prevRoomTypes, newRoomType]);
      
      setLoading(false);
      return newRoomType;
    }
    
    try {
      const response = await apiClient.post(`/properties/${propertyId}/room-types`, data);
      const newRoomType = response.data;
      
      // Update the local state
      setRoomTypes(prevRoomTypes => [...prevRoomTypes, newRoomType]);
      
      return newRoomType;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create room type';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing room type
  const updateRoomType = async (id: string, data: RoomTypeData): Promise<RoomType> => {
    setLoading(true);
    setError(null);
    
    // Simulate update in demo mode
    if (isDemoMode) {
      console.log(`[RoomTypesProvider] Demo mode - simulating room type update for ID: ${id}`);
      let updatedRoomType: RoomType | null = null;
      const roomIndex = mockRoomTypes.findIndex(rt => rt.id === id);
      
      if (roomIndex !== -1) {
        updatedRoomType = {
          ...mockRoomTypes[roomIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };
        mockRoomTypes[roomIndex] = updatedRoomType;
        
        // Update local state
        setRoomTypes(prevRoomTypes => 
          prevRoomTypes.map(roomType => 
            roomType.id === id ? updatedRoomType! : roomType
          )
        );
      } else {
        setError(`Demo mode: Room type with ID ${id} not found for update.`);
      }
      
      setLoading(false);
      if (!updatedRoomType) throw new Error(`Demo mode: Room type with ID ${id} not found.`);
      return updatedRoomType;
    }
    
    try {
      const response = await apiClient.put(`/room-types/${id}`, data);
      const updatedRoomType = response.data;
      
      // Update the local state
      setRoomTypes(prevRoomTypes => 
        prevRoomTypes.map(roomType => 
          roomType.id === id ? updatedRoomType : roomType
        )
      );
      
      return updatedRoomType;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to update room type with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete a room type
  const deleteRoomType = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    // Simulate deletion in demo mode
    if (isDemoMode) {
      console.log(`[RoomTypesProvider] Demo mode - simulating room type deletion for ID: ${id}`);
      const initialLength = mockRoomTypes.length;
      const roomIndex = mockRoomTypes.findIndex(rt => rt.id === id);
      if (roomIndex !== -1) {
          mockRoomTypes.splice(roomIndex, 1);
      }
      
      // Update local state
      setRoomTypes(prevRoomTypes => 
        prevRoomTypes.filter(roomType => roomType.id !== id)
      );
      
      setLoading(false);
      if (mockRoomTypes.length === initialLength && roomIndex === -1) {
          console.warn(`Demo mode: Room type with ID ${id} not found for deletion.`);
      }
      return;
    }
    
    try {
      await apiClient.delete(`/room-types/${id}`);
      
      // Update the local state
      setRoomTypes(prevRoomTypes => 
        prevRoomTypes.filter(roomType => roomType.id !== id)
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to delete room type with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    roomTypes,
    loading,
    error,
    getRoomTypesByProperty,
    getRoomType,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    isDemoMode
  };

  return (
    <RoomTypesContext.Provider value={value}>
      {children}
    </RoomTypesContext.Provider>
  );
};

// Custom hook to use the room types context
export const useRoomTypes = () => {
  const context = useContext(RoomTypesContext);
  
  if (context === undefined) {
    throw new Error('useRoomTypes must be used within a RoomTypesProvider');
  }
  
  return context;
};
