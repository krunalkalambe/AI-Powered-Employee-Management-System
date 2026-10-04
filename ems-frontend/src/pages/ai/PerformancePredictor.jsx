import React, { useState } from 'react';
import { aiApi } from '../../api/axios';
import Toast from '../../components/Toast';
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  BookOpen,
  Target,
} from 'lucide-react';

const PerformancePredictor = () => {
  const [formData, setFormData] = useState({
    attendancePercentage: 96,
    projectsCompleted: 8,
    peerRating: 4.2,
    trainingHours: 25,
    experienceYears: 3.0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiApi.post('/api/ai/performance', formData);
      setResult(res.data);
      setToast({ message: 'Performance evaluation generated successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to predict performance. Check AI service.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="performance-ai-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header-row">
        <div>
          <h2>Employee Performance Prediction & Appraisal AI</h2>
          <p className="page-header-sub">
            Model professional deliverables, execution reliability, and continuous learning metrics
          </p>
        </div>
      </div>

      <div className="ai-two-column-layout">
        {/* Left: Performance Inputs */}
        <div className="ai-input-card">
          <div className="card-top-bar">
            <h3>Appraisal Input Metrics</h3>
          </div>

          <form onSubmit={handlePredict} className="ai-slider-form">
            <div className="slider-group">
              <div className="slider-header">
                <label>Attendance Rate</label>
                <span className="slider-val">{formData.attendancePercentage}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                step="1"
                name="attendancePercentage"
                value={formData.attendancePercentage}
                onChange={handleChange}
              />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Peer & 360° Feedback Rating</label>
                <span className="slider-val">{formData.peerRating} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                name="peerRating"
                value={formData.peerRating}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid-2 mt-2">
              <div className="form-group">
                <label>Completed Projects (Year)</label>
                <input
                  type="number"
                  min="0"
                  name="projectsCompleted"
                  value={formData.projectsCompleted}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Upskilling Training Hours</label>
                <input
                  type="number"
                  min="0"
                  name="trainingHours"
                  value={formData.trainingHours}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading}>
              {loading ? (
                <span>Synthesizing Appraisal AI...</span>
              ) : (
                <span>
                  <Sparkles size={16} /> Predict Performance Rating
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Predicted Results */}
        <div className="ai-output-card">
          {!result ? (
            <div className="empty-state">
              <Award size={48} className="text-muted" />
              <h4>No Performance Analysis Yet</h4>
              <p>Configure the parameters and generate the prediction.</p>
            </div>
          ) : (
            <div className="performance-results-wrap">
              <div className="perf-hero-card">
                <div className="perf-score-badge">
                  <Star size={28} className="star-icon" />
                  <span className="perf-score-num">{result.predictedScore}</span>
                  <small>/ 5.0</small>
                </div>
                <div className="perf-meta">
                  <h4>{result.performanceCategory}</h4>
                  <p>{result.evaluationSummary}</p>
                </div>
              </div>

              <div className="result-section">
                <span className="section-subtitle">
                  <Target size={16} /> Actionable Growth & Coaching Roadmap
                </span>
                <ul className="roadmap-list">
                  {result.growthRoadmap.map((item, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} className="text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="result-section">
                <span className="section-subtitle">
                  <BookOpen size={16} /> Evaluated Input Parameters
                </span>
                <div className="meta-pills-row">
                  <span className="meta-pill">Attendance: {result.metricsEvaluated.attendance}</span>
                  <span className="meta-pill">Projects: {result.metricsEvaluated.projectsCompleted}</span>
                  <span className="meta-pill">Peer Feedback: {result.metricsEvaluated.peerFeedback}</span>
                  <span className="meta-pill">Training: {result.metricsEvaluated.trainingHours}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformancePredictor;
