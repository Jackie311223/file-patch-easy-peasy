import React, { useState, useEffect, useCallback } from "react"; // Đã thêm useCallback, useEffect
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/Dialog";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Label } from "@/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/Select";
import DatePicker from "@/ui/DatePicker"; 
import { Textarea } from "@/ui/Textarea";
import { useToast } from "@/hooks/useToast"; 
import { useAuth } from "@/hooks/useAuth";
import { createPayment, updatePayment, Payment, CreatePaymentPayload, UpdatePaymentPayload } from "@/api/paymentsApi"; 
import { useGetBookings, useGetUsers, Booking, User } from "@/api/bookingsApi"; 
import { z } from "zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form"; 
import { zodResolver } from "@hookform/resolvers/zod";

// Define Zod schema for validation
const paymentSchemaBase = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  // Sửa schema cho amount để xử lý tốt hơn với react-hook-form và zodResolver
  amount: z.coerce // Bắt đầu bằng coerce để Zod tự động chuyển đổi giá trị đầu vào
    .number({ invalid_type_error: "Amount must be a valid number" })
    .positive({ message: "Amount must be positive" })
    .optional(), // Cho phép trường này rỗng ban đầu, validation cuối cùng sẽ ở .refine
  method: z.string().min(1, "Payment method is required"),
  paymentDate: z.date({ required_error: "Payment date is required" }),
  notes: z.string().optional(),
});

const hotelCollectSchema = paymentSchemaBase.extend({
  paymentType: z.literal("HOTEL_COLLECT"),
  collectedById: z.string({required_error: "Collector is required"}).min(1, "Collector is required"),
  receivedFrom: z.string().optional(), 
});

const otaCollectSchema = paymentSchemaBase.extend({
  paymentType: z.literal("OTA_COLLECT"),
  receivedFrom: z.string({required_error: "Received from is required"}).min(1, "Received from is required"),
  collectedById: z.string().optional(),
});

const paymentSchema = z.discriminatedUnion("paymentType", [
  hotelCollectSchema,
  otaCollectSchema,
]).refine(data => data.amount !== undefined && data.amount > 0, {
    message: "Amount is required and must be positive for submission.",
    path: ["amount"], 
});

type PaymentFormData = z.infer<typeof paymentSchema>;

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
  paymentType: initialPaymentType, 
  editPayment,
}) => {
  const { user } = useAuth();
  // Sửa: Giả sử useToast trả về { toast: (props: ToastProps) => void; }
  const { toast } = useToast(); 
  const queryClient = useQueryClient();

  const isEditMode = !!editPayment && !!editPayment.id;

  const getDefaultValues = useCallback((paymentToEdit?: Payment | null): PaymentFormData => {
    const typeToUse = paymentToEdit?.paymentType || initialPaymentType;
    let defaultValues: PaymentFormData;

    if (typeToUse === "HOTEL_COLLECT") {
      defaultValues = {
        paymentType: "HOTEL_COLLECT",
        bookingId: paymentToEdit?.booking?.id || "",
        amount: paymentToEdit?.amount ?? undefined, 
        method: paymentToEdit?.method || "",
        paymentDate: paymentToEdit?.paymentDate ? new Date(paymentToEdit.paymentDate) : new Date(),
        notes: paymentToEdit?.notes || "",
        collectedById: paymentToEdit?.collectedBy?.id || user?.id || "", 
        receivedFrom: paymentToEdit?.receivedFrom || undefined,
      };
    } else { // OTA_COLLECT
      defaultValues = {
        paymentType: "OTA_COLLECT",
        bookingId: paymentToEdit?.booking?.id || "",
        amount: paymentToEdit?.amount ?? undefined,
        method: paymentToEdit?.method || "",
        paymentDate: paymentToEdit?.paymentDate ? new Date(paymentToEdit.paymentDate) : new Date(),
        notes: paymentToEdit?.notes || "",
        receivedFrom: paymentToEdit?.receivedFrom || "", 
        collectedById: paymentToEdit?.collectedBy?.id || undefined,
      };
    }
    return defaultValues;
  }, [initialPaymentType, user?.id]);
  
  const { 
    handleSubmit, 
    control, 
    register, 
    reset, 
    watch,
    setValue, 
    getValues, // Thêm getValues
    formState: { errors, isSubmitting }
  } = useForm<PaymentFormData>({ 
    resolver: zodResolver(paymentSchema), 
    defaultValues: getDefaultValues(editPayment),
    mode: 'onChange', 
  });

  const watchedPaymentType = watch("paymentType");

  useEffect(() => {
    if (isOpen) { 
        const defaultVals = getDefaultValues(editPayment);
        reset(defaultVals);
    }
  }, [editPayment, isOpen, reset, getDefaultValues]); 

  useEffect(() => {
    if (isOpen) { 
        if (watchedPaymentType === 'HOTEL_COLLECT') {
            setValue('receivedFrom', undefined, { shouldValidate: false }); 
            if (!isEditMode && user?.id && getValues('collectedById') === undefined) { 
                setValue('collectedById', user.id, { shouldValidate: true });
            }
        } else if (watchedPaymentType === 'OTA_COLLECT') {
            setValue('collectedById', undefined, { shouldValidate: false }); 
        }
    }
  }, [watchedPaymentType, setValue, isOpen, isEditMode, user?.id, getValues, reset]);


  const { data: bookingsResponse, isLoading: isLoadingBookings } = useGetBookings({ status: 'CONFIRMED', limit: 1000 }); 
  const bookings: Booking[] = bookingsResponse?.data || [];

  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers({ limit: 100 }); 
  const users: User[] = usersResponse?.data || [];

  const mutationOptions = {
    onSuccess: () => {
      // Sửa: toast nhận một object props, sử dụng 'description' và 'variant' (nếu ToastProps định nghĩa vậy)
      toast({ 
        title: isEditMode ? "Payment Updated" : "Payment Created", 
        description: "Operation successful.", 
        variant: "success" 
      });
      queryClient.invalidateQueries({ queryKey: ['payments'] }); 
      onSuccess();
      onClose(); 
    },
    onError: (error: any) => {
      toast({ 
        title: `Error ${isEditMode ? "Updating" : "Creating"} Payment`, 
        description: error.message || "An unexpected error occurred.", 
        variant: "destructive" 
      });
    },
  };

  const createPaymentMutation = useMutation<Payment, Error, CreatePaymentPayload>({
    mutationFn: createPayment,
    ...mutationOptions,
  });
  
  const updatePaymentMutation = useMutation<Payment, Error, { id: string; data: UpdatePaymentPayload } >({
    mutationFn: (vars) => updatePayment(vars.id, vars.data), 
    ...mutationOptions,
  });

  const onSubmitHandler: SubmitHandler<PaymentFormData> = (data) => { 
    // Zod refine đã đảm bảo amount là number > 0 nếu form hợp lệ và được submit
    // Tuy nhiên, data.amount vẫn có thể là undefined ở đây nếu refine không chạy hoặc optional không được xử lý đúng
    // Nên thêm một check nữa hoặc đảm bảo refine của Zod hoạt động như mong đợi
    if (typeof data.amount !== 'number' || data.amount <= 0) { 
        toast({title: "Validation Error", description: "Amount is required and must be positive.", variant: "destructive"});
        return;
    }

    const baseData = {
      bookingId: data.bookingId,
      amount: data.amount, 
      method: data.method,
      paymentDate: data.paymentDate.toISOString().split('T')[0], 
      notes: data.notes,
      paymentType: data.paymentType,
      tenantId: user?.tenantId,
      collectedById: data.paymentType === "HOTEL_COLLECT" ? data.collectedById : undefined,
      receivedFrom: data.paymentType === "OTA_COLLECT" ? data.receivedFrom : undefined,
    };
    
    if (isEditMode && editPayment?.id) {
      updatePaymentMutation.mutate({ 
        id: editPayment.id, 
        data: baseData as UpdatePaymentPayload 
      });
    } else {
      createPaymentMutation.mutate(baseData as CreatePaymentPayload); 
    }
  };
 
  const currentMutation = isEditMode ? updatePaymentMutation : createPaymentMutation;
  const paymentMethods = ["CASH", "BANK_TRANSFER", "MOMO", "9PAY", "ONEPAY", "OTA_TRANSFER", "BANK_PERSONAL"]; 

  return (
    <Dialog open={isOpen} onOpenChange={(openValue) => !openValue && onClose()}> 
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Payment" : "Create New Payment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4 py-4">
          <input type="hidden" {...register("paymentType")} />

          <div className="space-y-1">
            <Label htmlFor="bookingId">Booking</Label>
            <Controller
              name="bookingId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""} >
                  <SelectTrigger id="bookingId" className={errors.bookingId ? "border-red-500" : ""} disabled={isEditMode}>
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBookings ? (
                      <SelectItem value="loading" disabled>Loading bookings...</SelectItem>
                    ) : (
                      bookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}> 
                          {booking.guestName} (Code: {booking.id.substring(0,8)}...)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bookingId && <p className="text-xs text-red-500 mt-1">{errors.bookingId.message}</p>}
          </div>

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
                  className={errors.amount ? "border-red-500" : ""}
                  {...field}
                  onChange={event => field.onChange(event.target.value === '' ? undefined : parseFloat(event.target.value))}
                  value={field.value === undefined ? '' : String(field.value)} 
                />
              )}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="method">Payment Method</Label>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger id="method" className={errors.method ? "border-red-500" : ""}>
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
            {errors.method && <p className="text-xs text-red-500 mt-1">{errors.method.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <DatePicker 
                  value={field.value} 
                  onChange={field.onChange} 
                  className={errors.paymentDate ? "!border-red-500" : ""} 
                />
              )}
            />
            {errors.paymentDate && <p className="text-xs text-red-500 mt-1">{errors.paymentDate.message}</p>}
          </div>

          {watchedPaymentType === "HOTEL_COLLECT" && (
            <div className="space-y-1">
              <Label htmlFor="collectedById">Collected By</Label>
              <Controller
                name="collectedById"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="collectedById" className={errors.collectedById ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select collector" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>Loading users...</SelectItem>
                      ) : (
                        users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem> 
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.collectedById && <p className="text-xs text-red-500 mt-1">{errors.collectedById.message}</p>}
            </div>
          )}

          {watchedPaymentType === "OTA_COLLECT" && (
            <div className="space-y-1">
              <Label htmlFor="receivedFrom">Received From (OTA)</Label>
              <Input 
                id="receivedFrom" 
                {...register("receivedFrom")} 
                placeholder="e.g., Booking.com, Agoda"
                className={errors.receivedFrom ? "border-red-500" : ""}
              />
              {errors.receivedFrom && <p className="text-xs text-red-500 mt-1">{errors.receivedFrom.message}</p>}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              {...register("notes")} 
              placeholder="Add any relevant notes"
              className="min-h-[80px]" 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={currentMutation.isPending || isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={currentMutation.isPending || isSubmitting || (isEditMode && !updatePaymentMutation.mutate)}>
              {currentMutation.isPending ? "Saving..." : isEditMode ? "Update Payment" : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentFormModal;