# 🏗️ Tiki Task - Project Management System

**Pass tasks. Keep it moving.**

A full-stack project management web application built with React, Node.js, Express, PostgreSQL, and Sequelize.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication

- ✅ User Registration & Login
- ✅ JWT-based Authentication
- ✅ Forgot Password Flow (OTP via Email)
- ✅ Password Reset
- ✅ Protected Routes

### 👤 User Management

- ✅ User Profile (National ID Card design)
- ✅ Edit Profile (Name, Username, Phone, Bio)
- ✅ Profile Picture Upload (Cloudflare R2)
- ✅ View Other Users' Profiles

### 📁 Project Management

- ✅ Create Projects
- ✅ Join Projects (via Project ID)
- ✅ View Projects (Owned, Assigned, Pending)
- ✅ Project Details Page
- ✅ Project Members Management
- ✅ Accept/Reject Join Requests (Owner only)
- ✅ Remove Members (Owner only)
- ✅ Exit Project (Members only)

### ✅ Task Management

- ✅ Create Tasks (Owner only)
- ✅ Assign Tasks to Members
- ✅ Mark Tasks as Done
- ✅ View All Tasks (To-Do List Page)
- ✅ Task Details Modal
- ✅ Filter Tasks by Status

### ⚙️ Settings

- ✅ Edit Profile
- ✅ Change Password
- ✅ Delete Account

### 🎨 UI/UX

- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Sticky Navigation Bar
- ✅ Collapsible Members Sidebar
- ✅ Loading Skeletons
- ✅ Toast Notifications
- ✅ Lucide Icons
- ✅ Color Palette from Official Mockups

---

## 🛠️ Tech Stack

### **Frontend**

- **React** 18.x
- **React Router DOM** 6.x
- **Axios** (HTTP Client)
- **Lucide React** (Icons)
- **React Toastify** (Notifications)
- **CSS3** (Custom Styling)

### **Backend**

- **Node.js** & **Express**
- **PostgreSQL** (Database)
- **Sequelize** (ORM)
- **JWT** (Authentication)
- **Bcrypt.js** (Password Hashing)
- **Nodemailer** (Email Service)
- **Multer** (File Upload)
- **Cloudflare R2** (Image Storage)

---

## 📦 Installation

### **Prerequisites**

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### **1. Clone the Repository**

```bash
git clone <repository-url>
cd project-management-system
```

### **2. Backend Setup**

```bash
cd backend
npm install
```

Create `.env` file in backend folder:

```env
# Server
PORT=4000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tikitask_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Email (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
R2_BUCKET_NAME=tikitask
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_PUBLIC_URL=https://<account_id>.r2.cloudflarestorage.com
```

Start backend:

```bash
npm start
```

### **3. Frontend Setup**

```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:

```env
REACT_APP_API_URL=http://localhost:4000/api/v1
```

Start frontend:

```bash
npm start
```

---

## 🌍 Environment Variables

### **Backend (.env)**

| Variable                | Description                  | Example            |
| ----------------------- | ---------------------------- | ------------------ |
| `PORT`                  | Server port                  | `4000`             |
| `DATABASE_URL`          | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET`            | Secret key for JWT tokens    | `your_secret`      |
| `EMAIL_HOST`            | SMTP host                    | `smtp.gmail.com`   |
| `EMAIL_PORT`            | SMTP port                    | `587`              |
| `EMAIL_USER`            | Email address                | `you@gmail.com`    |
| `EMAIL_PASSWORD`        | Email app password           | `xxxx-xxxx-xxxx`   |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID        | `0a69889...`       |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token         | `vE7K3mN...`       |
| `R2_BUCKET_NAME`        | R2 bucket name               | `tikitask`         |
| `R2_ACCESS_KEY_ID`      | R2 access key                | `...`              |
| `R2_SECRET_ACCESS_KEY`  | R2 secret key                | `...`              |
| `R2_PUBLIC_URL`         | R2 public URL                | `https://...`      |

### **Frontend (.env)**

| Variable            | Description     | Example                        |
| ------------------- | --------------- | ------------------------------ |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:4000/api/v1` |

---

## 📡 API Documentation

### **Base URL**

```
http://localhost:4000/api/v1
```

### **Authentication Endpoints**

```
POST   /login/sign_up              - Register new user
POST   /login/                     - Login
GET    /login/me                   - Get current user
POST   /login/forget_password/:email - Request OTP
PATCH  /login/otp                  - Verify OTP
PATCH  /login/reset_password       - Reset password
```

### **User Endpoints**

```
PATCH  /user/edit_profile          - Update profile
POST   /user/create_project        - Create project
POST   /user/enter_project/:id     - Join project
GET    /user/view_profile/:id      - View user profile
DELETE /user/delete_user           - Delete account
```

### **Project Endpoints**

```
GET    /project/get_all_projects   - Get user's projects
GET    /project/:id                - Get project details
PATCH  /project/:id                - Update project
DELETE /project/:id                - Delete project
GET    /project/members/:id        - Get members
PATCH  /project/request/:id/:userId - Accept request
DELETE /project/request/:id/:userId - Remove member
DELETE /project/members/:id        - Exit project
```

### **Task Endpoints**

```
POST   /task/create_task           - Create task
GET    /task/get_all_tasks/:id     - Get project tasks
GET    /task/get_my_tasks          - Get user's tasks
GET    /task/:id                   - Get task details
PATCH  /task/:id                   - Update task
DELETE /task/:id                   - Delete task
PATCH  /task/assign_task/:id/:user_id - Assign task
PATCH  /task/mark_as_done/:id      - Mark as finished
```

---

## 📁 Project Structure

```
project-management-system/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── logger.js
│   ├── controller/
│   │   ├── login_controller.js
│   │   ├── user_controller.js
│   │   ├── project_controller.js
│   │   └── task_controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── login_middleware.js
│   │   ├── project_middleware.js
│   │   └── task_middleware.js
│   ├── models/
│   │   ├── user_model.js
│   │   ├── project_model.js
│   │   ├── task_model.js
│   │   └── assigned_model.js
│   ├── routes/
│   │   ├── login_routes.js
│   │   ├── user_routes.js
│   │   ├── project_route.js
│   │   ├── task_routes.js
│   │   └── upload_route.js
│   ├── index.js
│   └── .env
│
├── frontend/
│   ├── public/
│   │   ├── favicon.png
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   │       ├── TIKI_TASK_logo.png
│   │   │       └── default_profile_pic.jpg
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Skeleton.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   ├── Signup.js
│   │   │   │   ├── ForgotPassword.js
│   │   │   │   ├── VerifyOTP.js
│   │   │   │   └── ResetPassword.js
│   │   │   ├── profile/
│   │   │   │   ├── MyProfile.js
│   │   │   │   └── OtherUserProfile.js
│   │   │   ├── projects/
│   │   │   │   ├── ProjectsList.js
│   │   │   │   └── ProjectDetails.js
│   │   │   ├── tasks/
│   │   │   │   └── TodoList.js
│   │   │   └── settings/
│   │   │       └── Settings.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── cloudflare.js
│   │   ├── utils/
│   │   │   └── imageUrl.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🎨 Color Palette

```css
/* Primary Colors */
--logo-blue: #1565c0; /* "TIKI" text */
--logo-red: #c62828; /* "TASK" text */
--card-header: #1a237e; /* Deep Indigo */
--background-light: #d6eaf8; /* Light Blue */
--card-background: #ffffff; /* White */
--text-primary: #1f2937; /* Dark Gray */
--text-secondary: #6b7280; /* Medium Gray */
--accent-red: #dc2626; /* Logout button */
--success-green: #10b981; /* Success states */
```

---

## 🚀 Running the Application

### **Start Backend**

```bash
cd backend
npm start
# Server runs on http://localhost:4000
```

### **Start Frontend**

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### **Access the Application**

Open your browser and navigate to:

```
http://localhost:3000
```

---

## 🧪 Testing

### **Backend**

```bash
cd backend
npm test
```

### **Frontend**

```bash
cd frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Tiki Task Development Team**

---

## 🙏 Acknowledgments

- **Lucide Icons** - Beautiful icons for React
- **React Toastify** - Toast notifications
- **Cloudflare** - Image storage and CDN
- **Create React App** - React boilerplate

---

## 📞 Support

For support, email support@tikitask.com or open an issue in the repository.

---

**Made with ❤️ by the Tiki Task Team**

**Pass tasks. Keep it moving.** ⚽🎓
