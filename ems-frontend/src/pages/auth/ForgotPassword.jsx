import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Sparkles, Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.otp) {
        setGeneratedOtp(res.data.otp);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/verify-otp', { email, otp });
      // Redirect to reset password with email and otp
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h2>Reset Password</h2>
          <p>
            {step === 1
              ? 'Enter your registered email to receive a verification OTP'
              : 'Enter the 6-digit OTP code to verify your identity'}
          </p>
        </div>

        {error && (
          <div className="auth-alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="auth-alert alert-success">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        {generatedOtp && step === 2 && (
          <div className="otp-demo-card">
            <span className="otp-label">Demo Verification Code:</span>
            <span className="otp-code">{generatedOtp}</span>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setOtp(generatedOtp)}
            >
              Auto-Fill OTP
            </button>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label>Registered Work Email</label>
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

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span className="btn-loading-content">
                  <span className="spinner-small"></span> Sending Code...
                </span>
              ) : (
                <span className="btn-content">
                  Send Verification OTP <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label>6-Digit Verification OTP</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span className="btn-loading-content">
                  <span className="spinner-small"></span> Verifying OTP...
                </span>
              ) : (
                <span className="btn-content">
                  Verify & Proceed <ArrowRight size={16} />
                </span>
              )}
            </button>

            <button
              type="button"
              className="btn btn-link btn-block"
              onClick={() => setStep(1)}
            >
              Change Email
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
