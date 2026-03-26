// src/pages/profile/MyProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { LogOut } from 'lucide-react';
import './Profile.css';
import defaultProfilePic from '../../assets/images/default_profile_pic.jpg';

const MyProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState({ inProgressTasks: [], completedTasks: [] });
  const [projects, setProjects] = useState({ ownedProjects: [], assignedProjects: [], pendingProjects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Get current user profile
      const profileRes = await API.get('/login/me');
      setProfile(profileRes.data.data);

      // Get my tasks
      const tasksRes = await API.get('/task/get_my_tasks');
      setTasks(tasksRes.data.data);

      // Get my projects
      const projectsRes = await API.get('/project/get_all_projects');
      setProjects(projectsRes.data.data);
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      {/* National ID Card */}
      <div className="national-id-card">
        <div className="id-card-header">
          <div className="id-photo">
            <img 
              src={profile?.profile_picture || defaultProfilePic} 
              alt="Profile" 
              onError={(e) => {
                e.target.src = defaultProfilePic;
              }}
            />
          </div>
          <div className="id-info">
            <h2 className="id-name">{profile?.name || user?.name}</h2>
            <p><strong>Username:</strong> {profile?.username || user?.username}</p>
            <p><strong>Email:</strong> {profile?.email || user?.email}</p>
            <p><strong>Phone Number:</strong> {profile?.phone || 'N/A'}</p>
            <p><strong>Owned Projects:</strong> {projects.ownedProjects?.length || 0}</p>
            <p><strong>User ID:</strong> {profile?.id}</p>
          </div>
        </div>
        
        <div className="id-bio">
          <p>{profile?.bio || 'No bio added yet...'}</p>
        </div>

        <button onClick={handleLogout} className="logout-button">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* To-do List and Owned Projects Cards */}
      <div className="profile-cards">
        <div className="profile-card todo-card">
          <h3 className="card-title">To-do List</h3>
          <div className="card-content">
            {tasks.inProgressTasks?.length > 0 ? (
              tasks.inProgressTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <span className="task-name">{task.name}</span>
                    <span className="task-desc">{task.description?.substring(0, 50)}...</span>
                  </div>
                  <input type="checkbox" className="task-checkbox" />
                </div>
              ))
            ) : (
              <p className="no-items">No tasks in progress</p>
            )}
            <button className="view-more" onClick={() => navigate('/tasks')}>
              View More Tasks...
            </button>
          </div>
        </div>

        <div className="profile-card projects-card">
          <h3 className="card-title">Owned Projects</h3>
          <div className="card-content">
            {projects.ownedProjects?.length > 0 ? (
              projects.ownedProjects.slice(0, 3).map((project) => (
                <div 
                  key={project.id} 
                  className="project-item"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="project-info">
                    <span className="project-name">{project.name}</span>
                    <span className="project-desc">{project.description?.substring(0, 50)}...</span>
                  </div>
                  <span className="project-arrow">›</span>
                </div>
              ))
            ) : (
              <p className="no-items">No owned projects yet</p>
            )}
            <button className="view-more" onClick={() => navigate('/projects')}>
              View More Projects...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;