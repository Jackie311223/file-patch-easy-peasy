import React, { useRef, useEffect } from 'react';
import { useForm, FormProvider, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Sửa import Spinner thành LoadingSpinner (named import) và sử dụng path alias
import { LoadingSpinner } from '@/ui/Loading/Spinner'; 
// import { useToast } from '@/hooks/useToast'; // Bỏ comment nếu bạn muốn tích hợp toast

interface FormWrapperProps<T extends FieldValues> {
  onSubmit: (data: T) => void | Promise<void>;
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode);
  isLoading?: boolean; // Prop để truyền trạng thái loading từ bên ngoài (ví dụ: khi submit API)
  resetOnSuccess?: boolean;
  successMessage?: string; // Message cho toast khi thành công
  errorMessage?: string;   // Message cho toast khi thất bại (chung)
  className?: string;
  submitButton?: React.ReactNode; // Cho phép truyền nút submit từ bên ngoài
  id?: string; // Thêm id cho form nếu cần
}

export function FormWrapper<T extends FieldValues>({
  onSubmit,
  schema,
  defaultValues,
  children,
  isLoading = false, // Sử dụng prop isLoading này
  resetOnSuccess = false,
  successMessage,
  errorMessage,
  className = '',
  submitButton, // Sử dụng prop submitButton
  id,
}: FormWrapperProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {} as DefaultValues<T>, // Đảm bảo defaultValues không undefined
    mode: 'onSubmit', // Hoặc 'onChange' nếu muốn validate sớm hơn
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful, dirtyFields }, // Theo dõi dirtyFields để reset có điều kiện
  } = methods;

  const formRef = useRef<HTMLFormElement>(null);
  // const { toast } = useToast(); // Bỏ comment nếu muốn tích hợp toast

  // Auto-scroll to first error
  useEffect(() => {
    if (Object.keys(errors).length > 0 && formRef.current) {
      const firstErrorKey = Object.keys(errors)[0] as keyof T; // Ép kiểu để truy cập an toàn
      // Cố gắng tìm element bằng data-name hoặc name
      const firstErrorElement = formRef.current.querySelector<HTMLElement>(
        `[name="${String(firstErrorKey)}"], [data-name="${String(firstErrorKey)}"]`
      );

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        // Không nên tự động focus vì có thể gây khó chịu, trừ khi có yêu cầu cụ thể
        // (firstErrorElement as HTMLElement).focus({ preventScroll: true }); 
      }
    }
  }, [errors]);

  // Reset form after successful submission
  useEffect(() => {
    // Chỉ reset nếu isSubmitSuccessful, resetOnSuccess là true và có defaultValues (để reset về trạng thái ban đầu)
    if (isSubmitSuccessful && resetOnSuccess && defaultValues) {
      reset(defaultValues); 
    } else if (isSubmitSuccessful && resetOnSuccess) {
      reset(); // Reset về rỗng nếu không có defaultValues
    }
  }, [isSubmitSuccessful, reset, resetOnSuccess, defaultValues]);

  const handleFormSubmitWrapper = async (data: T) => {
    try {
      await onSubmit(data);
      if (successMessage) {
        // toast({ title: 'Success', description: successMessage, variant: 'success' });
        console.log('Form Success:', successMessage); // Placeholder cho toast
      }
    } catch (error: any) {
      console.error('Form Submission Error:', error);
      const messageToDisplay = errorMessage || error?.message || 'An unexpected error occurred.';
      // toast({ title: 'Error', description: messageToDisplay, variant: 'destructive' });
      console.error('Form Error:', messageToDisplay); // Placeholder cho toast
      
      // Nếu API trả về lỗi validation dạng { field: 'message' }
      // bạn có thể dùng setError của react-hook-form ở đây
      // Ví dụ:
      // if (error.response?.data?.errors) {
      //   Object.entries(error.response.data.errors).forEach(([key, value]) => {
      //     methods.setError(key as any, { type: 'manual', message: value as string });
      //   });
      // }
    }
  };
  
  const actualIsLoading = isSubmitting || isLoading;

  return (
    <FormProvider {...methods}>
      <form
        id={id}
        ref={formRef}
        onSubmit={handleSubmit(handleFormSubmitWrapper)}
        className={`space-y-6 ${className}`} // Tăng space-y
        noValidate
      >
        {typeof children === 'function' ? children(methods) : children}

        {/* Error summary (hiển thị lỗi tổng quan nếu có) */}
        {Object.keys(errors).length > 0 && (
          <div className="p-3 my-4 bg-red-100 text-red-700 border border-red-300 rounded-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
            <p className="font-medium text-sm">Please correct the errors below:</p>
            {/* // Chi tiết lỗi có thể hiển thị gần từng input field thay vì ở đây
            <ul className="list-disc list-inside mt-1 text-xs">
              {Object.entries(errors).map(([key, error]) => (
                error?.message && <li key={key}>{error.message as string}</li>
              ))}
            </ul> 
            */}
          </div>
        )}
        
        {/* Nút submit có thể được truyền từ ngoài vào, hoặc là một phần của children */}
        {submitButton && (
            <div className="pt-2"> {/* Thêm khoảng cách cho nút submit */}
                {React.cloneElement(submitButton as React.ReactElement<any>, { disabled: actualIsLoading })}
            </div>
        )}


        {/* Loading indicator (chỉ hiển thị khi đang submitting/loading và không có nút submit riêng) */}
        {actualIsLoading && !submitButton && (
          <div className="flex justify-center pt-2">
            <LoadingSpinner size="md" /> {/* Sử dụng LoadingSpinner */}
          </div>
        )}
      </form>
    </FormProvider>
  );
}