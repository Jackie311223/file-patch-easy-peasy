import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/Dialog"; 
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input"; 
import { Label } from "@/ui/Label";
import Checkbox from "@/ui/Checkbox"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import DatePicker from "@/ui/DatePicker"; 
import { LoadingSpinner } from "@/ui/Loading/Spinner";
import { Textarea } from "@/ui/Textarea"; 
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { getPayments, PaymentsResponse, Payment, GetPaymentsParams } from "@/api/paymentsApi"; 
import { useGetBookings, Booking } from "@/api/bookingsApi"; 
// Sửa: Bỏ import InvoiceStatus vì nó không được export hoặc không cần thiết nếu status là string literal
import { createInvoice, CreateInvoicePayload } from "@/api/invoicesApi"; 
import { formatCurrency, formatDate } from "@/utils/formatters";

// CreateInvoicePayload được import từ invoicesApi.ts, đảm bảo nó được export ở đó
// và có trường status với union type phù hợp (ví dụ: "DRAFT" | "SENT" | ...)

interface InvoiceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InvoiceCreateModal: React.FC<InvoiceCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast(); 
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState<string>("");

  const { data: bookingsResponse, isLoading: isLoadingBookings } = useGetBookings({ status: "CONFIRMED", limit: 1000 });
  const bookings: Booking[] = bookingsResponse?.data || [];

  const { data: paymentsResponse, isLoading: isLoadingPayments } = useQuery<PaymentsResponse, Error>({
    queryKey: ["payments", { bookingId: selectedBookingId, status: "UNPAID" }],
    // Sửa: Bỏ invoiceIdIsNull nếu GetPaymentsParams không có
    queryFn: () => getPayments({ bookingId: selectedBookingId, status: "UNPAID" }), 
    enabled: !!selectedBookingId, 
  });
  const availablePayments: Payment[] = paymentsResponse?.data || []; 

  const createInvoiceMutation = useMutation<any, Error, CreateInvoicePayload>({ 
    mutationFn: createInvoice,
    onSuccess: () => {
      toast({ title: "Invoice Created", description: "New invoice has been successfully created.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments", { bookingId: selectedBookingId }] }); 
      resetForm();
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error Creating Invoice", 
        description: error?.response?.data?.message || error.message || "An unexpected error occurred.", 
        variant: "destructive" 
      });
    },
  });

  const resetForm = useCallback(() => {
    setSelectedBookingId("");
    setSelectedPaymentIds([]);
    setDueDate(new Date());
    setNotes("");
  }, []);

  const handleCheckboxChange = (paymentId: string) => {
    setSelectedPaymentIds((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const isChecked = event.target.checked;
    if (availablePayments && availablePayments.length > 0) {
      if (isChecked) {
        setSelectedPaymentIds(availablePayments.map((p) => p.id));
      } else {
        setSelectedPaymentIds([]);
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedBookingId || !dueDate) {
      toast({ title: "Missing Information", description: "Please select a booking and set a due date.", variant: "destructive" });
      return;
    }
    // if (selectedPaymentIds.length === 0) { // Allow creating invoice without payments
    //   toast({ title: "No Payments Selected", description: "Please select at least one payment to include.", variant: "destructive" });
    //   return;
    // }

    const invoiceData: CreateInvoicePayload = {
      bookingId: selectedBookingId,
      dueDate: dueDate.toISOString().split('T')[0], 
      status: "DRAFT", // Đảm bảo "DRAFT" là giá trị hợp lệ cho CreateInvoicePayload.status
      notes,
      paymentIds: selectedPaymentIds,
      tenantId: user?.tenantId,
    };
    createInvoiceMutation.mutate(invoiceData);
  };

  useEffect(() => {
    setSelectedPaymentIds([]);
  }, [selectedBookingId]);

  useEffect(() => {
    if (!isOpen) {
        resetForm();
    }
  }, [isOpen, resetForm]);


  return (
    <Dialog open={isOpen} onOpenChange={(openState) => { if (!openState) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-1">
            <Label htmlFor="booking-select-invoice">Booking</Label>
            <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
              <SelectTrigger id="booking-select-invoice">
                <SelectValue placeholder="Select a booking" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBookings ? (
                  <SelectItem value="loading" disabled>Loading bookings...</SelectItem>
                ) : (
                  Array.isArray(bookings) && bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.bookingCode} - {booking.guestName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="invoice-due-date-picker">Due Date</Label>
            <DatePicker 
              value={dueDate} 
              onChange={setDueDate} 
              // Sửa: Bỏ prop 'id' nếu DatePickerProps không có.
              // id="invoice-due-date-picker" 
            /> 
          </div>

          <div className="space-y-2">
            <Label>Select Payments to Include</Label>
            {isLoadingPayments ? (
              <div className="flex justify-center py-4"><LoadingSpinner /></div>
            ) : availablePayments && availablePayments.length > 0 ? (
              <div className="rounded-md border max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        {/* Sửa: Đổi onCheckedChange thành onChange cho Checkbox */}
                        <Checkbox
                          id="select-all-payments-invoice" 
                          checked={availablePayments.length > 0 && selectedPaymentIds.length === availablePayments.length}
                          onChange={handleSelectAll} 
                          aria-label="Select all payments"
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead> 
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availablePayments.map((payment: Payment) => (
                      <TableRow key={payment.id} className={selectedPaymentIds.includes(payment.id) ? "bg-blue-50 dark:bg-blue-900/30" : ""}>
                        <TableCell>
                          {/* Sửa: Đổi onCheckedChange thành onChange cho Checkbox */}
                          <Checkbox
                            id={`select-payment-invoice-${payment.id}`} 
                            checked={selectedPaymentIds.includes(payment.id)}
                            onChange={() => handleCheckboxChange(payment.id)} 
                            aria-labelledby={`payment-label-invoice-${payment.id}`}
                          />
                        </TableCell>
                        <TableCell id={`payment-label-invoice-${payment.id}`}>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                {selectedBookingId ? "No unpaid and unbilled payments found for this booking." : "Select a booking to see available payments."}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="invoice-notes-area">Notes (Optional)</Label> 
            <Textarea 
              id="invoice-notes-area" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add any relevant notes" 
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createInvoiceMutation.isPending}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createInvoiceMutation.isPending || !selectedBookingId || !dueDate }
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceCreateModal;