import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InvoiceListPage from '../InvoiceListPage';
import InvoiceDetailPage from '../InvoiceDetailPage';
import { AuthProvider } from '../../hooks/useAuth'; // Assuming AuthProvider exists
import { Toaster } from '@/ui/Toaster'; // Assuming Toaster exists

// Mock APIs
jest.mock('../../api/invoicesApi', () => ({
  getInvoices: jest.fn(),
  getInvoiceById: jest.fn(),
  createInvoice: jest.fn(),
  updateInvoiceStatus: jest.fn(),
}));
jest.mock('../../api/paymentsApi', () => ({
  getPayments: jest.fn(),
}));

const queryClient = new QueryClient();

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Mock user context if needed
  const mockUser = { id: 'user1', tenantId: 'tenant1', role: 'ADMIN' }; 
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider value={{ user: mockUser, login: jest.fn(), logout: jest.fn() }}>
        <MemoryRouter initialEntries={['/invoices']}>
          {children}
          <Toaster />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Invoice Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Provide default mock implementations
    require('../../api/invoicesApi').getInvoices.mockResolvedValue([]);
    require('../../api/paymentsApi').getPayments.mockResolvedValue([]);
  });

  test('InvoiceListPage renders correctly and fetches invoices', async () => {
    require('../../api/invoicesApi').getInvoices.mockResolvedValueOnce([
      { id: 'inv1', invoiceNumber: 'INV-001', createdAt: new Date(), status: 'DRAFT', totalAmount: 100 },
    ]);
    render(
      <AllTheProviders>
        <Routes>
          <Route path="/invoices" element={<InvoiceListPage />} />
        </Routes>
      </AllTheProviders>
    );
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument());
    expect(require('../../api/invoicesApi').getInvoices).toHaveBeenCalledTimes(1);
  });

  test('InvoiceListPage filters work correctly', async () => {
    render(
      <AllTheProviders>
        <Routes>
          <Route path="/invoices" element={<InvoiceListPage />} />
        </Routes>
      </AllTheProviders>
    );
    fireEvent.click(screen.getByText('Filters'));
    fireEvent.change(screen.getByLabelText('OTA/Source'), { target: { value: 'Booking.com' } });
    // Add more filter interactions and assertions
    await waitFor(() => expect(require('../../api/invoicesApi').getInvoices).toHaveBeenCalledTimes(2)); // Initial + filter change
    expect(require('../../api/invoicesApi').getInvoices).toHaveBeenCalledWith(expect.objectContaining({ ota: 'Booking.com' }));
  });

  test('InvoiceListPage opens Create Invoice modal', () => {
    render(
      <AllTheProviders>
        <Routes>
          <Route path="/invoices" element={<InvoiceListPage />} />
        </Routes>
      </AllTheProviders>
    );
    fireEvent.click(screen.getByText('Create Invoice'));
    expect(screen.getByText('Select paid OTA Collect payments')).toBeInTheDocument();
  });

  test('InvoiceCreateModal fetches eligible payments and allows selection', async () => {
    require('../../api/paymentsApi').getPayments.mockResolvedValueOnce([
      { id: 'p1', booking: { bookingCode: 'BK001' }, paymentDate: new Date(), receivedFrom: 'Agoda', amount: 50 },
      { id: 'p2', booking: { bookingCode: 'BK002' }, paymentDate: new Date(), receivedFrom: 'Expedia', amount: 75 },
    ]);
    render(
      <AllTheProviders>
        <Routes>
          <Route path="/invoices" element={<InvoiceListPage />} />
        </Routes>
      </AllTheProviders>
    );
    fireEvent.click(screen.getByText('Create Invoice'));
    await waitFor(() => expect(screen.getByText('BK001')).toBeInTheDocument());
    expect(require('../../api/paymentsApi').getPayments).toHaveBeenCalledWith({ paymentType: 'OTA_COLLECT', status: 'PAID' });
    fireEvent.click(screen.getByLabelText('Select all'));
    expect(screen.getByText(/Total:.*125/)).toBeInTheDocument(); // Check total calculation
  });

  test('InvoiceCreateModal creates invoice successfully', async () => {
    require('../../api/paymentsApi').getPayments.mockResolvedValueOnce([
      { id: 'p1', booking: { bookingCode: 'BK001' }, paymentDate: new Date(), receivedFrom: 'Agoda', amount: 50 },
    ]);
    require('../../api/invoicesApi').createInvoice.mockResolvedValueOnce({ id: 'newInv', status: 'DRAFT' });
    render(
      <AllTheProviders>
        <Routes>
          <Route path="/invoices" element={<InvoiceListPage />} />
        </Routes>
      </AllTheProviders>
    );
    fireEvent.click(screen.getByText('Create Invoice'));
    await waitFor(() => expect(screen.getByText('BK001')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/select-payment-p1/));
    fireEvent.click(screen.getByText('Create Invoice'));
    await waitFor(() => expect(require('../../api/invoicesApi').createInvoice).toHaveBeenCalledWith(['p1']));
    // Check for success toast or modal close
  });

  test('InvoiceDetailPage renders correctly and fetches details', async () => {
    const mockInvoice = {
      id: 'inv1', invoiceNumber: 'INV-001', createdAt: new Date(), status: 'DRAFT', totalAmount: 100,
      payments: [{ id: 'p1', booking: { bookingCode: 'BK001' }, paymentDate: new Date(), method: 'OTA_TRANSFER', receivedFrom: 'Agoda', amount: 100 }]
    };
    require('../../api/invoicesApi').getInvoiceById.mockResolvedValueOnce(mockInvoice);
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider value={{ user: { role: 'ADMIN' }, login: jest.fn(), logout: jest.fn() }}>
          <MemoryRouter initialEntries={['/invoices/inv1']}>
            <Routes>
              <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getByText('Invoice Details')).toBeInTheDocument());
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('BK001')).toBeInTheDocument();
    expect(require('../../api/invoicesApi').getInvoiceById).toHaveBeenCalledWith('inv1');
  });

  test('InvoiceDetailPage allows status update', async () => {
    const mockInvoice = { id: 'inv1', status: 'DRAFT', totalAmount: 100, payments: [] };
    require('../../api/invoicesApi').getInvoiceById.mockResolvedValueOnce(mockInvoice);
    require('../../api/invoicesApi').updateInvoiceStatus.mockResolvedValueOnce({ ...mockInvoice, status: 'SENT' });
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider value={{ user: { role: 'ADMIN' }, login: jest.fn(), logout: jest.fn() }}>
          <MemoryRouter initialEntries={['/invoices/inv1']}>
            <Routes>
              <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getByText('Mark as Sent')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Mark as Sent'));
    await waitFor(() => expect(require('../../api/invoicesApi').updateInvoiceStatus).toHaveBeenCalledWith('inv1', 'SENT'));
    // Check for success toast
  });

  // Add more tests for error states, empty states, permissions, etc.
});
