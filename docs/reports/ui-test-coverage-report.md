# UI Test Coverage Report

## Summary

- Total Components: 10
- Covered Components: 7
- Coverage Percentage: 70.00%

## Module Coverage

### Calendar

- Coverage: 66.67% (4/6)

| Component | Covered | Test Files |
|-----------|---------|------------|
| BookingBlock | ✅ | BookingBlock.test.tsx |
| BookingModal | ✅ | BookingModal.test.tsx |
| BookingPopover | ❌ | None |
| CalendarFilters | ❌ | None |
| CalendarHeader | ✅ | CalendarHeader.test.tsx |
| TimelineGrid | ✅ | TimelineGrid.test.tsx |

### Payments

- Coverage: 66.67% (2/3)

| Component | Covered | Test Files |
|-----------|---------|------------|
| PaymentFilters | ❌ | None |
| PaymentFormModal | ✅ | PaymentFormModal.test.tsx, PaymentsPage.test.tsx |
| PaymentTable | ✅ | PaymentsPage.test.tsx |

### Invoices

- Coverage: 100.00% (1/1)

| Component | Covered | Test Files |
|-----------|---------|------------|
| InvoiceCreateModal | ✅ | InvoiceCreateModal.test.tsx, InvoiceModule.test.tsx |

## Uncovered Components

- BookingPopover
- CalendarFilters
- PaymentFilters

## Accessibility Testing

The following components have been tested for accessibility using jest-axe:

- BookingBlock
- BookingModal
- CalendarHeader
- TimelineGrid
- PaymentFormModal
- InvoiceCreateModal
