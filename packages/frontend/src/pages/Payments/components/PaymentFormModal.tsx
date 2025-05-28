import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/Dialog";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import Label from "@/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/Select";
import DatePicker from "@/ui/DatePicker";
import Textarea from "@/ui/Textarea";
import Spinner from "@/ui/Loading/Spinner";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { getPayments, createPayment, updatePaymentStatusApi, Payment, PaymentsResponse } from "@/api/paymentsApi";
// Assuming useGetUsers is correctly defined and exported from bookingsApi or a dedicated usersApi
import { useGetBookings, useGetUsers, Booking, BookingsResponse, User } from "@/api/bookingsApi"; 
import { formatCurrency, formatDate } from "@/utils/formatters";
import { z } from "zod";
import { useForm, Controller, SubmitHandler, FieldValues } from "react-hook-form"; // Import FieldValues
import { zodResolver } from "@hookform/resolvers/zod";

// Define Zod schema for validation
const paymentSchemaBase = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  // Simplify amount handling: expect number, positive. Let RHF handle input conversion.
  amount: z.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be positive"),
  method: z.string().min(1, "Payment method is required"),
  paymentDate: z.date({ required_error: "Payment date is required" }),
  notes: z.string().optional(),
});

const hotelCollectSchema = paymentSchemaBase.extend({
  paymentType: z.literal("HOTEL_COLLECT"),
  collectedById: z.string().min(1, "Collector is required"),
  receivedFrom: z.string().optional(), // Not required for HOTEL_COLLECT
});

const otaCollectSchema = paymentSchemaBase.extend({
  paymentType: z.literal("OTA_COLLECT"),
  receivedFrom: z.string().min(1, "Received from is required"),
  collectedById: z.string().optional(), // Not required for OTA_COLLECT
});

// Discriminated union schema
const paymentSchema = z.discriminatedUnion("paymentType", [
  hotelCollectSchema,
  otaCollectSchema,
]);

type PaymentFormData = z.infer<typeof paymentSchema>;

// Define the type for the data sent to the mutation
interface PaymentMutationData extends Omit<PaymentFormData, 'paymentDate'> {
  paymentDate: string; // Expect ISO string for API
  tenantId?: string;
}

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentType: "HOTEL_COLLECT" | "OTA_COLLECT";
  editPayment?: Payment | null;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paymentType,
  editPayment,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define default values matching PaymentFormData structure
  const getDefaultValues = (payment?: Payment | null): Partial<PaymentFormData> => { // Use Partial for initial state
    if (payment) {
      return {
        paymentType: payment.paymentType || paymentType,
        bookingId: payment.booking?.bookingCode || "", // Or payment.bookingId if available
        amount: payment.amount || undefined, // Use undefined for number input
        method: payment.method || "",
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
        notes: payment.notes || "",
        collectedById: payment.collectedBy?.id || "",
        receivedFrom: payment.receivedFrom || "",
      };
    } else {
      return {
        paymentType: paymentType,
        bookingId: "",
        amount: undefined, // Use undefined for number input initial state
        method: "",
        paymentDate: new Date(),
        notes: "",
        collectedById: "",
        receivedFrom: "",
      };
    }
  };

  const { 
    handleSubmit, 
    control, 
    register, 
    reset, 
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema), // Zod handles the schema
    defaultValues: getDefaultValues(editPayment),
  });

  const watchedPaymentType = watch("paymentType");

  // Fetch bookings - Correctly handle the response structure
  const { data: bookingsResponse, isLoading: isLoadingBookings } = useGetBookings({ status: 'CONFIRMED', limit: 100 });
  const bookings: Booking[] = bookingsResponse?.data || [];

  // Fetch users (collectors) - Assuming useGetUsers hook exists and returns { data: User[] }
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers(); // Add params if needed
  const users: User[] = usersResponse?.data || [];

  // Correct the mutation function type
  const createPaymentMutation = useMutation<Payment, Error, PaymentMutationData>({
    mutationFn: createPayment, // createPayment should expect PaymentMutationData
    onSuccess: () => {
      toast({ title: "Payment Created", variant: "success" });
      onSuccess();
      reset(getDefaultValues(null)); // Reset form on success with default empty values
    },
    onError: (error: any) => {
      toast({ title: "Error Creating Payment", description: error.message, variant: "destructive" });
    },
  });

  // Add mutation for updating payment if needed
  // const updatePaymentMutation = useMutation(...);

  // Correct the type for the onSubmit handler
  const onSubmit: SubmitHandler<PaymentFormData> = (data) => {
    // Ensure amount is a number before submission if needed, though Zod should handle it
    const submissionData: PaymentMutationData = {
      ...data,
      amount: Number(data.amount), // Explicitly ensure amount is number
      paymentDate: data.paymentDate.toISOString(), // Convert Date to ISO string here
      tenantId: user?.tenantId,
    };
    console.log("Submitting data:", submissionData);
    // if (editPayment) {
    //   updatePaymentMutation.mutate({ ...submissionData, id: editPayment.id });
    // } else {
      createPaymentMutation.mutate(submissionData);
    // }
  };

  useEffect(() => {
    // Reset form when modal opens or editPayment changes
    reset(getDefaultValues(editPayment));
  }, [editPayment, reset, isOpen]); // Depend on isOpen to reset when modal opens

  const paymentMethods = ["CASH", "BANK_TRANSFER", "MOMO", "9PAY", "ONEPAY", "OTA_TRANSFER", "BANK_PERSONAL"];

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editPayment ? "Edit Payment" : "Create New Payment"}</DialogTitle>
        </DialogHeader>
        {/* Use the form element with the correct onSubmit handler */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Booking */}
          <div className="space-y-1">
            <Label htmlFor="bookingId">Booking</Label>
            <Controller
              name="bookingId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="bookingId">
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBookings ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      bookings.map((booking) => (
                        // Use booking.id if it's the actual ID, or bookingCode if that's expected
                        <SelectItem key={booking.id} value={booking.id}> 
                          {booking.bookingCode} - {booking.guestName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bookingId && <p className="text-sm text-red-600">{errors.bookingId.message}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input 
                  id="amount" 
                  type="number" 
                  step="any" 
                  placeholder="Enter amount"
                  {...field}
                  // RHF handles valueAsNumber, Zod preprocess might be redundant now
                  onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                  value={field.value ?? ''} // Handle undefined for empty input
                />
              )}
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          {/* Method */}
          <div className="space-y-1">
            <Label htmlFor="method">Payment Method</Label>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>{method.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.method && <p className="text-sm text-red-600">{errors.method.message}</p>}
          </div>

          {/* Payment Date */}
          <div className="space-y-1">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <DatePicker 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
            {errors.paymentDate && <p className="text-sm text-red-600">{errors.paymentDate.message}</p>}
          </div>

          {/* Conditional Fields based on paymentType */}
          {watchedPaymentType === "HOTEL_COLLECT" && (
            <div className="space-y-1">
              <Label htmlFor="collectedById">Collected By</Label>
              <Controller
                name="collectedById"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="collectedById">
                      <SelectValue placeholder="Select collector" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {/* Ensure error message is displayed correctly for optional fields in union */}
              {errors.collectedById && <p className="text-sm text-red-600">{errors.collectedById.message}</p>}
            </div>
          )}

          {watchedPaymentType === "OTA_COLLECT" && (
            <div className="space-y-1">
              <Label htmlFor="receivedFrom">Received From (OTA)</Label>
              <Input 
                id="receivedFrom" 
                {...register("receivedFrom")} 
                placeholder="e.g., Booking.com, Agoda"
              />
              {/* Ensure error message is displayed correctly for optional fields in union */}
              {errors.receivedFrom && <p className="text-sm text-red-600">{errors.receivedFrom.message}</p>}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              {...register("notes")} 
              placeholder="Add any relevant notes"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || createPaymentMutation.isPending}>
              {isSubmitting || createPaymentMutation.isPending ? "Saving..." : editPayment ? "Update Payment" : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFormModal;

