// src/pages/settings/Settings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { ArrowLeft, User, Lock, Trash2, Save, X, Eye, EyeOff, Upload, Image } from 'lucide-react';
import defaultProfilePic from '../../assets/images/default_profile_pic.jpg';
import { uploadProfilePicture } from '../../services/cloudflare';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, fetchMe } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, danger
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    phone: '',
    bio: '',
    profile_picture: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        bio: user.bio || '',
        profile_picture: user.profile_picture || ''
      });
      setOriginalData({
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        bio: user.bio || '',
        profile_picture: user.profile_picture || ''
      });
      setImagePreview(user.profile_picture || defaultProfilePic);
    }
  }, [user]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload directly to Cloudflare, patch the user in backend, and delete the old one
      const imageUrl = await uploadProfilePicture(file, profileData.profile_picture);
      
      // Update profile data globally and locally
      setProfileData(prev => ({ ...prev, profile_picture: imageUrl }));
      setOriginalData(prev => ({ ...prev, profile_picture: imageUrl }));
      
      // Update the user context so the profile picture updates anywhere else
      await fetchMe();
      
      toast.success('Image uploaded and saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
      setImagePreview(profileData.profile_picture || defaultProfilePic);
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Check if modified
    const newData = { ...profileData, [name]: value };
    const hasChanges = Object.keys(originalData).some(key => 
      newData[key] !== originalData[key]
    );
    setIsModified(hasChanges);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updateData = {};
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== originalData[key]) {
          updateData[key] = profileData[key];
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        return;
      }
      
      await API.patch('/user/edit_profile', updateData);
      toast.success('Profile updated successfully!');
      fetchMe();
      setOriginalData(profileData);
      setIsModified(false);
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await API.patch('/login/change_password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.username) {
      toast.error('Username does not match');
      return;
    }
    
    setDeleting(true);
    try {
      await API.delete('/user/delete_user');
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to delete account';
      toast.error(message);
      console.error('Delete account error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsModified(false);
  };

  if (!user) {
    return (
      <div className="settings-page">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          Back to Profile
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-container">
        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Edit Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={18} />
            Change Password
          </button>
          <button 
            className={`tab-btn ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            <Trash2 size={18} />
            Danger Zone
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Edit Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2 className="section-title">Edit Profile</h2>
              
              <div className="profile-picture-section">
                <div className="current-avatar">
                  <img 
                    src={imagePreview || defaultProfilePic} 
                    alt="Profile"
                    onError={(e) => {
                      console.log('Image failed to load, using default');
                      e.target.src = defaultProfilePic;
                    }}
                  />
                  {uploadingImage && (
                    <div className="upload-overlay">
                      <div className="spinner"></div>
                    </div>
                  )}
                </div>
                <div className="avatar-input">
                  <label>Upload Profile Picture</label>
                  <div className="upload-area">
                    <input
                      type="file"
                      id="profile-picture-upload"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageSelect}
                      disabled={uploadingImage}
                      className="file-input"
                    />
                    <label htmlFor="profile-picture-upload" className="upload-btn">
                      <Upload size={20} />
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </label>
                    <small className="form-hint">
                      JPEG, PNG, GIF, or WebP. Max 5MB. Image will be uploaded to Cloudflare.
                    </small>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="01234567890"
                  />
                </div>
                <div className="form-group">
                  <label>Email (Read-only)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="disabled-input"
                  />
                  <small className="form-hint">Email cannot be changed</small>
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn-cancel" 
                  onClick={handleCancel}
                  disabled={!isModified || loading}
                >
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveProfile}
                  disabled={!isModified || loading}
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <h2 className="section-title">Change Password</h2>
              
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-primary" 
                  onClick={handlePasswordChange}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                >
                  <Lock size={18} />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="settings-section danger-zone">
              <h2 className="section-title danger">
                <Trash2 size={24} />
                Danger Zone
              </h2>
              
              <div className="danger-content">
                <p className="danger-description">
                  Once you delete your account, there is no going back. This action will permanently delete:
                </p>
                <ul className="danger-list">
                  <li>Your profile and all personal information</li>
                  <li>All projects you own (will be transferred or deleted)</li>
                  <li>All tasks assigned to you</li>
                  <li>Your membership in all projects</li>
                </ul>
                
                <div className="delete-form">
                  <label>Type your username to confirm: <strong>{user.username}</strong></label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={`Type ${user.username} to confirm`}
                    disabled={deleting}
                  />
                  <button 
                    className="btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== user.username || deleting}
                  >
                    <Trash2 size={18} />
                    {deleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
