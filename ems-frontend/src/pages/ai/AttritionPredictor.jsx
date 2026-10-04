import React, { useState } from 'react';
import { aiApi } from '../../api/axios';
import Toast from '../../components/Toast';
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Sliders,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

const AttritionPredictor = () => {
  const [formData, setFormData] = useState({
    jobSatisfaction: 2.5,
    performanceScore: 3.5,
    monthlyOvertimeHours: 25,
    salary: 45000,
    tenureYears: 2.5,
    promotionsLast3Years: 0,
    workLifeBalance: 2.5,
    department: 'Engineering',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) || value }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiApi.post('/api/ai/attrition', formData);
      setResult(res.data);
      setToast({ message: 'Attrition risk evaluated successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error communicating with AI service', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'LOW':
        return <span className="risk-badge risk-low">Low Attrition Risk</span>;
      case 'MEDIUM':
        return <span className="risk-badge risk-medium">Moderate Retention Watch</span>;
      case 'HIGH':
        return <span className="risk-badge risk-high">High Flight Risk</span>;
      default:
        return null;
    }
  };

  return (
    <div className="attrition-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header-row">
        <div>
          <h2>Employee Attrition Risk Predictor</h2>
          <p className="page-header-sub">
            Evaluate workforce retention signals and derive proactive talent preservation recommendations
          </p>
        </div>
      </div>

      <div className="ai-two-column-layout">
        {/* Left: Interactive Input Sliders */}
        <div className="ai-input-card">
          <div className="card-top-bar">
            <h3>
              <Sliders size={18} /> Employee Engagement Factors
            </h3>
          </div>

          <form onSubmit={handlePredict} className="ai-slider-form">
            <div className="slider-group">
              <div className="slider-header">
                <label>Job Satisfaction Rating</label>
                <span className="slider-val">{formData.jobSatisfaction} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                name="jobSatisfaction"
                value={formData.jobSatisfaction}
                onChange={handleChange}
              />
              <div className="slider-labels">
                <span>Dissatisfied (1.0)</span>
                <span>Very Happy (5.0)</span>
              </div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Work-Life Balance Score</label>
                <span className="slider-val">{formData.workLifeBalance} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                name="workLifeBalance"
                value={formData.workLifeBalance}
                onChange={handleChange}
              />
              <div className="slider-labels">
                <span>Poor (1.0)</span>
                <span>Excellent (5.0)</span>
              </div>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Monthly Overtime Hours</label>
                <span className="slider-val">{formData.monthlyOvertimeHours} hrs/month</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                name="monthlyOvertimeHours"
                value={formData.monthlyOvertimeHours}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid-2 mt-2">
              <div className="form-group">
                <label>Current Base Salary (INR)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Company Tenure (Years)</label>
                <input
                  type="number"
                  step="0.5"
                  name="tenureYears"
                  value={formData.tenureYears}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Promotions (Last 3 Yrs)</label>
                <select
                  name="promotionsLast3Years"
                  value={formData.promotionsLast3Years}
                  onChange={handleChange}
                >
                  <option value={0}>0 (No Promotion)</option>
                  <option value={1}>1 Promotion</option>
                  <option value={2}>2+ Promotions</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading}>
              {loading ? (
                <span>Evaluating Signals...</span>
              ) : (
                <span>
                  <Sparkles size={16} /> Predict Attrition Probability
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Results Card */}
        <div className="ai-output-card">
          {!result ? (
            <div className="empty-state">
              <TrendingDown size={48} className="text-muted" />
              <h4>No Risk Prediction Yet</h4>
              <p>Adjust the engagement metrics and click "Predict Attrition Probability".</p>
            </div>
          ) : (
            <div className="attrition-results-wrap">
              {/* Hero Banner */}
              <div className={`risk-hero-box hero-${result.riskLevel.toLowerCase()}`}>
                <div className="risk-level-header">
                  {getRiskBadge(result.riskLevel)}
                  <span className="risk-pct-tag">{result.attritionProbability}% Turnover Risk</span>
                </div>
                <div className="risk-progress-bar-wrap">
                  <div
                    className={`risk-progress-fill fill-${result.riskLevel.toLowerCase()}`}
                    style={{ width: `${result.attritionProbability}%` }}
                  ></div>
                </div>
              </div>

              {/* Contributing Drivers */}
              <div className="result-section">
                <span className="section-subtitle">
                  <AlertTriangle size={16} /> Primary Contributing Risk Factors
                </span>
                <ul className="factors-list">
                  {result.contributingFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>

              {/* Actionable HR Strategies */}
              <div className="result-section">
                <span className="section-subtitle">
                  <Lightbulb size={16} /> HR Retention Suggestions & Strategy
                </span>
                <ul className="suggestions-list">
                  {result.hrSuggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>

              {/* Legal Disclaimer */}
              <div className="ai-disclaimer-card">
                <HelpCircle size={16} />
                <p>{result.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttritionPredictor;
