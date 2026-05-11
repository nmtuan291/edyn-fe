# Edyn Backend — Complete API Specification

> **Purpose**: This document describes **every feature and API endpoint** across all Edyn backend microservices. It is designed to be consumed by a frontend agent to build a complete client application.

---

## Architecture Overview

```
Frontend  →  API Gateway (Ocelot, port 5057)  →  Microservices
```

All requests go through the **API Gateway**. The gateway rewrites upstream paths to downstream service paths. The frontend should target the gateway base URL.

### Gateway Route Mapping

| Frontend Path Prefix | Downstream Service | Downstream Path Prefix |
|---|---|---|
| `/auth/{...}` | AuthService `:5299` | `/api/account/{...}` |
| `/users/{...}` | UserService `:5161` | `/api/user/{...}` |
| `/forum/{...}` | ForumService `:5220` | `/api/forum/{...}` |
| `/forumthread/{...}` | ForumService `:5220` | `/api/forumthread/{...}` |
| `/feed/{...}` | ForumService `:5220` | `/api/feed/{...}` |
| `/chat/{...}` | ChatService `:5033` | `/api/chat/{...}` |
| `/notifications/{...}` | NotificationService `:5190` | `/api/notification/{...}` |
| `/hubs/chat/{...}` | ChatService `:5033` | `/hubs/chat/{...}` |
| `/hubs/notification/{...}` | NotificationService `:5190` | `/hubs/notification/{...}` |

### Authentication

- **Type**: JWT Bearer Token (RSA-signed)
- **Header**: `Authorization: Bearer <accessToken>`
- Endpoints marked 🔒 require the token. Endpoints marked 🌐 are public.
- The access token contains a `sub` claim (= `ClaimTypes.NameIdentifier`) which is the user's account ID (GUID string), and a `name` claim which is the username.

---

## Enums Reference

These are used across multiple endpoints. The frontend should define matching TypeScript enums or constants.

### ForumRole
```typescript
enum ForumRole {
  Admin = 0,
  SuperModerator = 1,
  Moderator = 2,
  Member = 3
}
```

### ForumPermissionType (Flags — bitwise)
```typescript
enum ForumPermissionType {
  None             = 0,
  ManageForumInfo  = 1,      // 1 << 0
  ManageRoles      = 2,      // 1 << 1
  DeleteForum      = 4,      // 1 << 2
  PinThread        = 8,      // 1 << 3
  LockThread       = 16,     // 1 << 4
  DeleteThread     = 32,     // 1 << 5
  EditAnyThread    = 64,     // 1 << 6
  DeleteComment    = 128,    // 1 << 7
  EditAnyComment   = 256,    // 1 << 8
  BanMember        = 512,    // 1 << 9
  ManageTags       = 1024,   // 1 << 10
  CreateThread     = 2048,   // 1 << 11
  CreateComment    = 4096,   // 1 << 12
  Vote             = 8192,   // 1 << 13
  All              = 16383
}
```

### SortBy
```typescript
enum SortBy {
  Latest = 0,
  Hot = 1,
  Top = 2
}
```

### SortDate
```typescript
enum SortDate {
  Day = 0,
  Month = 1,
  Year = 2,
  All = 3
}
```

### VoteStatus
```typescript
enum VoteStatus {
  UpVote = 1,
  DownVote = -1,
  NoVote = 0
}
```

### Gender
```typescript
// Used in registration and profile
// 0 = Male, 1 = Female, 2 = Other (inferred from usage)
```

---

## Generic Types

### PagedResult\<T\>
```typescript
interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;       // computed: ceil(totalCount / pageSize)
  hasNextPage: boolean;     // page < totalPages
  hasPreviousPage: boolean; // page > 1
}
```

---

# Service 1: AuthService

**Gateway prefix**: `/auth/`

Handles user registration, login, token management, password changes, and session management.

## Feature 1.1: Registration

Register a new user account.

### `POST /auth/register`
🌐 Public

**Request Body:**
```json
{
  "username": "string (3–50 chars, required)",
  "password": "string (6–100 chars, required)",
  "passwordVerify": "string (required, must match password)",
  "email": "string (valid email, required)",
  "gender": 0
}
```

**Success Response:** `200 OK` (empty body)

**Error Response:** `400 Bad Request`
```json
[
  { "code": "DuplicateUserName", "description": "Username 'x' is already taken." }
]
```

---

## Feature 1.2: Login

Authenticate and receive tokens.

### `POST /auth/login`
🌐 Public

**Request Body:**
```json
{
  "username": "string (required — can be username or email)",
  "password": "string (required)",
  "isEmail": false
}
```
> Set `isEmail: true` when the user logs in with their email address instead of username.

**Success Response:** `200 OK`
```json
{
  "id": "guid-string (account ID)",
  "userName": "string",
  "email": "string",
  "accessToken": "jwt-string",
  "refreshToken": "string"
}
```

**Error Response:** `401 Unauthorized`

---

## Feature 1.3: Token Refresh

Get a new access token using an expired token + refresh token.

### `POST /auth/refresh-token`
🌐 Public

**Request Body:**
```json
{
  "expiredToken": "string (the expired JWT, with or without 'Bearer ' prefix)",
  "refreshToken": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "accessToken": "new-jwt-string",
  "refreshToken": "new-refresh-token-string"
}
```

**Error Response:** `401 Unauthorized`

---

## Feature 1.4: Username/Email Availability Check

Check if a username or email is available before registration.

### `GET /auth/verify-email?email={email}`
🌐 Public

**Success (available):** `200 OK` → `true`
**Error (taken):** `400 Bad Request` → `"Email is already in use"`

### `GET /auth/verify-user?username={username}`
🌐 Public

**Success (available):** `200 OK` → `true`
**Error (taken):** `400 Bad Request` → `"Username is already in use"`

---

## Feature 1.5: Logout

Revoke a specific refresh token (current session).

### `POST /auth/logout`
🔒 Requires Auth

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response:** `200 OK`

---

## Feature 1.6: Change Password

Change user password. **Revokes ALL refresh tokens** (logs out all sessions) as a security measure.

### `POST /auth/change-password`
🔒 Requires Auth

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (6–100 chars, required)",
  "newPasswordVerify": "string (required, must match)"
}
```

**Success Response:** `200 OK`

**Error Response:** `400 Bad Request`
```json
[
  { "code": "PasswordMismatch", "description": "Incorrect password." }
]
```

---

## Feature 1.7: Revoke All Sessions

Invalidate all refresh tokens for the current user (global sign-out).

### `POST /auth/revoke-all-sessions`
🔒 Requires Auth

**Request Body:** (empty)

**Success Response:** `200 OK`

---

# Service 2: UserService

**Gateway prefix**: `/users/`

Manages user profiles (display name, avatar, bio, etc.).

## Feature 2.1: Get User Profile

Retrieve any user's public profile by their account ID.

### `GET /users/{accountId}`
🌐 Public

**Response:** `200 OK`
```json
{
  "accountId": "guid-string",
  "userName": "string",
  "birthday": "2000-01-15T00:00:00Z | null",
  "avatar": "string (URL or empty)",
  "bio": "string | null",
  "gender": 0
}
```

**Error:** `404 Not Found`

---

## Feature 2.2: Update Own Profile

Partially update the authenticated user's profile. Only non-null fields are updated.

### `PUT /users/profile`
🔒 Requires Auth

**Request Body (all fields optional):**
```json
{
  "bio": "string | null",
  "avatar": "string | null",
  "birthday": "2000-01-15T00:00:00Z | null",
  "gender": 0
}
```

**Success Response:** `200 OK` → Returns the full updated `UserProfileDto`

**Error:** `404 Not Found` (user doesn't exist)

---

# Service 3: ForumService

**Gateway prefix**: `/forum/` (forum management) and `/forumthread/` (threads & comments) and `/feed/` (home feed)

This is the largest service — handles forums (communities), threads (posts), comments, voting, tags, permissions, and member management.

---

## Feature 3.1: List All Forums

### `GET /forum/`
🌐 Public

**Response:** `200 OK`
```json
[
  {
    "id": "guid",
    "name": "string",
    "creatorId": "guid",
    "shortName": "string",
    "description": "string",
    "forumBanner": "string (URL)",
    "forumImage": "string (URL)",
    "createdAt": "datetime"
  }
]
```

---

## Feature 3.2: Search Forums

### `GET /forum/search?q={query}`
🌐 Public

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | `""` | Search query (searches name and description) |

**Response:** `200 OK` → Array of `ForumDto` (max 20 results)

---

## Feature 3.3: Get Forum by Name

### `GET /forum/{forumName}`
🌐 Public

**Response:** `200 OK` → Single `ForumDto`

**Error:** `404 Not Found`

---

## Feature 3.4: Create Forum

### `POST /forum/`
🔒 Requires Auth

**Request Body:**
```json
{
  "name": "string (required, unique)",
  "shortName": "string (required)",
  "description": "string (required)",
  "forumBanner": "string (URL, required)",
  "forumImage": "string (URL, required)"
}
```

**Success:** `201 Created` → Returns the created `ForumDto`

**Error:** `500` if forum name already exists

---

## Feature 3.5: Join Forum

### `POST /forum/join/{forumId}`
🔒 Requires Auth

**Success:** `200 OK`

---

## Feature 3.6: Leave Forum

### `POST /forum/leave/{forumId}`
🔒 Requires Auth

**Success:** `200 OK`

**Error:** `400 Bad Request` → `"Forum admin cannot leave. Transfer ownership first."`

---

## Feature 3.7: Get Joined Forums

Get all forums the authenticated user has joined.

### `GET /forum/joined`
🔒 Requires Auth

**Response:** `200 OK`
```json
[
  {
    "forumId": "guid",
    "name": "string",
    "forumImage": "string (URL)",
    "role": 3
  }
]
```

---

## Feature 3.8: Get User Permissions in Forum

### `GET /forum/{forumId}/permissions`
🔒 Requires Auth

**Response:** `200 OK`
```json
{
  "userId": "guid",
  "forumId": "guid",
  "role": 3,
  "effectivePermissions": 14336,
  "permissionOverrides": null
}
```
> `effectivePermissions` is a bitwise combination of `ForumPermissionType` flags. Use bitwise AND to check individual permissions.

---

## Feature 3.9: Forum Tags

### `GET /forum/{forumId}/tags`
🌐 Public

**Response:** `200 OK`
```json
[
  { "id": 1, "forumId": "guid", "name": "Discussion", "color": "#ff6600" }
]
```

### `POST /forum/{forumId}/tags`
🔒 Requires Auth (needs `ManageTags` permission)

**Request Body:**
```json
{
  "name": "string (required)",
  "color": "string | null (hex color, e.g. '#ff6600')"
}
```

**Success:** `200 OK` → Returns the created `ForumTagDto`

---

## Feature 3.10: Forum Member Management

### `GET /forum/{forumId}/members`
🔒 Requires Auth

**Response:** `200 OK`
```json
[
  {
    "id": "guid (userId)",
    "username": "string",
    "avatar": "string",
    "bio": "string",
    "birthDay": "datetime",
    "gender": 0,
    "role": 3,
    "effectivePermissions": 14336,
    "permissionOverrides": null
  }
]
```

### `GET /forum/{forumId}/members/{targetUserId}/permissions`
🔒 Requires Auth (needs `ManageRoles` permission, or querying yourself)

**Response:** `200 OK` → `MemberPermissionDto`

### `PUT /forum/{forumId}/members/{targetUserId}/role`
🔒 Requires Auth (needs `ManageRoles` permission)

**Request Body:**
```json
{
  "role": 2
}
```

**Success:** `200 OK`

### `PUT /forum/{forumId}/members/{targetUserId}/permissions`
🔒 Requires Auth (needs `ManageRoles` permission)

**Request Body:**
```json
{
  "permissions": 14336
}
```
> `permissions` is a bitwise combination of `ForumPermissionType` flags.

**Success:** `200 OK`

### `DELETE /forum/{forumId}/members/{targetUserId}`
🔒 Requires Auth (needs permission to ban/remove)

**Success:** `200 OK`

---

## Feature 3.11: List Threads in Forum (Paginated)

### `GET /forumthread/{forumId}?page=1&pageSize=10&sortBy=1&sortDate=3`
🌐 Public (but if authenticated, vote status is included)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number (min 1) |
| `pageSize` | int | `10` | Items per page (1–50) |
| `sortBy` | SortBy | `Hot (1)` | Sorting mode |
| `sortDate` | SortDate | `All (3)` | Time filter (only for `Top` sort) |

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "guid",
      "forumId": "guid",
      "creatorId": "guid",
      "title": "string",
      "isPinned": false,
      "tags": [{ "id": 1, "name": "Discussion", "color": "#ff6600" }],
      "pollItems": [{ "pollContent": "Option A", "voteCount": 5 }],
      "images": ["url1", "url2"],
      "content": "string (post body)",
      "slug": "string (URL-friendly)",
      "upvote": 42,
      "createdAt": "datetime",
      "lastUpdatedAt": "datetime | null",
      "vote": 0,
      "forumName": "string | null",
      "forumImage": "string | null"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 150,
  "totalPages": 15,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## Feature 3.12: Search Threads

### `GET /forumthread/search?q={query}&page=1&pageSize=10`
🌐 Public

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | `""` | Search query (searches title and content) |
| `page` | int | `1` | Page number |
| `pageSize` | int | `10` | Items per page (1–50) |

**Response:** `200 OK` → `PagedResult<ForumThreadDto>` (same shape as Feature 3.11)

---

## Feature 3.13: Get Thread by ID

### `GET /forumthread/thread/{threadId}`
🌐 Public

**Response:** `200 OK` → Single `ForumThreadDto`

**Error:** `404 Not Found`

---

## Feature 3.14: Create Thread

### `POST /forumthread/`
🔒 Requires Auth (needs `CreateThread` permission in the target forum)

**Request Body:**
```json
{
  "forumId": "guid (required)",
  "title": "string (required)",
  "isPinned": false,
  "tags": [{ "id": 1, "name": "Discussion", "color": "#ff6600" }],
  "pollItems": [{ "pollContent": "Option A", "voteCount": 0 }],
  "images": ["url1"],
  "content": "string (required)",
  "slug": "string (required)"
}
```

**Success:** `200 OK` → Returns the created `ForumThreadDto` with generated `id` and `createdAt`

---

## Feature 3.15: Edit Thread

Only the thread owner can edit.

### `PUT /forumthread/thread/{threadId}`
🔒 Requires Auth

**Request Body (all fields optional — only non-null fields are updated):**
```json
{
  "title": "string | null",
  "content": "string | null"
}
```

**Success:** `200 OK` → Returns the updated `ForumThreadDto`

**Error:** `403 Forbidden` (not the owner) | `404 Not Found`

---

## Feature 3.16: Delete Thread

Only the thread owner can delete.

### `DELETE /forumthread/thread/{threadId}`
🔒 Requires Auth

**Success:** `200 OK`

**Error:** `403 Forbidden` (not the owner)

---

## Feature 3.17: Get Comments for Thread

### `GET /forumthread/{threadId}/comments`
🌐 Public (if authenticated, vote status is included)

**Response:** `200 OK`
```json
[
  {
    "id": "guid",
    "threadId": "guid",
    "ownerId": "guid",
    "ownerName": "string",
    "content": "string",
    "upvote": 5,
    "parentId": "guid | null (for nested replies)",
    "childrenComments": [],
    "updatedAt": "datetime | null",
    "createdAt": "datetime",
    "deleted": false,
    "vote": 0
  }
]
```
> Comments are returned in a **tree structure**. Top-level comments have `parentId: null`, and nested replies are inside `childrenComments`.

---

## Feature 3.18: Create Comment

### `POST /forumthread/comment/create`
🔒 Requires Auth (needs `CreateComment` permission)

**Request Body:**
```json
{
  "threadId": "guid (required)",
  "content": "string (required)",
  "upvote": 0,
  "deleted": false,
  "parentId": "guid | null (set to parent comment ID for a reply)"
}
```

**Success:** `200 OK`

---

## Feature 3.19: Edit Comment

Only the comment owner can edit.

### `PUT /forumthread/comment/{commentId}`
🔒 Requires Auth

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Success:** `200 OK` → Returns the updated `CommentDto`

**Error:** `403 Forbidden` (not the owner) | `404 Not Found`

---

## Feature 3.20: Delete Comment

Only the comment owner can delete.

### `DELETE /forumthread/comment/{commentId}`
🔒 Requires Auth

**Success:** `200 OK`

**Error:** `403 Forbidden` (not the owner)

---

## Feature 3.21: Vote on Thread

### `POST /forumthread/thread/vote`
🔒 Requires Auth (needs `Vote` permission)

**Request Body:**
```json
{
  "id": "guid (thread ID)",
  "isDownvote": false
}
```
> Alternative body formats accepted:
> - `{ "threadId": "guid", "isDownvote": true }`
> - `{ "id": "guid", "vote": 1 }` (1 = upvote, -1 = downvote)

**Success:** `200 OK` → Returns the updated `ForumThreadDto` with new `upvote` count and `vote` status

---

## Feature 3.22: Vote on Comment

### `POST /forumthread/comment/vote`
🔒 Requires Auth

**Request Body:**
```json
{
  "id": "guid (comment ID)",
  "isDownvote": false
}
```
> Same alternative formats as thread vote, using `commentId` instead of `threadId`.

**Success:** `200 OK` → Returns the updated `CommentDto`

---

## Feature 3.23: Home Feed

Returns a curated feed of threads. If authenticated, prioritizes threads from forums the user has joined.

### `GET /feed/?page=1&pageSize=20`
🌐 Public (but personalized if authenticated)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number |
| `pageSize` | int | `20` | Items per page (1–50) |

**Response:** `200 OK` → Array of `ForumThreadDto` (includes `forumName` and `forumImage` for each thread)

---

# Service 4: ChatService

**Gateway prefix**: `/chat/` (REST API) and `/hubs/chat/` (SignalR)

Handles direct messaging between users.

## Feature 4.1: Get Conversations

Get all conversations for the authenticated user.

### `GET /chat/conversation`
🔒 Requires Auth

**Response:** `200 OK`
```json
[
  {
    "id": "guid",
    "user1Id": "string (account ID)",
    "user2Id": "string (account ID)",
    "createdAt": "datetime",
    "lastMessageAt": "datetime | null",
    "lastMessageId": "guid | null",
    "lastMessage": { "...MessageDto or null" },
    "messages": []
  }
]
```

---

## Feature 4.2: Get Messages in Conversation

### `GET /chat/conversation/{conversationId}/messages`
🔒 Requires Auth (must be a participant)

**Response:** `200 OK`
```json
[
  {
    "id": "guid",
    "conversationId": "guid",
    "senderId": "string (account ID)",
    "receiverId": "string (account ID)",
    "content": "string",
    "createdAt": "datetime",
    "editedAt": "datetime | null",
    "isDeleted": false,
    "isRead": false,
    "readAt": "datetime | null"
  }
]
```

**Error:** `403 Forbidden` (not a participant)

---

## Feature 4.3: Send Message

### `POST /chat/conversation/add`
🔒 Requires Auth

**Request Body:**
```json
{
  "receiverId": "string (target user account ID, required)",
  "content": "string (required)",
  "conversationId": "guid | null (null for first message — creates conversation)"
}
```

**Success:** `200 OK`

**Error:** `400 Bad Request` → `"Failed to send message"`

---

## Feature 4.4: Real-time Chat (SignalR)

### Hub URL: `/hubs/chat/`
🔒 Requires Auth (pass token as query param: `?access_token=<jwt>`)

**Connection Flow:**
1. Connect to the hub with the JWT token
2. The server auto-starts listening for messages for the authenticated user via RabbitMQ
3. When a new message arrives, the server pushes it to the client

**Server → Client Events:**
| Event | Payload | Description |
|-------|---------|-------------|
| `ReceiveMessage` | `MessageDto` | A new message received in real-time |

> The hub does NOT expose client-callable methods. Messages are sent via the REST API (`POST /chat/conversation/add`), and the server pushes them to connected recipients via SignalR.

---

# Service 5: NotificationService

**Gateway prefix**: `/notifications/` (REST API) and `/hubs/notification/` (SignalR)

Handles push notifications (comment replies, etc.) stored in Redis.

## Feature 5.1: Get Notifications

Get the authenticated user's notifications from the last 10 days.

### `GET /notifications/`
🔒 Requires Auth

**Response:** `200 OK`
```json
[
  {
    "id": "guid",
    "recipientId": "guid",
    "createdAt": "datetime",
    "message": "string (notification text)",
    "isRead": false
  }
]
```

---

## Feature 5.2: Mark Notification as Read

### `POST /notifications/?notificationId={guid}`
🔒 Requires Auth

**Query Parameter:** `notificationId` (GUID)

**Success:** `200 OK`

**Error:** `404 Not Found`

---

## Feature 5.3: Mark All Notifications as Read

### `POST /notifications/mark-all-read`
🔒 Requires Auth

**Response:** `200 OK`
```json
{
  "markedCount": 5
}
```

---

## Feature 5.4: Get Unread Count

### `GET /notifications/unread-count`
🔒 Requires Auth

**Response:** `200 OK`
```json
{
  "unreadCount": 3
}
```

---

## Feature 5.5: Delete Notification

### `DELETE /notifications/{notificationId}`
🔒 Requires Auth

**Success:** `200 OK`

**Error:** `404 Not Found`

---

## Feature 5.6: Real-time Notifications (SignalR)

### Hub URL: `/hubs/notification/`
🔒 Requires Auth (pass token as query param: `?access_token=<jwt>`)

**Connection Flow:**
1. Connect to the hub with the JWT token
2. The server uses the user's ID from the JWT to join them into a user-specific group
3. When a notification is created (e.g., someone replies to the user's comment), the server pushes it in real-time

**Server → Client Events:**
| Event | Payload | Description |
|-------|---------|-------------|
| `ReceiveNotification` | `Notification` object | A new notification pushed in real-time |

---

# Error Handling

All services follow consistent error patterns:

| HTTP Status | Meaning |
|---|---|
| `200 OK` | Success |
| `201 Created` | Resource created (with Location header) |
| `400 Bad Request` | Validation error or business rule violation |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Authenticated but lacks permission |
| `404 Not Found` | Resource doesn't exist |
| `409 Conflict` | Duplicate resource (e.g., duplicate tag name) |
| `500 Internal Server Error` | Unexpected server error |

### Identity Error Format (AuthService)
```json
[
  { "code": "string", "description": "string" }
]
```

### General Error Format (Other services)
```json
"string error message"
```

---

# Token Management Guide

The frontend should implement the following token flow:

1. **Login** → store `accessToken` and `refreshToken` (localStorage or secure cookie)
2. **API calls** → attach `Authorization: Bearer <accessToken>` header
3. **On 401** → call `POST /auth/refresh-token` with the expired access token and refresh token
4. **On refresh success** → update stored tokens, retry the original request
5. **On refresh failure** → redirect to login page
6. **Logout** → call `POST /auth/logout` with the refresh token, then clear stored tokens
7. **Change password** → all sessions are revoked; redirect user to re-login

---

# SignalR Connection Guide

For both hubs (`/hubs/chat/` and `/hubs/notification/`):

```typescript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${GATEWAY_URL}/hubs/notification`, {
    accessTokenFactory: () => getAccessToken()
  })
  .withAutomaticReconnect()
  .build();

// Listen for events
connection.on("ReceiveNotification", (notification) => {
  console.log("New notification:", notification);
});

// Start connection
await connection.start();
```
