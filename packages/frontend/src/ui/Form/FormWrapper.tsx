import React, { useEffect, useRef } from 'react';
import { useForm, FormProvider, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Spinner from "../Loading/Spinner";

interface FormWrapperProps<T extends FieldValues> {
  onSubmit: (data: T) => void | Promise<void>;
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode);
  isLoading?: boolean;
  resetOnSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

export function FormWrapper<T extends FieldValues>({
  onSubmit,
  schema,
  defaultValues,
  children,
  isLoading = false,
  resetOnSuccess = false,
  successMessage,
  errorMessage,
  className = '',
}: FormWrapperProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const formRef = useRef<HTMLFormElement>(null);

  // Auto-scroll to first error
  useEffect(() => {
    if (Object.keys(errors).length > 0 && formRef.current) {
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorElement = formRef.current.querySelector(
        `[name="${firstErrorKey}"]`
      );

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        (firstErrorElement as HTMLElement).focus();
      }
    }
  }, [errors]);

  // Reset form after successful submission if resetOnSuccess is true
  useEffect(() => {
    if (isSubmitSuccessful && resetOnSuccess) {
      reset();
    }
  }, [isSubmitSuccessful, reset, resetOnSuccess]);

  const handleFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      if (successMessage) {
        // Here you would use your toast notification
        console.log(successMessage);
      }
    } catch (error) {
      if (errorMessage) {
        // Here you would use your toast notification
        console.error(errorMessage);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        onSubmit={handleSubmit(handleFormSubmit)}
        className={`space-y-4 ${className}`}
        noValidate
      >
        {typeof children === 'function' ? children(methods) : children}

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-error-light text-error rounded-md">
            <p className="font-medium">Please fix the following errors:</p>
            <ul className="list-disc list-inside mt-1">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>{error?.message as string}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading indicator */}
        {(isSubmitting || isLoading) && (
          <div className="flex justify-center">
            <Spinner size="md" />
          </div>
        )}
      </form>
    </FormProvider>
  );
}
