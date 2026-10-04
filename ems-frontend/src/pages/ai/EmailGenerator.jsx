import React, { useState } from 'react';
import { aiApi } from '../../api/axios';
import Toast from '../../components/Toast';
import {
  Mail,
  Copy,
  Check,
  Sparkles,
  Send,
  Edit3,
} from 'lucide-react';

const EmailGenerator = () => {
  const [formData, setFormData] = useState({
    category: 'Leave Approval',
    recipientName: 'Aarti Ghayde',
    senderName: 'Human Resources Team',
    senderTitle: 'HR Operations Lead',
    tone: 'Formal',
    details: 'Approved for 2 days casual leave (March 15 to March 16). Please ensure handoff.',
  });

  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCopied(false);
    try {
      const res = await aiApi.post('/api/ai/email-generator', formData);
      setGeneratedSubject(res.data.subject);
      setGeneratedBody(res.data.body);
      setToast({ message: 'Professional email drafted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error communicating with AI service', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${generatedSubject}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setToast({ message: 'Copied email to clipboard!', type: 'success' });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="email-generator-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header-row">
        <div>
          <h2>AI HR Communication & Email Generator</h2>
          <p className="page-header-sub">
            Draft tailored, policy-compliant corporate communications, notifications, and notices in seconds
          </p>
        </div>
      </div>

      <div className="ai-two-column-layout">
        {/* Left: Email Configuration */}
        <div className="ai-input-card">
          <div className="card-top-bar">
            <h3>Email Details & Tone</h3>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Communication Purpose *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Leave Approval">Leave Approval</option>
                <option value="Leave Rejection">Leave Rejection</option>
                <option value="Interview Invitation">Interview Invitation</option>
                <option value="Employee Warning">Disciplinary / Attendance Warning</option>
                <option value="Performance Appreciation">Performance Appreciation & Kudos</option>
                <option value="Salary Increment">Salary Revision / Increment Notice</option>
                <option value="Meeting Invitation">Mandatory Team Meeting Invitation</option>
                <option value="General Announcement">General Workplace Announcement</option>
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Recipient Name *</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="e.g. Aarti Ghayde"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tone of Voice</label>
                <select name="tone" value={formData.tone} onChange={handleChange}>
                  <option value="Formal">Formal & Official</option>
                  <option value="Warm & Supportive">Warm & Supportive</option>
                  <option value="Direct & Firm">Direct & Firm</option>
                  <option value="Inspirational">Inspirational & Celebratory</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sender Sign-off Name</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="e.g. HR Department"
                />
              </div>

              <div className="form-group">
                <label>Sender Designation</label>
                <input
                  type="text"
                  name="senderTitle"
                  value={formData.senderTitle}
                  onChange={handleChange}
                  placeholder="e.g. Lead HR Specialist"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Key Specifics, Dates, or Reasons *</label>
              <textarea
                rows={4}
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Include specific dates, metrics, agenda, or background reasons..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span>Generating Draft...</span>
              ) : (
                <span>
                  <Sparkles size={16} /> Generate Professional Email
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Editable Generated Draft */}
        <div className="ai-output-card">
          <div className="card-top-bar">
            <h3>Generated Email Draft</h3>
            {generatedBody && (
              <button
                type="button"
                className={`btn btn-sm ${copied ? 'btn-success' : 'btn-secondary'}`}
                onClick={handleCopy}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Email'}
              </button>
            )}
          </div>

          {!generatedBody ? (
            <div className="empty-state">
              <Mail size={48} className="text-muted" />
              <h4>No Email Draft Generated Yet</h4>
              <p>Configure communication parameters on the left to draft corporate emails.</p>
            </div>
          ) : (
            <div className="email-preview-container">
              <div className="email-field-group">
                <label>Subject Line (Editable):</label>
                <input
                  type="text"
                  className="subject-input"
                  value={generatedSubject}
                  onChange={(e) => setGeneratedSubject(e.target.value)}
                />
              </div>

              <div className="email-field-group mt-3">
                <label>Body Content (Editable before sending):</label>
                <textarea
                  rows={13}
                  className="body-textarea"
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                ></textarea>
              </div>

              <div className="email-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCopy}
                >
                  <Copy size={16} /> Copy to Clipboard
                </button>
                <span className="text-muted text-sm">
                  You can freely modify any wording directly inside the text fields.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;
