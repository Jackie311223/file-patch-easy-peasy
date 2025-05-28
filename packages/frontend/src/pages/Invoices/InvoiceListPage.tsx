import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { PlusCircle, Edit, Trash2, FileText, MoreHorizontal } from "lucide-react";

import Button from "@/ui/Button";
import DatePicker from "@/ui/DatePicker";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { getInvoices, deleteInvoice, Invoice, InvoicesResponse } from "@/api/invoicesApi";
import { formatCurrency, formatDate } from "@/utils/formatters";
import InvoiceDetailModal, { InvoiceDetailModalProps } from "@/pages/Invoices/components/InvoiceDetailModal";
import InvoiceCreateModal from "@/pages/Invoices/components/InvoiceCreateModal";
import InvoiceFilters, { InvoiceFiltersProps } from "@/pages/Invoices/components/InvoiceFilters";
import PageHeader from "@/ui/PageHeader";
import Spinner from "@/ui/Loading/Spinner";
import ErrorState from "@/ui/ErrorState";
// Correct import for EmptyState (default export)
import EmptyState from "@/ui/EmptyState"; 
// Correct import for Badge (default export)
import Badge from "@/ui/Badge"; 
import DropdownMenu, { DropdownMenuItem } from "@/ui/DropdownMenu";

interface Filters {
  status?: string;
  propertyId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Assuming EmptyStateProps is defined within EmptyState.tsx or not needed here
// interface CustomEmptyStateProps extends EmptyStateProps { ... }

// Define a more complete Invoice type matching InvoiceDetailModalProps if needed
// Or adjust InvoiceDetailModalProps to accept the current Invoice type
interface FullInvoice extends Invoice {
  tenantId: string;
  propertyId: string;
  bookingId: string;
  // Add other missing properties if required by InvoiceDetailModal
}

const InvoiceListPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<Filters>({});
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  // Use the more complete type if needed, otherwise cast later
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoicesResponse, isLoading, error } = useQuery<InvoicesResponse, Error>({
    queryKey: ["invoices", user?.tenantId, filters],
    // Pass only tenantId and filters to getInvoices if that's the signature
    queryFn: () => getInvoices(user?.tenantId || "", filters), 
    enabled: !!user?.tenantId,
    placeholderData: (previousData) => previousData,
  });

  const invoices = invoicesResponse?.data || [];

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      toast({ title: "Invoice Deleted", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["invoices", user?.tenantId] });
    },
    onError: (error: any) => {
      toast({ title: "Error Deleting Invoice", description: error.message, variant: "destructive" });
    },
  });

  const handleApplyFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleOpenDetailModal = (invoice: Invoice) => {
    // Cast or ensure the selected invoice matches InvoiceDetailModalProps
    setSelectedInvoice(invoice);
    setDetailModalOpen(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      deleteMutation.mutate(invoiceId);
    }
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["invoices", user?.tenantId] });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID": return "success";
      case "PENDING": return "warning";
      case "CANCELLED": return "destructive";
      default: return "secondary";
    }
  };

  const renderDropdownTrigger = () => (
    <Button variant="ghost" className="h-8 w-8 p-0">
      <span className="sr-only">Open menu</span>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Invoices">
        <Button onClick={handleOpenCreateModal} variant="primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </PageHeader>

      <InvoiceFilters onFiltersChange={handleApplyFilters} />

      <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState title="Error Loading Invoices" message={error.message} />
        ) : invoices.length === 0 ? (
          <EmptyState title="No Invoices Found" description="Try adjusting your filters or create a new invoice." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.booking?.bookingCode || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.booking?.guestName || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Correct align prop value */}
                      <DropdownMenu trigger={renderDropdownTrigger()} align="right"> 
                        <DropdownMenuItem onSelect={() => handleOpenDetailModal(invoice)}>
                          <FileText className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDeleteInvoice(invoice.id)} className="text-red-600 hover:text-red-700">
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
      </div>

      <InvoiceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Cast selectedInvoice to the type expected by InvoiceDetailModal if necessary */}
      {selectedInvoice && (
        <InvoiceDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          invoice={selectedInvoice as InvoiceDetailModalProps['invoice']} 
        />
      )}
    </div>
  );
};

export default InvoiceListPage;

