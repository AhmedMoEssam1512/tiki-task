// src/pages/auth/VerifyOTP.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import logo from '../../assets/images/TIKI_TASK_logo.png';
import './Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email not found. Please restart the process.');
      navigate('/forgot-password');
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(email, otp);
      toast.success('OTP verified!');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      const message = error.response?.data?.data?.message || 
                     error.response?.data?.message || 
                     'Invalid or expired OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page forgot-page-centered">
      <div className="forgot-container">
        <img src={logo} alt="TIKI TASK" className="forgot-logo" />
        <h2 className="forgot-title">Verify OTP</h2>

        <form onSubmit={handleSubmit} className="forgot-form">
          <p className="otp-instruction">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>

          <div className="form-group">
            <label>One-Time Password</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="otp-input"
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-forgot btn-loading" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          <p className="auth-switch">
            Didn't receive code? <button type="button" onClick={() => navigate('/forgot-password')} className="link-button">Resend</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;