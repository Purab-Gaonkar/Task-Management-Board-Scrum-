import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import LoginForm from './components/LoginForm';
import { taskService, userService } from './services/api';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('scrum_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('scrum_user');
      }
    }
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks();
      if (res.data.success) {
        setTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Could not connect to Task Microservice via API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await userService.getUsers();
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.warn('Could not load users list from User Service:', err.message);
    }
  };

  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      if (editingTask) {
        const res = await taskService.updateTask(editingTask.id, taskData);
        if (res.data.success) {
          setTasks(tasks.map(t => t.id === editingTask.id ? res.data.data : t));
        }
      } else {
        const res = await taskService.createTask(taskData);
        if (res.data.success) {
          setTasks([res.data.data, ...tasks]);
        }
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      alert('Failed to save task: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateTaskStatus(taskId, newStatus);
      if (res.data.success) {
        setTasks(tasks.map(t => t.id === taskId ? res.data.data : t));
      }
    } catch (err) {
      alert('Failed to update task status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await taskService.deleteTask(taskId);
      if (res.data.success) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      alert('Failed to delete task: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('scrum_token');
    localStorage.removeItem('scrum_user');
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      <Header 
        user={currentUser}
        onNewTask={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
        onLogout={handleLogout}
        onToggleLogin={() => setIsLoginModalOpen(true)}
      />

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.15)', borderBottom: '1px solid #f43f5e', color: '#f43f5e', padding: '0.75rem 2rem', fontSize: '0.875rem' }}>
          ⚠️ {error} — Ensure API Gateway (VM 3) is running and microservices are reachable.
        </div>
      )}

      <main style={{ flex: 1, display: 'flex' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
            Loading Scrum Board...
          </div>
        ) : (
          <Board 
            tasks={tasks}
            onEditTask={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleCreateOrUpdateTask}
        task={editingTask}
        users={users}
      />

      <LoginForm 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => { setCurrentUser(user); fetchUsers(); }}
      />
    </div>
  );
}
