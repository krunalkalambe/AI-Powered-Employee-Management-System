import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import {
  CalendarOff,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';

const Leave = () => {
  const { user, role } = useAuth();
  const isAdminOrHR = role === 'ADMIN' || role === 'HR';
  const isManager = role === 'MANAGER';

  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingLeave, setReviewingLeave] = useState(null);
  const [reviewDecision, setReviewDecision] = useState({
    status: 'APPROVED',
    remarks: '',
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadLeaves = async () => {
    setLoading(true);
    try {
      if (isAdminOrHR || isManager) {
        // Load stats
        const statsRes = await api.get('/api/leaves/stats');
        setStats(statsRes.data);

        // Load all leaves with filter
        let url = '/api/leaves/all';
        if (statusFilter !== 'ALL') {
          url += `?status=${statusFilter}`;
        }
        const res = await api.get(url);
        setLeaves(res.data);
      } else {
        // Employee leaves
        if (user?.email) {
          const res = await api.get(`/api/leaves/my?email=${user.email}`);
          const myData = res.data;
          setLeaves(myData);
          setStats({
            totalRequests: myData.length,
            pending: myData.filter((l) => l.status === 'PENDING').length,
            approved: myData.filter((l) => l.status === 'APPROVED').length,
            rejected: myData.filter((l) => l.status === 'REJECTED').length,
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading leave applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/leaves/apply', {
        ...applyForm,
        email: user.email,
      });
      showToast('Leave request submitted successfully!');
      setIsApplyModalOpen(false);
      setApplyForm({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
      loadLeaves();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit leave request', 'error');
    }
  };

  const handleOpenReview = (leave, decision) => {
    setReviewingLeave(leave);
    setReviewDecision({
      status: decision,
      remarks: decision === 'APPROVED' ? 'Approved by manager' : 'Declined due to team scheduling requirements',
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingLeave) return;

    try {
      await api.put(`/api/leaves/${reviewingLeave.id}/status`, {
        status: reviewDecision.status,
        reviewedBy: user.name || user.email,
        remarks: reviewDecision.remarks,
      });
      showToast(`Leave request ${reviewDecision.status.toLowerCase()} successfully`);
      setIsReviewModalOpen(false);
      loadLeaves();
    } catch (err) {
      console.error(err);
      showToast('Error updating leave decision', 'error');
    }
  };

  return (
    <div className="leave-page">
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
          <h2>Leave Management & Approvals</h2>
          <p className="page-header-sub">
            {isAdminOrHR || isManager
              ? 'Review pending time-off requests, monitor leave quotas, and maintain audit trails'
              : 'Apply for planned or sick leaves, and check your approval status in real time'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid mb-4">
        <StatCard
          title="Total Requests"
          value={stats.totalRequests || 0}
          icon={CalendarOff}
          color="blue"
          subtext="Applications recorded"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pending || 0}
          icon={Clock}
          color="amber"
          subtext="Awaiting manager sign-off"
        />
        <StatCard
          title="Approved Leaves"
          value={stats.approved || 0}
          icon={CheckCircle}
          color="green"
          subtext="Successfully granted"
        />
        <StatCard
          title="Rejected / Declined"
          value={stats.rejected || 0}
          icon={XCircle}
          color="rose"
          subtext="Not approved"
        />
      </div>

      {/* Filter Bar for Reviewers */}
      {(isAdminOrHR || isManager) && (
        <div className="filter-bar-card">
          <div className="filter-item">
            <label className="filter-label">Filter by Status:</label>
            <div className="input-with-icon">
              <Filter size={16} className="input-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table of Leaves */}
      <div className="table-card">
        <div className="table-card-header">
          <h3>
            {isAdminOrHR || isManager ? 'Leave Request Queue' : 'My Leave Applications'}
          </h3>
          <span className="table-count-label">{leaves.length} record(s)</span>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading leave applications...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <CalendarOff size={40} className="text-muted" />
            <h4>No leave requests found</h4>
            <p>
              {isAdminOrHR || isManager
                ? 'All leave requests have been resolved.'
                : 'Click "Apply for Leave" above to create your first application.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {(isAdminOrHR || isManager) && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} className="table-row-hover">
                    <td>
                      <div>
                        <strong>{l.employeeName}</strong>
                        <span className="emp-email-sub">{l.employeeEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className="leave-type-tag">{l.leaveType}</span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {l.startDate} to {l.endDate}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {l.totalDays} {l.totalDays === 1 ? 'day' : 'days'}
                      </strong>
                    </td>
                    <td>
                      <p className="leave-reason-text">{l.reason}</p>
                      {l.reviewRemarks && (
                        <small className="reviewer-note">
                          Note: {l.reviewRemarks} (by {l.reviewedBy || 'HR'})
                        </small>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill status-${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                    {(isAdminOrHR || isManager) && (
                      <td className="text-right">
                        {l.status === 'PENDING' ? (
                          <div className="action-buttons-group">
                            <button
                              className="btn btn-sm btn-success"
                              title="Approve Leave"
                              onClick={() => handleOpenReview(l, 'APPROVED')}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Reject Leave"
                              onClick={() => handleOpenReview(l, 'REJECTED')}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted text-sm">Reviewed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave of Absence"
        maxWidth="550px"
      >
        <form onSubmit={handleApplySubmit} className="modal-form">
          <div className="form-group">
            <label>Leave Classification *</label>
            <select
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
              required
            >
              <option value="Casual">Casual Leave (CL)</option>
              <option value="Sick">Sick Leave (SL)</option>
              <option value="Privilege">Privilege / Earned Leave (PL)</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
              <option value="Bereavement">Bereavement Leave</option>
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Leave *</label>
            <textarea
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              placeholder="State the purpose of your time off and any coverage arrangements"
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Decision Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`${reviewDecision.status === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request`}
        maxWidth="500px"
      >
        <form onSubmit={handleReviewSubmit} className="modal-form">
          {reviewingLeave && (
            <div className="review-summary-card mb-3">
              <p>
                <strong>Employee:</strong> {reviewingLeave.employeeName}
              </p>
              <p>
                <strong>Dates:</strong> {reviewingLeave.startDate} to {reviewingLeave.endDate} ({reviewingLeave.totalDays} days)
              </p>
              <p>
                <strong>Reason:</strong> {reviewingLeave.reason}
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Manager / HR Remarks</label>
            <textarea
              rows={2}
              value={reviewDecision.remarks}
              onChange={(e) => setReviewDecision({ ...reviewDecision, remarks: e.target.value })}
              placeholder="Provide comments or conditions for the employee"
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${reviewDecision.status === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
            >
              Confirm {reviewDecision.status === 'APPROVED' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leave;
