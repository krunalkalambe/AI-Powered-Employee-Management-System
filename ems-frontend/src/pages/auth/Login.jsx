import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h2>Sign in to AI-EMS</h2>
          <p>Enterprise AI-Powered Employee Management Platform</p>
        </div>

        {error && (
          <div className="auth-alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Work Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner-small"></span> Authenticating...
              </span>
            ) : (
              <span className="btn-content">
                Sign In to Dashboard <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-box-header">
            <ShieldCheck size={16} />
            <span>Quick Demo Credentials (Click to fill):</span>
          </div>
          <div className="demo-chips-grid">
            <button
              type="button"
              className="demo-chip chip-admin"
              onClick={() => handleDemoLogin('admin@ems.com', 'admin123')}
            >
              <strong>Admin:</strong> admin@ems.com
            </button>
            <button
              type="button"
              className="demo-chip chip-hr"
              onClick={() => handleDemoLogin('hr@ems.com', 'hr123')}
            >
              <strong>HR:</strong> hr@ems.com
            </button>
            <button
              type="button"
              className="demo-chip chip-manager"
              onClick={() => handleDemoLogin('manager@ems.com', 'manager123')}
            >
              <strong>Manager:</strong> manager@ems.com
            </button>
            <button
              type="button"
              className="demo-chip chip-employee"
              onClick={() => handleDemoLogin('aarti.ghayde@example.com', 'emp123')}
            >
              <strong>Employee:</strong> aarti.ghayde@example.com
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
