import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { aiApi } from '../../api/axios';
import StatCard from '../../components/StatCard';
import {
  Users,
  Building2,
  CalendarCheck,
  CalendarX,
  Clock,
  DollarSign,
  TrendingDown,
  Sparkles,
  Bot,
  FileSearch,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Award,
} from 'lucide-react';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
    employeesAtRisk: 1,
  });
  const [myAttendance, setMyAttendance] = useState(null);
  const [mySalary, setMySalary] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [pendingLeaveList, setPendingLeaveList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [role, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (role === 'ADMIN' || role === 'HR') {
        const [sumRes, empRes, leaveRes] = await Promise.allSettled([
          api.get('/api/reports/summary'),
          api.get('/api/employees'),
          api.get('/api/leaves/all?status=PENDING'),
        ]);

        if (sumRes.status === 'fulfilled') {
          setStats((prev) => ({
            ...prev,
            ...sumRes.value.data,
            employeesAtRisk: 2,
          }));
        }
        if (empRes.status === 'fulfilled') {
          setRecentEmployees(empRes.value.data.slice(-5).reverse());
        }
        if (leaveRes.status === 'fulfilled') {
          setPendingLeaveList(leaveRes.value.data.slice(0, 5));
        }
      } else if (role === 'MANAGER') {
        const [sumRes, leaveRes] = await Promise.allSettled([
          api.get('/api/reports/summary'),
          api.get('/api/leaves/all?status=PENDING'),
        ]);
        if (sumRes.status === 'fulfilled') {
          setStats((prev) => ({ ...prev, ...sumRes.value.data }));
        }
        if (leaveRes.status === 'fulfilled') {
          setPendingLeaveList(leaveRes.value.data.slice(0, 5));
        }
      } else {
        // Employee Personal Dashboard
        if (user?.email) {
          const [attRes, salRes, leaveRes] = await Promise.allSettled([
            api.get(`/api/attendance/employee/${user.email}`),
            api.get(`/api/payroll/employee/${user.email}`),
            api.get(`/api/leaves/my?email=${user.email}`),
          ]);

          if (attRes.status === 'fulfilled') {
            setMyAttendance(attRes.value.data);
          }
          if (salRes.status === 'fulfilled' && salRes.value.data.length > 0) {
            setMySalary(salRes.value.data[0]);
          }
          if (leaveRes.status === 'fulfilled') {
            setMyLeaves(leaveRes.value.data.slice(0, 4));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      await api.post('/api/attendance/mark', {
        email: user.email,
        status: 'PRESENT',
        action: 'CHECK_IN',
        remarks: 'Portal check in',
      });
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const isAdminOrHR = role === 'ADMIN' || role === 'HR';
  const isManager = role === 'MANAGER';
  const isEmployee = role === 'EMPLOYEE';

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Gathering organizational insights...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {user?.name || 'Team Member'}! 👋</h2>
          <p>
            {isAdminOrHR && 'Here is the high-level executive overview of workforce operations and AI insights.'}
            {isManager && 'Review your team deliverables, pending leave requests, and attendance rosters.'}
            {isEmployee && 'Track your attendance, manage leave requests, and explore AI career tools.'}
          </p>
        </div>
        <div className="welcome-actions">
          {isEmployee && (
            <button className="btn btn-primary" onClick={handleQuickCheckIn}>
              <CalendarCheck size={18} /> Quick Check-In
            </button>
          )}
          <Link to="/ai/chatbot" className="btn btn-gradient">
            <Sparkles size={18} /> Ask HR Bot
          </Link>
        </div>
      </div>

      {/* KPI Cards Section */}
      {(isAdminOrHR || isManager) ? (
        <div className="stats-grid">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees || 0}
            icon={Users}
            color="blue"
            trend={{ text: '+12% this quarter', type: 'up' }}
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments || 0}
            icon={Building2}
            color="purple"
            subtext="Active divisions"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday || 0}
            icon={CalendarCheck}
            color="green"
            subtext="Staff marked on-time"
          />
          <StatCard
            title="Absent / Unmarked"
            value={stats.absentToday || 0}
            icon={CalendarX}
            color="amber"
            subtext="Absence alerts"
          />
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves || 0}
            icon={Clock}
            color="amber"
            subtext="Awaiting review"
          />
          <StatCard
            title="Total Payroll"
            value={`₹${(stats.totalPayroll || 0).toLocaleString('en-IN')}`}
            icon={DollarSign}
            color="emerald"
            subtext="Estimated monthly"
          />
          <StatCard
            title="Employees at Risk"
            value={stats.employeesAtRisk || 1}
            icon={TrendingDown}
            color="rose"
            subtext="AI Attrition Risk"
          />
        </div>
      ) : (
        <div className="stats-grid">
          <StatCard
            title="Attendance Rate"
            value={`${myAttendance?.attendancePercentage || 95}%`}
            icon={CalendarCheck}
            color="green"
            subtext={`${myAttendance?.presentCount || 0} days recorded`}
          />
          <StatCard
            title="Latest Net Salary"
            value={mySalary ? `₹${mySalary.netSalary.toLocaleString('en-IN')}` : '₹50,000'}
            icon={DollarSign}
            color="emerald"
            subtext={mySalary ? `${mySalary.month} ${mySalary.year}` : 'Current Month'}
          />
          <StatCard
            title="Leaves Applied"
            value={myLeaves.length}
            icon={Clock}
            color="blue"
            subtext="All-time requests"
          />
          <StatCard
            title="Assigned Role"
            value={role}
            icon={Award}
            color="purple"
            subtext={user?.employeeId || 'EMP-1001'}
          />
        </div>
      )}

      {/* AI Features Quick Cards */}
      <div className="section-title-wrap">
        <h3 className="section-title">
          <Sparkles size={20} className="text-accent" /> AI Operations & Analytics
        </h3>
        <span className="section-desc">Smart machine intelligence modules tailored for human resources</span>
      </div>

      <div className="ai-feature-cards-grid">
        <Link to="/ai/chatbot" className="ai-quick-card card-hover">
          <div className="ai-card-icon bot-icon">
            <Bot size={24} />
          </div>
          <div className="ai-card-info">
            <h4>HR Assistant Bot</h4>
            <p>Instant policy answers, leave rules, and guidance</p>
          </div>
          <ArrowUpRight size={18} className="ai-card-arrow" />
        </Link>

        {isAdminOrHR && (
          <Link to="/ai/resume-analyzer" className="ai-quick-card card-hover">
            <div className="ai-card-icon resume-icon">
              <FileSearch size={24} />
            </div>
            <div className="ai-card-info">
              <h4>Resume Analyzer</h4>
              <p>Parse resumes, match candidate skills & scores</p>
            </div>
            <ArrowUpRight size={18} className="ai-card-arrow" />
          </Link>
        )}

        {isAdminOrHR && (
          <Link to="/ai/attrition" className="ai-quick-card card-hover">
            <div className="ai-card-icon attrition-icon">
              <TrendingDown size={24} />
            </div>
            <div className="ai-card-info">
              <h4>Attrition Predictor</h4>
              <p>Detect flight risks and formulate retention plans</p>
            </div>
            <ArrowUpRight size={18} className="ai-card-arrow" />
          </Link>
        )}

        {(isAdminOrHR || isManager) && (
          <Link to="/ai/performance" className="ai-quick-card card-hover">
            <div className="ai-card-icon perf-icon">
              <Award size={24} />
            </div>
            <div className="ai-card-info">
              <h4>Performance AI</h4>
              <p>Predict growth scores, identify star performers</p>
            </div>
            <ArrowUpRight size={18} className="ai-card-arrow" />
          </Link>
        )}
      </div>

      {/* Two Column Layout: Recent Roster & Leave Queues */}
      <div className="dashboard-split-grid">
        {(isAdminOrHR || isManager) ? (
          <>
            {/* Left: Pending Leave Approvals */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Pending Leave Approvals</h3>
                <Link to="/leave" className="btn btn-sm btn-link">
                  View All
                </Link>
              </div>
              <div className="dash-card-body">
                {pendingLeaveList.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle2 size={36} className="text-muted" />
                    <p>No pending leave requests to review.</p>
                  </div>
                ) : (
                  <div className="list-items">
                    {pendingLeaveList.map((item) => (
                      <div key={item.id} className="list-item-row">
                        <div className="item-main">
                          <strong>{item.employeeName}</strong>
                          <span className="item-sub">
                            {item.leaveType} ({item.totalDays} {item.totalDays === 1 ? 'day' : 'days'}) • {item.startDate} to {item.endDate}
                          </span>
                        </div>
                        <span className="badge badge-warning">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recent Employee Directory */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Recently Added Employees</h3>
                <Link to="/employees" className="btn btn-sm btn-link">
                  Directory
                </Link>
              </div>
              <div className="dash-card-body">
                {recentEmployees.length === 0 ? (
                  <div className="empty-state">
                    <Users size={36} className="text-muted" />
                    <p>No employee records found.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Designation</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentEmployees.map((emp) => (
                          <tr key={emp.id}>
                            <td><code>{emp.empId || `EMP-${emp.id}`}</code></td>
                            <td><strong>{emp.fname}</strong></td>
                            <td>{emp.department || 'General'}</td>
                            <td>{emp.desig || 'Staff'}</td>
                            <td>
                              <span className={`status-pill status-${(emp.status || 'ACTIVE').toLowerCase()}`}>
                                {emp.status || 'ACTIVE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Employee Leaves List */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>My Recent Leaves</h3>
                <Link to="/leave" className="btn btn-sm btn-link">
                  Apply Leave
                </Link>
              </div>
              <div className="dash-card-body">
                {myLeaves.length === 0 ? (
                  <div className="empty-state">
                    <CalendarCheck size={36} className="text-muted" />
                    <p>You haven't applied for any leaves yet.</p>
                  </div>
                ) : (
                  <div className="list-items">
                    {myLeaves.map((l) => (
                      <div key={l.id} className="list-item-row">
                        <div className="item-main">
                          <strong>{l.leaveType} Leave ({l.totalDays} days)</strong>
                          <span className="item-sub">
                            {l.startDate} to {l.endDate} • {l.reason}
                          </span>
                        </div>
                        <span className={`badge badge-${l.status.toLowerCase()}`}>
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Employee Compensation Card */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>My Compensation Summary</h3>
                <Link to="/payroll" className="btn btn-sm btn-link">
                  View Payslips
                </Link>
              </div>
              <div className="dash-card-body">
                {mySalary ? (
                  <div className="salary-summary-box">
                    <div className="salary-row">
                      <span>Basic Pay</span>
                      <strong>₹{mySalary.basicSalary.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="salary-row text-success">
                      <span>Allowances (HRA / Special)</span>
                      <strong>+ ₹{mySalary.allowance.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="salary-row text-danger">
                      <span>Deductions (PF / Tax)</span>
                      <strong>- ₹{mySalary.deduction.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="salary-divider"></div>
                    <div className="salary-row total-row">
                      <span>Net Disbursed Salary</span>
                      <strong className="net-amount">₹{mySalary.netSalary.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <DollarSign size={36} className="text-muted" />
                    <p>Payslip for current cycle will be generated by the 1st.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
