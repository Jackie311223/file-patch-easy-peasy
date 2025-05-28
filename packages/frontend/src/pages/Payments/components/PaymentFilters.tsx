import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
// Correct import paths using aliases and default imports where needed
import Label from '@/ui/Label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import DatePicker from '@/ui/DatePicker'; 
import Button from '@/ui/Button'; // Correct: default import
import { useAuth } from '@/hooks/useAuth';
// Import the hooks
import { useGetProperties } from '@/api/propertiesApi'; 
import { useGetUsers } from '@/api/usersApi';

// Define types for API data if not already defined globally
interface Property {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface Filters {
  propertyId?: string;
  status?: string;
  method?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
}

interface PaymentFiltersProps {
  // Remove the 'filters' prop if it's managed internally
  onFiltersChange: (filters: Filters) => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({ onFiltersChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>(() => {
    const initialFilters: Filters = {};
    searchParams.forEach((value, key) => {
      // Ensure the key is a valid filter key before assigning
      if (key === 'propertyId' || key === 'status' || key === 'method' || key === 'ownerId' || key === 'startDate' || key === 'endDate') {
        initialFilters[key as keyof Filters] = value;
      }
    });
    return initialFilters;
  });

  // Use the hooks correctly
  // Assuming useGetProperties hook doesn't take arguments or they are optional
  const { data: propertiesData } = useGetProperties() as { data?: Property[] }; 
  const properties = propertiesData || [];

  // Assuming useGetUsers hook takes arguments
  const { data: ownersData } = useGetUsers({ role: 'PARTNER', limit: 100 }) as { data?: User[] }; 
  const owners = ownersData || [];

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      }
    });
    if (newSearchParams.toString() !== searchParams.toString()) {
        setSearchParams(newSearchParams, { replace: true });
    }
    onFiltersChange(filters);
  }, [filters, onFiltersChange, setSearchParams, searchParams]);

  const handleInputChange = (key: keyof Filters, value: string | Date | undefined) => {
    let formattedValue: string | undefined;
    if (value instanceof Date) {
      formattedValue = value.toISOString().split('T')[0];
    } else {
      formattedValue = value;
    }
    setFilters((prev) => ({ ...prev, [key]: formattedValue || undefined }));
  };

  const handleSelectChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === 'all' ? undefined : value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Property Filter */}
        <div className="space-y-1">
          <Label htmlFor="propertyId">Property</Label>
          <Select
            value={filters.propertyId || 'all'}
            onValueChange={(value) => handleSelectChange('propertyId', value)}
          >
            <SelectTrigger id="propertyId">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {Array.isArray(properties) && properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Owner Filter (Super Admin only) */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="space-y-1">
            <Label htmlFor="ownerId">Owner</Label>
            <Select
              value={filters.ownerId || 'all'}
              onValueChange={(value) => handleSelectChange('ownerId', value)}
            >
              <SelectTrigger id="ownerId">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {Array.isArray(owners) && owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Filter */}
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Method Filter */}
        <div className="space-y-1">
          <Label htmlFor="method">Method</Label>
          <Select
            value={filters.method || 'all'}
            onValueChange={(value) => handleSelectChange('method', value)}
          >
            <SelectTrigger id="method">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="MOMO">MoMo</SelectItem>
              <SelectItem value="9PAY">9Pay</SelectItem>
              <SelectItem value="ONEPAY">OnePay</SelectItem>
              <SelectItem value="OTA_TRANSFER">OTA Transfer</SelectItem>
              <SelectItem value="BANK_PERSONAL">Bank Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-1">
          <Label htmlFor="startDate">Start Date</Label>
          <DatePicker
            value={filters.startDate ? new Date(filters.startDate) : undefined}
            onChange={(date) => handleInputChange('startDate', date)}
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-1">
          <Label htmlFor="endDate">End Date</Label>
          <DatePicker
            value={filters.endDate ? new Date(filters.endDate) : undefined}
            onChange={(date) => handleInputChange('endDate', date)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default PaymentFilters;

