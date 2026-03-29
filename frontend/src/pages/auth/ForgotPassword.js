// src/pages/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import logo from '../../assets/images/TIKI_TASK_logo.png';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success('Check your email for OTP');
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      const message = error.response?.data?.data?.message || 
                     error.response?.data?.message || 
                     'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page forgot-page-centered">
      <div className="forgot-container">
        <img src={logo} alt="TIKI TASK" className="forgot-logo" />
        <h2 className="forgot-title">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-forgot btn-loading" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              'Send OTP'
            )}
          </button>

          <p className="auth-switch">
            Remember your password? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;