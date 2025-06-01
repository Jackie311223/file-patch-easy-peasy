import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '@/api/axios'; 
import { RoomType, RoomTypeData } from '../types/roomType'; 
import { mockRoomTypes, getRoomTypesByPropertyId as getMockRoomTypesByPropertyId } from '../mock/mockData';
import { useAuth } from '@/hooks/useAuth'; 

interface RoomTypesContextType {
  roomTypes: RoomType[];
  loading: boolean;
  error: string | null;
  getRoomTypesByProperty: (propertyId: string) => Promise<RoomType[]>;
  getRoomType: (id: string) => Promise<RoomType | null>;
  createRoomType: (propertyId: string, data: RoomTypeData) => Promise<RoomType>;
  updateRoomType: (id: string, data: Partial<RoomTypeData>) => Promise<RoomType>; 
  deleteRoomType: (id: string) => Promise<void>;
  isDemoMode: boolean;
}

const RoomTypesContext = createContext<RoomTypesContextType | undefined>(undefined);

export const RoomTypesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const { user } = useAuth(); 

  useEffect(() => {
    // SỬA LỖI: Không dùng process.env, dùng import.meta.env cho Vite
    const demoEnabled = import.meta.env.VITE_DEMO_MODE === 'true' || true; 
    if (demoEnabled) {
      console.log("[RoomTypesProvider] Running in demo mode");
      setIsDemoMode(true);
    }
  }, []);

  const getRoomTypesByProperty = useCallback(async (propertyId: string): Promise<RoomType[]> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        const mockData = getMockRoomTypesByPropertyId(propertyId); 
        setRoomTypes(mockData);
        return mockData;
      }
      const response = await apiClient.get<{ data: RoomType[] }>(`/properties/${propertyId}/room-types`); 
      const fetchedRoomTypes = response.data.data; 
      setRoomTypes(fetchedRoomTypes);
      return fetchedRoomTypes;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch room types';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const getRoomType = useCallback(async (id: string): Promise<RoomType | null> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        const roomType = mockRoomTypes.find(rt => rt.id === id) || null;
        return roomType;
      }
      const response = await apiClient.get<{data: RoomType}>(`/room-types/${id}`);
      return response.data.data; 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to fetch room type with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const createRoomType = useCallback(async (propertyId: string, data: RoomTypeData): Promise<RoomType> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        const newRoomTypeObject: any = {
            name: data.name,
            description: data.description,
        };

        if ('occupancy' in data) {
            newRoomTypeObject.occupancy = (data as any).occupancy;
        }

        const newRoomType: RoomType = {
          id: `mock-rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          propertyId,
          ...newRoomTypeObject,
          status: 'AVAILABLE', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as RoomType;

        mockRoomTypes.push(newRoomType); 
        setRoomTypes(prev => [...prev, newRoomType]);
        return newRoomType;
      }
      const response = await apiClient.post<{data: RoomType}>(`/properties/${propertyId}/room-types`, data);
      const createdRoomType = response.data.data; 
      setRoomTypes(prevRoomTypes => [...prevRoomTypes, createdRoomType]);
      return createdRoomType;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create room type';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, user?.tenantId]); 

  const updateRoomType = useCallback(async (id: string, data: Partial<RoomTypeData>): Promise<RoomType> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        let updatedRoomType: RoomType | undefined;
        const roomIndex = mockRoomTypes.findIndex(rt => rt.id === id);

        if (roomIndex !== -1) {
          const currentRoomType = mockRoomTypes[roomIndex];
          const updateDataForRoomType: Partial<RoomType> = {};
          if (data.name !== undefined) updateDataForRoomType.name = data.name;
          if (data.description !== undefined) updateDataForRoomType.description = data.description;
          if ((data as any).occupancy !== undefined) {
            updateDataForRoomType.occupancy = (data as any).occupancy;
          }

          updatedRoomType = { 
            ...currentRoomType, 
            ...updateDataForRoomType, 
            updatedAt: new Date().toISOString() 
          };
          mockRoomTypes[roomIndex] = updatedRoomType;
          setRoomTypes(prev => prev.map(rt => rt.id === id ? updatedRoomType! : rt));
        } else {
          throw new Error(`Demo mode: Room type with ID ${id} not found for update.`);
        }
        return updatedRoomType;
      }
      const response = await apiClient.put<{data: RoomType}>(`/room-types/${id}`, data);
      const newUpdatedRoomType = response.data.data; 
      setRoomTypes(prevRoomTypes => 
        prevRoomTypes.map(roomType => 
          roomType.id === id ? newUpdatedRoomType : roomType
        )
      );
      return newUpdatedRoomType;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to update room type with ID: ${id}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const deleteRoomType = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        const initialLength = mockRoomTypes.length;
        const filteredMockData = mockRoomTypes.filter(rt => rt.id !== id);
        if (initialLength > filteredMockData.length) {
            mockRoomTypes.length = 0;
            mockRoomTypes.push(...filteredMockData);
        }
        setRoomTypes(prev => prev.filter(rt => rt.id !== id));
        return;
      }
      await apiClient.delete(`/room-types/${id}`);
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
  }, [isDemoMode]);

  const contextValue = {
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
    <RoomTypesContext.Provider value={contextValue}>
      {children}
    </RoomTypesContext.Provider>
  );
};

export const useRoomTypes = (): RoomTypesContextType => {
  const context = useContext(RoomTypesContext);
  if (context === undefined) {
    throw new Error('useRoomTypes must be used within a RoomTypesProvider');
  }
  return context;
};