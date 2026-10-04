import React, { useState } from 'react';
import { aiApi } from '../../api/axios';
import Toast from '../../components/Toast';
import {
  FileSearch,
  Upload,
  CheckCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Briefcase,
  GraduationCap,
  Layers,
} from 'lucide-react';

const sampleResumeText = `AARAV SHARMA
Email: aarav.sharma@example.com | Phone: +91 9876543210 | Location: Nagpur, India

SUMMARY
Passionate Full Stack Software Engineer with 3+ years of practical experience building responsive web applications and scalable RESTful backends. Skilled in Java, Spring Boot, React, MySQL, JavaScript, Git, and Docker.

EDUCATION
B.Tech in Computer Science & Engineering - TGPCET (2020 - 2024), CGPA: 8.5/10

EXPERIENCE
Software Engineer - Innova Tech Solutions (2024 - Present)
- Developed secure microservices using Java 17 and Spring Boot for employee data tracking.
- Designed modern single-page frontend interfaces with React, Vite, and CSS.
- Automated MySQL database indexing and schema optimizations, reducing API response times by 35%.
- Implemented JWT token-based authentication and role-based access control.

TECHNICAL SKILLS
Languages: Java, JavaScript, SQL, HTML5, CSS3, Python
Frameworks & Tools: Spring Boot, React, Hibernate, REST APIs, Git, GitHub, Docker, Postman
Databases: MySQL, PostgreSQL
Soft Skills: Agile Teamwork, Problem Solving, Communication`;

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState(sampleResumeText);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setToast({ message: 'Please provide resume text to analyze', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await aiApi.post('/api/ai/resume-analyzer', {
        resumeText,
        targetRole,
      });
      setAnalysis(res.data);
      setToast({ message: 'Resume analysis generated successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to analyze resume. Verify AI microservice.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-analyzer-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header-row">
        <div>
          <h2>AI Resume Screening & Analyzer</h2>
          <p className="page-header-sub">
            Evaluate candidate suitability, extract verified skills, and highlight technical gaps
          </p>
        </div>
      </div>

      <div className="ai-two-column-layout">
        {/* Left: Input Form */}
        <div className="ai-input-card">
          <div className="card-top-bar">
            <h3>Candidate Resume Input</h3>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setResumeText(sampleResumeText)}
            >
              Load Sample Candidate
            </button>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label>Target Employment Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Developer">Backend Developer (Java / Spring)</option>
                <option value="Data Analyst / AI Specialist">Data Analyst / AI Specialist</option>
                <option value="Human Resources Manager">Human Resources Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label>Paste Resume Content / CV Text</label>
              <textarea
                rows={14}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate resume text or CV summary here..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span>Screening Candidate Profile...</span>
              ) : (
                <span>
                  <Sparkles size={16} /> Analyze Candidate Match
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Analysis Results */}
        <div className="ai-output-card">
          {!analysis ? (
            <div className="empty-state">
              <FileSearch size={48} className="text-muted" />
              <h4>No Analysis Generated Yet</h4>
              <p>
                Click "Analyze Candidate Match" to screen the candidate against the{' '}
                <strong>{targetRole}</strong> role requirements.
              </p>
            </div>
          ) : (
            <div className="analysis-results-container">
              {/* Scorecard */}
              <div className="scorecard-hero">
                <div className="score-circle">
                  <span className="score-number">{analysis.matchScore}%</span>
                  <span className="score-label">Match Score</span>
                </div>
                <div className="score-meta">
                  <h4>{analysis.targetRole}</h4>
                  <p className="score-recommendation">{analysis.recommendation}</p>
                  <div className="meta-badges">
                    <span className="meta-pill">
                      <GraduationCap size={14} /> {analysis.education}
                    </span>
                    <span className="meta-pill">
                      <Briefcase size={14} /> {analysis.detectedExperience}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Extracted */}
              <div className="result-section">
                <span className="section-subtitle">
                  <Layers size={16} /> Detected Skills & Competencies ({analysis.skillsFound.length})
                </span>
                <div className="skills-chips-row">
                  {analysis.skillsFound.map((skill, i) => (
                    <span key={i} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benchmark Matching & Gaps */}
              <div className="two-col-gaps">
                <div className="matched-box">
                  <span className="gap-title text-success">
                    <CheckCircle size={16} /> Matched Role Skills
                  </span>
                  <ul>
                    {analysis.matchedBenchmarkSkills.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="missing-box">
                  <span className="gap-title text-danger">
                    <AlertTriangle size={16} /> Potential Gaps / Missing
                  </span>
                  <ul>
                    {analysis.missingSkills.length === 0 ? (
                      <li className="text-success">No major skill gaps detected!</li>
                    ) : (
                      analysis.missingSkills.map((s, i) => <li key={i}>{s}</li>)
                    )}
                  </ul>
                </div>
              </div>

              {/* Key Strengths */}
              <div className="result-section">
                <span className="section-subtitle">
                  <Award size={16} /> Key Profile Strengths
                </span>
                <ul className="strengths-list">
                  {analysis.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
