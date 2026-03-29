// src/pages/profile/OtherUserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { ProfileSkeleton } from '../../components/Skeleton';
import './Profile.css';
import defaultProfilePic from '../../assets/images/default_profile_pic.jpg';

const OtherUserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get(`/user/view_profile/${userId}`);
      setProfile(response.data.data);
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to load user profile';
      toast.error(message);
      console.error('User profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <ProfileSkeleton />
      </div>
    );
  }
  
  if (!profile) return <div className="error">User not found</div>;

  return (
    <div className="profile-page">
      {/* National ID Card ONLY - No Todo List, No Projects */}
      <div className="national-id-card other-user-card">
        <div className="id-card-header">
          <div className="id-photo">
            <img 
              src={profile?.profile_picture || defaultProfilePic} 
              alt="Profile" 
              className="profile-image"
              onError={(e) => {
                // Fallback if image fails to load
              e.target.src = defaultProfilePic;
              }}
            />
          </div>
          <div className="id-info">
            <h2 className="id-name">{profile?.name}</h2>
            <p><strong>Username:</strong> {profile?.username}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone Number:</strong> {profile?.phone || 'N/A'}</p>
            <p><strong>User ID:</strong> {profile?.id}</p>
          </div>
        </div>
        
        <div className="id-bio">
          <p>{profile?.bio || 'No bio added yet...'}</p>
        </div>

        {/* NO LOGOUT BUTTON for other users! */}
      </div>
    </div>
  );
};

export default OtherUserProfile;