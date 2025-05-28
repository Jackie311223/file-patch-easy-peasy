# PMS Roomrise Solutions - UI/UX Design Specification

This document outlines the comprehensive UI/UX design plan for the Property Management System (PMS) Roomrise Solutions, following best practices and aiming for a top-tier user experience.

## 1. Research & Personas

Understanding the primary users is crucial for designing an effective and intuitive system. We identify three key personas:

### Persona 1: Alex Nguyen - The Independent Host

*   **Role:** Owner/Manager of a small boutique hotel (5-15 rooms).
*   **Goals:**
    *   Maximize occupancy and revenue.
    *   Provide excellent guest experiences.
    *   Minimize administrative overhead.
    *   Quickly view availability and manage bookings.
*   **Pain Points:**
    *   Spending too much time on manual booking entries and updates.
    *   Difficulty tracking guest communication and special requests.
    *   Overbooking risks due to managing multiple channels (OTAs, direct).
    *   Lack of clear overview of financial performance.
*   **Tech Savviness:** Moderate. Comfortable with web applications and mobile apps, but prefers simple, intuitive interfaces. Not a power user.
*   **Key Needs:** Easy-to-use calendar view, streamlined booking process, simple reporting, mobile access.

### Persona 2: Linh Tran - The Customer Service Representative (CSKH)

*   **Role:** Front desk / Customer service staff at a mid-sized hotel (20-50 rooms).
*   **Goals:**
    *   Handle guest inquiries and bookings efficiently (phone, email, walk-in).
    *   Manage check-ins/check-outs smoothly.
    *   Quickly find guest information and booking details.
    *   Address guest issues promptly.
*   **Pain Points:**
    *   Slow system response when searching for information.
    *   Complex booking modification process.
    *   Difficulty coordinating requests between departments (housekeeping, maintenance).
    *   Inconsistent information across different system views.
*   **Tech Savviness:** High. Uses the PMS daily for core tasks. Familiar with various software but values speed and efficiency.
*   **Key Needs:** Fast search, clear booking details view, efficient check-in/out workflow, internal communication tools (or integration).

### Persona 3: Minh Le - The Accountant / Finance Manager

*   **Role:** Handles finances for one or multiple properties.
*   **Goals:**
    *   Accurately track revenue, expenses, and payments.
    *   Generate financial reports for management and tax purposes.
    *   Reconcile payments from various sources (cash, card, OTAs).
    *   Ensure compliance and data accuracy.
*   **Pain Points:**
    *   Manual data export and manipulation in spreadsheets for reporting.
    *   Difficulty tracking commissions and fees from OTAs.
    *   Lack of detailed payment transaction history.
    *   Time-consuming reconciliation process.
*   **Tech Savviness:** Moderate to High. Proficient with accounting software and spreadsheets. Needs reliable data export and customizable reports.
*   **Key Needs:** Robust reporting module, detailed payment tracking, export functionality (CSV, Excel), clear financial dashboard.

### User Journey Maps (Simplified)

**A. Alex Nguyen (Host) - Creating a Direct Booking:**

1.  **Check Availability:** Opens Calendar view -> Selects dates -> Sees available room types.
2.  **Enter Guest Info:** Clicks available room -> Opens booking form -> Enters guest name, contact, stay dates.
3.  **Confirm & Payment:** Selects rate -> Adds notes (optional) -> Takes payment details (if applicable) -> Clicks "Confirm Booking".
4.  **Confirmation:** Sees success message -> Booking appears on Calendar -> Optional: Sends confirmation email.

**B. Linh Tran (CSKH) - Managing Room Status:**

1.  **View Room Status:** Navigates to Properties -> Rooms List or uses a dedicated Housekeeping view.
2.  **Identify Needs:** Filters by status (e.g., "Departed", "Stayover") -> Sees rooms needing cleaning/inspection.
3.  **Update Status:** Clicks on a room -> Selects new status (e.g., "Clean", "Inspected", "Out of Order") -> Saves change.
4.  **Confirmation:** Status updates instantly on the list/view -> Housekeeping team is notified (ideally).

**C. Minh Le (Accountant) - Exporting Monthly Revenue Report:**

1.  **Navigate to Reports:** Opens Reports module from sidebar.
2.  **Select Report Type:** Chooses "Financial Reports" -> Selects "Monthly Revenue Summary".
3.  **Configure Report:** Selects date range (e.g., Last Month) -> Applies filters (optional, e.g., by property) -> Clicks "Generate Report".
4.  **View & Export:** Reviews report preview on screen -> Clicks "Export" -> Selects format (CSV/Excel) -> Downloads file.




## 2. Information Architecture (IA) & Navigation

A clear and logical structure is essential for usability. The proposed IA organizes features into intuitive modules accessible via a consistent navigation pattern.

### Sitemap

The following sitemap outlines the primary sections and sub-sections of the PMS:

```
/
├── /dashboard                 (Overview, key metrics, quick actions)
├── /bookings
│   ├── /list                  (Default view, searchable/filterable table)
│   ├── /new                   (Form for creating new bookings)
│   └── /:bookingId            (Booking detail view, includes edit functionality)
├── /properties
│   ├── /list                  (List of managed properties - relevant for multi-property users)
│   ├── /:propertyId           (Property dashboard/overview - default view for single-property users)
│   │   ├── /rooms             (List/grid of rooms for the property, status view)
│   │   │   └── /:roomId       (Room detail/settings)
│   │   ├── /room-types        (List of room types for the property)
│   │   │   ├── /new           (Form for new room type)
│   │   │   └── /:roomTypeId   (Room type detail/edit)
│   │   └── /settings        (Property-specific settings - rates, policies)
│   └── /new                   (Form for adding a new property - admin/owner)
├── /calendar                  (Visual availability calendar, booking management)
├── /payments
│   ├── /transactions          (List of all payment transactions, filterable)
│   ├── /invoices              (List of generated invoices)
│   │   └── /:invoiceId        (Invoice detail view)
│   └── /reconciliation       (Tools for payment reconciliation - Accountant focus)
├── /reports
│   ├── /list                  (Dashboard/list of available standard and custom reports)
│   └── /generate/:reportType  (Configuration screen for specific reports)
├── /inbox                     (Internal messaging or guest communication log)
└── /settings
    ├── /account               (Current user's profile, password, preferences)
    ├── /users                 (User management - admin/owner)
    ├── /integrations          (OTA channels, payment gateways, etc.)
    └── /billing               (Subscription and payment method - if applicable)
```

*Note: Access to certain sections like `/settings/users`, `/properties/new`, or specific reports might be restricted based on user roles (Host, CSKH, Accountant).* 

### Navigation Design

*   **Primary Navigation: Collapsible Sidebar**
    *   **Structure:** A vertical menu on the left side, permanently visible on larger screens, collapsible to icons-only on smaller screens or by user choice.
    *   **Items (with icons):**
        *   Dashboard
        *   Calendar
        *   Bookings
        *   Properties
        *   Payments
        *   Reports
        *   Inbox
        *   Settings
    *   **Behavior:** Expands on hover/click (on collapsed state). Active section is highlighted.

*   **Secondary Navigation: Breadcrumbs**
    *   **Placement:** Located consistently at the top of the main content area, below any potential header bar.
    *   **Function:** Provides context about the user's current location within the site hierarchy and allows easy navigation back to parent pages.
    *   **Example:** `Dashboard > Properties > Beach Resort & Spa > Rooms`

*   **Tertiary Navigation (Contextual): Tabs**
    *   **Usage:** Employed within complex pages to organize related content without requiring separate page loads.
    *   **Example (Booking Detail Page):** Tabs for `Overview`, `Guest Details`, `Payment History`, `Notes & Communication`.
    *   **Example (Settings Page):** Tabs for `Account`, `Property`, `Users`, `Integrations`.




## 3. Design System / Component Library

A consistent design system ensures a cohesive user experience and speeds up development. This system defines visual styles (tokens) and reusable UI components.

### Design Tokens

Design tokens are the foundational visual values used throughout the application.

**A. Colors:**

*   **Primary:** `#0D47A1` (Deep Blue - For main actions, active states, branding)
    *   *Variants:* `#1565C0` (Lighter), `#0A3880` (Darker)
*   **Secondary:** `#607D8B` (Blue Grey - For secondary actions, borders, less important elements)
    *   *Variants:* `#90A4AE` (Lighter), `#455A64` (Darker)
*   **Success:** `#2E7D32` (Green - For confirmation messages, success states)
    *   *Variants:* `#4CAF50` (Lighter), `#1B5E20` (Darker)
*   **Warning:** `#FF8F00` (Amber - For warnings, pending states)
    *   *Variants:* `#FFC107` (Lighter), `#E65100` (Darker)
*   **Error:** `#C62828` (Red - For errors, destructive actions)
    *   *Variants:* `#EF5350` (Lighter), `#B71C1C` (Darker)
*   **Background:**
    *   `#FFFFFF` (White - Main content background)
    *   `#F5F7FA` (Light Grey - Subtle background variations, disabled states)
    *   `#ECEFF1` (Grey - Borders, dividers)
*   **Text:**
    *   `#212121` (Near Black - Primary text)
    *   `#616161` (Dark Grey - Secondary text, labels)
    *   `#9E9E9E` (Medium Grey - Placeholder text, disabled text)
    *   `#FFFFFF` (White - Text on dark/colored backgrounds)

**B. Typography:** (Using a common sans-serif font like Inter, Roboto, or system default)

*   **Font Family:** `Inter, sans-serif`
*   **Scale:**
    *   `H1`: 32px Bold (Page Titles)
    *   `H2`: 24px Bold (Section Titles)
    *   `H3`: 20px SemiBold (Sub-section Titles, Modal Titles)
    *   `H4`: 16px SemiBold (Card Titles, Important Labels)
    *   `Body Large`: 16px Regular (Main text content)
    *   `Body Medium`: 14px Regular (Standard text, table content, input text)
    *   `Body Small`: 12px Regular (Helper text, captions)
    *   `Button Text`: 14px Medium
*   **Line Height:** Generally 1.5x font size for body text, 1.3x for headings.

**C. Spacing:** (Using a base unit of 4px)

*   **Base Unit:** `4px`
*   **Scale:**
    *   `xs`: 4px (0.25rem)
    *   `sm`: 8px (0.5rem)
    *   `md`: 12px (0.75rem)
    *   `lg`: 16px (1rem)
    *   `xl`: 24px (1.5rem)
    *   `2xl`: 32px (2rem)
    *   `3xl`: 48px (3rem)
*   **Usage:** Apply consistently for padding, margins, and gaps between elements.

### UI Component Specifications

**1. Button:**

*   **Sizes:**
    *   *Medium (Default):* Height 36px, Padding `8px 16px`
    *   *Large:* Height 44px, Padding `12px 24px`
    *   *Small:* Height 32px, Padding `6px 12px`
*   **Font:** `Button Text` (14px Medium)
*   **Border Radius:** `4px`
*   **Icon Usage:** Optional icon placed before or after text, size ~16-20px, margin `8px` from text.
*   **Variants & States:**
    *   *Primary:* Background `Primary`, Text `White`. Hover: `Primary Lighter`. Focus: Outline `Primary Lighter`. Disabled: Background `#B0BEC5`, Text `#FFFFFF`.
    *   *Secondary:* Background `Transparent`, Border `1px solid #CFD8DC`, Text `Primary`. Hover: Background `#E3F2FD`. Focus: Outline `Primary Lighter`. Disabled: Border `#ECEFF1`, Text `#B0BEC5`.
    *   *Text:* Background `Transparent`, Text `Primary`. Hover: Background `#E3F2FD`. Focus: Outline `Primary Lighter`. Disabled: Text `#B0BEC5`.
    *   *Destructive (Error):* Background `Error`, Text `White`. Hover: `Error Lighter`. Focus: Outline `Error Lighter`. Disabled: Background `#FFCDD2`, Text `#FFFFFF`.

**2. Input / Select / Datepicker:**

*   **Sizes:**
    *   *Medium (Default):* Height 36px, Padding `8px 12px`
    *   *Large:* Height 44px, Padding `12px 16px`
*   **Font:** `Body Medium` (14px Regular)
*   **Border:** `1px solid #CFD8DC`
*   **Border Radius:** `4px`
*   **Background:** `White`
*   **Placeholder Text:** Color `#9E9E9E`
*   **States:**
    *   *Hover:* Border `Secondary Darker` (`#455A64`).
    *   *Focus:* Border `Primary`, Box Shadow `0 0 0 2px rgba(13, 71, 161, 0.2)`.
    *   *Disabled:* Background `#F5F7FA`, Border `#ECEFF1`, Text `#B0BEC5`.
    *   *Error:* Border `Error`, Box Shadow `0 0 0 2px rgba(198, 40, 40, 0.2)`.
*   **Select:** Includes dropdown arrow icon.
*   **Datepicker:** Includes calendar icon, uses Modal/Popover for calendar display.

**3. Table:**

*   **Header:** Background `#F5F7FA`, Font `Body Small` (12px SemiBold), Text Color `Secondary Darker`, Padding `12px 16px`, Border Bottom `2px solid #ECEFF1`.
*   **Row:** Background `White`. Hover: Background `#F5F7FA`. Border Bottom `1px solid #ECEFF1`.
*   **Cell Padding:** `12px 16px`.
*   **Font:** `Body Medium` (14px Regular).
*   **Pagination:** Placed below table, includes page numbers, next/prev buttons (using Text Buttons), items per page selector (Select component).
*   **Inline Edit:** On hover/click specific cells (if enabled), display Input field or Select dropdown directly within the cell, provide Save/Cancel actions (small icon buttons).

**4. Modal / Drawer:**

*   **Modal:**
    *   *Backdrop:* Semi-transparent black (`rgba(0, 0, 0, 0.5)`).
    *   *Container:* Background `White`, Border Radius `8px`, Padding `24px`, Max Width `600px` (default).
    *   *Header:* Font `H3` (20px SemiBold), Padding Bottom `16px`, Border Bottom `1px solid #ECEFF1`.
    *   *Footer:* Padding Top `16px`, Border Top `1px solid #ECEFF1`, contains action buttons (e.g., Save, Cancel).
    *   *Close Button:* Icon button (X) top right corner.
*   **Drawer:** Slides from right/left, similar styling to Modal but full height or defined height, Width `400px` (default).

**5. Notification / Tooltip:**

*   **Notification (Toast):** Background based on type (Success, Error, Warning, Info - using primary/secondary), Text `White` or `Near Black` for contrast, Padding `12px 16px`, Border Radius `4px`, Optional icon.
*   **Tooltip:** Background `Near Black` (`#212121`), Text `White`, Font `Body Small` (12px Regular), Padding `4px 8px`, Border Radius `4px`. Appears on hover after a short delay.

**6. Sidebar / Navbar:**

*   **Sidebar (Expanded):** Width `240px`, Background `White` or slightly off-white `#FAFAFA`, Padding `16px 0`.
*   **Sidebar (Collapsed):** Width `72px`, Icons centered.
*   **Sidebar Item:** Padding `12px 24px` (Expanded) / `12px` centered (Collapsed), Font `Body Medium` (14px Medium), Icon size `20px`. Active State: Background `#E3F2FD`, Text/Icon `Primary`. Hover State: Background `#F5F7FA`.
*   **Navbar (Top):** Height `64px`, Background `White`, Border Bottom `1px solid #ECEFF1`, Contains Breadcrumbs, User Menu, Notifications icon.

**7. Form Validation Messages:**

*   **Placement:** Typically below the relevant input field.
*   **Style:** Font `Body Small` (12px Regular), Color `Error` (`#C62828`).
*   **Icon:** Optional small error icon preceding the text.




## 4. Wireframes & Mockups

This section provides descriptions of low-fidelity wireframes and high-fidelity mockups for key screens. As direct visual creation isn't possible here, descriptions focus on layout, component placement, and application of the design system.

### Low-Fidelity Wireframes (Layout & Structure)

**A. Dashboard Wireframe:**

*   **Layout:** Standard two-column layout (Sidebar + Main Content Area).
*   **Sidebar:** Placeholder for collapsible navigation items.
*   **Main Content Area:**
    *   *Top:* Breadcrumbs (`Dashboard`). Page Title (`H1: Dashboard`).
    *   *Row 1:* Series of stat cards (e.g., "Today's Arrivals", "Departures", "Occupancy Rate", "Recent Bookings"). Each card has a title and a large number/value placeholder.
    *   *Row 2:* Two main sections side-by-side.
        *   *Left Section:* "Quick Actions" area with buttons (e.g., "New Booking", "Check-in", "Check-out").
        *   *Right Section:* "Recent Activity Feed" or "Notifications" list.
    *   *Row 3:* Full-width section for a mini-calendar view or an occupancy forecast chart.

**B. Bookings List Wireframe:**

*   **Layout:** Sidebar + Main Content Area.
*   **Sidebar:** Navigation items, "Bookings" highlighted.
*   **Main Content Area:**
    *   *Top:* Breadcrumbs (`Dashboard > Bookings`). Page Title (`H1: Bookings`). Action Button (`Primary: + Add Booking`).
    *   *Filters/Search Bar:* Row with search input, date range picker, status filter dropdown.
    *   *Table:* Standard data table component.
        *   *Header:* Columns like "Guest Name", "Check-in", "Check-out", "Room Type", "Status", "Total", "Actions".
        *   *Rows:* Placeholder lines representing individual bookings.
        *   *Actions Column:* Placeholders for view/edit/cancel icon buttons.
    *   *Bottom:* Pagination component.

**C. Booking Detail Wireframe:**

*   **Layout:** Sidebar + Main Content Area.
*   **Sidebar:** Navigation items, "Bookings" highlighted.
*   **Main Content Area:**
    *   *Top:* Breadcrumbs (`Dashboard > Bookings > #BookingID`). Page Title (`H1: Booking Details`). Action Buttons (`Secondary: Edit Booking`, `Text: Cancel Booking`). Booking Status Badge.
    *   *Section 1 (Two Columns):*
        *   *Left Column:* "Booking Information" block (Property, Room Type, Dates, Duration, Source).
        *   *Right Column:* "Guest Information" block (Name, Email, Phone, Notes).
    *   *Section 2 (Full Width):* "Payment Information" block (Room Rate, Nights, Commission, Total Amount, Payment Status).
    *   *Section 3 (Full Width):* "Booking Status Management" block (e.g., Check-in/Check-out buttons, status history).
    *   *Section 4 (Optional Tabs):* Placeholder for tabs like "Notes", "History", "Invoices".

### High-Fidelity Mockup Descriptions (Applying Design System)

*(These descriptions assume the application of the previously defined Design System: Deep Blue primary color, Inter font, 4px spacing unit, etc.)*

**A. Dashboard Mockup:**

*   **Overall:** Clean, spacious layout with white background (`#FFFFFF`).
*   **Sidebar:** Expanded (`Width: 240px`), white background, `Primary` color (`#0D47A1`) for the active "Dashboard" icon and text.
*   **Navbar:** Height `64px`, white background, thin grey border bottom (`#ECEFF1`). Breadcrumbs (`Body Medium`, `#616161`). User menu top right.
*   **Main Content:** Padding `xl` (`24px`).
    *   *Title:* `H1` (32px Bold, `#212121`).
    *   *Stat Cards:* White background, subtle shadow, border radius `8px`. Title (`Body Small`, `#616161`), Value (`H2`, `#0D47A1` or appropriate status color). Spacing between cards `lg` (`16px`).
    *   *Quick Actions:* Buttons use `Medium` size, `Primary` and `Secondary` variants.
    *   *Activity Feed:* List items with `Body Medium` text, timestamps (`Body Small`, `#9E9E9E`).
    *   *Chart/Calendar:* Uses defined color palette, clear labels (`Body Small`).

**B. Bookings List Mockup:**

*   **Overall:** Consistent with Dashboard layout.
*   **Sidebar:** "Bookings" item active (`Primary` color).
*   **Main Content:**
    *   *Title:* `H1` (32px Bold).
    *   *Add Booking Button:* `Primary` variant, `Medium` size, icon `+`.
    *   *Filters:* Input/Select/Datepicker components use defined specs (Height 36px, border `#CFD8DC`, focus state with `Primary` border).
    *   *Table:*
        *   *Header:* Background `#F5F7FA`, Font `12px SemiBold`, `#455A64` text.
        *   *Rows:* White background, hover state `#F5F7FA`. Text `Body Medium` (`#212121`).
        *   *Status Badge:* Uses `Success`, `Warning`, `Primary`, `Secondary` background colors with white/dark text for contrast, padding `xs sm`, border radius `12px`, font `Body Small` Bold.
        *   *Actions:* Icon buttons (View `eye`, Edit `pencil`, Cancel `trash`), size ~20px, color `Secondary Darker`, hover color `Primary`.
    *   *Pagination:* Uses Text buttons for page numbers/arrows, Select for items per page.

**C. Booking Detail Mockup:**

*   **Overall:** Consistent layout.
*   **Main Content:**
    *   *Title:* `H1` (32px Bold).
    *   *Action Buttons:* `Edit Booking` (Secondary), `Cancel Booking` (Text, Error color if destructive).
    *   *Status Badge:* Prominently displayed near title, styled as in the table.
    *   *Information Blocks:* Use `H4` (16px SemiBold) for labels (e.g., "Property:", "Name:") and `Body Medium` (14px Regular) for values. Spacing between label/value pairs `sm` (`8px`), spacing between blocks `xl` (`24px`).
    *   *Payment Info:* Clearly formatted currency values.
    *   *Status Management:* Uses `Primary` button for Check-in, potentially `Error` or `Secondary` for Check-out/Cancel.
    *   *Tabs (if used):* Standard tab component styling, active tab with `Primary` indicator line/color.




## 5. Interaction & Micro-interactions

Thoughtful interactions enhance usability and provide helpful feedback to the user.

### Standard Interaction Behaviors

*   **Hover States:**
    *   *Buttons/Links:* Change background color or text decoration (underline) as defined in the Design System (e.g., Primary button background becomes `Primary Lighter`).
    *   *Table Rows:* Background color changes to `#F5F7FA` to indicate the row the cursor is over.
    *   *Interactive Elements (Cards, Icons):* Subtle scale increase (`transform: scale(1.02)`) or background change.
*   **Click/Tap States:**
    *   *Buttons:* Subtle visual feedback like a slight inset shadow or brief color change (`Primary Darker` for Primary button) during the press.
    *   *Navigation Items:* Immediate navigation or expansion of sub-menus, with the active state clearly indicated.
*   **Focus States:**
    *   *Inputs/Selects/Buttons:* Visible outline (e.g., `Primary` color outline with slight box-shadow) to aid keyboard navigation, consistent with WCAG requirements.
*   **Loading States:**
    *   *Page Load/Data Fetching:* Use skeleton screens that mimic the layout of the content being loaded (e.g., grey placeholder boxes for tables, cards). This provides a better perceived performance than spinners alone.
    *   *Button Actions (Submit):* Disable the button and show a small spinner icon within the button text (e.g., "Saving...") or next to it.
    *   *Inline Loading:* For smaller updates within a section, a subtle spinner or progress indicator can be used locally.
*   **Transitions:**
    *   *Modals/Drawers:* Smooth slide-in/fade-in transition (`opacity` and `transform`) over ~200-300ms.
    *   *Sidebar Collapse/Expand:* Smooth width transition over ~200ms.
    *   *Accordion/Dropdown Expand:* Smooth height transition.

### Micro-interaction Examples (CSS)

**1. Button Click Feedback (Primary Button):**

```css
.button-primary {
  background-color: #0D47A1; /* primary */
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-out, transform 0.1s ease-out;
}

.button-primary:hover {
  background-color: #1565C0; /* primary-lighter */
}

.button-primary:active {
  background-color: #0A3880; /* primary-darker */
  transform: scale(0.98); /* Subtle press effect */
}

.button-primary:focus-visible {
  outline: 2px solid #1565C0; /* primary-lighter */
  outline-offset: 2px;
}

.button-primary:disabled {
  background-color: #B0BEC5;
  color: #FFFFFF;
  cursor: not-allowed;
}
```

**2. Table Row Hover Highlight:**

```css
.table-row {
  background-color: #FFFFFF;
  border-bottom: 1px solid #ECEFF1;
  transition: background-color 0.15s ease-in-out;
}

.table-row:hover {
  background-color: #F5F7FA; /* light-grey */
}
```

**3. Input Field Focus:**

```css
.input-field {
  border: 1px solid #CFD8DC;
  border-radius: 4px;
  padding: 8px 12px;
  transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;
}

.input-field:focus {
  border-color: #0D47A1; /* primary */
  box-shadow: 0 0 0 2px rgba(13, 71, 161, 0.2);
  outline: none; /* Remove default browser outline */
}
```




## 6. Responsive & Accessibility

Ensuring the PMS is usable across different devices and by people with disabilities is paramount.

### Responsive Design Strategy

The application will be designed mobile-first or use a responsive approach to adapt gracefully to various screen sizes.

*   **Breakpoints:**
    *   *Mobile:* < 640px
    *   *Tablet:* 640px - 1024px
    *   *Desktop:* > 1024px
*   **Layout Adaptation:**
    *   *Sidebar:* Collapses to icon-only on tablet and mobile. May be hidden behind a hamburger menu on mobile.
    *   *Grids/Columns:* Multi-column layouts (e.g., on Dashboard, Booking Detail) will stack vertically on smaller screens.
    *   *Tables:* On mobile, tables might become horizontally scrollable, transform into a card-based list view (each row becomes a card), or hide less critical columns behind an expandable element.
    *   *Modals/Drawers:* May become full-screen or have adjusted dimensions on mobile.
    *   *Spacing/Typography:* May use slightly adjusted spacing and typography scales for smaller screens to optimize readability.
*   **Touch Targets:** Ensure buttons and interactive elements have adequate size and spacing for touch interaction on mobile and tablet (minimum 44x44px recommended).

### Accessibility (WCAG 2.1 Level AA Checklist)

Adherence to WCAG 2.1 AA guidelines is a core requirement.

*   **Perceivable:**
    *   **1.1 Text Alternatives:** All non-text content (icons without text, images, charts) must have appropriate text alternatives (`alt` text, `aria-label`).
    *   **1.3 Adaptable:** Use semantic HTML structure (headings, lists, landmarks like `<nav>`, `<main>`, `<aside>`) so content can be presented in different ways (e.g., by screen readers) without losing information.
    *   **1.4 Distinguishable:**
        *   **1.4.1 Use of Color:** Color should not be the *only* means of conveying information (e.g., use icons or text alongside color for status indicators).
        *   **1.4.3 Contrast (Minimum):** Text and interactive elements must have a contrast ratio of at least 4.5:1 against their background (3:1 for large text - 18pt/24px regular or 14pt/19px bold).
        *   **1.4.11 Non-text Contrast:** Visual boundaries of UI components (inputs, buttons) and state indicators (focus, hover) must have a contrast ratio of at least 3:1 against adjacent colors.
*   **Operable:**
    *   **2.1 Keyboard Accessible:** All functionality must be operable via keyboard alone. No keyboard traps.
    *   **2.4 Navigable:**
        *   **2.4.3 Focus Order:** Focus order must be logical and predictable.
        *   **2.4.4 Link Purpose (In Context):** The purpose of each link should be clear from its text or surrounding context.
        *   **2.4.6 Headings and Labels:** Use clear and descriptive headings and labels for sections and form controls.
        *   **2.4.7 Focus Visible:** Keyboard focus indicator must be clearly visible (as defined in Design System).
*   **Understandable:**
    *   **3.1 Readable:** Language of the page should be identifiable (`lang` attribute).
    *   **3.2 Predictable:** Navigation and components should behave consistently across the application.
    *   **3.3 Input Assistance:**
        *   **3.3.1 Error Identification:** Clearly identify input errors and describe them in text.
        *   **3.3.2 Labels or Instructions:** Provide clear labels and instructions for form inputs.
*   **Robust:**
    *   **4.1 Compatible:** Use valid HTML and ARIA attributes where necessary to ensure compatibility with assistive technologies. Use ARIA roles (`role="button"`, `role="dialog"`) and states (`aria-expanded`, `aria-invalid`) correctly when native HTML elements are insufficient.

**Tools for Checking:**
*   Browser developer tools (Accessibility Tree, Contrast Checkers)
*   Automated tools (e.g., Axe DevTools, Lighthouse)
*   Manual keyboard testing
*   Screen reader testing (e.g., NVDA, VoiceOver, JAWS)




## 7. Usability Testing Plan

To validate the design and identify potential usability issues before launch, a structured usability test will be conducted.

### Objectives

*   Evaluate the ease of use and efficiency of core workflows (booking creation, room management, report generation).
*   Identify any points of confusion, frustration, or friction in the user interface.
*   Assess whether the design meets the needs and expectations of the target personas.
*   Gather qualitative feedback on the overall user experience and visual design.
*   Validate adherence to accessibility best practices through user interaction.

### Participants

*   **Number:** 5-8 participants.
*   **Profile:** Recruit participants who closely match the defined personas:
    *   2-3 Independent Hosts (Alex Nguyen type)
    *   2-3 Customer Service / Front Desk staff (Linh Tran type)
    *   1-2 Accountants or Managers responsible for finance (Minh Le type)
*   **Screening:** Use a screener questionnaire to ensure participants have relevant experience with property management (even if using other systems or manual methods) and fit the tech savviness profile.

### Methodology

*   **Format:** Moderated remote usability testing sessions (using video conferencing tools with screen sharing).
*   **Moderator Role:** Guide the participant through tasks, encourage think-aloud protocol, observe behavior, ask probing questions, and record the session (with permission).
*   **Duration:** Approximately 45-60 minutes per session.

### Test Scenarios & Tasks

Participants will be asked to complete the following tasks using a high-fidelity prototype or a staging version of the application:

1.  **(Host/CSKH) Find Availability & Create a Booking:** "A guest calls wanting to book a Deluxe Ocean View room for 3 nights starting next Tuesday. Check if it's available and create the booking for them."
2.  **(Host/CSKH) Modify an Existing Booking:** "The guest from the previous booking (Alice Wonderland) now wants to add an extra night to their stay. Find their booking and update the check-out date."
3.  **(Host/CSKH) Manage Room Status:** "Room 101 has just checked out and needs cleaning. Update the status of Room 101 to 'Dirty' or 'Needs Cleaning'. Later, imagine housekeeping has finished; update it to 'Clean'."
4.  **(Accountant/Host) View Payment Information:** "Find the total payment received for Alice Wonderland's booking."
5.  **(Accountant/Host) Generate a Performance Report:** "You need to see how well the property performed last month. Generate a monthly occupancy or revenue report for last month."

### Key Performance Indicators (KPIs)

*   **Task Success Rate:** Percentage of participants who successfully complete each task (Target: ≥ 95%).
*   **Time on Task:** Average time taken to complete each task (Target: ≤ 30-45 seconds for simple tasks like status updates, longer for booking/reporting).
*   **Error Rate:** Number and severity of errors encountered per task.
*   **System Usability Scale (SUS):** Post-test questionnaire to measure overall perceived usability (Target Score: > 75-80).
*   **Qualitative Feedback:** Observations, comments, satisfaction ratings.

### Feedback Collection Templates

**A. Observation Notes Template (Per Participant/Task):**

```markdown
**Participant:** [Participant ID/Name]
**Persona Type:** [Host/CSKH/Accountant]
**Date:** [Date]
**Moderator:** [Name]

**Task:** [Task Number & Description]

**Observations:**
*   Path taken:
*   Hesitations / Points of confusion:
*   Errors made:
*   Verbal feedback (Think-aloud quotes):
*   Non-verbal cues (if visible):
*   Assistance required:

**Task Completion:** [Success / Success with Difficulty / Failure]
**Time Taken:** [MM:SS]
**Subjective Rating (1-5, 5=Easy):** [Participant's rating]
**Additional Notes/Quotes:**
```

**B. Post-Test Questionnaire Snippets:**

*   System Usability Scale (SUS) questions.
*   "What did you like most about the system?"
*   "What did you find most frustrating or difficult?"
*   "If you could change one thing, what would it be?"
*   "How would you rate the overall ease of use? (1=Very Difficult, 5=Very Easy)"
*   "How visually appealing did you find the design? (1=Not at all, 5=Very Appealing)"

### Usability Test Report Template Outline

1.  **Executive Summary:** Key findings, overall usability score, top recommendations.
2.  **Introduction:** Background, goals of the test, dates conducted.
3.  **Methodology:** Participants (demographics, personas), tasks, procedure, KPIs.
4.  **Findings (Quantitative):** Task success rates, time on task, error rates, SUS score.
5.  **Findings (Qualitative - Organized by Theme/Task):**
    *   Detailed observations for each task.
    *   Common usability issues identified (with severity rating).
    *   Positive feedback highlights.
    *   Direct quotes from participants.
6.  **Recommendations:** Actionable suggestions for design improvements, prioritized by severity/impact.
7.  **Appendix:** Raw data, observation notes, questionnaire responses (anonymized).

