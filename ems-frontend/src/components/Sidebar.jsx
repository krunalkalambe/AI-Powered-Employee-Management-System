import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  DollarSign,
  FileBarChart,
  Bot,
  FileSearch,
  TrendingDown,
  Award,
  BadgeDollarSign,
  Mail,
  UserCheck,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [aiMenuOpen, setAiMenuOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminOrHR = role === 'ADMIN' || role === 'HR';
  const isManager = role === 'MANAGER';
  const isEmployee = role === 'EMPLOYEE';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles className="icon-sparkle" size={24} />
        </div>
        <div className="brand-text">
          <h2>AI-EMS</h2>
          <span className="brand-tag">Enterprise Suite</span>
        </div>
      </div>

      <div className="user-badge-card">
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <h4>{user?.name || 'User'}</h4>
          <span className={`role-pill role-${role?.toLowerCase()}`}>
            {role}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">MAIN MENU</div>

        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {(isAdminOrHR || isManager) && (
          <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Employees</span>
          </NavLink>
        )}

        {isAdminOrHR && (
          <NavLink to="/departments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Building2 size={18} />
            <span>Departments</span>
          </NavLink>
        )}

        <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarCheck size={18} />
          <span>Attendance</span>
        </NavLink>

        <NavLink to="/leave" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarOff size={18} />
          <span>Leave Management</span>
        </NavLink>

        {(isAdminOrHR || isEmployee) && (
          <NavLink to="/payroll" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <DollarSign size={18} />
            <span>Payroll & Salary</span>
          </NavLink>
        )}

        {(isAdminOrHR || isManager) && (
          <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileBarChart size={18} />
            <span>Reports & Exports</span>
          </NavLink>
        )}

        <div className="nav-section-label">AI INTELLIGENCE</div>

        <div className="ai-menu-group">
          <button
            type="button"
            className="nav-item ai-toggle-btn"
            onClick={() => setAiMenuOpen(!aiMenuOpen)}
          >
            <div className="ai-btn-left">
              <Sparkles size={18} className="ai-icon" />
              <span>AI Features</span>
            </div>
            {aiMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {aiMenuOpen && (
            <div className="ai-sub-menu">
              <NavLink to="/ai/chatbot" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                <Bot size={16} />
                <span>HR Assistant Bot</span>
              </NavLink>

              {isAdminOrHR && (
                <NavLink to="/ai/resume-analyzer" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                  <FileSearch size={16} />
                  <span>Resume Analyzer</span>
                </NavLink>
              )}

              {isAdminOrHR && (
                <NavLink to="/ai/attrition" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                  <TrendingDown size={16} />
                  <span>Attrition Risk</span>
                </NavLink>
              )}

              {(isAdminOrHR || isManager) && (
                <NavLink to="/ai/performance" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                  <Award size={16} />
                  <span>Performance AI</span>
                </NavLink>
              )}

              {isAdminOrHR && (
                <NavLink to="/ai/salary" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                  <BadgeDollarSign size={16} />
                  <span>Salary Predictor</span>
                </NavLink>
              )}

              {(isAdminOrHR || isManager) && (
                <NavLink to="/ai/email-generator" className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}>
                  <Mail size={16} />
                  <span>AI Email Drafter</span>
                </NavLink>
              )}
            </div>
          )}
        </div>

        <div className="nav-section-label">ACCOUNT</div>

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserCheck size={18} />
          <span>My Profile</span>
        </NavLink>

        <button type="button" onClick={handleLogout} className="nav-item logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
