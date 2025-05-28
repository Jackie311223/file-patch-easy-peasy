import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import Badge from '@/ui/Badge';
import Button from '@/ui/Button';
import DropdownMenu, { DropdownMenuItem } from '@/ui/DropdownMenu';
import { MoreHorizontal, Edit, Eye, Trash } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast'; // Assuming useToast exists and provides toast function
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUpdatePaymentStatus, useDeletePayment } from '@/api/paymentsApi';

interface PaymentTableProps {
  payments: any[];
  paymentType: 'HOTEL_COLLECT' | 'OTA_COLLECT';
  onRefresh: () => void;
  onEdit?: (payment: any) => void;
  onView?: (payment: any) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ 
  payments, 
  paymentType, 
  onRefresh,
  onEdit,
  onView
}) => {
  const { user } = useAuth();
  const { toast } = useToast(); // Get toast function
  const queryClient = useQueryClient();
  
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'PARTNER';
  const canDelete = user?.role === 'SUPER_ADMIN';
  
  // Use the imported hooks. onSuccess/onError are defined within the hooks.
  const updateStatusMutation = useUpdatePaymentStatus();
  const deleteMutation = useDeletePayment();
  
  const handleEdit = (payment: any) => {
    if (onEdit) {
      onEdit(payment);
    }
  };
  
  const handleView = (payment: any) => {
    if (onView) {
      onView(payment);
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      // Pass only the ID. Callbacks are handled by the hook.
      deleteMutation.mutate(id);
      // Manually trigger refresh/toast here if needed, although hook should handle it
      // queryClient.invalidateQueries({ queryKey: ['payments'] });
      // toast({ title: 'Delete initiated', variant: 'success' });
      // onRefresh(); 
    }
  };
  
  const handleStatusChange = (id: string, status: string) => {
    // Pass only the data object. Callbacks are handled by the hook.
    updateStatusMutation.mutate({ paymentId: id, status });
     // Manually trigger refresh/toast here if needed, although hook should handle it
     // queryClient.invalidateQueries({ queryKey: ['payments'] });
     // toast({ title: 'Update initiated', variant: 'success' });
     // onRefresh();
  };
  
  // Render payment method badge
  const renderMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      CASH: 'bg-green-100 text-green-800',
      BANK_TRANSFER: 'bg-blue-100 text-blue-800',
      MOMO: 'bg-purple-100 text-purple-800',
      '9PAY': 'bg-indigo-100 text-indigo-800',
      ONEPAY: 'bg-orange-100 text-orange-800',
      OTA_TRANSFER: 'bg-yellow-100 text-yellow-800',
      BANK_PERSONAL: 'bg-cyan-100 text-cyan-800',
    };
    const methodLabels: Record<string, string> = {
      CASH: 'Cash',
      BANK_TRANSFER: 'Bank Transfer',
      MOMO: 'MoMo',
      '9PAY': '9Pay',
      ONEPAY: 'OnePay',
      OTA_TRANSFER: 'OTA Transfer',
      BANK_PERSONAL: 'Bank Personal',
    };
    return (
      <Badge className={methodColors[method] || 'bg-gray-100 text-gray-800'}>
        {methodLabels[method] || method}
      </Badge>
    );
  };
  
  // Render payment status badge
  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      UNPAID: 'bg-red-100 text-red-800',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
    };
    const statusLabels: Record<string, string> = {
      PAID: 'Paid',
      UNPAID: 'Unpaid',
      PARTIALLY_PAID: 'Partially Paid',
    };
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking Code</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>{paymentType === 'HOTEL_COLLECT' ? 'Collected By' : 'Received From'}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.booking?.bookingCode || '-'}</TableCell>
              <TableCell>{renderMethodBadge(payment.method)}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{renderStatusBadge(payment.status)}</TableCell>
              <TableCell>{formatDate(payment.paymentDate)}</TableCell>
              <TableCell>
                {paymentType === 'HOTEL_COLLECT' 
                  ? payment.collectedBy?.name || '-'
                  : payment.receivedFrom || '-'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                  align="right"
                >
                  <DropdownMenuItem onClick={() => handleView(payment)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                  
                  {canEdit && (
                    <DropdownMenuItem onClick={() => handleEdit(payment)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit payment
                    </DropdownMenuItem>
                  )}
                  
                  {canEdit && payment.status !== 'PAID' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'PAID')}>
                      Mark as paid
                    </DropdownMenuItem>
                  )}
                  
                  {canEdit && payment.status !== 'UNPAID' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'UNPAID')}>
                      Mark as unpaid
                    </DropdownMenuItem>
                  )}
                  
                  {canDelete && (
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDelete(payment.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentTable;
