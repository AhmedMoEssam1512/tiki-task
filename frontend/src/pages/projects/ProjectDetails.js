// src/pages/projects/ProjectDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { ArrowLeft, Users, Calendar, CheckCircle, XCircle, UserPlus, Trash2, Edit2, LogOut, User, Check, Circle, Clock } from 'lucide-react';
import { ProjectCardSkeleton, TaskCardSkeleton } from '../../components/Skeleton';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    due_date: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      // Fetch project details
      const projectRes = await API.get(`/project/${id}`);
      const projectData = projectRes.data.data;
      setProject(projectData.project);
      
      // Check if user is owner
      const userId = user?.id;
      setCurrentUserId(userId);
      setIsOwner(projectData.project.owner_id === userId);
      
      // Fetch tasks
      const tasksRes = await API.get(`/task/get_all_tasks/${id}`);
      setTasks(tasksRes.data.data || []);
      
      // Fetch members
      const membersRes = await API.get(`/project/members/${id}`);
      const membersData = membersRes.data.data || [];
      setMembers(membersData);
      
      // Fetch user details for all members
      const userIds = [...new Set(membersData.map(m => m.user_id))];
      const userPromises = userIds.map(uid => API.get(`/user/view_profile/${uid}`));
      const usersResponses = await Promise.all(userPromises);
      const usersMap = {};
      usersResponses.forEach(res => {
        const userData = res.data.data;
        usersMap[userData.id] = userData;
      });
      setUserDetails(usersMap);
      
      toast.success('Project loaded successfully');
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to load project';
      toast.error(message);
      console.error('Project details fetch error:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const taskData = {
        name: newTask.name,
        description: newTask.description,
        due_date: new Date(newTask.due_date).toISOString(),
        project_id: id
      };
      
      // Add assigned_to if provided
      if (newTask.assigned_to) {
        taskData.assigned_to = newTask.assigned_to;
      }
      
      await API.post('/task/create_task', taskData);
      toast.success('Task created successfully!');
      setShowAddTaskModal(false);
      setNewTask({ name: '', description: '', due_date: '', assigned_to: '' });
      fetchProjectDetails();
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.data?.message || 'Failed to create task';
      toast.error(message);
      console.error('Create task error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await API.patch(`/project/request/${id}/${userId}`);
      toast.success('Request accepted!');
      fetchProjectDetails();
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to accept request';
      toast.error(message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await API.delete(`/project/request/${id}/${userId}`);
      toast.success('Member removed!');
      fetchProjectDetails();
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to remove member';
      toast.error(message);
    }
  };

  const handleExitProject = async () => {
    if (!window.confirm('Are you sure you want to exit this project?')) return;
    
    try {
      await API.delete(`/project/members/${id}`);
      toast.success('You exited the project');
      navigate('/projects');
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to exit project';
      toast.error(message);
    }
  };

  const handleMarkTaskAsDone = async (taskId) => {
    try {
      await API.patch(`/task/mark_as_done/${taskId}`);
      toast.success('Task marked as done!');
      fetchProjectDetails();
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to mark task as done';
      toast.error(message);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
  };

  const handleAssignTask = async (userId) => {
    if (!selectedTask) return;
    
    try {
      await API.patch(`/task/assign_task/${selectedTask.id}/${userId}`);
      toast.success('Task assigned successfully!');
      fetchProjectDetails();
      // Update selected task with new assignment
      setSelectedTask({ ...selectedTask, assigned_to: userId, status: 'in-progress' });
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to assign task';
      toast.error(message);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'finished': return <Check size={14} className="status-icon" />;
      case 'in-progress': return <Clock size={14} className="status-icon" />;
      default: return <Circle size={14} className="status-icon" />;
    }
  };

  const getAssignedUser = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.assigned_to) return null;
    
    const member = members.find(m => m.user_id === task.assigned_to);
    if (!member) return `User #${task.assigned_to}`;
    
    const user = userDetails[task.assigned_to];
    return user ? user.username : `User #${task.assigned_to}`;
  };

  const getMemberName = (userId) => {
    const user = userDetails[userId];
    return user ? user.username : `User #${userId}`;
  };

  const canMarkAsDone = (task) => {
    // Owner can mark any task as done
    if (isOwner) return true;
    // Assigned user can mark their own task as done
    if (task.assigned_to === currentUserId) return true;
    return false;
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="role-badge admin">Owner</span>;
      case 'member': return <span className="role-badge member">Member</span>;
      case 'pending': return <span className="role-badge pending">Pending</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="project-header-skeleton">
          <ProjectCardSkeleton count={1} />
        </div>
        <div className="project-body">
          <div className="tasks-section">
            <h3>Tasks</h3>
            <TaskCardSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="error-message">Project not found</div>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      {/* Project Header */}
      <div className="project-header">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="project-title-section">
          <h1 className="project-title">{project.name}</h1>
          <p className="project-description">{project.description}</p>
          <div className="project-meta">
            <span className="meta-item">
              <Calendar size={16} />
              {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
            </span>
            <span className="meta-item project-id-display">
              ID: {project.id}
            </span>
          </div>
        </div>
        <div className="project-actions">
          {isOwner && (
            <button className="btn-primary btn-xs" onClick={() => setShowAddTaskModal(true)}>
              <CheckCircle size={16} />
              Create Task
            </button>
          )}
          {!isOwner && (
            <button className="btn-danger btn-sm" onClick={handleExitProject}>
              <LogOut size={18} />
              Exit Project
            </button>
          )}
        </div>
      </div>

      <div className="project-body">
        {/* Tasks Section */}
        <div className="tasks-section">
          <div className="section-header">
            <h2>Tasks</h2>
            <span className="task-count">{tasks.length} tasks</span>
          </div>
          
          {tasks.length > 0 ? (
            <div className="tasks-list">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className="task-card"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="task-info">
                    <h3 className="task-name">{task.name}</h3>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className="task-status">
                        {getStatusIcon(task.status)} {task.status}
                      </span>
                      {task.due_date && (
                        <span className="task-due">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.assigned_to && (
                        <span className="task-assigned">
                          <User size={14} /> {getAssignedUser(task.id)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    {task.status !== 'finished' && canMarkAsDone(task) && (
                      <button 
                        className="btn-success btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkTaskAsDone(task.id);
                        }}
                      >
                        <CheckCircle size={16} />
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tasks">
              <p>No tasks yet</p>
              {isOwner && (
                <button className="btn-primary" onClick={() => setShowAddTaskModal(true)}>
                  Create First Task
                </button>
              )}
            </div>
          )}
        </div>

        {/* Members Sidebar */}
        <div className={`members-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>
              <Users size={20} />
              Team Members
            </h2>
            <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '›' : '‹'}
            </button>
          </div>
          
          <div className="members-list">
            {members.length > 0 ? (
              members.map(member => (
                <div 
                  key={member.id} 
                  className="member-card"
                  onClick={() => navigate(`/users/${member.user_id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="member-info">
                    <User size={16} className="member-icon" />
                    <span className="member-name">{getMemberName(member.user_id)}</span>
                    {getRoleBadge(member.role)}
                  </div>
                  {isOwner && member.role === 'pending' && (
                    <div className="member-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn-success btn-xs"
                        onClick={() => handleAcceptRequest(member.user_id)}
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button 
                        className="btn-danger btn-xs"
                        onClick={() => handleRemoveMember(member.user_id)}
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                  {isOwner && member.role !== 'admin' && member.role !== 'pending' && (
                    <button 
                      className="btn-danger btn-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(member.user_id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="no-members">No members yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Name *</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                  placeholder="e.g., Implement Login"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Describe the task..."
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(project.end_date).toISOString().split('T')[0]}
                  required
                />
                <small className="form-hint">Must be within project timeline</small>
              </div>
              <div className="form-group">
                <label>Assign To (Optional)</label>
                <select
                  value={newTask.assigned_to}
                  onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
                >
                  <option value="">-- Unassigned --</option>
                  {members.filter(m => m.role !== 'pending').map(member => (
                    <option key={member.user_id} value={member.user_id}>
                      {getMemberName(member.user_id)}
                    </option>
                  ))}
                </select>
                <small className="form-hint">Leave unassigned for pending status</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddTaskModal(false)} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={creating}>
                  {creating ? (
                    <>
                      <span className="spinner spinner-small"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskDetailsModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowTaskDetailsModal(false)}>
          <div className="modal task-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Task Details</h3>
              <button className="modal-close" onClick={() => setShowTaskDetailsModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <label>Task Name</label>
                <p className="detail-value">{selectedTask.name}</p>
              </div>
              
              <div className="detail-section">
                <label>Description</label>
                <p className="detail-value description">{selectedTask.description}</p>
              </div>
              
              <div className="detail-row">
                <div className="detail-section">
                  <label>Project</label>
                  <p className="detail-value">{project.name}</p>
                </div>
                <div className="detail-section">
                  <label>Project ID</label>
                  <p className="detail-value project-id">{project.id}</p>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-section">
                  <label>Status</label>
                  <p className="detail-value">
                    {getStatusIcon(selectedTask.status)} {selectedTask.status}
                  </p>
                </div>
                <div className="detail-section">
                  <label>Due Date</label>
                  <p className="detail-value">
                    {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
              
              <div className="detail-section">
                <label>Assigned To</label>
                <p className="detail-value">
                  {selectedTask.assigned_to ? (
                    <>
                      <User size={16} className="inline-icon" />
                      {getAssignedUser(selectedTask.id)} (ID: {selectedTask.assigned_to})
                    </>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )}
                </p>
              </div>
              
              {isOwner && (
                <div className="detail-section">
                  <label>Assign Task To</label>
                  <select 
                    className="assign-select"
                    value={selectedTask.assigned_to || ''}
                    onChange={(e) => handleAssignTask(e.target.value)}
                  >
                    <option value="">-- Unassigned --</option>
                    {members.filter(m => m.role !== 'pending').map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {getMemberName(member.user_id)}
                      </option>
                    ))}
                  </select>
                  <small className="form-hint">Select a member to assign this task</small>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {selectedTask.status !== 'finished' && canMarkAsDone(selectedTask) && (
                <button 
                  className="btn-success"
                  onClick={() => {
                    handleMarkTaskAsDone(selectedTask.id);
                    setShowTaskDetailsModal(false);
                  }}
                >
                  <CheckCircle size={16} />
                  Mark as Done
                </button>
              )}
              <button className="btn-cancel" onClick={() => setShowTaskDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
