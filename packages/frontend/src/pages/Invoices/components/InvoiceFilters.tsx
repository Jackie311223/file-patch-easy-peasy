import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/Select";
import DatePicker from "@/ui/DatePicker";
import { useGetProperties } from "@/api/propertiesApi"; // Corrected: Use the hook

// Export the props interface
export interface InvoiceFiltersProps {
  onFiltersChange: (filters: any) => void;
}

// Define expected types for API data
interface Property {
  id: string;
  name: string;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<any>({});

  // Fetch properties for dropdown using the hook
  const { data: propertiesResponse, isLoading: isLoadingProperties } = useGetProperties(); // Corrected: Call the hook
  // Ensure propertiesData is an array before mapping, using safe access
  const properties = propertiesResponse || []; // Corrected: useGetProperties returns Property[] directly

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => { // Accept Date | undefined
    setFilters((prev: any) => ({ ...prev, [name]: date ? date.toISOString().split("T")[0] : undefined }));
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const invoiceStatuses = ["DRAFT", "SENT", "PAID", "VOID"]; // Example statuses
  const invoiceTypes = ["BOOKING", "SERVICE", "OTHER"]; // Example types

  return (
    <div className="p-4 mb-4 bg-gray-50 rounded-md border">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Property Filter */}
        <div className="space-y-1">
          <label htmlFor="propertyId" className="text-sm font-medium">Property</label>
          <Select 
            value={filters.propertyId || ""} 
            onValueChange={(value) => setFilters((prev: any) => ({ ...prev, propertyId: value }))}
          >
            <SelectTrigger id="propertyId">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Properties</SelectItem>
              {/* Check if properties is an array before mapping */}
              {Array.isArray(properties) && properties.map((property: Property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <Select 
            value={filters.status || ""} 
            onValueChange={(value) => setFilters((prev: any) => ({ ...prev, status: value }))}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {invoiceStatuses.map((status) => (
                <SelectItem key={String(status)} value={String(status)}>
                  {String(status)} 
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-1">
          <label htmlFor="type" className="text-sm font-medium">Type</label>
          <Select 
            value={filters.type || ""} 
            onValueChange={(value) => setFilters((prev: any) => ({ ...prev, type: value }))}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {invoiceTypes.map((type) => (
                <SelectItem key={String(type)} value={String(type)}>
                  {String(type).replace("_", " ")} 
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filters */}
        <div className="space-y-1">
          <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
          <DatePicker 
            // Pass Date | undefined, converting null to undefined
            value={filters.startDate ? new Date(filters.startDate) : undefined} 
            onChange={(date) => handleDateChange("startDate", date)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
          <DatePicker 
            // Pass Date | undefined, converting null to undefined
            value={filters.endDate ? new Date(filters.endDate) : undefined} 
            onChange={(date) => handleDateChange("endDate", date)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={clearFilters}>Clear</Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
};

export default InvoiceFilters;

