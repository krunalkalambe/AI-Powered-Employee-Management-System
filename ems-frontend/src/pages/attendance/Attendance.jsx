import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import {
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle,
  Percent,
  Search,
  Filter,
  LogIn,
  LogOut,
  Calendar,
} from 'lucide-react';

const Attendance = () => {
  const { user, role } = useAuth();
  const isAdminOrHR = role === 'ADMIN' || role === 'HR';
  const isManager = role === 'MANAGER';

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    attendanceRateToday: 0,
  });
  const [personalStats, setPersonalStats] = useState({
    totalDays: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendancePercentage: 100,
  });

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmpEmail, setSelectedEmpEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Manual Mark Attendance Modal
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markData, setMarkData] = useState({
    email: user?.email || '',
    status: 'PRESENT',
    remarks: '',
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadAttendanceData();
    if (isAdminOrHR || isManager) {
      loadEmployees();
    }
  }, [filterDate, selectedEmpEmail]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadEmployees = async () => {
    try {
      const res = await api.get('/api/employees');
      setEmployees(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      if (isAdminOrHR || isManager) {
        // Load stats
        const statsRes = await api.get('/api/attendance/stats');
        setStats(statsRes.data);

        // Load records with date/email filter
        let url = `/api/attendance/all?date=${filterDate}`;
        if (selectedEmpEmail) {
          url = `/api/attendance/all?email=${selectedEmpEmail}`;
        }
        const recordsRes = await api.get(url);
        setAttendanceRecords(recordsRes.data);
      } else {
        // Personal employee attendance
        if (user?.email) {
          const res = await api.get(`/api/attendance/employee/${user.email}`);
          setAttendanceRecords(res.data.records || []);
          setPersonalStats({
            totalDays: res.data.totalDays,
            presentCount: res.data.presentCount,
            lateCount: res.data.lateCount,
            absentCount: res.data.absentCount,
            attendancePercentage: res.data.attendancePercentage,
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = async (action) => {
    try {
      await api.post('/api/attendance/mark', {
        email: user.email,
        status: 'PRESENT',
        action: action, // "CHECK_IN" or "CHECK_OUT"
        remarks: action === 'CHECK_IN' ? 'Checked in via portal' : 'Checked out for the day',
      });
      showToast(action === 'CHECK_IN' ? 'Check-in recorded successfully!' : 'Check-out recorded successfully!');
      loadAttendanceData();
    } catch (err) {
      console.error(err);
      showToast('Failed to record check in/out', 'error');
    }
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/attendance/mark', markData);
      showToast('Attendance recorded successfully');
      setIsMarkModalOpen(false);
      loadAttendanceData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error recording attendance', 'error');
    }
  };

  return (
    <div className="attendance-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <div className="page-header-row">
        <div>
          <h2>Attendance & Timesheet Tracking</h2>
          <p className="page-header-sub">
            {isAdminOrHR || isManager
              ? 'Real-time staff punch-in logs, punctuality metrics, and absence tracking'
              : 'Log your daily work hours and review your historical attendance percentage'}
          </p>
        </div>

        <div className="header-action-group">
          <button
            className="btn btn-success"
            onClick={() => handleQuickCheck('CHECK_IN')}
          >
            <LogIn size={18} /> Quick Check-In
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleQuickCheck('CHECK_OUT')}
          >
            <LogOut size={18} /> Check-Out
          </button>
          {(isAdminOrHR || isManager) && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setMarkData({ email: '', status: 'PRESENT', remarks: '' });
                setIsMarkModalOpen(true);
              }}
            >
              <CalendarCheck size={18} /> Mark Attendance
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {(isAdminOrHR || isManager) ? (
        <div className="stats-grid mb-4">
          <StatCard
            title="Present Today"
            value={stats.presentToday || 0}
            icon={CalendarCheck}
            color="green"
            subtext="On-time attendees"
          />
          <StatCard
            title="Late Today"
            value={stats.lateToday || 0}
            icon={Clock}
            color="amber"
            subtext="Arrived after 9:45 AM"
          />
          <StatCard
            title="Absent Today"
            value={stats.absentToday || 0}
            icon={CalendarX}
            color="rose"
            subtext="Unmarked or on leave"
          />
          <StatCard
            title="Daily Attendance Rate"
            value={`${stats.attendanceRateToday || 0}%`}
            icon={Percent}
            color="blue"
            subtext="Of total headcount"
          />
        </div>
      ) : (
        <div className="stats-grid mb-4">
          <StatCard
            title="My Attendance Rate"
            value={`${personalStats.attendancePercentage}%`}
            icon={Percent}
            color="green"
            subtext="All-time punctuality"
          />
          <StatCard
            title="Present Days"
            value={personalStats.presentCount}
            icon={CheckCircle}
            color="blue"
            subtext="Logged successfully"
          />
          <StatCard
            title="Late Arrivals"
            value={personalStats.lateCount}
            icon={Clock}
            color="amber"
            subtext="Grace marks"
          />
          <StatCard
            title="Total Working Days"
            value={personalStats.totalDays}
            icon={CalendarCheck}
            color="purple"
            subtext="In records"
          />
        </div>
      )}

      {/* Filters for Admin/Manager */}
      {(isAdminOrHR || isManager) && (
        <div className="filter-bar-card">
          <div className="filter-item">
            <label className="filter-label">Filter by Date:</label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setSelectedEmpEmail('');
                }}
              />
            </div>
          </div>

          <div className="filter-item">
            <label className="filter-label">Filter by Employee:</label>
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <select
                value={selectedEmpEmail}
                onChange={(e) => setSelectedEmpEmail(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.email}>
                    {emp.fname} ({emp.empId || `EMP-${emp.id}`})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="table-card">
        <div className="table-card-header">
          <h3>
            {isAdminOrHR || isManager
              ? selectedEmpEmail
                ? `Attendance History for ${selectedEmpEmail}`
                : `Attendance Logs for ${filterDate}`
              : 'My Attendance Logs'}
          </h3>
          <span className="table-count-label">
            {attendanceRecords.length} record(s)
          </span>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading timesheets...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={40} className="text-muted" />
            <h4>No attendance records found</h4>
            <p>
              {isAdminOrHR || isManager
                ? 'No staff have marked attendance for this selection.'
                : 'Click "Quick Check-In" to log your attendance today.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((rec) => (
                  <tr key={rec.id} className="table-row-hover">
                    <td>
                      <strong>{rec.date}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{rec.employeeName}</strong>
                        <span className="emp-email-sub">{rec.employeeEmail}</span>
                      </div>
                    </td>
                    <td>
                      <code className="time-code">
                        {rec.checkInTime ? rec.checkInTime.substring(0, 5) : '—'}
                      </code>
                    </td>
                    <td>
                      <code className="time-code">
                        {rec.checkOutTime ? rec.checkOutTime.substring(0, 5) : '—'}
                      </code>
                    </td>
                    <td>
                      <span className={`status-pill status-${rec.status?.toLowerCase()}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">{rec.remarks || 'Standard punch'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Mark Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Record Employee Attendance"
        maxWidth="500px"
      >
        <form onSubmit={handleMarkSubmit} className="modal-form">
          <div className="form-group">
            <label>Select Employee *</label>
            <select
              value={markData.email}
              onChange={(e) => setMarkData({ ...markData, email: e.target.value })}
              required
            >
              <option value="">Choose employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.email}>
                  {emp.fname} - {emp.email} ({emp.empId || `EMP-${emp.id}`})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Attendance Status *</label>
            <select
              value={markData.status}
              onChange={(e) => setMarkData({ ...markData, status: e.target.value })}
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. Approved client visit, medical delay"
              value={markData.remarks}
              onChange={(e) => setMarkData({ ...markData, remarks: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsMarkModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
