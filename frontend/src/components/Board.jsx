import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Circle, Clock, CheckCircle2, Search } from 'lucide-react';

export default function Board({ tasks, onEditTask, onDeleteTask, onStatusChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.assignee && t.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter(t => t.status === 'DONE');

  const columns = [
    {
      id: 'TODO',
      title: 'To Do',
      icon: <Circle size={18} color="#38bdf8" />,
      tasks: todoTasks,
      color: '#38bdf8'
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      icon: <Clock size={18} color="#fbbf24" />,
      tasks: inProgressTasks,
      color: '#fbbf24'
    },
    {
      id: 'DONE',
      title: 'Done',
      icon: <CheckCircle2 size={18} color="#34d399" />,
      tasks: doneTasks,
      color: '#34d399'
    }
  ];

  return (
    <div className="board-container">
      <div className="board-controls">
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search tasks, descriptions or assignees..." 
            style={{ paddingLeft: '36px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Total Tasks: <strong style={{ color: '#f8fafc' }}>{tasks.length}</strong>
        </div>
      </div>

      <div className="columns-grid">
        {columns.map(col => (
          <div key={col.id} className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                {col.icon}
                <span>{col.title}</span>
              </div>
              <span className="column-count">{col.tasks.length}</span>
            </div>

            <div className="task-list">
              {col.tasks.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  No tasks in {col.title}
                </div>
              ) : (
                col.tasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
