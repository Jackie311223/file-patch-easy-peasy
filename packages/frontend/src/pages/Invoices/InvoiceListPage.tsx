import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation, QueryKey, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PlusCircle, MoreHorizontal, FileText, Trash2, Edit } from 'lucide-react'; 
import { format } from 'date-fns';

import { Button } from "@/ui/Button";
import PageHeader from "@/ui/PageHeader"; 
import InvoiceDetailModal, { InvoiceDetailModalProps } from "@/pages/Invoices/components/InvoiceDetailModal";
import InvoiceCreateModal from "@/pages/Invoices/components/InvoiceCreateModal";
// Sửa: Chỉ import default component, InvoiceCoreFilterValues sẽ được định nghĩa cục bộ
import InvoiceFiltersComponent from "@/pages/Invoices/components/InvoiceFilters";
import { LoadingSpinner } from "@/ui/Loading/Spinner";
import ErrorState from "@/ui/ErrorState";
import EmptyState from "@/ui/EmptyState"; 
// Sửa: Import BadgeProps nếu Badge.tsx export nó, nếu không thì định nghĩa cục bộ hoặc bỏ
import { Badge, BadgeProps as ImportedBadgeProps } from "@/ui/Badge"; 
import DropdownMenu, { DropdownMenuItem } from "@/ui/DropdownMenu";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { getInvoices, deleteInvoice, Invoice, InvoicesResponse, GetInvoicesParams } from "@/api/invoicesApi";
import { formatCurrency, formatDate } from "@/utils/formatters";

// Sửa: Định nghĩa type cho các giá trị filter cốt lõi mà InvoiceFiltersComponent trả về
interface InvoiceCoreFilterValues {
  status?: string;
  propertyId?: string;
  startDate?: Date; 
  endDate?: Date;   
}

// PageFiltersState bao gồm các filter cốt lõi và thông tin phân trang
interface PageFiltersState extends InvoiceCoreFilterValues {
  page?: number;
  limit?: number;
}

// Type cho Badge variant, nếu BadgeProps không được export hoặc cần tùy chỉnh
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';


const InvoiceListPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialFilters = useCallback((): PageFiltersState => {
    const params: PageFiltersState = { page: 1, limit: 10 };
    searchParams.forEach((value, key) => {
      const k = key as keyof PageFiltersState;
      if (k === "page" || k === "limit") {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 0) params[k] = numValue;
      } else if (k === "startDate" || k === "endDate") {
        if (value) params[k] = new Date(value); 
      } else if (["status", "propertyId"].includes(k)) { 
        (params as any)[k] = value;
      }
    });
    return params;
  }, [searchParams]);

  const [filters, setFilters] = useState<PageFiltersState>(getInitialFilters);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value instanceof Date) { 
        newSearchParams.set(key, format(value, 'yyyy-MM-dd'));
      } else if (value !== undefined && value !== null && String(value).trim() !== '') {
        newSearchParams.set(key, String(value));
      }
    });
    // Chỉ cập nhật searchParams nếu chúng thực sự thay đổi
    if (decodeURIComponent(newSearchParams.toString()) !== decodeURIComponent(searchParams.toString())) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  useEffect(() => {
    const currentFiltersFromParams = getInitialFilters();
    // So sánh sâu hơn để tránh re-render không cần thiết
    if (JSON.stringify(currentFiltersFromParams) !== JSON.stringify(filters)) {
      setFilters(currentFiltersFromParams);
    }
  }, [getInitialFilters, filters]); // Thêm filters vào dependency array


  const { data: invoicesResponse, isLoading, error, refetch } = useQuery<InvoicesResponse, Error, InvoicesResponse, QueryKey>({
    // Query key nên bao gồm tất cả các dependencies của queryFn mà thay đổi
    queryKey: ["invoices", user?.tenantId, filters.status, filters.propertyId, filters.startDate?.toISOString(), filters.endDate?.toISOString(), filters.page, filters.limit] as QueryKey,
    queryFn: () => {
      if (!user?.tenantId) {
        return Promise.resolve({ data: [], total: 0, page: filters.page, limit: filters.limit, totalPages: 0 }); 
      }
      const apiParams: GetInvoicesParams = {
        status: filters.status,
        propertyId: filters.propertyId,
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
        page: filters.page,
        limit: filters.limit,
        // tenantId: user.tenantId, // Gửi tenantId nếu API yêu cầu nó trong params
                                  // Hoặc đảm bảo apiClient đã tự động thêm tenantId
      };
      return getInvoices(apiParams); 
    },
    enabled: !!user?.tenantId,
    placeholderData: keepPreviousData,
  });

  const invoices = invoicesResponse?.data || [];
  const totalInvoices = invoicesResponse?.total || 0;
  const totalPages = (filters.limit && totalInvoices) ? Math.ceil(totalInvoices / filters.limit) : 0;

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      toast({ title: "Invoice Deleted", description: "Invoice successfully deleted.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["invoices", user?.tenantId] }); // Invalidate queries liên quan
    },
    onError: (err: any) => { 
      toast({ title: "Error Deleting Invoice", description: err.message || "Could not delete invoice.", variant: "destructive" });
    },
  });

  // Sửa: newFiltersFromComponent giờ là InvoiceCoreFilterValues
  const handleApplyFilters = useCallback((newFiltersFromComponent: InvoiceCoreFilterValues) => { 
    setFilters(prev => ({ 
        ...prev, 
        ...newFiltersFromComponent, 
        page: 1 // Reset về trang 1 khi filter thay đổi
    }));
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) { // Đảm bảo newPage >= 1
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleOpenCreateModal = () => setCreateModalOpen(true);
  
  const handleOpenDetailModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailModalOpen(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      deleteMutation.mutate(invoiceId);
    }
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
  };

  const getStatusBadgeVariant = (status?: Invoice['status']): BadgeVariant => { 
    if (!status) return 'secondary';
    switch (status.toUpperCase()) { 
      case "PAID": return "success";
      case "DRAFT": return "default"; 
      case "VOID": return "destructive";
      case "SENT": return "secondary"; 
      default: return "secondary";
    }
  };

  const renderDropdownTrigger = () => (
    <Button variant="ghost" className="h-8 w-8 p-0">
      <span className="sr-only">Open menu</span>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  if (isLoading && !invoicesResponse) { 
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) { 
    return <div className="p-4"><ErrorState title="Error Loading Invoices" message={error.message || "Unknown error"} onRetry={refetch} /></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <PageHeader title="Invoices">
        <Button onClick={handleOpenCreateModal} variant="primary" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </PageHeader>

      {/* Sửa: Bỏ initialFilters nếu InvoiceFiltersComponent không hỗ trợ */}
      <InvoiceFiltersComponent 
        onFiltersChange={handleApplyFilters} 
        // initialFilters={filters} // Bỏ prop này nếu không được định nghĩa trong InvoiceFiltersProps
      />

      <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {isLoading && <div className="p-4 text-center"><LoadingSpinner/></div> }
        {!isLoading && invoices.length === 0 ? (
          <div className="py-10">
            <EmptyState 
                title="No Invoices Found" 
                description="Try adjusting your filters or create your first invoice." 
                action={
                    <Button onClick={handleOpenCreateModal} variant="primary" size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
                    </Button>
                }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booking</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guest</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{invoice.booking?.bookingCode || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{invoice.booking?.guestName || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.dueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu trigger={renderDropdownTrigger()} align="right"> 
                        <DropdownMenuItem onSelect={() => handleOpenDetailModal(invoice)}>
                          <FileText className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onSelect={() => handleDeleteInvoice(invoice.id)} 
                            className="text-red-600 hover:text-red-700 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-700 dark:focus:text-red-100"
                            disabled={deleteMutation.isPending && deleteMutation.variables === invoice.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && totalPages > 0 && invoices.length > 0 && ( // Chỉ hiển thị pagination nếu có dữ liệu và > 1 trang
            <div className="flex justify-center items-center py-4 mt-4 border-t dark:border-gray-700">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={(filters.page || 1) <= 1 || isLoading}
                >
                    Previous
                </Button>
                <span className="text-sm text-gray-700 dark:text-gray-300 px-4">
                    Page {filters.page || 1} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={(filters.page || 1) >= totalPages || isLoading}
                >
                    Next
                </Button>
            </div>
        )}
      </div>

      <InvoiceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedInvoice && (
        <InvoiceDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => { setDetailModalOpen(false); setSelectedInvoice(null); }}
          invoice={selectedInvoice as InvoiceDetailModalProps['invoice']} 
        />
      )}
    </div>
  );
};

export default InvoiceListPage;

// Bỏ định nghĩa BadgeProps cục bộ nếu ImportedBadgeProps từ @/ui/Badge đã đủ dùng và đúng
// interface BadgeProps {
//  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
// }