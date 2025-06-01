import React, { useState, useEffect } from 'react';
// Bỏ useQuery nếu không sử dụng trong file này
// import { useQuery } from '@tanstack/react-query'; 
import { useSearchParams } from 'react-router-dom';
import { Label } from '@/ui/Label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import DatePicker from '@/ui/DatePicker'; 
import { Button } from '@/ui/Button'; // Đây là named import, đúng nếu Button.tsx export const Button
import { useAuth } from '@/hooks/useAuth';
import { useGetProperties } from '@/api/propertiesApi'; 
import { useGetUsers } from '@/api/usersApi';
import { format } from 'date-fns'; // Thêm import format nếu dùng ở đây

// Define types
interface Property {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

// Sửa: Export interface Filters để PaymentsPage có thể import
export interface Filters {
  propertyId?: string;
  status?: string;
  method?: string;
  ownerId?: string;
  startDate?: string; // Giữ là string (YYYY-MM-DD) trong state của component này
  endDate?: string;   // Giữ là string (YYYY-MM-DD) trong state của component này
}

interface PaymentFiltersProps {
  onFiltersChange: (filters: Filters) => void;
  // initialFilters có thể được truyền từ PaymentsPage nếu cần đồng bộ khi mount
  initialFilters?: Partial<Filters>; 
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({ onFiltersChange, initialFilters }) => {
  const [searchParams, setSearchParams] = useSearchParams(); // setSearchParams có thể không cần nếu chỉ đọc
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<Filters>(() => {
    const initial: Filters = { ...initialFilters }; // Ưu tiên initialFilters từ props
    searchParams.forEach((value, key) => {
      const k = key as keyof Filters;
      if (['propertyId', 'status', 'method', 'ownerId', 'startDate', 'endDate'].includes(k)) {
        if (value) initial[k] = value;
      }
    });
    return initial;
  });

  const { data: propertiesData, isLoading: isLoadingProperties } = useGetProperties(); 
  const properties = propertiesData || [];

  const { data: ownersData, isLoading: isLoadingOwners } = useGetUsers({ role: 'PARTNER', limit: 100 }); 
  const owners = ownersData || [];

  // useEffect để gọi onFiltersChange khi filters thay đổi
  // và cũng để cập nhật URL search params
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    let hasActiveFilters = false;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        newSearchParams.set(key, value);
        hasActiveFilters = true;
      }
    });

    // Chỉ cập nhật searchParams nếu có thay đổi hoặc không có filter nào mà params vẫn còn
    const currentSearchString = searchParams.toString();
    const newSearchString = newSearchParams.toString();

    if (newSearchString !== currentSearchString) {
      if (hasActiveFilters || currentSearchString !== "") { // Cập nhật nếu có filter hoặc cần xóa params cũ
         setSearchParams(newSearchParams, { replace: true });
      }
    }
    onFiltersChange(filters);
  }, [filters, onFiltersChange, setSearchParams, searchParams]);


  // Effect để đồng bộ filters state từ URL khi URL thay đổi (ví dụ: nút back/forward)
  useEffect(() => {
    const filtersFromURL: Filters = {};
    searchParams.forEach((value, key) => {
        if (['propertyId', 'status', 'method', 'ownerId', 'startDate', 'endDate'].includes(key)) {
            filtersFromURL[key as keyof Filters] = value;
        }
    });
    // Chỉ setFilters nếu có sự khác biệt thực sự để tránh vòng lặp vô hạn
    if (JSON.stringify(filtersFromURL) !== JSON.stringify(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== ''))
    )) {
        // Cập nhật filters state dựa trên những gì có trong URL, giữ lại các giá trị không có trong URL là undefined
        const newFiltersState = {
            propertyId: filtersFromURL.propertyId,
            status: filtersFromURL.status,
            method: filtersFromURL.method,
            ownerId: filtersFromURL.ownerId,
            startDate: filtersFromURL.startDate,
            endDate: filtersFromURL.endDate,
        };
        // Chỉ cập nhật nếu khác với state hiện tại (sau khi đã loại bỏ undefined fields khỏi filters để so sánh)
        const currentEffectiveFilters = Object.fromEntries(Object.entries(filters).filter(([_,v]) => v !== undefined && v !== ''));
        if(JSON.stringify(filtersFromURL) !== JSON.stringify(currentEffectiveFilters)){
            setFilters(newFiltersState);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Chỉ chạy khi searchParams thay đổi


  const handleDateChange = (key: 'startDate' | 'endDate', date: Date | undefined) => {
    setFilters((prev) => ({ 
      ...prev, 
      [key]: date ? format(date, 'yyyy-MM-dd') : undefined 
    }));
  };

  const handleSelectChange = (key: keyof Omit<Filters, 'startDate' | 'endDate'>, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === 'all' || value === '' ? undefined : value }));
  };

  const clearFilters = () => {
    setFilters({
        propertyId: undefined,
        status: undefined,
        method: undefined,
        ownerId: undefined,
        startDate: undefined,
        endDate: undefined,
    });
    // URL sẽ được cập nhật bởi useEffect
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 mb-6 shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
        <div className="space-y-1">
          <Label htmlFor="filterPropertyId">Property</Label>
          <Select
            value={filters.propertyId || ''}
            onValueChange={(value) => handleSelectChange('propertyId', value)}
          >
            <SelectTrigger id="filterPropertyId" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-white">
              <SelectItem value="all" className="dark:hover:bg-gray-600">All Properties</SelectItem>
              {isLoadingProperties ? <SelectItem value="loading_prop" disabled>Loading...</SelectItem> :
               properties.map((property) => (
                <SelectItem key={property.id} value={property.id} className="dark:hover:bg-gray-600">
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <div className="space-y-1">
            <Label htmlFor="filterOwnerId">Owner</Label>
            <Select
              value={filters.ownerId || ''}
              onValueChange={(value) => handleSelectChange('ownerId', value)}
            >
              <SelectTrigger id="filterOwnerId" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-white">
                <SelectItem value="all" className="dark:hover:bg-gray-600">All Owners</SelectItem>
                {isLoadingOwners ? <SelectItem value="loading_owner" disabled>Loading...</SelectItem> :
                 owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id} className="dark:hover:bg-gray-600">
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="filterStatus">Status</Label>
          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger id="filterStatus" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-white">
              <SelectItem value="all" className="dark:hover:bg-gray-600">All Statuses</SelectItem>
              <SelectItem value="PAID" className="dark:hover:bg-gray-600">Paid</SelectItem>
              <SelectItem value="UNPAID" className="dark:hover:bg-gray-600">Unpaid</SelectItem>
              <SelectItem value="PARTIALLY_PAID" className="dark:hover:bg-gray-600">Partially Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filterMethod">Method</Label>
          <Select
            value={filters.method || ''}
            onValueChange={(value) => handleSelectChange('method', value)}
          >
            <SelectTrigger id="filterMethod" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-white">
              <SelectItem value="all" className="dark:hover:bg-gray-600">All Methods</SelectItem>
              <SelectItem value="CASH" className="dark:hover:bg-gray-600">Cash</SelectItem>
              <SelectItem value="BANK_TRANSFER" className="dark:hover:bg-gray-600">Bank Transfer</SelectItem>
              <SelectItem value="MOMO" className="dark:hover:bg-gray-600">MoMo</SelectItem>
              <SelectItem value="9PAY" className="dark:hover:bg-gray-600">9Pay</SelectItem>
              <SelectItem value="ONEPAY" className="dark:hover:bg-gray-600">OnePay</SelectItem>
              <SelectItem value="OTA_TRANSFER" className="dark:hover:bg-gray-600">OTA Transfer</SelectItem>
              <SelectItem value="BANK_PERSONAL" className="dark:hover:bg-gray-600">Bank Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filterStartDate">Start Date</Label>
          <DatePicker
            value={filters.startDate ? new Date(filters.startDate + "T00:00:00") : undefined} // Đảm bảo parse đúng múi giờ
            onChange={(date) => handleDateChange('startDate', date)}
            // placeholderText="Select start date" // DatePicker của bạn cần hỗ trợ prop này
            // className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" // Thêm class nếu cần
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filterEndDate">End Date</Label>
          <DatePicker
            value={filters.endDate ? new Date(filters.endDate + "T00:00:00") : undefined}
            onChange={(date) => handleDateChange('endDate', date)}
            // placeholderText="Select end date"
            // minDate={filters.startDate ? new Date(filters.startDate) : undefined} 
            // className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="flex items-end">
          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFilters;