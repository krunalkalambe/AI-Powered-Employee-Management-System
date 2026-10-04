import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Search, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Enterprise Dashboard';
    if (path.startsWith('/employees')) return 'Employee Management';
    if (path.startsWith('/departments')) return 'Department Administration';
    if (path.startsWith('/attendance')) return 'Attendance & Timesheets';
    if (path.startsWith('/leave')) return 'Leave Operations';
    if (path.startsWith('/payroll')) return 'Payroll & Compensation';
    if (path.startsWith('/reports')) return 'Analytics & Reports';
    if (path.startsWith('/ai/chatbot')) return 'AI HR Assistant Bot';
    if (path.startsWith('/ai/resume-analyzer')) return 'AI Resume Screening & Analysis';
    if (path.startsWith('/ai/attrition')) return 'Employee Attrition Risk Predictor';
    if (path.startsWith('/ai/performance')) return 'Performance Prediction & Evaluation';
    if (path.startsWith('/ai/salary')) return 'Market Salary Benchmark Predictor';
    if (path.startsWith('/ai/email-generator')) return 'AI HR Communication Generator';
    if (path.startsWith('/profile')) return 'Employee Profile';
    return 'Employee Management System';
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu size={20} />
        </button>
        <div className="navbar-title-wrap">
          <h1 className="navbar-title">{getPageTitle(location.pathname)}</h1>
          <span className="navbar-date">{currentDate}</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="system-status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">System Live</span>
        </div>

        <div className="user-profile-menu">
          <div className="nav-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="nav-user-details">
            <span className="nav-user-name">{user?.name || 'User'}</span>
            <span className="nav-user-role">{role}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="nav-logout-btn"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
