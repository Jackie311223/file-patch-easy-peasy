import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PlusCircleIcon } from "lucide-react";

import Button from "@/ui/Button";
import PageHeader from "@/ui/PageHeader"; 
import PaymentTable from "./components/PaymentTable";
import PaymentFormModal from "./components/PaymentFormModal";
import PaymentFilters from "./components/PaymentFilters";
import ErrorState from "@/ui/ErrorState";
import EmptyState from "@/ui/EmptyState"; // Corrected import path if needed
import Spinner from "@/ui/Loading/Spinner";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { getPayments } from "@/api/paymentsApi"; 

// Define Payment type based on expected data structure
interface Payment {
  id: string;
  booking: { bookingCode: string; guestName: string };
  amount: number;
  method: string;
  paymentDate: string;
  status: string;
  paymentType: "HOTEL_COLLECT" | "OTA_COLLECT";
  // Add other relevant fields
}

// Define the expected response structure for getPayments
interface PaymentsResponse {
  data: Payment[];
  total: number;
  // Add other pagination/metadata if available
}

interface Filters {
  propertyId?: string;
  status?: string;
  method?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  paymentType?: "HOTEL_COLLECT" | "OTA_COLLECT";
  page?: number;
  limit?: number;
}

const PaymentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);

  const [filters, setFilters] = useState<Filters>(() => {
    const params: Filters = { page: 1, limit: 10 };
    searchParams.forEach((value, key) => {
      if (key === "page" || key === "limit") {
        params[key] = Number(value);
      } else if (key === "paymentType") {
        if (value === "HOTEL_COLLECT" || value === "OTA_COLLECT") {
          params[key] = value;
        }
      } else if (["propertyId", "status", "method", "ownerId", "startDate", "endDate"].includes(key)) {
        params[key as keyof Omit<Filters, "page" | "limit" | "paymentType">] = value;
      }
    });
    return params;
  });

  const { 
    data: paymentsResponse,
    isLoading,
    error,
    isFetching,
  } = useQuery<PaymentsResponse, Error>({
    queryKey: ["payments", filters], 
    queryFn: () => getPayments(filters), 
  });

  const paymentsData = paymentsResponse?.data || [];
  const totalPayments = paymentsResponse?.total || 0;

  const handleFiltersChange = useCallback((newFilters: Omit<Filters, "page" | "limit">) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, 
    }));
  }, []);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

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
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  if (error) {
    return <ErrorState message={error.message} onRetry={() => queryClient.invalidateQueries({ queryKey: ["payments"] })} />;
  }

  const modalPaymentType = filters.paymentType || "HOTEL_COLLECT";

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Payments">
        <Button onClick={() => handleModalOpen()} size="sm">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          New Payment
        </Button>
        <Button variant="outline" onClick={() => setIsFiltersOpen(!isFiltersOpen)} size="sm">
          {isFiltersOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </PageHeader>

      {isFiltersOpen && (
        <PaymentFilters 
          onFiltersChange={handleFiltersChange} 
        />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      // Correct props for EmptyState: use description prop
      ) : paymentsData.length === 0 ? (
        <EmptyState 
          title="No Payments Found" 
          description="Try adjusting your filters or create a new payment."
        />
      ) : (
        <PaymentTable
          payments={paymentsData} 
          // Remove isFetching prop as it's not defined in PaymentTable
          paymentType={modalPaymentType} // Pass paymentType needed by PaymentTable
          onEdit={handleModalOpen}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ["payments"] })}
          // Pass pagination props if needed by PaymentTable (assuming it needs them)
          // currentPage={filters.page || 1}
          // totalPages={Math.ceil(totalPayments / (filters.limit || 10))}
          // onPageChange={handlePageChange}
        />
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

