// src/pages/tasks/TodoList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { CheckCircle, Clock, Circle, User, ArrowLeft } from 'lucide-react';
import { TaskCardSkeleton } from '../../components/Skeleton';
import './TodoList.css';

const TodoList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in-progress, completed
  
  // Modal states
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectDetails, setProjectDetails] = useState({});
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get('/task/get_my_tasks');
      const taskData = response.data.data;
      
      // Combine in-progress and completed tasks
      const allTasks = [
        ...(taskData.inProgressTasks || []).map(t => ({ ...t, project: null })),
        ...(taskData.completedTasks || []).map(t => ({ ...t, project: null }))
      ];
      
      // Fetch project details for each task
      const tasksWithProjects = await Promise.all(
        allTasks.map(async (task) => {
          try {
            const projectRes = await API.get(`/project/${task.project_id}`);
            return {
              ...task,
              project: projectRes.data.data.project
            };
          } catch (error) {
            return task;
          }
        })
      );
      
      setTasks(tasksWithProjects);
      
      // Fetch members for projects where user is owner
      const projectIds = [...new Set(tasksWithProjects.map(t => t.project_id))];
      const membersMap = {};
      
      await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const membersRes = await API.get(`/project/members/${projectId}`);
            membersMap[projectId] = membersRes.data.data || [];
          } catch (error) {
            membersMap[projectId] = [];
          }
        })
      );
      
      setMembers(membersMap);
      toast.success('Tasks loaded successfully');
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to load tasks';
      toast.error(message);
      console.error('Tasks fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
  };

  const handleMarkAsDone = async (taskId) => {
    try {
      await API.patch(`/task/mark_as_done/${taskId}`);
      toast.success('Task marked as done!');
      fetchTasks();
      // Update selected task
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: 'finished' });
      }
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to mark task as done';
      toast.error(message);
    }
  };

  const handleAssignTask = async (userId) => {
    if (!selectedTask) return;
    
    try {
      await API.patch(`/task/assign_task/${selectedTask.id}/${userId}`);
      toast.success('Task assigned successfully!');
      fetchTasks();
      setSelectedTask({ ...selectedTask, assigned_to: userId, status: 'in-progress' });
    } catch (error) {
      const message = error.response?.data?.data?.message || error.response?.data?.message || 'Failed to assign task';
      toast.error(message);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'finished': return <CheckCircle size={14} className="status-icon" />;
      case 'in-progress': return <Clock size={14} className="status-icon" />;
      default: return <Circle size={14} className="status-icon" />;
    }
  };

  const getProjectMembers = (projectId) => {
    return members[projectId] || [];
  };

  const isOwner = (task) => {
    if (!task.project) return false;
    return task.project.owner_id === user?.id;
  };

  const canMarkAsDone = (task) => {
    if (isOwner(task)) return true;
    if (task.assigned_to === user?.id) return true;
    return false;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'in-progress') return task.status === 'in-progress';
    if (filter === 'completed') return task.status === 'finished';
    return true;
  });

  if (loading) {
    return (
      <div className="todo-list-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowLeft size={20} />
            Back to Profile
          </button>
          <h1>My Tasks</h1>
        </div>
        <TaskCardSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="todo-list-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          Back to Profile
        </button>
        <h1>My Tasks</h1>
      </div>

      <div className="tasks-filter">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks ({tasks.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({tasks.filter(t => t.status === 'in-progress').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter(t => t.status === 'finished').length})
        </button>
      </div>

      <div className="tasks-container">
        {filteredTasks.length > 0 ? (
          <div className="tasks-list">
            {filteredTasks.map(task => (
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
                    {task.project && (
                      <span className="task-project">
                        📁 {task.project.name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="task-due">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {task.assigned_to && (
                      <span className="task-assigned">
                        <User size={14} /> You
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
                        handleMarkAsDone(task.id);
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
            <h3>No tasks found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any tasks yet. Ask your project owner to assign you some tasks!"
                : `No ${filter.replace('-', ' ')} tasks.`
              }
            </p>
            <button className="btn-primary" onClick={() => navigate('/projects')}>
              Go to Projects
            </button>
          </div>
        )}
      </div>

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
              
              {selectedTask.project && (
                <div className="detail-row">
                  <div className="detail-section">
                    <label>Project</label>
                    <p className="detail-value">{selectedTask.project.name}</p>
                  </div>
                  <div className="detail-section">
                    <label>Project ID</label>
                    <p className="detail-value project-id">{selectedTask.project.id}</p>
                  </div>
                </div>
              )}
              
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
                      You (ID: {selectedTask.assigned_to})
                    </>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )}
                </p>
              </div>
              
              {isOwner(selectedTask) && getProjectMembers(selectedTask.project_id).length > 0 && (
                <div className="detail-section">
                  <label>Assign Task To</label>
                  <select 
                    className="assign-select"
                    value={selectedTask.assigned_to || ''}
                    onChange={(e) => handleAssignTask(e.target.value)}
                  >
                    <option value="">-- Unassigned --</option>
                    {getProjectMembers(selectedTask.project_id)
                      .filter(m => m.role !== 'pending')
                      .map(member => (
                        <option key={member.user_id} value={member.user_id}>
                          User #{member.user_id}
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
                    handleMarkAsDone(selectedTask.id);
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

export default TodoList;
