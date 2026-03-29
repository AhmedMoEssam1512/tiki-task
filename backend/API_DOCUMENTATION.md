# API Documentation — Tiki Task Backend

**Base URL:** `http://localhost:4000/api/v1`  
**Authentication:** Bearer Token (JWT) — include in header: `Authorization: Bearer <token>`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User](#2-user)
3. [Project](#3-project)
4. [Task](#4-task)

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
  "bio": "Software Developer", // Optional
  "profile_picture": "https://example.com/pic.jpg" // Optional
}
```

#### Outcomes

**1. Success: User Created**
- **Status Codes:** `201 Created`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "User created successfully",
    "data": {
      "id": 1,
      "name": "Ahmed Essam",
      "email": "ahmed@example.com",
      "username": "ahmed123",
      "phone": "01012345678",
      "bio": "Software Developer",
      "profile_picture": "https://example.com/pic.jpg",
      "createdAt": "2026-03-22T12:00:00.000Z",
      "updatedAt": "2026-03-22T12:00:00.000Z"
    }
  }
  ```

**2. Problem: Missing Required Fields**
- **Condition:** The request body is missing one or more of the required fields (`name`, `email`, `password`, `username`, `phone`).
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "All fields are required"
    }
  }
  ```

**3. Problem: Invalid Email Format**
- **Condition:** The provided `email` string does not match a valid email format.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "Email format is not valid"
    }
  }
  ```

**4. Problem: Email Already Exists**
- **Condition:** A user with the provided `email` already exists in the database.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "email already exists"
    }
  }
  ```

**5. Problem: Phone Already Exists**
- **Condition:** A user with the provided `phone` already exists in the database.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "phone already exists"
    }
  }
  ```

**6. Problem: Username Already Exists**
- **Condition:** A user with the provided `username` already exists in the database.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "username already exists"
    }
  }
  ```

---

### 1.2 Login

**`POST /api/v1/login/`**

> 🔓 Public — No authentication required.

**Request Body:**
```json
{
  "identifier": "ahmed@example.com", // Can be email, phone, or username
  "password": "mypassword"
}
```

#### Outcomes

**1. Success: Logged In**
- **Status Code:** `201 Created`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "User logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "data": {
      "id": 1,
      "name": "Ahmed Essam",
      "email": "ahmed@example.com",
      "username": "ahmed123",
      "phone": "01012345678",
      "bio": "Software Developer",
      "profile_picture": "https://example.com/pic.jpg"
    }
  }
  ```

**2. Problem: Invalid Identifier**
- **Condition:** No user could be found matching the provided `identifier` (email, phone, or username).
- **Status Code:** `401 Unauthorized`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Invalid credentials",
    "data": {
      "message": "Invalid credentials"
    }
  }
  ```

**3. Problem: Invalid Password**
- **Condition:** A user was found, but the provided `password` does not match the hashed password in the database.
- **Status Code:** `401 Unauthorized`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Invalid credentials",
    "data": {
      "message": "Invalid credentials"
    }
  }
  ```

---

### 1.3 Get Current User (Me)

**`GET /api/v1/login/me`**

> 🔒 Requires authentication.

**Request:** No body. Requires `Authorization: Bearer <token>` header.

#### Outcomes

**1. Success: User Found**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "User found successfully",
    "data": {
      "id": 1,
      "name": "Ahmed Essam",
      "email": "ahmed@example.com",
      "username": "ahmed123",
      "phone": "01012345678",
      "bio": "Software Developer",
      "profile_picture": "https://example.com/pic.jpg"
    }
  }
  ```

**2. Problem: User Not Found**
- **Condition:** The token is valid, but the user ID decoded from the token no longer exists in the database.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "User not found",
    "data": {
      "message": "User not found"
    }
  }
  ```

*(Also applies common Authentication errors, see section 5).*

---

### 1.4 Forget Password — Step 1 (Request OTP)

**`POST /api/v1/login/forget_password/:email`**

> 🔓 Public — No authentication required.

**Request Parameters:**
- Path parameter `email`: The email address of the account.

#### Outcomes

**1. Success: OTP Sent**
- **Condition:** A user with the email exists, and an OTP email was successfully sent.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "If an account exists with this email, you will receive a password reset OTP",
    "data": {
      "message": "Check your email",
      "email": "ahmed@example.com"
    }
  }
  ```

**2. Success: User Not Found (Security Vague Response)**
- **Condition:** No user exists with the provided email. The API returns success to prevent email enumeration.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "If an account exists with this email, you will receive a password reset OTP",
    "data": {
      "message": "Check your email"
    }
  }
  ```

**3. Problem: Invalid Email Validation**
- **Condition:** The provided parameter is not a valid email address format.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Valid email is required"
  }
  ```

**4. Problem: Too Many Requests (Rate Limiting)**
- **Condition:** The user already requested an OTP recently and it is still active.
- **Status Code:** `429 Too Many Requests`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Please wait before requesting another reset code",
    "data": {
      "retryAfter": "15 minutes"
    }
  }
  ```

**5. Problem: Email Service Failure**
- **Condition:** The SMTP service failed to send the email.
- **Status Code:** `500 Internal Server Error`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Failed to process password reset request. Please try again later."
  }
  ```

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

#### Outcomes

**1. Success: OTP Verified**
- **Condition:** The OTP matches and hasn't expired.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "OTP verified. You can now reset your password.",
    "data": {
      "email": "ahmed@example.com"
    }
  }
  ```

**2. Problem: Missing Data**
- **Condition:** Either `email` or `otp` was not provided in the request body.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Email and OTP are required"
  }
  ```

**3. Problem: User Not Found**
- **Condition:** The provided email does not exist in the database.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "User not found"
  }
  ```

**4. Problem: Invalid or Expired OTP**
- **Condition:** The provided OTP does not match the stored OTP, or the stored OTP has expired.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Invalid or expired OTP. Please request a new one."
  }
  ```

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

#### Outcomes

**1. Success: Password Reset**
- **Condition:** The user has previously successfully verified their OTP and provided a new password.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Password reset successfully. You can now login with your new password.",
    "data": {
      "email": "ahmed@example.com"
    }
  }
  ```

**2. Problem: Missing Data**
- **Condition:** Either `email` or `newPassword` was not provided in the request body.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Email and new password are required"
  }
  ```

**3. Problem: User Not Found**
- **Condition:** The provided email does not exist in the database.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "User not found"
  }
  ```

**4. Problem: OTP Not Verified First**
- **Condition:** The user is trying to reset the password without successfully passing Step 2 (Verify OTP).
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "OTP not verified. Please verify your OTP first."
  }
  ```

---

### 1.7 Change Password

**`PATCH /api/v1/login/change_password`**

> 🔒 Requires authentication.

**Request Body:**
```json
{
  "oldPassword": "mycurrentpassword",
  "newPassword": "mynewpassword"
}
```

#### Outcomes

**1. Success: Password Changed**
- **Condition:** The token is valid, the user exists, and `oldPassword` matches the current password.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "User found successfully",
    "data": {
      "id": 1,
      "name": "Ahmed Essam",
      "email": "ahmed@example.com",
      "username": "ahmed123",
      "phone": "01012345678",
      "bio": "Software Developer",
      "profile_picture": "https://example.com/pic.jpg"
    }
  }
  ```

**2. Problem: User Not Found**
- **Condition:** The token is valid, but the user ID decoded from it no longer exists in the database.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "User not found",
    "data": {
      "message": "User not found"
    }
  }
  ```

**3. Problem: Incorrect Old Password**
- **Condition:** The provided `oldPassword` does not match the user's current hashed password.
- **Status Code:** `401 Unauthorized`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Invalid credentials",
    "data": {
      "message": "Invalid credentials"
    }
  }
  ```

*(Also applies common Authentication errors, see section 5).*

---

## 2. User

Base path: `/api/v1/user`

---

### 2.1 Edit Profile

**`PATCH /api/v1/user/edit_profile`**

> 🔒 Requires authentication.

**Request Body (All fields optional):**
```json
{
  "name": "Ahmed New Name",
  "username": "ahmed_new",
  "phone": "01099999999",
  "bio": "Updated bio text",
  "profile_picture": "https://example.com/newpic.jpg"
}
```
*(Note: `email` and `password` updates are ignored here).*

#### Outcomes

**1. Success: Profile Updated**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": {
      "id": 1,
      "username": "ahmed_new",
      "email": "ahmed@example.com",
      "phone": "01099999999",
      "profile_picture": "https://example.com/newpic.jpg",
      "bio": "Updated bio text",
      "createdAt": "2026-03-22T12:00:00.000Z",
      "updatedAt": "2026-03-22T18:00:00.000Z"
    }
  }
  ```

**2. Problem: Username Already Taken**
- **Condition:** The provided `username` is already used by another account.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "Username already exists"
    }
  }
  ```

**3. Problem: Phone Already Taken**
- **Condition:** The provided `phone` is already used by another account.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "Phone already exists"
    }
  }
  ```

---

### 2.2 Create Project

**`POST /api/v1/user/create_project`**

> 🔒 Requires authentication.

**Request Body:**
```json
{
  "name": "New Project Name",
  "description": "Project description text",
  "start_date": "2026-04-01T00:00:00.000Z", // Optional, defaults to now
  "end_date": "2026-05-01T00:00:00.000Z" // Optional, defaults to start_date + 14 days
}
```

#### Outcomes

**1. Success: Project Created**
- **Condition:** Valid dates provided. The user making the request becomes the project `owner`.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "id": "uuid-here",
      "name": "New Project Name",
      "description": "Project description text",
      "start_date": "2026-04-01T00:00:00.000Z",
      "end_date": "2026-05-01T00:00:00.000Z",
      "owner_id": 1,
      "updatedAt": "...",
      "createdAt": "..."
    }
  }
  ```

**2. Problem: Invalid Date Range**
- **Condition:** The provided `start_date` is strictly after the `end_date`.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Invalid dates"
  }
  ```

---

### 2.3 Enter Project Using Code

**`POST /api/v1/user/enter_project/:id`**

> 🔒 Requires authentication.

**Request Parameters:**
- Path parameter `id`: The ID of the project the user wants to join.

#### Outcomes

**1. Success: Join Request Submitted (Pending)**
- **Condition:** User is not currently in the project. A request is created with `role: "pending"`.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Project assigned successfully",
    "data": {
      "id": "assignment-uuid",
      "project_id": "project-uuid",
      "user_id": 1,
      "role": "pending",
      "updatedAt": "...",
      "createdAt": "..."
    }
  }
  ```

**2. Problem: Project Not Found**
- **Condition:** No project exists with the provided ID.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Project not found"
  }
  ```

**3. Problem: Already Assigned or Pending**
- **Condition:** The user is already a member of the project or already has a pending join request.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "You are already assigned or pending to this project"
    }
  }
  ```

---

### 2.4 Delete User

**`DELETE /api/v1/user/delete_user`**

> 🔒 Requires authentication.

**Request:** No body.

#### Outcomes

**1. Success: User Deleted**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

---

### 2.5 View Profile

**`GET /api/v1/user/view_profile/:id`**

> 🔓 Public — No authentication required.

**Request Parameters:**
- Path parameter `id`: The ID of the user whose profile you want to view.

#### Outcomes

**1. Success: Profile Fetched**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "User found successfully",
    "data": {
      "id": 2,
      "username": "johndoe",
      "name": "John Doe",
      "bio": "Testing API",
      "profile_picture": null
    }
  }
  ```

**2. Problem: User Not Found**
- **Condition:** No user exists with the given ID.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

## 3. Project

Base path: `/api/v1/project`

> 🔒 All `/project` endpoints require authentication.

---

### 3.1 Get All Projects

**`GET /api/v1/project/get_all_projects`**

> 🔒 Requires authentication.

**Request:** No parameters or body.

#### Outcomes

**1. Success: Projects Fetched**
- **Condition:** Returns projects grouped by the user's role in them.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Projects fetched successfully",
    "data": {
      "ownedProjects": [ { "id": "...", "name": "Project A" } ],
      "assignedProjects": [ { "id": "...", "name": "Project B" } ],
      "pendingProjects": []
    }
  }
  ```

---

### 3.2 Get Project By ID

**`GET /api/v1/project/:id`**

> 🔒 Requires authentication. User must be a member.

**Request Parameters:**
- Path parameter `id`: The project ID.

#### Outcomes

**1. Success: Project Fetched**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Project fetched successfully",
    "data": {
      "project": {
        "id": "uuid-here",
        "name": "My Project",
        "description": "...",
        "start_date": "...",
        "end_date": "...",
        "owner_id": 1
      },
      "owner": {
        "name": "Project Owner",
        "email": "owner@example.com"
      }
    }
  }
  ```

**2. Problem: User Not a Member**
- **Condition:** The user is not assigned to the project or their request is still pending.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "You are not assigned or pending to this project"
    }
  }
  ```

**3. Problem: Project Not Found**
- **Condition:** The project ID does not exist.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Project not found"
  }
  ```

---

### 3.3 Update Project

**`PATCH /api/v1/project/:id`**

> 🔒 Requires authentication. User must be the `admin` (owner).

**Request Parameters:**
- Path parameter `id`: The project ID.

**Request Body (All fields optional):**
```json
{
  "name": "Updated Name",
  "start_date": "2026-04-01T00:00:00.000Z",
  "end_date": "2026-05-01T00:00:00.000Z"
}
```

#### Outcomes

**1. Success: Project Updated**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Project updated successfully",
    "data": {
      "project": {
        "id": "...",
        "name": "Updated Name",
        "start_date": "2026-04-01T00:00:00.000Z",
        "end_date": "2026-05-01T00:00:00.000Z"
      }
    }
  }
  ```

**2. Problem: Bad Date Format**
- **Condition:** `start_date` or `end_date` provided cannot be parsed as a Date.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Invalid date format. Use ISO 8601 (e.g., 2026-05-20T10:30:00.000Z)"
  }
  ```

**3. Problem: Invalid Date Range**
- **Condition:** `start_date` is later than `end_date`.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Invalid date range: start_date must be before or equal to end_date"
  }
  ```

**4. Problem: Not the Owner**
- **Condition:** The authenticated user is a member, but not the admin.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "You are not the owner of this project"
    }
  }
  ```

*(Also returns 404 Project Not found or 403 Not a member — see 3.2)*

---

### 3.4 Delete Project

**`DELETE /api/v1/project/:id`**

> 🔒 Requires authentication. User must be the `admin` (owner).

**Request Parameters:**
- Path parameter `id`: The project ID.

#### Outcomes

**1. Success: Project Deleted**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Project deleted successfully"
  }
  ```

**2. Problem: Not the Owner**
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "You are not the owner of this project"
    }
  }
  ```

*(Also returns 404 Project Not found or 403 Not a member — see 3.2)*

---

### 3.5 Get All Members

**`GET /api/v1/project/members/:id`**

> 🔒 Requires authentication. User must be a member.

**Request Parameters:**
- Path parameter `id`: The project ID.

#### Outcomes

**1. Success: Members Fetched**
- **Condition:** If the requester is an `admin`, this lists ALL assigned users including `pending`. If the requester is a regular `member`, this only lists confirmed members.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Members fetched successfully",
    "data": [
      {
        "id": "assignment-uuid",
        "project_id": "...",
        "user_id": 1,
        "role": "admin"
      },
      {
        "id": "assignment-uuid-2",
        "project_id": "...",
        "user_id": 2,
        "role": "member"
      }
    ]
  }
  ```

*(Also returns 404 Project Not found or 403 Not a member — see 3.2)*

---

### 3.6 Accept Join Request

**`PATCH /api/v1/project/request/:id/:userId`**

> 🔒 Requires authentication. User must be the `admin`.

**Request Parameters:**
- Path parameter `id`: The project ID.
- Path parameter `userId`: The ID of the user whose request to accept.

#### Outcomes

**1. Success: Request Accepted**
- **Condition:** The target user's role is updated from `pending` to `member`.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Request accepted successfully",
    "data": {
      "id": "assignment-uuid",
      "project_id": "...",
      "user_id": 2,
      "role": "member"
    }
  }
  ```

**2. Problem: User Not Pending**
- **Condition:** The target user does not have a "pending" assignment.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "this user is not pending for this project"
    }
  }
  ```

*(Also returns 404 Project Not found or 403 Not Owner — see previous)*

---

### 3.7 Remove Member

**`DELETE /api/v1/project/request/:id/:userId`**

> 🔒 Requires authentication. User must be the `admin`.

**Request Parameters:**
- Path parameter `id`: The project ID.
- Path parameter `userId`: The ID of the user to remove.

#### Outcomes

**1. Success: Member Removed**
- **Condition:** The user's assignment record to this project is deleted.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Member removed successfully"
  }
  ```

**2. Problem: Target User Not in Project**
- **Condition:** The target `userId` does not have an assignment record for this project.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "User not in this project"
  }
  ```

*(Also returns 403 Not Owner — see previous)*

---

### 3.8 Exit Project

**`DELETE /api/v1/project/members/:id`**

> 🔒 Requires authentication. User must be a member.

**Request Parameters:**
- Path parameter `id`: The project ID.

#### Outcomes

**1. Success: Member Exited**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Member exited project successfully"
  }
  ```

**2. Problem: Admin Cannot Exit**
- **Condition:** The requester is the `admin` of the project.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "error",
    "message": "Admin cannot exit project"
  }
  ```

---

## 4. Task

Base path: `/api/v1/task`

> 🔒 All `/task` endpoints require authentication.

---

### 4.1 Create Task

**`POST /api/v1/task/create_task`**

> 🔒 Requires authentication. User must be the `admin` of the project.

**Request Body:**
```json
{
  "name": "Implement Login",
  "description": "Create the backend login mechanism.",
  "due_date": "2026-04-15T10:00:00.000Z",
  "project_id": "project-uuid"
}
```

#### Outcomes

**1. Success: Task Created**
- **Condition:** Valid data provided and date falls within project timeline.
- **Status Code:** `201 Created`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "id": "task-uuid",
      "name": "Implement Login",
      "description": "Create the backend login mechanism.",
      "due_date": "2026-04-15T10:00:00.000Z",
      "project_id": "project-uuid",
      "status": "pending",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
  ```

**2. Problem: Missing Required Fields**
- **Condition:** Request is missing `name`, `description`, `due_date`, or `project_id`.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "All fields are required"
    }
  }
  ```

**3. Problem: Due Date in the Past**
- **Condition:** The `due_date` is earlier than the current time.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "Due date is in the past" }
  }
  ```

**4. Problem: Due Date Exceeds Project End**
- **Condition:** The task `due_date` is after the project's `end_date`.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "Due date is greater than project end date" }
  }
  ```

**5. Problem: Due Date Before Project Start**
- **Condition:** The task `due_date` is before the project's `start_date`.
- **Status Code:** `400 Bad Request`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "Due date is less than project start date" }
  }
  ```

**6. Problem: Not the Owner**
- **Condition:** The user is not the `admin` of the specified project.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "You are not authorized to create task in this project" }
  }
  ```

**7. Problem: Project Not Found**
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "Project not found" }
  }
  ```

---

### 4.2 Get All Tasks by Project

**`GET /api/v1/task/get_all_tasks/:id`**

> 🔒 Requires authentication. User must be a project `member`.

**Request Parameters:**
- Path parameter `id`: The project ID.

#### Outcomes

**1. Success: Tasks Fetched**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Tasks fetched successfully",
    "data": [
      {
        "id": "task-uuid",
        "name": "Implement login",
        "status": "pending",
        "assigned_to": null
      }
    ]
  }
  ```

*(Also returns 404 Project Not found or 403 Not a member — see Section 3)*

---

### 4.3 Get My Tasks

**`GET /api/v1/task/get_my_tasks`**

> 🔒 Requires authentication.

**Request:** No body.

#### Outcomes

**1. Success: Tasks Fetched**
- **Condition:** Returns tasks where the user is assigned, grouped by `in-progress` and `completed` statuses.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Tasks fetched successfully",
    "data": {
      "inProgressTasks": [ { "id": "...", "name": "Task 1", "status": "in-progress" } ],
      "completedTasks": [ { "id": "...", "name": "Task 2", "status": "completed" } ]
    }
  }
  ```

---

### 4.4 Get Task By ID

**`GET /api/v1/task/:id`**

> 🔒 Requires authentication. User must be a member of the task's project.

**Request Parameters:**
- Path parameter `id`: The task ID.

#### Outcomes

**1. Success: Task Found**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task fetched successfully",
    "data": {
      "id": "task-uuid",
      "name": "Task Name",
      ...
    }
  }
  ```

**2. Problem: Task Not Found**
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "Task not found"
    }
  }
  ```

**3. Problem: User Not an Active Member**
- **Condition:** The user is pending or not in the project.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "You are not authorized to view this task"
    }
  }
  ```

---

### 4.5 Update Task

**`PATCH /api/v1/task/:id`**

> 🔒 Requires authentication. User must be the `admin` of the project.

**Request Parameters:**
- Path parameter `id`: The task ID.

**Request Body (All fields optional):**
```json
{
  "name": "Updated Task Topic",
  "description": "New description",
  "due_date": "2026-05-01T10:00:00.000Z"
}
```

#### Outcomes

**1. Success: Task Updated**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": {
      "id": "task-uuid",
      "name": "Updated Task Topic",
      ...
    }
  }
  ```

**2. Problem: Not the Admin**
- **Condition:** Requester is not the owner of the project.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "You are not the owner of this task"
    }
  }
  ```

*(Also applies date validation errors from 4.1 and access errors from 4.4)*

---

### 4.6 Delete Task

**`DELETE /api/v1/task/:id`**

> 🔒 Requires authentication. User must be the `admin` of the project.

**Request Parameters:**
- Path parameter `id`: The task ID.

#### Outcomes

**1. Success: Task Deleted**
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

*(Also applies Not Admin / Task Not Found errors)*

---

### 4.7 Assign Task

**`PATCH /api/v1/task/assign_task/:id/:user_id`**

> 🔒 Requires authentication. User must be the `admin` of the project.

**Request Parameters:**
- Path parameter `id`: The task ID.
- Path parameter `user_id`: The ID of the user to assign.

#### Outcomes

**1. Success: Task Assigned**
- **Condition:** State changes to `in-progress` and user is assigned.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task assigned successfully",
    "data": {
      "id": "task-uuid",
      "assigned_to": 2,
      "status": "in-progress"
      ...
    }
  }
  ```

**2. Problem: Invalid Target User**
- **Condition:** The target `user_id` does not exist in the system.
- **Status Code:** `404 Not Found`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "User not found"
    }
  }
  ```

**3. Problem: Target Not an Active Project Member**
- **Condition:** The target user is not in the project, or their request is still pending.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "can't assign task to this user"
    }
  }
  ```

*(Also applies Not Admin / Task Not Found errors)*

---

### 4.8 Mark Task as Done

**`PATCH /api/v1/task/mark_as_done/:id`**

> 🔒 Requires authentication. User must be the `admin` OR the assigned user.

**Request Parameters:**
- Path parameter `id`: The task ID.

#### Outcomes

**1. Success: Task Finished**
- **Condition:** State changes to `finished`.
- **Status Code:** `200 OK`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task marked as done successfully",
    "data": {
      "id": "task-uuid",
      "status": "finished",
      ...
    }
  }
  ```

**2. Problem: Not Authorized to Edit**
- **Condition:** The requester is a regular member but is **not** the assigned user for this specific task.
- **Status Code:** `403 Forbidden`
- **Response:**
  ```json
  {
    "status": "Error",
    "data": {
      "message": "You are not authorized to edit this task"
    }
  }
  ```

---

## 5. Global Authentication Errors

For any endpoint marked with 🔒, the following `401 Unauthorized` errors may occur during token validation:

**1. Problem: No Token Provided**
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "Token required" }
  }
  ```

**2. Problem: Invalid Format / Signature**
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "Invalid token" }
  }
  ```

**3. Problem: Token Expired**
- **Response:**
  ```json
  {
    "status": "Error",
    "data": { "message": "Token expired" }
  }
  ```
