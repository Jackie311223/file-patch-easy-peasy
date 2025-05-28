export interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyData {
  name: string;
  location: string;
  description: string;
  images: string[];
}
