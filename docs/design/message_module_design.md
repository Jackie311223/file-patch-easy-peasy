# Message Module - Design Specification

## 1. Overview

This document outlines the design for the internal Message Module in PMS Roomrise. This module allows system administrators to send messages (SYSTEM or PRIVATE) to tenants/users and allows users to view their received messages.

## 2. Backend API Design (`/messages`)

### Prisma Schema (`Message` Model Update)

Ensure the `Message` model in `schema.prisma` includes:

```prisma
model Message {
  id          String      @id @default(uuid())
  tenantId    String
  senderId    String?     // User ID of the sender (null for SYSTEM messages)
  recipientId String?     // User ID of the recipient (null for SYSTEM messages sent to all)
  messageType MessageType // SYSTEM | PRIVATE
  content     String      @db.Text
  isRead      Boolean     @default(false)
  createdAt   DateTime    @default(now())

  tenant      Tenant      @relation(fields: [tenantId], references: [id])
  sender      User?       @relation("SentMessages", fields: [senderId], references: [id])
  recipient   User?       @relation("ReceivedMessages", fields: [recipientId], references: [id])

  @@index([tenantId])
  @@index([recipientId])
}

enum MessageType {
  SYSTEM
  PRIVATE
}
```
*(Need to add relations to User model as well)*

### API Endpoints

**Base Path:** `/api/messages`

**Authentication:** Required (JWT)

**Authorization:** Role-based (details below)

#### `GET /`

- **Description:** Get messages for the current user/tenant.
- **Permissions:** All authenticated users.
- **Query Parameters:**
  - `type?: MessageType` (SYSTEM | PRIVATE) - Filter by message type.
  - `isRead?: boolean` - Filter by read status.
  - `limit?: number` (default: 20)
  - `offset?: number` (default: 0)
- **Logic:**
  - Retrieves messages where `tenantId` matches `user.tenantId`.
  - Filters SYSTEM messages (where `recipientId` is null) and PRIVATE messages where `recipientId` matches `user.id`.
  - Applies query parameter filters.
  - Orders by `createdAt` descending.
- **Response:** `200 OK`
  ```json
  {
    "data": [ { "id": "...", "senderId": "...", "messageType": "...", "content": "...", "isRead": false, "createdAt": "..." } ],
    "total": 15
  }
  ```

#### `POST /`

- **Description:** Send a new message.
- **Permissions:** `SUPER_ADMIN`, `ADMIN`.
- **Request Body:** `CreateMessageDto`
  ```json
  {
    "recipientId": "uuid", // Optional: Target user ID for PRIVATE message
    "messageType": "SYSTEM | PRIVATE",
    "content": "Your message content here."
  }
  ```
- **Logic:**
  - `senderId` is set to the current `user.id`.
  - `tenantId` is set to the current `user.tenantId`.
  - If `messageType` is SYSTEM, `recipientId` should be null (sent to all in tenant).
  - If `messageType` is PRIVATE, `recipientId` is required and validated.
- **Response:** `201 Created` - The created `Message` object.

#### `PATCH /:id/read`

- **Description:** Mark a specific message as read.
- **Permissions:** Authenticated user.
- **Path Parameter:** `id` (uuid) - ID of the message.
- **Logic:**
  - Finds the message by `id`.
  - Verifies the message belongs to the user (either SYSTEM message in their tenant or PRIVATE message where `recipientId` matches `user.id`).
  - Sets `isRead` to `true`.
- **Response:** `200 OK` - The updated `Message` object.

### Backend Implementation

- Create `MessagesModule`, `MessagesController`, `MessagesService`.
- Implement CRUD operations using PrismaService.
- Add necessary DTOs (`CreateMessageDto`, `QueryMessagesDto`).
- Implement authorization guards/logic.
- Add `MessagesModule` to `AppModule`.

## 3. Frontend Component Design

### `InboxPage.tsx` (`/pages/Inbox/`)

- **Purpose:** Main page to display the list of messages.
- **State:**
  - `messages`: Array of message objects.
  - `isLoading`, `isError`, `error`: Data fetching states.
  - `filters`: { type: string, isRead: string }.
  - `pagination`: { page: number, limit: number, total: number }.
  - `isSendMessageModalOpen`: Boolean.
- **Functionality:**
  - Uses `useQuery` to fetch messages via `GET /messages` based on filters and pagination.
  - Renders filter controls (All/System/Private, All/Unread/Read).
  - Renders a list of `MessageCard` components.
  - Renders pagination controls.
  - Renders a "Send Message" button (visible to admins) to open `SendMessageModal`.
  - Handles navigation or display logic when a message card is clicked.

### `MessageCard.tsx` (`/pages/Inbox/components/`)

- **Purpose:** Display a single message summary in the list.
- **Props:**
  - `message`: Message object.
  - `onClick`: Function to handle card click.
- **Functionality:**
  - Displays sender info (e.g., "System Message" or sender name if available), message snippet, date.
  - Uses visual cues (e.g., bold text, dot indicator) for unread messages (`!message.isRead`).
  - Calls `onClick` prop when clicked.

### `MessageDetailView.tsx` (Optional - Could be a Drawer/Modal or part of InboxPage)

- **Purpose:** Display the full content of a selected message.
- **Props:**
  - `message`: Message object.
  - `onClose`: Function to close the view.
- **Functionality:**
  - Displays full message content.
  - Automatically calls `PATCH /messages/:id/read` via `useMutation` when the message is viewed (if currently unread).

### `SendMessageModal.tsx` (`/pages/Inbox/components/`)

- **Purpose:** Modal for admins to compose and send messages.
- **Props:**
  - `isOpen`: Boolean.
  - `onClose`: Function.
  - `onSuccess`: Function (called after successful send).
- **State:**
  - Form state (recipient, type, content) managed by `react-hook-form`.
  - `isSubmitting`: Mutation loading state.
- **Functionality:**
  - Form fields:
    - Message Type (Select: SYSTEM/PRIVATE).
    - Recipient (Select/Autocomplete User - shown only if type is PRIVATE).
    - Content (Textarea).
  - Uses `useMutation` to call `POST /messages` on submit.
  - Handles form validation.
  - Displays loading/error states for submission.
  - Calls `onSuccess` and `onClose` on successful submission.

## 4. Data Flow

1.  `InboxPage` fetches messages using `GET /messages`.
2.  Messages are passed to `MessageCard` components for rendering.
3.  Clicking a `MessageCard` triggers showing `MessageDetailView` (or similar).
4.  `MessageDetailView` marks the message as read using `PATCH /messages/:id/read` if needed.
5.  Admin clicks "Send Message" on `InboxPage` to open `SendMessageModal`.
6.  `SendMessageModal` sends the new message using `POST /messages`.
7.  `InboxPage` refetches the message list after a new message is sent successfully (via `onSuccess` callback and query invalidation).

## 5. Next Steps

- Update Prisma schema and run migrations.
- Implement backend API endpoints (Controller, Service, Module).
- Implement frontend components (`InboxPage`, `MessageCard`, `SendMessageModal`, potentially `MessageDetailView`).
- Integrate frontend components with backend API.
- Add tests for backend and frontend.
