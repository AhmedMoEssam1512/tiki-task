import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, LogIn } from 'lucide-react';
import { ProjectCardSkeleton } from '../../components/Skeleton';
import './Projects.css';

const ProjectsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState({
    ownedProjects: [],
    assignedProjects: [],
    pendingProjects: []
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  });
  const [joinProjectId, setJoinProjectId] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get('/project/get_all_projects');
      console.log('Projects response:', response.data);

      const rawData = response.data.data;

      // Helper function to flatten and sort projects by status order: ongoing → not-started → finished
      const flattenAndSortProjects = (projectsArray) => {
        if (!projectsArray) return [];

        // Define status order
        const statusOrder = { 'ongoing': 0, 'not-started': 1, 'finished': 2 };

        // Sort the array by status order
        const sorted = [...projectsArray].sort((a, b) => {
          return statusOrder[a.status] - statusOrder[b.status];
        });

        // Flatten all projects from the sorted groups
        return sorted.flatMap(group => group.projects || []);
      };

      // Transform the data to extract projects properly
      const transformedData = {
        ownedProjects: flattenAndSortProjects(rawData.ownedProjects),
        assignedProjects: flattenAndSortProjects(rawData.assignedProjects),
        pendingProjects: flattenAndSortProjects(rawData.pendingProjects)
      };

      console.log('Transformed projects:', transformedData);
      setProjects(transformedData);
      toast.success('Projects loaded successfully');
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to load projects';
      toast.error(message);
      console.error('Projects fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateDates = () => {
    const { start_date, end_date } = newProject;
    
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const now = new Date();
      
      if (start > end) {
        toast.error('Start date must be before end date');
        return false;
      }
      
      if (start < now) {
        toast.error('Start date cannot be in the past');
        return false;
      }
    }
    
    return true;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!validateDates()) return;
    
    setCreating(true);
    
    try {
      const projectData = {
        name: newProject.name,
        description: newProject.description
      };
      
      // Add dates if provided
      if (newProject.start_date) {
        projectData.start_date = new Date(newProject.start_date).toISOString();
      }
      if (newProject.end_date) {
        projectData.end_date = new Date(newProject.end_date).toISOString();
      }
      
      await API.post('/user/create_project', projectData);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', start_date: '', end_date: '' });
      fetchProjects();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.data?.message || 'Failed to create project';
      toast.error(message);
      console.error('Create project error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoining(true);
    
    try {
      await API.post(`/user/enter_project/${joinProjectId}`);
      toast.success('Join request sent! Waiting for owner approval.');
      setShowJoinModal(false);
      setJoinProjectId('');
      fetchProjects();
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to join project';
      setJoinError(message);
      toast.error(message);
      console.error('Join project error:', error);
    } finally {
      setJoining(false);
    }
  };

  const ProjectCard = ({ project }) => {
    // Status icon mapping
    const getStatusIcon = (status) => {
      switch(status) {
        case 'ongoing': return '🟡';
        case 'not-started': return '⚪';
        case 'finished': return '✅';
        default: return '⚪';
      }
    };

    return (
      <div
        className="project-card"
        onClick={() => navigate(`/projects/${project.id}`)}
      >
        <span className="project-name">{project.name}</span>
        <span className="project-status-icon" title={project.status}>
          {getStatusIcon(project.status)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="projects-page">
        <h2 className="page-title">My Projects</h2>
        <ProjectCardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2 className="page-title">My Projects</h2>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} strokeWidth={2.5} />
            Create Project
          </button>
          <button className="btn-secondary" onClick={() => setShowJoinModal(true)}>
            <LogIn size={20} strokeWidth={2.5} />
            Join Project
          </button>
        </div>
      </div>

      <div className="projects-section">
        <h3 className="section-title">owned projects</h3>
        <div className="projects-grid">
          {projects.ownedProjects?.length > 0 ? (
            projects.ownedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="no-projects">No owned projects yet. Create one to get started!</p>
          )}
        </div>
      </div>

      <div className="projects-section">
        <h3 className="section-title">assigned projects</h3>
        <div className="projects-grid">
          {projects.assignedProjects?.length > 0 ? (
            projects.assignedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="no-projects">No assigned projects yet</p>
          )}
        </div>
      </div>

      <div className="projects-section">
        <h3 className="section-title">pending projects</h3>
        <div className="projects-grid">
          {projects.pendingProjects?.length > 0 ? (
            projects.pendingProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="no-projects">No pending projects</p>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g., Mobile App Development"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe the project goals and scope..."
                  rows="4"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newProject.start_date}
                    onChange={e => setNewProject({ ...newProject, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <small className="form-hint">Optional, defaults to today</small>
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newProject.end_date}
                    onChange={e => setNewProject({ ...newProject, end_date: e.target.value })}
                    min={newProject.start_date || new Date().toISOString().split('T')[0]}
                  />
                  <small className="form-hint">Optional, defaults to +14 days</small>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={creating}>
                  {creating ? (
                    <>
                      <span className="spinner spinner-small"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Project Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Join Project</h3>
            <form onSubmit={handleJoinProject}>
              <div className="form-group">
                <label>Project ID *</label>
                <input
                  type="text"
                  value={joinProjectId}
                  onChange={e => setJoinProjectId(e.target.value)}
                  placeholder="Enter project UUID"
                  required
                  disabled={joining}
                />
                <small className="form-hint">Ask the project owner for the project ID</small>
              </div>
              {joinError && (
                <div className="error-message">
                  {joinError}
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowJoinModal(false)} disabled={joining}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={joining}>
                  {joining ? (
                    <>
                      <span className="spinner spinner-small"></span>
                      Sending Request...
                    </>
                  ) : (
                    'Join Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;