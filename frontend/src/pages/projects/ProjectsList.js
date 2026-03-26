// src/pages/projects/ProjectsList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';
import './Projects.css';

const ProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState({
    ownedProjects: [],
    assignedProjects: [],
    pendingProjects: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get('/project/get_all_projects');
      setProjects(response.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error('Projects fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const ProjectCard = ({ project }) => (
    <div 
      className="project-card"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <span className="project-name">{project.name}</span>
      <span className="project-arrow">›</span>
    </div>
  );

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="projects-page">
      <h2 className="page-title">My Projects</h2>

      <div className="projects-section">
        <h3 className="section-title">owned projects</h3>
        <div className="projects-grid">
          {projects.ownedProjects?.length > 0 ? (
            projects.ownedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="no-projects">No owned projects yet</p>
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
    </div>
  );
};

export default ProjectsList;