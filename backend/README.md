# 📋 Tiki Task — Backend

A RESTful API backend for a full-featured project management system. Built with **Node.js**, **Express**, **PostgreSQL**, and **Sequelize ORM**.

📄 **[View Full API Documentation →](./API_DOCUMENTATION.md)**

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure token-based auth with expiration
- 📧 **Password Reset via OTP** — Email-based OTP flow using Nodemailer + Gmail SMTP
- 👤 **User Profiles** — Edit profile, view public profiles, delete account
- 📁 **Project Management** — Create projects, manage members, role-based access
- ✅ **Task Management** — Create, assign, update, and complete tasks
- 🔑 **Role-Based Access Control** — `admin`, `member`, and `pending` roles per project
- 🛡️ **Input Validation** — Middleware-level validation on all endpoints
- 📝 **Structured Logging** — Winston-powered request and error logging

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express v5 |
| Database | PostgreSQL |
| ORM | Sequelize v6 |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Validation | validator.js |
| Logging | Winston |
| Environment | dotenv |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
- [PostgreSQL](https://www.postgresql.org/) running locally or remotely
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP

---

### 1. Clone the Repository

```bash
git clone https://github.com/AhmedMoEssam1512/project-management-system.git
cd project-management-system/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DIALECT=postgres

PORT=4000

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_smtp_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Your App Name
```

### 4. Run the Server

**Development** (with auto-reload via nodemon):
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server starts on `http://localhost:4000` by default.

---

## 📡 API Overview

Base URL: `http://localhost:4000/api/v1`

| Group | Base Path | Description |
|-------|-----------|-------------|
| Auth | `/api/v1/login` | Sign up, login, password reset via OTP |
| User | `/api/v1/user` | Profile management, project creation |
| Project | `/api/v1/project` | Project CRUD, member management |
| Task | `/api/v1/task` | Task CRUD, assignment, completion |

> 📄 See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for the full reference including every endpoint, request body, and all possible responses.

---

## 🔐 Authentication

Protected endpoints require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Obtain a token by calling `POST /api/v1/login/`.

---

## 👥 Role System

Each user has a role **per project**:

| Role | Description |
|------|-------------|
| `admin` | Project creator. Full control — manage members, tasks, and project settings |
| `member` | Active member. Can view project/tasks and mark assigned tasks as done |
| `pending` | Requested to join but not yet accepted by admin |

---

## 🔁 Password Reset Flow

The forget-password feature is a 3-step process:

```
1. POST /api/v1/login/forget_password/:email   → Sends OTP to email
2. PATCH /api/v1/login/otp                     → Verifies OTP
3. PATCH /api/v1/login/reset_password          → Sets new password
```

---

## 📁 Project Structure

```
backend/
├── config/             # Database config and Winston logger
├── controller/         # Route handler logic
│   ├── login_controller.js
│   ├── project_controller.js
│   ├── tasks_controller.js
│   └── user_controller.js
├── middleware/         # Validation and auth middleware
│   ├── auth.js
│   ├── login_middleware.js
│   ├── project_middleware.js
│   ├── task_middleware.js
│   └── user_middleware.js
├── models/             # Sequelize models
│   ├── assigned_model.js
│   ├── project_model.js
│   ├── task_model.js
│   └── user_model.js
├── repo/               # Database access layer (repository pattern)
├── routes/             # Express route definitions
│   ├── login_routes.js
│   ├── project_route.js
│   ├── task_routes.js
│   └── user_routes.js
├── seeders/            # Database seed scripts
├── services/           # Email and OTP services
├── utils/              # App-wide utilities (AppError, asyncwrapper, cache)
├── .env                # Environment variables (not committed)
├── .env.example        # Environment variable template
├── .gitignore
├── API_DOCUMENTATION.md
├── index.js            # App entry point
└── package.json
```

---

## 🌐 Health Check

```
GET /health
```

Returns `200 OK` if the server is running.

---

## 📜 License

ISC
