import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PlusCircleIcon, FilterIcon, XIcon } from 'lucide-react';

import { Button } from "@/ui/Button";
import PageHeader from "@/ui/PageHeader"; 
import PaymentTable from "./components/PaymentTable"; // Component PaymentTable cần sử dụng đúng type 'Payment' từ API
import PaymentFormModal from "./components/PaymentFormModal";
import PaymentFiltersComponent, { Filters as PaymentFiltersValuesType } from "./components/PaymentFilters"; 
import ErrorState from "@/ui/ErrorState"; 
import EmptyState from "@/ui/EmptyState"; 
import { LoadingSpinner } from "@/ui/Loading/Spinner"; 
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { getPayments, Payment, PaymentsResponse } from "@/api/paymentsApi"; 

interface PageFilters extends PaymentFiltersValuesType {
  paymentType?: "HOTEL_COLLECT" | "OTA_COLLECT";
  page?: number;
  limit?: number;
}

const PaymentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // const { toast } = useToast(); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true); 
  const [editPayment, setEditPayment] = useState<Payment | null>(null);

  const getInitialFilters = useCallback((): PageFilters => {
    const params: PageFilters = { page: 1, limit: 10, paymentType: "HOTEL_COLLECT" }; 
    const validFilterKeys: (keyof PaymentFiltersValuesType)[] = ["propertyId", "status", "method", "ownerId", "startDate", "endDate"];
    
    searchParams.forEach((value, key) => {
      const k = key as keyof PageFilters;
      if (k === "page" || k === "limit") {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 0) {
          params[k] = numValue;
        }
      } else if (k === "paymentType") {
        if (value === "HOTEL_COLLECT" || value === "OTA_COLLECT") {
          params[k] = value;
        }
      } else if (validFilterKeys.includes(k as keyof PaymentFiltersValuesType)) {
        (params as any)[k] = value;
      }
    });
    return params;
  }, [searchParams]);

  const [filters, setFilters] = useState<PageFilters>(getInitialFilters);

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        newSearchParams.set(key, String(value));
      }
    });
    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  useEffect(() => {
    const currentFiltersFromParams = getInitialFilters();
    if (JSON.stringify(currentFiltersFromParams) !== JSON.stringify(filters)) {
        setFilters(currentFiltersFromParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { 
    data: paymentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<PaymentsResponse, Error>({
    queryKey: ["payments", filters], 
    queryFn: () => getPayments(filters as any), 
    placeholderData: keepPreviousData,
  });

  const paymentsData = paymentsResponse?.data || [];
  const totalPayments = paymentsResponse?.total || 0;
  const totalPages = (filters.limit && totalPayments) ? Math.ceil(totalPayments / filters.limit) : 0;

  const handleFiltersChange = useCallback((newPaymentFilters: Omit<PageFilters, 'page' | 'limit' | 'paymentType'>) => {
    setFilters((prev) => ({
      ...prev,
      ...newPaymentFilters,
      page: 1, 
    }));
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // handleModalOpen sử dụng type Payment từ paymentsApi.ts.
  // Lỗi TS2322 bạn gặp phải là do PaymentTable.tsx truyền vào một đối tượng payment
  // không hoàn toàn khớp với type Payment này (cụ thể là thuộc tính 'booking').
  // Để sửa lỗi này, PaymentTable.tsx cần đảm bảo nó truyền một đối tượng payment
  // có 'booking' với 'bookingCode' và 'guestName' là string bắt buộc.
  const handleModalOpen = (payment?: Payment) => { 
    setEditPayment(payment || null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditPayment(null);
  };

  const handleSuccess = () => {
    handleModalClose();
  };

  if (error) {
    return <div className="p-4"><ErrorState title="Error Loading Payments" message={error.message} onRetry={refetch} /></div>;
  }

  const modalPaymentType = filters.paymentType || "HOTEL_COLLECT";

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <PageHeader title="Payments Management">
        <div className="flex space-x-2">
          <Button onClick={() => handleModalOpen()} size="sm" variant="primary">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            New Payment
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsFiltersVisible(!isFiltersVisible)} 
            size="sm"
            aria-expanded={isFiltersVisible}
            aria-controls="payment-filters-panel"
          >
            {isFiltersVisible ? <XIcon className="mr-2 h-4 w-4" /> : <FilterIcon className="mr-2 h-4 w-4" />}
            {isFiltersVisible ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </PageHeader>

      {isFiltersVisible && (
        <div id="payment-filters-panel" className="my-4">
          <PaymentFiltersComponent 
            onFiltersChange={handleFiltersChange}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : paymentsData.length === 0 ? (
        <div className="mt-6">
          <EmptyState 
            title="No Payments Found" 
            description="Try adjusting your filters or create a new payment."
            action={
              <Button onClick={() => handleModalOpen()} size="sm" variant="primary">
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create First Payment
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <PaymentTable
            payments={paymentsData} 
            paymentType={modalPaymentType}
            onEdit={handleModalOpen} 
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["payments"] })}
          />
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                disabled={(filters.page || 1) <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {filters.page || 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                disabled={(filters.page || 1) >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <PaymentFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          paymentType={modalPaymentType} 
          editPayment={editPayment}
        />
      )}
    </div>
  );
};

export default PaymentsPage;