# Tài liệu hướng dẫn UI/UX PMS Roomrise

## Giới thiệu

Tài liệu này mô tả chi tiết về hệ thống UI/UX mới của PMS Roomrise đã được nâng cấp lên chuẩn SaaS thương mại cao cấp. Hệ thống mới cung cấp trải nghiệm người dùng nhất quán, hiệu suất cao và khả năng tùy biến theo tenant.

## Kiến trúc tổng quan

Hệ thống UI/UX mới được xây dựng dựa trên kiến trúc component-based với các lớp sau:

1. **Design Tokens**: Các biến thiết kế cơ bản (màu sắc, kích thước, font, spacing)
2. **Theme System**: Hệ thống chủ đề hỗ trợ light/dark mode và tùy biến theo tenant
3. **Core Components**: Các component cơ bản tái sử dụng (Button, Input, Card...)
4. **Composite Components**: Các component phức tạp kết hợp từ core components
5. **Layout Components**: Các component bố cục (Grid, Flex, Container...)
6. **Page Templates**: Các mẫu trang được chuẩn hóa
7. **Context Providers**: Các provider cung cấp state và behavior xuyên suốt ứng dụng

## Các Provider chính

### 1. ThemeProvider

Quản lý theme của ứng dụng (light/dark/system) và lưu trữ preference của người dùng.

```tsx
// Sử dụng ThemeProvider
import { ThemeProvider } from '../theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      {/* App content */}
    </ThemeProvider>
  );
}

// Sử dụng hook
import { useTheme } from '../theme/ThemeProvider';

function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();
  
  return (
    <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### 2. TenantThemeProvider

Quản lý theme riêng cho từng tenant (màu sắc thương hiệu, logo, font).

```tsx
// Sử dụng TenantThemeProvider
import { TenantThemeProvider } from '../theme/TenantThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <TenantThemeProvider>
        {/* App content */}
      </TenantThemeProvider>
    </ThemeProvider>
  );
}

// Sử dụng hook
import { useTenantTheme } from '../theme/TenantThemeProvider';

function BrandedHeader() {
  const { tenantTheme } = useTenantTheme();
  
  return (
    <header style={{ backgroundColor: tenantTheme.primaryColor }}>
      <img src={tenantTheme.logoUrl} alt="Logo" />
    </header>
  );
}
```

### 3. ToastProvider

Hệ thống thông báo toast với các loại: success, error, warning, info.

```tsx
// Sử dụng ToastProvider
import { ToastProvider } from '../ui/Toast/ToastProvider';

function App() {
  return (
    <ToastProvider>
      {/* App content */}
    </ToastProvider>
  );
}

// Sử dụng hook
import { useToast } from '../ui/Toast/ToastProvider';

function SaveButton() {
  const { toast } = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      toast('Đã lưu thành công', { type: 'success' });
    } catch (error) {
      toast('Lỗi khi lưu dữ liệu', { type: 'error' });
    }
  };
  
  return <button onClick={handleSave}>Lưu</button>;
}
```

### 4. LoadingProvider

Quản lý trạng thái loading toàn cục và theo từng phần.

```tsx
// Sử dụng LoadingProvider
import { LoadingProvider } from '../ui/Loading/LoadingProvider';

function App() {
  return (
    <LoadingProvider>
      {/* App content */}
    </LoadingProvider>
  );
}

// Sử dụng hook
import { useLoading } from '../ui/Loading/LoadingProvider';

function DataTable() {
  const { isLoading, startLoading, stopLoading } = useLoading();
  
  const fetchData = async () => {
    startLoading();
    try {
      // Fetch data
    } finally {
      stopLoading();
    }
  };
  
  return (
    <div>
      {isLoading ? <Spinner /> : <Table data={data} />}
    </div>
  );
}
```

### 5. OnboardingProvider

Hệ thống hướng dẫn người dùng mới với các tour step-by-step.

```tsx
// Sử dụng OnboardingProvider
import { OnboardingProvider } from '../ui/Onboarding/OnboardingProvider';

const tours = {
  welcome: [
    {
      target: '.sidebar',
      content: 'Đây là menu chính để truy cập tất cả tính năng.',
    },
    // More steps...
  ],
};

function App() {
  return (
    <OnboardingProvider tours={tours}>
      {/* App content */}
    </OnboardingProvider>
  );
}

// Sử dụng hook
import { useOnboarding } from '../ui/Onboarding/OnboardingProvider';

function WelcomePage() {
  const { startTour } = useOnboarding();
  
  return (
    <button onClick={() => startTour('welcome')}>
      Bắt đầu hướng dẫn
    </button>
  );
}
```

## Components UI cơ bản

### 1. ModalBase

Modal chuẩn cho toàn hệ thống với các tính năng: đóng khi click outside, đóng khi nhấn ESC, auto-focus vào phần tử đầu tiên.

```tsx
import { ModalBase } from '../ui/Modal/ModalBase';

function ExampleModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Mở modal</button>
      
      <ModalBase
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Tiêu đề modal"
        size="md" // 'sm', 'md', 'lg', 'xl', 'full'
        footer={
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsOpen(false)}>Hủy</button>
            <button>Lưu</button>
          </div>
        }
      >
        <p>Nội dung modal</p>
      </ModalBase>
    </>
  );
}
```

### 2. FormWrapper

Component quản lý form với validation, loading state, và error handling.

```tsx
import { FormWrapper } from '../ui/Form/FormWrapper';
import { z } from 'zod';

// Define schema
const schema = z.object({
  name: z.string().min(3, 'Tên phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
});

type FormData = z.infer<typeof schema>;

function ExampleForm() {
  const handleSubmit = async (data: FormData) => {
    // Submit data
  };
  
  return (
    <FormWrapper<FormData>
      onSubmit={handleSubmit}
      schema={schema}
      defaultValues={{ name: '', email: '' }}
      isLoading={false}
      resetOnSuccess={true}
    >
      {({ register, formState: { errors } }) => (
        <>
          <div>
            <label>Tên</label>
            <input {...register('name')} />
            {errors.name && <p>{errors.name.message}</p>}
          </div>
          
          <div>
            <label>Email</label>
            <input {...register('email')} />
            {errors.email && <p>{errors.email.message}</p>}
          </div>
          
          <button type="submit">Gửi</button>
        </>
      )}
    </FormWrapper>
  );
}
```

### 3. EmptyState

Component hiển thị trạng thái trống với tiêu đề, mô tả và action.

```tsx
import { EmptyState } from '../ui/EmptyState/EmptyState';
import { PlusIcon } from '@heroicons/react/24/outline';

function BookingsList() {
  const bookings = [];
  
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="Chưa có booking nào"
        description="Bắt đầu bằng cách tạo booking đầu tiên của bạn."
        icon={<PlusIcon className="h-12 w-12 text-gray-400" />}
        action={{
          label: 'Tạo booking',
          onClick: () => { /* Open create booking modal */ },
        }}
      />
    );
  }
  
  return <BookingsTable bookings={bookings} />;
}
```

### 4. ErrorBoundary

Component bắt lỗi và hiển thị fallback UI khi có lỗi xảy ra.

```tsx
import { ErrorBoundary } from '../ui/ErrorBoundary/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 text-red-700">
          <h2>Đã xảy ra lỗi</h2>
          <button onClick={() => window.location.reload()}>Tải lại trang</button>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log error to service
        console.error(error, errorInfo);
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Tối ưu hiệu năng

### 1. Lazy Loading

Tải các component theo nhu cầu để giảm kích thước bundle ban đầu.

```tsx
import { LazyLoadComponent } from '../utils/lazyLoading';
import { lazy } from 'react';

const LazyCalendarPage = lazy(() => import('../pages/Calendar/CalendarPage'));

function Routes() {
  return (
    <Switch>
      <Route path="/calendar">
        <LazyLoadComponent component={LazyCalendarPage} />
      </Route>
      {/* Other routes */}
    </Switch>
  );
}
```

### 2. Memoization

Tối ưu render với React.memo, useMemo và useCallback.

```tsx
import { withMemo, useDeepMemo, useDeepCallback } from '../utils/memoization';

// Memoize component
const MemoizedTable = withMemo(Table, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});

function DataView() {
  // Memoize expensive calculation
  const processedData = useDeepMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);
  
  // Memoize callback
  const handleRowClick = useDeepCallback((id) => {
    // Handle row click
  }, []);
  
  return <MemoizedTable data={processedData} onRowClick={handleRowClick} />;
}
```

### 3. Virtual List & Infinite Scroll

Hiển thị hiệu quả danh sách lớn.

```tsx
// Virtual List
import { VirtualList } from '../utils/VirtualList';

function LargeList() {
  return (
    <VirtualList
      items={items}
      height={500}
      itemHeight={50}
      renderItem={(item, index) => (
        <div>{item.name}</div>
      )}
      itemKey={(item) => item.id}
    />
  );
}

// Infinite Scroll
import { InfiniteScroll } from '../utils/InfiniteScroll';

function InfiniteList() {
  const fetchData = async (page) => {
    // Fetch data for page
    return data;
  };
  
  return (
    <InfiniteScroll
      fetchData={fetchData}
      renderItem={(item) => <div>{item.name}</div>}
      itemKey={(item) => item.id}
      pageSize={20}
    />
  );
}
```

### 4. Prefetch

Tải trước dữ liệu khi hover để cải thiện UX.

```tsx
import { PrefetchLink } from '../utils/Prefetch/PrefetchLink';

function BookingsList() {
  return (
    <ul>
      {bookings.map(booking => (
        <li key={booking.id}>
          <PrefetchLink
            to={`/bookings/${booking.id}`}
            prefetch={true}
            prefetchTimeout={300}
            onPrefetch={() => fetchBookingDetails(booking.id)}
          >
            {booking.name}
          </PrefetchLink>
        </li>
      ))}
    </ul>
  );
}
```

## Tương tác thông minh

### 1. SmartTooltip

Tooltip thông minh với vị trí tự động điều chỉnh.

```tsx
import { SmartTooltip } from '../ui/Tooltip/SmartTooltip';

function FeatureButton() {
  return (
    <SmartTooltip
      content="Tính năng này cho phép bạn tự động tạo báo cáo hàng tháng"
      position="top"
      delay={300}
    >
      <button>Tạo báo cáo</button>
    </SmartTooltip>
  );
}
```

### 2. ActionSuggestion

Gợi ý hành động thông minh dựa trên hành vi người dùng.

```tsx
import { ActionSuggestion } from '../ui/Suggestion/ActionSuggestion';

function BookingConfirmation() {
  return (
    <div>
      <h1>Booking đã được tạo thành công</h1>
      
      <ActionSuggestion
        message="Bạn có muốn gửi email xác nhận cho khách hàng không?"
        action={{
          label: 'Gửi email',
          onClick: () => sendConfirmationEmail(),
        }}
        onDismiss={() => {}}
        autoHideDuration={10000}
      />
    </div>
  );
}
```

### 3. SmartSuggestion

Hệ thống gợi ý thông minh dựa trên hành động người dùng.

```tsx
import { SmartSuggestion, BookingSuggestions } from '../utils/SmartSuggestion';

function BookingPage() {
  return (
    <div>
      {/* Booking content */}
      
      {/* This will show suggestions based on user actions */}
      <BookingSuggestions />
    </div>
  );
}
```

## Tích hợp tất cả Provider

Sử dụng AppProviders để tích hợp tất cả provider vào ứng dụng.

```tsx
import { AppProviders } from '../providers/AppProviders';

function App() {
  return (
    <AppProviders>
      <Router>
        <Layout>
          <Routes />
        </Layout>
      </Router>
    </AppProviders>
  );
}
```

## Kiểm thử

Hệ thống UI/UX mới đi kèm với các công cụ kiểm thử toàn diện.

```tsx
import { renderWithProviders, testResponsiveness, testThemeSwitching, testAccessibility } from '../utils/testUtils';

describe('YourComponent', () => {
  test('renders correctly', () => {
    renderWithProviders(<YourComponent />);
    // Assertions...
  });
  
  test('is responsive', async () => {
    await testResponsiveness(<YourComponent />);
    // Assertions...
  });
  
  test('supports theme switching', async () => {
    await testThemeSwitching(<YourComponent />);
    // Assertions...
  });
  
  test('is accessible', () => {
    const { container } = renderWithProviders(<YourComponent />);
    const accessibilityResults = testAccessibility(container);
    // Assertions...
  });
});
```

## Hướng dẫn mở rộng

### Thêm component mới

1. Tạo file component trong thư mục `/ui/` tương ứng
2. Viết test trong thư mục `__tests__`
3. Export component trong file index.ts của thư mục
4. Cập nhật tài liệu

### Thêm theme mới

1. Mở rộng TenantThemeProvider để hỗ trợ theme mới
2. Thêm các biến CSS mới vào ui.config.ts
3. Cập nhật các component sử dụng theme

### Thêm provider mới

1. Tạo provider mới trong thư mục tương ứng
2. Thêm provider vào AppProviders
3. Viết test cho provider
4. Cập nhật tài liệu

## Kết luận

Hệ thống UI/UX mới của PMS Roomrise đã được nâng cấp lên chuẩn SaaS thương mại cao cấp với các tính năng:

- Responsive layout toàn bộ hệ thống
- Dark mode và theme theo tenant
- Toast notification thông minh
- Loading UX chuyên nghiệp
- Component tái sử dụng đa dạng
- Form với validation và UX tối ưu
- Tối ưu hiệu năng với lazy loading, memoization, virtual list
- Tương tác thông minh với tooltip, suggestion, onboarding
- Kiểm thử toàn diện

Hệ thống này cung cấp nền tảng vững chắc để phát triển và mở rộng PMS Roomrise trong tương lai.
