import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import { Badge } from '@/ui/Badge'; 
import { Button } from '@/ui/Button'; 
import DropdownMenu, { DropdownMenuItem } from '@/ui/DropdownMenu'; 
import { MoreHorizontal, Edit, Eye, Trash } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
// import { useToast } from '@/hooks/useToast'; // Bỏ nếu không dùng trực tiếp
// import { useQueryClient } from '@tanstack/react-query'; 
// Sửa: Import Payment type từ paymentsApi để đảm bảo nhất quán
import { useUpdatePaymentStatus, useDeletePayment, Payment } from '@/api/paymentsApi'; 

// Bỏ định nghĩa Payment cục bộ, sử dụng type đã import
// interface Payment { ... }

interface PaymentTableProps {
  payments: Payment[]; // Sử dụng Payment type đã import từ API
  paymentType: 'HOTEL_COLLECT' | 'OTA_COLLECT'; 
  onRefresh?: () => void; 
  onEdit?: (payment: Payment) => void; // Sử dụng Payment type đã import từ API
  onView?: (payment: Payment) => void; // Sử dụng Payment type đã import từ API
}

const PaymentTable: React.FC<PaymentTableProps> = ({ 
  payments, 
  paymentType, 
  onRefresh,
  onEdit,
  onView
}) => {
  const { user } = useAuth();
  
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'PARTNER' || user?.role === 'ADMIN';
  const canDelete = user?.role === 'SUPER_ADMIN';
  
  const updateStatusMutation = useUpdatePaymentStatus();
  const deleteMutation = useDeletePayment(); 
  
  const handleEdit = (payment: Payment) => {
    if (onEdit) {
      onEdit(payment);
    }
  };
  
  const handleView = (payment: Payment) => {
    if (onView) {
      onView(payment);
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (onRefresh) onRefresh(); 
        }
      });
    }
  };
  
  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ paymentId: id, status }, {
        onSuccess: () => {
            if (onRefresh) onRefresh(); 
        }
    });
  };
  
  const renderMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      CASH: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      BANK_TRANSFER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      MOMO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      '9PAY': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      ONEPAY: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      OTA_TRANSFER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      BANK_PERSONAL: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    const methodLabels: Record<string, string> = {
      CASH: 'Cash', BANK_TRANSFER: 'Bank Transfer', MOMO: 'MoMo', '9PAY': '9Pay',
      ONEPAY: 'OnePay', OTA_TRANSFER: 'OTA Transfer', BANK_PERSONAL: 'Bank Personal',
    };
    return (
      <Badge className={methodColors[method] || methodColors.DEFAULT}>
        {methodLabels[method] || method}
      </Badge>
    );
  };
  
  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      UNPAID: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DEFAULT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    const statusLabels: Record<string, string> = {
      PAID: 'Paid', UNPAID: 'Unpaid', PARTIALLY_PAID: 'Partially Paid',
    };
    return (
      <Badge className={statusColors[status] || statusColors.DEFAULT}>
        {statusLabels[status] || status}
      </Badge>
    );
  };
  
  if (!payments) {
    return <div className="p-4 text-center">Loading payments...</div>; 
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking Code</TableHead>
            <TableHead>Guest Name</TableHead> {/* Thêm cột Guest Name nếu cần */}
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>{paymentType === 'HOTEL_COLLECT' ? 'Collected By' : 'Received From'}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-gray-500"> 
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => ( // payment giờ là type Payment từ API
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.booking?.bookingCode || '-'}</TableCell>
                <TableCell>{payment.booking?.guestName || '-'}</TableCell> {/* Hiển thị Guest Name */}
                <TableCell>{renderMethodBadge(payment.method)}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{renderStatusBadge(payment.status)}</TableCell>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>
                  {payment.paymentType === 'HOTEL_COLLECT' // Sử dụng payment.paymentType từ đối tượng payment
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
                    {onView && (
                      <DropdownMenuItem onClick={() => handleView(payment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                    )}
                    
                    {canEdit && onEdit && (
                      <DropdownMenuItem onClick={() => handleEdit(payment)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit payment
                      </DropdownMenuItem>
                    )}
                    
                    {canEdit && payment.status !== 'PAID' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'PAID')}
                        disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.paymentId === payment.id && updateStatusMutation.variables?.status === 'PAID'}
                      >
                        Mark as paid
                      </DropdownMenuItem>
                    )}
                    
                    {canEdit && payment.status !== 'UNPAID' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(payment.id, 'UNPAID')}
                        disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.paymentId === payment.id && updateStatusMutation.variables?.status === 'UNPAID'}
                      >
                        Mark as unpaid
                      </DropdownMenuItem>
                    )}
                    
                    {canDelete && (
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-800 dark:focus:text-red-100"
                        onClick={() => handleDelete(payment.id)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === payment.id}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentTable;