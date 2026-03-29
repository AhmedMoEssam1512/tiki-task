// src/pages/auth/ResetPassword.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/images/TIKI_TASK_logo.png';
import './Auth.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ pass: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Session expired. Please restart the process.');
      navigate('/forgot-password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, formData.newPassword);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.data?.message ||
                     error.response?.data?.message ||
                     'Failed to reset password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page forgot-page-centered">
      <div className="forgot-container">
        <img src={logo} alt="TIKI TASK" className="forgot-logo" />
        <h2 className="forgot-title">Reset Password</h2>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input">
              <input
                type={showPassword.pass ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="**********"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword({ ...showPassword, pass: !showPassword.pass })}
              >
                {showPassword.pass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="**********"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-forgot btn-loading" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;