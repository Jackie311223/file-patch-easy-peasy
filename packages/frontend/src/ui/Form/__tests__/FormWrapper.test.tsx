import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestProviders } from '../../utils/testUtils';
import { FormWrapper } from '@/ui/Form/FormWrapper';
import { z } from 'zod';

// Test schema
const testSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

type TestFormData = z.infer<typeof testSchema>;

describe('FormWrapper Component', () => {
  test('renders form with children', () => {
    render(
      <TestProviders>
        <FormWrapper<TestFormData>
          onSubmit={jest.fn()}
          schema={testSchema}
          defaultValues={{ name: '', email: '' }}
        >
          {({ register }) => (
            <>
              <input {...register('name')} placeholder="Name" />
              <input {...register('email')} placeholder="Email" />
              <button type="submit">Submit</button>
            </>
          )}
        </FormWrapper>
      </TestProviders>
    );

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(
      <TestProviders>
        <FormWrapper<TestFormData>
          onSubmit={jest.fn()}
          schema={testSchema}
          defaultValues={{ name: '', email: '' }}
        >
          {({ register }) => (
            <>
              <input {...register('name')} placeholder="Name" />
              <input {...register('email')} placeholder="Email" />
              <button type="submit">Submit</button>
            </>
          )}
        </FormWrapper>
      </TestProviders>
    );

    // Submit with empty fields
    fireEvent.click(screen.getByText('Submit'));

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  test('calls onSubmit with valid data', async () => {
    const onSubmitMock = jest.fn();
    
    render(
      <TestProviders>
        <FormWrapper<TestFormData>
          onSubmit={onSubmitMock}
          schema={testSchema}
          defaultValues={{ name: '', email: '' }}
        >
          {({ register }) => (
            <>
              <input {...register('name')} placeholder="Name" />
              <input {...register('email')} placeholder="Email" />
              <button type="submit">Submit</button>
            </>
          )}
        </FormWrapper>
      </TestProviders>
    );

    // Fill in valid data
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'john@example.com' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Submit'));

    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });

  test('shows loading state during submission', async () => {
    // Create a mock that returns a promise that doesn't resolve immediately
    const onSubmitMock = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(resolve, 100);
      });
    });
    
    render(
      <TestProviders>
        <FormWrapper<TestFormData>
          onSubmit={onSubmitMock}
          schema={testSchema}
          defaultValues={{ name: 'John Doe', email: 'john@example.com' }}
        >
          {({ register }) => (
            <>
              <input {...register('name')} placeholder="Name" />
              <input {...register('email')} placeholder="Email" />
              <button type="submit">Submit</button>
            </>
          )}
        </FormWrapper>
      </TestProviders>
    );

    // Submit form
    fireEvent.click(screen.getByText('Submit'));

    // Check for loading indicator
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
