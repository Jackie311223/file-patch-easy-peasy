export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  occupancy: number;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomTypeData {
  name: string;
  description?: string;
  occupancy: number;
  price: number;
  quantity: number;
}
