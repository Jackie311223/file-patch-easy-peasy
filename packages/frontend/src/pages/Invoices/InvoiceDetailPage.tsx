import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoices } from '../../api/invoicesApi';
// Mock implementation for missing API functions
const getInvoiceById = async (id: string): Promise<any> => {
  console.log(`Fetching invoice with ID: ${id}`);
  return {}; // Return empty object as placeholder
};

const updateInvoiceStatus = async (id: string, status: string): Promise<any> => {
  console.log(`Updating invoice ${id} status to ${status}`);
  return {}; // Return empty object as placeholder
};
import Button from '@/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import Badge from '@/ui/Badge';
import { ArrowLeft, CheckCircle, Send, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import LoadingSpinner from '@/ui/Loading/Spinner';
import ErrorState from '@/ui/ErrorState';
import { useToast } from '@/hooks/useToast';
import { useAuth } from "@/hooks/useAuth";

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check permissions for updating status
  const canUpdateStatus = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'PARTNER' || user?.role === 'MANAGER';

  // Fetch invoice details
  const { 
    data: invoice = {}, // Provide default empty object to avoid type errors
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => updateInvoiceStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Invalidate list view as well
      toast({
        title: 'Status updated',
        description: 'Invoice status has been updated successfully',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update invoice status',
        variant: 'destructive',
      });
    }
  });

  const handleStatusUpdate = (status: string) => {
    if (!id) return;
    updateStatusMutation.mutate(status);
  };

  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      VOID: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status || 'UNKNOWN'}
      </Badge>
    );
  };

  const renderPaymentMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      OTA_TRANSFER: 'bg-yellow-100 text-yellow-800',
      BANK_PERSONAL: 'bg-cyan-100 text-cyan-800',
      '9PAY': 'bg-indigo-100 text-indigo-800',
      ONEPAY: 'bg-orange-100 text-orange-800',
    };
    const methodLabels: Record<string, string> = {
      OTA_TRANSFER: 'OTA Transfer',
      BANK_PERSONAL: 'Bank Personal',
      '9PAY': '9Pay',
      ONEPAY: 'OnePay',
    };
    return (
      <Badge className={methodColors[method] || 'bg-gray-100 text-gray-800'}>
        {methodLabels[method] || method}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState 
          title="Failed to load invoice details" 
          message={error?.message || 'Something went wrong'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState 
          title="Invoice not found" 
          message="The requested invoice could not be found."
          onRetry={undefined}
        />
         <Button variant="secondary" onClick={() => navigate('/invoices')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back Button and Title */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
        <h1 className="text-2xl font-bold">Invoice Details</h1>
      </div>

      {/* Invoice Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoice Summary</CardTitle>
          {renderStatusBadge(invoice.status)}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Invoice Number</p>
              <p className="font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Invoice Date</p>
              <p className="font-semibold">{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="font-semibold text-lg">{formatCurrency(invoice.totalAmount)}</p>
            </div>
          </div>
          {/* Action Buttons */}
          {canUpdateStatus && invoice.status !== 'VOID' && invoice.status !== 'PAID' && (
            <div className="flex space-x-2 mt-4">
              {invoice.status === 'DRAFT' && (
                <Button 
                  size="sm" 
                  onClick={() => handleStatusUpdate('SENT')}
                  disabled={updateStatusMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" /> Mark as Sent
                </Button>
              )}
              {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleStatusUpdate('PAID')}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                </Button>
              )}
              {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                <Button 
                  size="sm" 
                  variant="danger"
                  onClick={() => handleStatusUpdate('VOID')}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Void Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Included Payments Card */}
      <Card>
        <CardHeader>
          <CardTitle>Included Payments</CardTitle>
          <CardDescription>List of payments included in this invoice.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Received From</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments?.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.booking?.bookingCode || '-'}</TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{renderPaymentMethodBadge(payment.method)}</TableCell>
                    <TableCell>{payment.receivedFrom || '-'}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetailPage;
