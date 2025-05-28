import React from 'react';
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/Dialog';
import Button from '@/ui/Button';
import Badge from '@/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import { formatCurrency, formatDate } from '@/utils/formatters';
// Corrected import path assuming types is under src
import { Invoice, InvoiceItem, InvoiceStatus, PaymentType } from '@/types/finance'; 

// Export the props interface
export interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const renderStatusBadge = (status: InvoiceStatus) => {
    const statusColors: Record<InvoiceStatus, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      VOID: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Details - {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Booking Code</p>
              <p>{invoice.booking?.bookingCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Guest Name</p>
              <p>{invoice.booking?.guestName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Issue Date</p>
              <p>{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Due Date</p>
              <p>{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p>{renderStatusBadge(invoice.status)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p>{formatCurrency(invoice.totalAmount)}</p>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <p className="text-sm font-medium text-gray-500">Notes</p>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Invoice Items</p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item: InvoiceItem, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {/* Add other actions like Print, Send, Mark as Paid etc. if needed */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailModal;

