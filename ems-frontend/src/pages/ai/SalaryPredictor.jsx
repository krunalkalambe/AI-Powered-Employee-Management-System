import React, { useState } from 'react';
import { aiApi } from '../../api/axios';
import Toast from '../../components/Toast';
import {
  BadgeDollarSign,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Briefcase,
  Layers,
  Award,
} from 'lucide-react';

const SalaryPredictor = () => {
  const [formData, setFormData] = useState({
    designation: 'Software Engineer',
    department: 'Engineering',
    experienceYears: 3.0,
    skillCount: 6,
    performanceRating: 4.0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === 'number' || e.target.type === 'range' ? Number(value) : value,
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiApi.post('/api/ai/salary', formData);
      setResult(res.data);
      setToast({ message: 'Salary benchmark predicted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to predict salary benchmark', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salary-predictor-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header-row">
        <div>
          <h2>Market Salary Benchmark Predictor</h2>
          <p className="page-header-sub">
            Estimate competitive corporate compensation bands based on skill proficiency and tenure
          </p>
        </div>
      </div>

      <div className="ai-two-column-layout">
        {/* Left: Input Form */}
        <div className="ai-input-card">
          <div className="card-top-bar">
            <h3>Role & Competency Parameters</h3>
          </div>

          <form onSubmit={handlePredict} className="ai-slider-form">
            <div className="form-group">
              <label>Target Designation / Title</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              >
                <option value="Junior Software Engineer">Junior Software Engineer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Senior Software Engineer">Senior Software Engineer</option>
                <option value="Tech Lead / Architect">Tech Lead / Architect</option>
                <option value="Engineering Manager">Engineering Manager</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="HR Executive">HR Executive</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Product Manager">Product Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Years of Relevant Experience</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Verified Skill Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  name="skillCount"
                  value={formData.skillCount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="slider-group mt-2">
              <div className="slider-header">
                <label>Performance Appraisal Rating</label>
                <span className="slider-val">{formData.performanceRating} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                name="performanceRating"
                value={formData.performanceRating}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading}>
              {loading ? (
                <span>Querying Market Benchmarks...</span>
              ) : (
                <span>
                  <Sparkles size={16} /> Predict Market Compensation
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Results Display */}
        <div className="ai-output-card">
          {!result ? (
            <div className="empty-state">
              <BadgeDollarSign size={48} className="text-muted" />
              <h4>No Salary Benchmark Computed</h4>
              <p>Configure role details and generate competitive market salary estimation.</p>
            </div>
          ) : (
            <div className="salary-results-wrap">
              <div className="salary-hero-card">
                <span className="salary-hero-label">Estimated Annual / Monthly Compensation</span>
                <h3 className="salary-hero-amount">
                  ₹{result.expectedSalary.toLocaleString('en-IN')}{' '}
                  <span className="per-month">/ month</span>
                </h3>
                <div className="salary-range-band">
                  <span>Band: ₹{result.salaryRange.min.toLocaleString('en-IN')} (Min)</span>
                  <span>—</span>
                  <span>₹{result.salaryRange.max.toLocaleString('en-IN')} (Max)</span>
                </div>
                <div className="market-percentile-tag">
                  <TrendingUp size={14} /> Market Position: <strong>{result.marketPercentile}</strong>
                </div>
              </div>

              <div className="result-section">
                <span className="section-subtitle">
                  <Briefcase size={16} /> AI Valuation Rationale
                </span>
                <p className="rationale-text">{result.rationale}</p>
              </div>

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

export default SalaryPredictor;
