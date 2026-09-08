import React from 'react';
import { Trash2, Edit3, ArrowRight, ArrowLeft, Clock, User } from 'lucide-react';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      case 'LOW': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <span className={`badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button 
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Edit3 size={14} />
          </button>
          <button 
            style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
            onClick={() => onDelete(task.id)}
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <User size={12} />
          <span>{task.assignee || 'Unassigned'}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {task.status !== 'TODO' && (
            <button 
              className="btn-secondary" 
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
              onClick={() => onStatusChange(task.id, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
              title="Move Left"
            >
              <ArrowLeft size={12} />
            </button>
          )}

          {task.status !== 'DONE' && (
            <button 
              className="btn-secondary" 
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
              onClick={() => onStatusChange(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
              title="Move Right"
            >
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
