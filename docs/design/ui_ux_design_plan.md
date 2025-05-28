# UI/UX Design Plan for PMS Frontend

## Overview
This document outlines the UI/UX design plan for the Property Management System (PMS) frontend, focusing on the three core modules: Properties, RoomTypes, and Bookings. The design aims to create a cohesive, intuitive, and responsive user interface that follows modern design principles and provides a seamless user experience.

## Design Principles
- **Consistency**: Maintain consistent design patterns across all modules
- **Simplicity**: Keep interfaces clean and focused on essential functionality
- **Responsiveness**: Ensure all pages work well on different screen sizes
- **Accessibility**: Follow accessibility best practices
- **Feedback**: Provide clear feedback for user actions

## Common Layout Structure
All pages will follow a consistent layout structure:

```
+------------------------------------------+
|              Navigation Bar              |
+------------------------------------------+
|                                          |
|  +--------------------------------------+|
|  |             Page Header              ||
|  |  (Title, Actions, Filters, Search)   ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |                                      ||
|  |             Main Content             ||
|  |                                      ||
|  +--------------------------------------+|
|                                          |
+------------------------------------------+
|                 Footer                   |
+------------------------------------------+
```

## Color Scheme
- Primary: #3B82F6 (Blue)
- Secondary: #10B981 (Green)
- Accent: #8B5CF6 (Purple)
- Neutral: #F3F4F6 (Light Gray)
- Background: #FFFFFF (White)
- Text: #1F2937 (Dark Gray)
- Error: #EF4444 (Red)
- Warning: #F59E0B (Amber)
- Success: #10B981 (Green)

## Typography
- Headings: Inter, sans-serif
- Body: Inter, sans-serif
- Monospace: Consolas, monospace

## Module-Specific Designs

### 1. Properties Module

#### Properties List Page
- **URL**: `/properties`
- **Components**:
  - Search bar for filtering properties
  - Add Property button
  - Properties table with columns:
    - Name
    - Location
    - Description (truncated)
    - Actions (View, Edit, Delete)
  - Pagination controls
- **Actions**:
  - Add new property
  - Edit existing property
  - Delete property (with confirmation)
  - View property details
  - View rooms for a property

#### Property Form (Add/Edit)
- **URL**: `/properties/new` or `/properties/:id/edit`
- **Components**:
  - Form with fields:
    - Name (required)
    - Location (required)
    - Description
    - Images (multiple upload)
  - Save and Cancel buttons
- **Validation**:
  - Name: Required, max 100 characters
  - Location: Required, max 200 characters
  - Description: Optional, max 1000 characters

#### Property Details Page
- **URL**: `/properties/:id`
- **Components**:
  - Property information card
  - Image gallery
  - Tabs for:
    - Details
    - Room Types
    - Bookings
  - Edit and Back buttons
- **Actions**:
  - Edit property
  - Add room type
  - View bookings for this property

### 2. RoomTypes Module

#### RoomTypes List Page (Property-specific)
- **URL**: `/properties/:propertyId/room-types`
- **Components**:
  - Property information header
  - Add Room Type button
  - Room Types table with columns:
    - Name
    - Occupancy
    - Price
    - Quantity
    - Actions (View, Edit, Delete)
  - Pagination controls
- **Actions**:
  - Add new room type
  - Edit existing room type
  - Delete room type (with confirmation)
  - View room type details

#### RoomType Form (Add/Edit)
- **URL**: `/properties/:propertyId/room-types/new` or `/properties/:propertyId/room-types/:id/edit`
- **Components**:
  - Form with fields:
    - Name (required)
    - Occupancy (required)
    - Price (required)
    - Quantity (required)
    - Description
  - Save and Cancel buttons
- **Validation**:
  - Name: Required, max 100 characters
  - Occupancy: Required, positive integer
  - Price: Required, positive number with 2 decimal places
  - Quantity: Required, positive integer
  - Description: Optional, max 500 characters

#### RoomType Details Page
- **URL**: `/properties/:propertyId/room-types/:id`
- **Components**:
  - Room Type information card
  - Availability calendar
  - Bookings for this room type
  - Edit and Back buttons
- **Actions**:
  - Edit room type
  - View bookings for this room type
  - Create booking for this room type

### 3. Bookings Module

#### Bookings List Page
- **URL**: `/bookings`
- **Components**:
  - Search and filter controls:
    - Date range
    - Property
    - Status
    - Source
  - Add Booking button
  - Bookings table with columns:
    - Booking ID
    - Guest Name
    - Property
    - Room Type
    - Check-in
    - Check-out
    - Status
    - Total Amount
    - Actions (View, Edit, Cancel)
  - Pagination controls
- **Actions**:
  - Add new booking
  - Edit existing booking
  - Cancel booking (with confirmation)
  - View booking details

#### Property-specific Bookings
- **URL**: `/properties/:propertyId/bookings`
- Similar to main bookings page but filtered for specific property

#### Booking Form (Add/Edit)
- **URL**: `/bookings/new` or `/bookings/:id/edit`
- **Components**:
  - Form with fields:
    - Property (select, required)
    - Room Type (select, required, filtered by property)
    - Check-in date (required)
    - Check-out date (required)
    - Guest information:
      - Name (required)
      - Email (required)
      - Phone (required)
    - Source (select: DIRECT, BOOKING_COM, EXPEDIA, etc.)
    - Notes
  - Room availability indicator
  - Price calculation summary
  - Save and Cancel buttons
- **Validation**:
  - Property: Required
  - Room Type: Required
  - Check-in: Required, must be today or future date
  - Check-out: Required, must be after check-in
  - Guest Name: Required, max 100 characters
  - Guest Email: Required, valid email format
  - Guest Phone: Required, valid phone format

#### Booking Details Page
- **URL**: `/bookings/:id`
- **Components**:
  - Booking information card
  - Guest information
  - Payment information
  - Status update controls
  - Edit and Back buttons
- **Actions**:
  - Edit booking
  - Update booking status
  - Cancel booking

## Navigation Structure

```
Home
├── Properties
│   ├── Property List
│   ├── Add Property
│   └── Property Details
│       ├── Room Types
│       │   ├── Room Type List
│       │   ├── Add Room Type
│       │   └── Room Type Details
│       └── Bookings (Property-specific)
└── Bookings
    ├── Booking List
    ├── Add Booking
    └── Booking Details
```

## Responsive Design Considerations
- Tables will collapse to cards on mobile devices
- Forms will stack fields vertically on smaller screens
- Navigation will use a hamburger menu on mobile
- Touch-friendly controls for mobile users

## Interactive Elements
- **Buttons**: Clear visual hierarchy (primary, secondary, danger)
- **Forms**: Inline validation with helpful error messages
- **Tables**: Sortable columns, row hover effects
- **Modals**: For confirmations and quick actions
- **Toasts**: For success/error notifications
- **Calendars**: For date selection and availability visualization

## Implementation Plan
1. Create reusable components for common UI elements
2. Implement base layout and navigation
3. Develop Properties module pages
4. Develop RoomTypes module pages
5. Develop Bookings module pages
6. Implement cross-module integration
7. Add responsive design adjustments
8. Conduct usability testing and refinements
