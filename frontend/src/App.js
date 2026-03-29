// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import MyProfile from './pages/profile/MyProfile';
import OtherUserProfile from './pages/profile/OtherUserProfile';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetails from './pages/projects/ProjectDetails';
import TodoList from './pages/tasks/TodoList';
import Settings from './pages/settings/Settings';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      
      <Routes>
        {/* Public Routes (no navbar) */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/profile" /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes (with navbar) */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/users/:userId" element={
          <ProtectedRoute>
            <OtherUserProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        } />
        
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/tasks" element={
          <ProtectedRoute>
            <TodoList />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;