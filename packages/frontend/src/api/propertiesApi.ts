import apiClient from "./axios";
import { useQuery, UseQueryResult, QueryKey } from "@tanstack/react-query";

// Định nghĩa kiểu Property
export interface Property {
  id: string;
  name: string;
  address?: string;
  // Thêm các trường khác nếu cần
}

// Hàm gọi API lấy danh sách properties
export const fetchProperties = async (): Promise<Property[]> => {
  const response = await apiClient.get<Property[]>("/properties");
  return response.data;
};

// Hook React Query để lấy properties
export const useGetProperties = (): UseQueryResult<Property[], Error> => {
  return useQuery<Property[], Error>({
    queryKey: ["properties"] as QueryKey,
    queryFn: fetchProperties,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};

// (Tuỳ chọn) Nếu cần, bạn có thể thêm các hàm và hook khác:
// export const fetchPropertyById = async (id: string) => { ... };
// export const useGetProperty = (id: string) => { ... };
// export const createProperty = async (data: Partial<Property>) => { ... };
// export const useCreateProperty = () => { ... };