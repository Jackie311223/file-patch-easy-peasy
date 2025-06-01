import React from 'react';
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/ui/Dialog';
import { Button } from '@/ui/Button';
// Sửa: Chỉ import Badge component. BadgeProps có thể không cần nếu CustomBadgeVariant đủ dùng và khớp.
import { Badge } from '@/ui/Badge'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/finance'; 

export interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

// Sửa: Loại bỏ 'info' và 'outline' nếu BadgeProps của component Badge không hỗ trợ chúng.
// Dựa trên thông báo lỗi, BadgeProps.variant là:
// 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | undefined
// Vì vậy 'outline' là hợp lệ, 'info' không hợp lệ.
type CustomBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';


const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const getStatusBadgeVariant = (status: InvoiceStatus): CustomBadgeVariant => { 
    // Đảm bảo hàm này chỉ trả về các giá trị có trong CustomBadgeVariant (đã được cập nhật)
    switch (status.toUpperCase()) { 
      case "PAID": return "success";
      case "DRAFT": return "secondary"; // Hoặc 'default', 'outline' tùy theo style bạn muốn
      case "VOID": return "destructive";
      case "SENT": return "secondary"; // Hoặc 'default', 'outline'
      // case "PENDING": return "warning"; // Nếu InvoiceStatus có 'PENDING'
      default: return "secondary"; // Fallback về một variant hợp lệ
    }
  };

  const renderStatusBadge = (status: InvoiceStatus) => {
    const statusColors: Record<string, string> = { 
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      VOID: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    const defaultColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    const variantToUse = getStatusBadgeVariant(status);

    return (
      <Badge 
        className={statusColors[status.toUpperCase()] || defaultColor} 
        variant={variantToUse} // variantToUse giờ đây không còn 'info'
      >
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => { if (!openState) onClose(); }}>
      <DialogContent className="sm:max-w-3xl dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle>Invoice Details - {invoice.invoiceNumber}</DialogTitle>
          {invoice.booking?.bookingCode && (
            <DialogDescription>
              Booking Code: {invoice.booking.bookingCode}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4 space-y-6 text-sm max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Guest Name</p>
              <p>{invoice.booking?.guestName || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Status</p>
              <div>{renderStatusBadge(invoice.status)}</div>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Issue Date</p>
              <p>{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Due Date</p>
              <p>{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="md:col-span-2"> 
              <p className="font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="font-semibold text-lg">{formatCurrency(invoice.totalAmount)}</p>
            </div>
          </div>

          {invoice.notes && (
            <div className="pt-2"> 
              <p className="font-medium text-gray-500 dark:text-gray-400">Notes</p>
              <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md whitespace-pre-wrap text-gray-700 dark:text-gray-300">{invoice.notes}</p>
            </div>
          )}

          <div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Invoice Items</p>
            {invoice.items && invoice.items.length > 0 ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-700">
                    <TableRow>
                      <TableHead className="text-gray-600 dark:text-gray-300">Description</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Quantity</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Unit Price</TableHead>
                      <TableHead className="text-right text-gray-600 dark:text-gray-300">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.items.map((item: InvoiceItem, index: number) => ( 
                      <TableRow key={item.id || `item-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="text-gray-800 dark:text-gray-200">{item.description}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{item.quantity}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right text-gray-800 dark:text-gray-200">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="italic text-gray-500 dark:text-gray-400 py-3">No items in this invoice.</p>
            )}
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailModal;