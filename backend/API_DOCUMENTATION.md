# API Documentation — Project Management System

**Base URL:** `http://localhost:4000/api/v1`  
**Authentication:** Bearer Token (JWT) — include in header: `Authorization: Bearer <token>`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User](#2-user)
3. [Project](#3-project)
4. [Task](#4-task)
5. [Common Error Responses](#5-common-error-responses)

---

## 1. Authentication

Base path: `/api/v1/login`

---

### 1.1 Sign Up

**`POST /api/v1/login/sign_up`**

> 🔓 Public — No authentication required.

**Request Body:**
```json
{
  "name": "Ahmed Essam",
  "email": "ahmed@example.com",
  "username": "ahmed123",
  "phone": "01012345678",
  "password": "mypassword",
  "bio": "optional",
  "profile_picture": "optional URL"
}
```

**Required fields:** `name`, `email`, `password`, `username`, `phone`

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `201 Created` | User created successfully | `{ status: "success", message: "User created successfully", data: { id, name, email, username, phone, bio, profile_picture, createdAt, updatedAt } }` |
| `400 Bad Request` | Any required field is missing | `{ status: "Error", data: { message: "All fields are required" } }` |
| `400 Bad Request` | Email format is invalid | `{ status: "Error", data: { message: "Email format is not valid" } }` |
| `400 Bad Request` | Email already registered | `{ status: "Error", data: { message: "email already exists" } }` |
| `400 Bad Request` | Phone already registered | `{ status: "Error", data: { message: "phone already exists" } }` |
| `400 Bad Request` | Username already taken | `{ status: "Error", data: { message: "username already exists" } }` |

---

### 1.2 Login

**`POST /api/v1/login/`**

> 🔓 Public — No authentication required.

**Request Body:**
```json
{
  "identifier": "ahmed@example.com",
  "password": "mypassword"
}
```

`identifier` can be an email, phone number, or username.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `201 Created` | Login successful | `{ status: "success", message: "User logged in successfully", token: "<JWT>", data: { id, name, email, username, phone, bio, profile_picture } }` |
| `401 Unauthorized` | User not found with given identifier | `{ status: "error", message: "Invalid credentials", data: { message: "Invalid credentials" } }` |
| `401 Unauthorized` | Password is incorrect | `{ status: "error", message: "Invalid credentials", data: { message: "Invalid credentials" } }` |

---

### 1.3 Get Current User (Me)

**`GET /api/v1/login/me`**

> 🔒 Requires authentication.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Token valid and user found | `{ status: "success", message: "User found successfully", data: { id, name, email, username, phone, bio, profile_picture } }` |
| `404 Not Found` | Authenticated user ID not found in DB | `{ status: "error", message: "User not found", data: { message: "User not found" } }` |
| `401 Unauthorized` | No token provided | `{ status: "Error", data: { message: "Token required" } }` |
| `401 Unauthorized` | Token is malformed/invalid | `{ status: "Error", data: { message: "Invalid token" } }` |
| `401 Unauthorized` | Token has expired | `{ status: "Error", data: { message: "Token expired" } }` |

---

### 1.4 Forget Password — Step 1 (Request OTP)

**`POST /api/v1/login/forget_password/:email`**

> 🔓 Public — No authentication required.

**URL Params:** `email` — the registered email address.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | OTP sent successfully | `{ status: "success", message: "If an account exists with this email, you will receive a password reset OTP", data: { message: "Check your email", email } }` |
| `200 OK` | Email not found (intentionally vague for security) | `{ status: "success", message: "If an account exists with this email, you will receive a password reset OTP", data: { message: "Check your email" } }` |
| `400 Bad Request` | Email format is invalid | `{ status: "error", message: "Valid email is required" }` |
| `429 Too Many Requests` | OTP already active for this user | `{ status: "error", message: "Please wait before requesting another reset code", data: { retryAfter: "15 minutes" } }` |
| `500 Internal Server Error` | Email service failed | `{ status: "error", message: "Failed to process password reset request. Please try again later." }` |

---

### 1.5 Forget Password — Step 2 (Verify OTP)

**`PATCH /api/v1/login/otp`**

> 🔓 Public — No authentication required.

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "otp": "123456"
}
```

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | OTP is valid and confirmed | `{ status: "success", message: "OTP verified. You can now reset your password.", data: { email } }` |
| `400 Bad Request` | Missing email or OTP | `{ status: "error", message: "Email and OTP are required" }` |
| `400 Bad Request` | OTP is invalid or expired | `{ status: "error", message: "Invalid or expired OTP. Please request a new one." }` |
| `404 Not Found` | Email not found | `{ status: "error", message: "User not found" }` |

---

### 1.6 Forget Password — Step 3 (Reset Password)

**`PATCH /api/v1/login/reset_password`**

> 🔓 Public — No authentication required.

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "newPassword": "mynewpassword"
}
```

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Password reset successfully | `{ status: "success", message: "Password reset successfully. You can now login with your new password.", data: { email } }` |
| `400 Bad Request` | Missing email or new password | `{ status: "error", message: "Email and new password are required" }` |
| `400 Bad Request` | OTP was not verified first | `{ status: "error", message: "OTP not verified. Please verify your OTP first." }` |
| `404 Not Found` | Email not found | `{ status: "error", message: "User not found" }` |

---

## 2. User

Base path: `/api/v1/user`

> 🔒 All endpoints (except `view_profile`) require authentication.

---

### 2.1 Edit Profile

**`PATCH /api/v1/user/edit_profile`**

> 🔒 Requires authentication.

**Request Body** (all optional):
```json
{
  "name": "New Name",
  "username": "new_username",
  "phone": "01098765432",
  "bio": "Updated bio",
  "profile_picture": "https://..."
}
```

> ⚠️ Email and password cannot be changed through this endpoint.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Profile updated successfully | `{ success: true, message: "User updated successfully", data: { id, username, email, phone, profile_picture, bio, createdAt, updatedAt } }` |
| `400 Bad Request` | Username is already taken by another user | `{ status: "Error", data: { message: "Username already exists" } }` |
| `400 Bad Request` | Phone is already taken by another user | `{ status: "Error", data: { message: "Phone already exists" } }` |
| `404 Not Found` | Authenticated user not found in DB | `{ status: "Error", data: { message: "User not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 2.2 Create Project

**`POST /api/v1/user/create_project`**

> 🔒 Requires authentication.

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "start_date": "2026-04-01T00:00:00.000Z",
  "end_date": "2026-05-01T00:00:00.000Z"
}
```

> `start_date` defaults to now. `end_date` defaults to start_date + 14 days if not provided. The authenticated user automatically becomes the project owner (admin).

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Project created successfully | `{ success: true, message: "Project created successfully", data: { project object } }` |
| `400 Bad Request` | `start_date` is after `end_date` | `{ status: "error", message: "Invalid dates" }` |
| `404 Not Found` | Authenticated user not found in DB | `{ status: "Error", data: { message: "User not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 2.3 Enter Project Using Code

**`POST /api/v1/user/enter_project/:id`**

> 🔒 Requires authentication.

**URL Params:** `id` — the project ID to join.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Join request submitted (status: pending) | `{ success: true, message: "Project assigned successfully", data: { assigned record } }` |
| `403 Forbidden` | User is already a member or has a pending request | `{ status: "Error", data: { message: "You are already assigned or pending to this project" } }` |
| `404 Not Found` | Project not found | `{ status: "error", message: "Project not found" }` |
| `404 Not Found` | Authenticated user not found in DB | `{ status: "Error", data: { message: "User not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 2.4 Delete Account

**`DELETE /api/v1/user/delete_user`**

> 🔒 Requires authentication.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | User deleted successfully | `{ success: true, message: "User deleted successfully" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 2.5 View Profile

**`GET /api/v1/user/view_profile/:id`**

> 🔓 Public — No authentication required.

**URL Params:** `id` — the user's ID.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | User found | `{ success: true, message: "User found successfully", data: { user object } }` |
| `404 Not Found` | User with given ID does not exist | `{ success: false, message: "User not found" }` |

---

## 3. Project

Base path: `/api/v1/project`

> 🔒 All endpoints require authentication.

---

### 3.1 Get All Projects

**`GET /api/v1/project/get_all_projects`**

> 🔒 Requires authentication.

Returns the current user's projects grouped by their role.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Projects fetched | `{ status: "success", message: "Projects fetched successfully", data: { ownedProjects: [...], assignedProjects: [...], pendingProjects: [...] } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 3.2 Get Project By ID

**`GET /api/v1/project/:id`**

> 🔒 Requires authentication. User must be a member (not pending) of the project.

**URL Params:** `id` — the project ID.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Project found | `{ status: "success", message: "Project fetched successfully", data: { project: { ... }, owner: { name, email } } }` |
| `403 Forbidden` | User is not a member (or still pending) | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 3.3 Update Project

**`PATCH /api/v1/project/:id`**

> 🔒 Requires authentication. User must be the **project owner (admin)**.

**URL Params:** `id` — the project ID.

**Request Body** (all optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "start_date": "2026-04-01T00:00:00.000Z",
  "end_date": "2026-06-01T00:00:00.000Z"
}
```

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Project updated | `{ status: "success", message: "Project updated successfully", data: { project: { ... } } }` |
| `400 Bad Request` | `start_date` or `end_date` is not a valid date | `{ status: "error", message: "Invalid date format. Use ISO 8601 (e.g., 2026-05-20T10:30:00.000Z)" }` |
| `400 Bad Request` | `start_date` is after `end_date` | `{ status: "error", message: "Invalid date range: start_date must be before or equal to end_date" }` |
| `403 Forbidden` | User is not the admin of this project | `{ status: "Error", data: { message: "You are not the owner of this project" } }` |
| `403 Forbidden` | User is not a member of this project at all | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 3.4 Delete Project

**`DELETE /api/v1/project/:id`**

> 🔒 Requires authentication. User must be the **project owner (admin)**.

**URL Params:** `id` — the project ID.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Project deleted | `{ status: "success", message: "Project deleted successfully" }` |
| `403 Forbidden` | User is not the admin of this project | `{ status: "Error", data: { message: "You are not the owner of this project" } }` |
| `403 Forbidden` | User is not a member of this project at all | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 3.5 Get All Members

**`GET /api/v1/project/members/:id`**

> 🔒 Requires authentication. User must be a member (not pending).

**URL Params:** `id` — the project ID.

> **Note:** If the requester is **admin**, all members including pending users are returned. If the requester is a regular **member**, only confirmed members are returned.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Members fetched | `{ status: "success", message: "Members fetched successfully", data: [ ...members ] }` |
| `403 Forbidden` | User is not a member (or still pending) | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 3.6 Accept Join Request

**`PATCH /api/v1/project/request/:id/:userId`**

> 🔒 Requires authentication. User must be the **project owner (admin)**.

**URL Params:**
- `id` — the project ID
- `userId` — the ID of the user whose pending request to accept

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Request accepted, user is now a member | `{ status: "success", message: "Request accepted successfully", data: { updated assigned record } }` |
| `403 Forbidden` | Target user's status is not `pending` | `{ status: "Error", data: { message: "this user is not pending for this project" } }` |
| `403 Forbidden` | Requester is not the admin of this project | `{ status: "Error", data: { message: "You are not the owner of this project" } }` |
| `403 Forbidden` | Requester is not a member of this project at all | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 3.7 Remove Member

**`DELETE /api/v1/project/request/:id/:userId`**

> 🔒 Requires authentication. User must be the **project owner (admin)**.

**URL Params:**
- `id` — the project ID
- `userId` — the ID of the user to remove

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Member removed successfully | `{ status: "success", message: "Member removed successfully" }` |
| `404 Not Found` | Target user is not in this project | `{ status: "error", message: "User not in this project" }` |
| `403 Forbidden` | Requester is not the admin of this project | `{ status: "Error", data: { message: "You are not the owner of this project" } }` |
| `403 Forbidden` | Requester is not a member of this project at all | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 3.8 Exit Project

**`DELETE /api/v1/project/members/:id`**

> 🔒 Requires authentication. User must be a member (not pending).

**URL Params:** `id` — the project ID.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | User exited project successfully | `{ status: "success", message: "Member exited project successfully" }` |
| `403 Forbidden` | Admin cannot exit their own project | `{ status: "error", message: "Admin cannot exit project" }` |
| `403 Forbidden` | User is not a member (or still pending) | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

## 4. Task

Base path: `/api/v1/task`

> 🔒 All endpoints require authentication.

---

### 4.1 Create Task

**`POST /api/v1/task/create_task`**

> 🔒 Requires authentication. User must be the **project owner (admin)** of the given project.

**Request Body:**
```json
{
  "name": "Task title",
  "description": "Task description",
  "due_date": "2026-04-15T10:00:00.000Z",
  "project_id": "uuid-of-project"
}
```

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `201 Created` | Task created successfully | `{ success: true, message: "Task created successfully", data: { task object } }` |
| `400 Bad Request` | Missing `name`, `description`, `due_date`, or `project_id` | `{ status: "Error", data: { message: "All fields are required" } }` |
| `400 Bad Request` | `due_date` is in the past | `{ status: "Error", data: { message: "Due date is in the past" } }` |
| `400 Bad Request` | `due_date` is after project end date | `{ status: "Error", data: { message: "Due date is greater than project end date" } }` |
| `400 Bad Request` | `due_date` is before project start date | `{ status: "Error", data: { message: "Due date is less than project start date" } }` |
| `403 Forbidden` | User is not the owner of the project | `{ status: "Error", data: { message: "You are not authorized to create task in this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "Error", data: { message: "Project not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 4.2 Get All Tasks by Project

**`GET /api/v1/task/get_all_tasks/:id`**

> 🔒 Requires authentication. User must be a **member (not pending)** of the project.

**URL Params:** `id` — the project ID.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Tasks fetched | `{ success: true, message: "Tasks fetched successfully", data: [ ...tasks ] }` |
| `403 Forbidden` | User is not a member (or still pending) | `{ status: "Error", data: { message: "You are not assigned or pending to this project" } }` |
| `404 Not Found` | Project does not exist | `{ status: "error", message: "Project not found" }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 4.3 Get My Tasks

**`GET /api/v1/task/get_my_tasks`**

> 🔒 Requires authentication.

Returns the authenticated user's tasks grouped by status.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Tasks fetched | `{ success: true, message: "Tasks fetched successfully", data: { inProgressTasks: [...], completedTasks: [...] } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 4.4 Get Task By ID

**`GET /api/v1/task/:id`**

> 🔒 Requires authentication. User must be a **member (not pending)** of the task's project.

**URL Params:** `id` — the task ID.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task found | `{ success: true, message: "Task fetched successfully", data: { task object } }` |
| `403 Forbidden` | User is not a member of the task's project (or still pending) | `{ status: "Error", data: { message: "You are not authorized to view this task" } }` |
| `404 Not Found` | Task not found | `{ status: "Error", data: { message: "Task not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 4.5 Update Task

**`PATCH /api/v1/task/:id`**

> 🔒 Requires authentication. User must be the **project admin (owner of task)**.

**URL Params:** `id` — the task ID.

**Request Body** (all optional):
```json
{
  "name": "Updated task name",
  "description": "Updated description",
  "due_date": "2026-05-01T10:00:00.000Z"
}
```

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task updated | `{ success: true, message: "Task updated successfully", data: { task object } }` |
| `400 Bad Request` | `due_date` is in the past | `{ status: "Error", data: { message: "Due date is in the past" } }` |
| `400 Bad Request` | `due_date` is after project end date | `{ status: "Error", data: { message: "Due date is greater than project end date" } }` |
| `400 Bad Request` | `due_date` is before project start date | `{ status: "Error", data: { message: "Due date is less than project start date" } }` |
| `403 Forbidden` | User is not the admin (owner) of the task's project | `{ status: "Error", data: { message: "You are not the owner of this task" } }` |
| `403 Forbidden` | User is not a member of the task's project (or pending) | `{ status: "Error", data: { message: "You are not authorized to view this task" } }` |
| `404 Not Found` | Task not found | `{ status: "Error", data: { message: "Task not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 4.6 Delete Task

**`DELETE /api/v1/task/:id`**

> 🔒 Requires authentication. User must be the **project admin (owner of task)**.

**URL Params:** `id` — the task ID.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task deleted | `{ success: true, message: "Task deleted successfully" }` |
| `403 Forbidden` | User is not the admin (owner) of the task's project | `{ status: "Error", data: { message: "You are not the owner of this task" } }` |
| `403 Forbidden` | User is not a member of the task's project (or pending) | `{ status: "Error", data: { message: "You are not authorized to view this task" } }` |
| `404 Not Found` | Task not found | `{ status: "Error", data: { message: "Task not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 4.7 Assign Task

**`PATCH /api/v1/task/assign_task/:id/:user_id`**

> 🔒 Requires authentication. User must be the **project admin (owner of task)**.

**URL Params:**
- `id` — the task ID
- `user_id` — the ID of the user to assign

> Assigning a task automatically sets its status to `in-progress`.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task assigned successfully | `{ success: true, message: "Task assigned successfully", data: { task object } }` |
| `403 Forbidden` | Target user is not an active member of the project (not found or pending) | `{ status: "Error", data: { message: "can't assign task to this user" } }` |
| `403 Forbidden` | Requester is not the admin of the task's project | `{ status: "Error", data: { message: "You are not the owner of this task" } }` |
| `403 Forbidden` | Requester is not a member of the task's project (or pending) | `{ status: "Error", data: { message: "You are not authorized to view this task" } }` |
| `404 Not Found` | Target user not found | `{ status: "Error", data: { message: "User not found" } }` |
| `404 Not Found` | Task not found | `{ status: "Error", data: { message: "Task not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

### 4.8 Mark Task as Done

**`PATCH /api/v1/task/mark_as_done/:id`**

> 🔒 Requires authentication. User must be the **project admin** OR the **user assigned to the task**.

**URL Params:** `id` — the task ID.

> Sets the task status to `finished`.

#### Possible Responses

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task marked as done | `{ success: true, message: "Task marked as done successfully", data: { task object } }` |
| `403 Forbidden` | User is not the admin and is not the assigned user | `{ status: "Error", data: { message: "You are not authorized to edit this task" } }` |
| `403 Forbidden` | User is not a member of the task's project (or pending) | `{ status: "Error", data: { message: "You are not authorized to view this task" } }` |
| `404 Not Found` | Task not found | `{ status: "Error", data: { message: "Task not found" } }` |
| `401 Unauthorized` | No/invalid/expired token | *(See common auth errors)* |

---

## 5. Common Error Responses

### Authentication Errors (applied to all 🔒 endpoints)

| Status | Condition | Body |
|--------|-----------|------|
| `401 Unauthorized` | No `Authorization` header or not Bearer format | `{ status: "Error", data: { message: "Token required" } }` |
| `401 Unauthorized` | Token is malformed or signature invalid | `{ status: "Error", data: { message: "Invalid token" } }` |
| `401 Unauthorized` | Token payload has no user ID | `{ status: "Error", data: { message: "Invalid token payload" } }` |
| `401 Unauthorized` | Token has expired | `{ status: "Error", data: { message: "Token expired" } }` |
| `401 Unauthorized` | Generic authentication failure | `{ status: "Error", data: { message: "Authentication failed" } }` |

### Server / Validation Errors

| Status | Condition | Body |
|--------|-----------|------|
| `400 Bad Request` | Sequelize validation error (e.g., invalid email in DB model) | `{ status: "Error", data: { message: "Invalid email format" } }` |
| `500 Internal Server Error` | Unhandled server-side exception | Varies — passed through global error handler |

---

## Appendix — User Roles in Projects

| Role | Capabilities |
|------|-------------|
| `admin` | Owner of the project. Can update/delete project, manage members, create/assign/delete tasks |
| `member` | Active project member. Can view project, view tasks, mark assigned tasks as done |
| `pending` | Has requested to join. Cannot access project resources until accepted by admin |

---

## Appendix — Task Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Task created but not yet assigned |
| `in-progress` | Task has been assigned to a user |
| `finished` | Task has been marked as done |
