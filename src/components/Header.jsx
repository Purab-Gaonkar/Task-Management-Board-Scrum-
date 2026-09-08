import React from 'react';
import { LayoutGrid, Plus, LogOut, User } from 'lucide-react';

export default function Header({ user, onNewTask, onLogout, onToggleLogin }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-badge">SB</div>
        <div>
          <h1 className="header-title">Scrum Management Board</h1>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>GCP 4-VM Polyglot Architecture</span>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn-primary" onClick={onNewTask}>
          <Plus size={16} /> New Task
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-pill">
              <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
              <span>{user.username} ({user.role})</span>
            </div>
            <button className="btn-secondary" onClick={onLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={onToggleLogin}>
            <User size={16} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
