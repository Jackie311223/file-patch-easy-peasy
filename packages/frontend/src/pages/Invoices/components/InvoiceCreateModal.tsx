import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/Dialog";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import Label from "@/ui/Label";
import Checkbox from "@/ui/Checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/Select";
import DatePicker from "@/ui/DatePicker";
import Spinner from "@/ui/Loading/Spinner";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { getPayments, PaymentsResponse, Payment } from "@/api/paymentsApi";
import { useGetBookings, BookingsResponse, Booking } from "@/api/bookingsApi"; // Use the hook
import { createInvoice } from "@/api/invoicesApi";
import { formatCurrency, formatDate } from "@/utils/formatters";

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

  // Fetch bookings using the hook
  const { data: bookingsResponse, isLoading: isLoadingBookings } = useGetBookings({ status: "CONFIRMED" });
  // Extract the data array
  const bookings: Booking[] = bookingsResponse?.data || [];

  // Fetch unpaid payments for the selected booking
  const { data: paymentsResponse, isLoading: isLoadingPayments } = useQuery<PaymentsResponse, Error>({
    queryKey: ["payments", { bookingId: selectedBookingId, status: "UNPAID" }],
    // Pass correct params to getPayments
    queryFn: () => getPayments({ bookingId: selectedBookingId, status: "UNPAID" }), 
    enabled: !!selectedBookingId, 
  });
  const payments: Payment[] = paymentsResponse?.data || []; 

  const createInvoiceMutation = useMutation<any, Error, any>({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast({ title: "Invoice Created", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      resetForm();
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error Creating Invoice", 
        description: error?.response?.data?.message || error.message, 
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setSelectedBookingId("");
    setSelectedPaymentIds([]);
    setDueDate(new Date());
    setNotes("");
  };

  const handleCheckboxChange = (paymentId: string) => {
    setSelectedPaymentIds((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (payments && payments.length > 0) {
      if (selectedPaymentIds.length === payments.length) {
        setSelectedPaymentIds([]);
      } else {
        setSelectedPaymentIds(payments.map((p) => p.id));
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedBookingId || !dueDate) {
      toast({ title: "Missing Information", description: "Please select a booking and due date.", variant: "destructive" });
      return;
    }
    if (selectedPaymentIds.length === 0) {
      toast({ title: "No Payments Selected", description: "Please select at least one payment to include.", variant: "destructive" });
      return;
    }

    const invoiceData = {
      bookingId: selectedBookingId,
      dueDate: dueDate.toISOString(),
      status: "DRAFT",
      notes,
      paymentIds: selectedPaymentIds,
      tenantId: user?.tenantId,
    };
    createInvoiceMutation.mutate(invoiceData);
  };

  useEffect(() => {
    setSelectedPaymentIds([]);
  }, [selectedBookingId]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Booking Selection */}
          <div className="space-y-1">
            <Label htmlFor="bookingId">Booking</Label>
            <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
              <SelectTrigger id="bookingId">
                <SelectValue placeholder="Select a booking" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBookings ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  // Ensure bookings is an array before mapping
                  Array.isArray(bookings) && bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.bookingCode} - {booking.guestName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <Label htmlFor="dueDate">Due Date</Label>
            {/* Remove invalid id prop */}
            <DatePicker value={dueDate} onChange={setDueDate} /> 
          </div>

          {/* Payments Table */}
          <div className="space-y-2">
            <Label>Select Payments to Include</Label>
            {isLoadingPayments ? (
              <Spinner />
            ) : payments && payments.length > 0 ? (
              <div className="rounded-md border max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          id="select-all-payments"
                          checked={payments.length > 0 && selectedPaymentIds.length === payments.length}
                          onChange={handleSelectAll}
                          aria-label="Select all payments"
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Checkbox
                            id={`select-payment-${payment.id}`}
                            checked={selectedPaymentIds.includes(payment.id)}
                            onChange={() => handleCheckboxChange(payment.id)}
                            aria-labelledby={`payment-label-${payment.id}`}
                          />
                        </TableCell>
                        <TableCell id={`payment-label-${payment.id}`}>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {selectedBookingId ? "No unpaid payments found for this booking." : "Select a booking to see payments."}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add any relevant notes" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createInvoiceMutation.isPending}>
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceCreateModal;

