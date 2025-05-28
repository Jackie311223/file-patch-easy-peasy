// src/api/usersApi.ts

import apiClient from "@/api/axios";
import { useQuery, UseQueryResult, QueryKey } from "@tanstack/react-query";

// Định nghĩa kiểu User
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// Tham số cho API fetch users
export interface GetUsersParams {
  role?: string;
  limit?: number;
}

// Hàm gọi API lấy danh sách user
export const fetchUsers = async (
  params: GetUsersParams = {}
): Promise<User[]> => {
  const response = await apiClient.get<User[]>("/users", { params });
  return response.data;
};

// Hook React Query để lấy users với params
export const useGetUsers = (
  params: GetUsersParams = {}
): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error>({
    queryKey: ["users", params] as QueryKey,
    queryFn: () => fetchUsers(params),
    staleTime: 5 * 60 * 1000, // cache 5 phút
    enabled: true,
  });
};
