import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import {
  DollarSign,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Eye,
  Printer,
  Calendar,
  Building,
  CreditCard,
} from 'lucide-react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Payroll = () => {
  const { user, role } = useAuth();
  const isAdminOrHR = role === 'ADMIN' || role === 'HR';

  const [payrollList, setPayrollList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalDisbursedOrScheduled: 0,
    paidCount: 0,
    pendingCount: 0,
  });

  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [loading, setLoading] = useState(true);

  // Generate / Add Payroll Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [payrollForm, setPayrollForm] = useState({
    email: '',
    month: 'March',
    year: 2026,
    basicSalary: '',
    allowance: '5000',
    deduction: '2000',
    paymentStatus: 'PAID',
  });

  // View Payslip Modal
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [viewingSlip, setViewingSlip] = useState(null);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadPayrollData();
    if (isAdminOrHR) {
      loadEmployees();
    }
  }, [selectedMonth, selectedYear, filterEmployee]);

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

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      if (isAdminOrHR) {
        // Admin/HR view all
        const [statsRes, listRes] = await Promise.allSettled([
          api.get('/api/payroll/stats'),
          api.get(`/api/payroll/all?month=${selectedMonth}&year=${selectedYear}${filterEmployee ? `&email=${filterEmployee}` : ''}`),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (listRes.status === 'fulfilled') setPayrollList(listRes.value.data);
      } else {
        // Employee view personal
        if (user?.email) {
          const res = await api.get(`/api/payroll/employee/${user.email}`);
          const mySalaries = res.data;
          setPayrollList(mySalaries);
          setStats({
            totalRecords: mySalaries.length,
            totalDisbursedOrScheduled: mySalaries.reduce((acc, s) => acc + (s.netSalary || 0), 0),
            paidCount: mySalaries.filter((s) => s.paymentStatus === 'PAID').length,
            pendingCount: mySalaries.filter((s) => s.paymentStatus === 'PENDING').length,
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading payroll records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelectInForm = (empEmail) => {
    const emp = employees.find((e) => e.email === empEmail);
    if (emp) {
      setPayrollForm((prev) => ({
        ...prev,
        email: empEmail,
        basicSalary: emp.sal ? String(emp.sal) : '50000',
        allowance: emp.inc ? String(emp.inc) : '5000',
      }));
    } else {
      setPayrollForm((prev) => ({ ...prev, email: empEmail }));
    }
  };

  // Calculated Net in Form: Basic + Allowance - Deduction
  const computedNet = (Number(payrollForm.basicSalary) || 0) +
                      (Number(payrollForm.allowance) || 0) -
                      (Number(payrollForm.deduction) || 0);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/payroll/generate', {
        ...payrollForm,
        basicSalary: Number(payrollForm.basicSalary) || 0,
        allowance: Number(payrollForm.allowance) || 0,
        deduction: Number(payrollForm.deduction) || 0,
        year: Number(payrollForm.year) || 2026,
      });
      showToast('Payroll record generated and calculated successfully!');
      setIsGenerateModalOpen(false);
      loadPayrollData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error generating payroll', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/payroll/${id}/status`, { paymentStatus: newStatus });
      showToast(`Payment status marked as ${newStatus}`);
      loadPayrollData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleOpenSlip = (item) => {
    setViewingSlip(item);
    setIsSlipModalOpen(true);
  };

  return (
    <div className="payroll-page">
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
          <h2>Payroll & Compensation Management</h2>
          <p className="page-header-sub">
            {isAdminOrHR
              ? 'Calculate salary disbursements (Net = Basic + Allowance - Deduction) and issue payslips'
              : 'Review your monthly compensation breakdown, deductions, and official payslips'}
          </p>
        </div>
        {isAdminOrHR && (
          <button className="btn btn-primary" onClick={() => setIsGenerateModalOpen(true)}>
            <Plus size={18} /> Generate Payroll
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="stats-grid mb-4">
        <StatCard
          title="Total Net Payroll"
          value={`₹${(stats.totalDisbursedOrScheduled || 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="emerald"
          subtext="Net disbursed amount"
        />
        <StatCard
          title="Paid Records"
          value={stats.paidCount || 0}
          icon={CheckCircle}
          color="green"
          subtext="Transferred to bank"
        />
        <StatCard
          title="Pending Disbursals"
          value={stats.pendingCount || 0}
          icon={Clock}
          color="amber"
          subtext="Scheduled for execution"
        />
        <StatCard
          title="Total Generated Slips"
          value={stats.totalRecords || 0}
          icon={CreditCard}
          color="blue"
          subtext="In this cycle"
        />
      </div>

      {/* Filter Bar */}
      {isAdminOrHR && (
        <div className="filter-bar-card">
          <div className="filter-item">
            <label className="filter-label">Payroll Month:</label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-item">
            <label className="filter-label">Filter Employee:</label>
            <div className="input-with-icon">
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.email}>
                    {emp.fname} - {emp.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Records Table */}
      <div className="table-card">
        <div className="table-card-header">
          <h3>{isAdminOrHR ? `Payroll Slips for ${selectedMonth} ${selectedYear}` : 'My Official Payslips'}</h3>
          <span className="table-count-label">{payrollList.length} record(s)</span>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading compensation sheets...</p>
          </div>
        ) : payrollList.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={40} className="text-muted" />
            <h4>No payroll records found</h4>
            <p>
              {isAdminOrHR
                ? 'Generate salary slips for this month using the button above.'
                : 'Your payslip for this cycle will be issued soon.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Basic Pay</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollList.map((item) => (
                  <tr key={item.id} className="table-row-hover">
                    <td>
                      <div>
                        <strong>{item.employeeName}</strong>
                        <span className="emp-email-sub">
                          {item.employeeId} • {item.department}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>
                        {item.month} {item.year}
                      </strong>
                    </td>
                    <td>₹{item.basicSalary.toLocaleString('en-IN')}</td>
                    <td className="text-success">+₹{item.allowance.toLocaleString('en-IN')}</td>
                    <td className="text-danger">-₹{item.deduction.toLocaleString('en-IN')}</td>
                    <td>
                      <strong className="text-primary net-highlight">
                        ₹{item.netSalary.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className={`status-pill status-${item.paymentStatus.toLowerCase()}`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="btn btn-sm btn-secondary"
                          title="View Official Payslip"
                          onClick={() => handleOpenSlip(item)}
                        >
                          <Eye size={14} /> View Slip
                        </button>
                        {isAdminOrHR && item.paymentStatus === 'PENDING' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(item.id, 'PAID')}
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate & Calculate Employee Payroll"
        maxWidth="600px"
      >
        <form onSubmit={handleGenerateSubmit} className="modal-form">
          <div className="form-group">
            <label>Employee *</label>
            <select
              value={payrollForm.email}
              onChange={(e) => handleEmployeeSelectInForm(e.target.value)}
              required
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.email}>
                  {emp.fname} ({emp.empId || `EMP-${emp.id}`}) - Base: ₹{emp.sal || 0}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Payroll Month *</label>
              <select
                value={payrollForm.month}
                onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
                required
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                value={payrollForm.year}
                onChange={(e) => setPayrollForm({ ...payrollForm, year: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Basic Salary (INR) *</label>
              <input
                type="number"
                placeholder="50000"
                value={payrollForm.basicSalary}
                onChange={(e) => setPayrollForm({ ...payrollForm, basicSalary: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Allowances / HRA (INR)</label>
              <input
                type="number"
                placeholder="5000"
                value={payrollForm.allowance}
                onChange={(e) => setPayrollForm({ ...payrollForm, allowance: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Deductions (PF / Tax) (INR)</label>
              <input
                type="number"
                placeholder="2000"
                value={payrollForm.deduction}
                onChange={(e) => setPayrollForm({ ...payrollForm, deduction: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Disbursal Status</label>
              <select
                value={payrollForm.paymentStatus}
                onChange={(e) => setPayrollForm({ ...payrollForm, paymentStatus: e.target.value })}
              >
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {/* Live Net Salary Formula Display */}
          <div className="salary-formula-preview">
            <div className="formula-box">
              <span className="formula-title">Calculated Net Salary:</span>
              <div className="formula-equation">
                <span>Basic (₹{payrollForm.basicSalary || 0})</span> +{' '}
                <span>Allowance (₹{payrollForm.allowance || 0})</span> -{' '}
                <span>Deductions (₹{payrollForm.deduction || 0})</span>
              </div>
              <div className="formula-result">
                = <strong>₹{computedNet.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsGenerateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Payslip
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="Official Employee Payslip"
        maxWidth="650px"
      >
        {viewingSlip && (
          <div className="payslip-container">
            <div className="payslip-header">
              <div className="payslip-company">
                <h2>AI-EMS ENTERPRISE</h2>
                <p>Employee Management & Compensation Division</p>
              </div>
              <div className="payslip-cycle">
                <h3>PAYSLIP</h3>
                <span>
                  {viewingSlip.month} {viewingSlip.year}
                </span>
              </div>
            </div>

            <div className="payslip-emp-meta">
              <div>
                <strong>Employee:</strong> {viewingSlip.employeeName}
              </div>
              <div>
                <strong>Employee ID:</strong> {viewingSlip.employeeId}
              </div>
              <div>
                <strong>Email:</strong> {viewingSlip.employeeEmail}
              </div>
              <div>
                <strong>Department:</strong> {viewingSlip.department}
              </div>
            </div>

            <div className="payslip-table-wrap">
              <table className="payslip-table">
                <thead>
                  <tr>
                    <th>Earnings</th>
                    <th className="text-right">Amount (INR)</th>
                    <th>Deductions</th>
                    <th className="text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Pay</td>
                    <td className="text-right">₹{viewingSlip.basicSalary.toLocaleString('en-IN')}</td>
                    <td>Provident Fund & TDS</td>
                    <td className="text-right">₹{viewingSlip.deduction.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Allowances (HRA / Special)</td>
                    <td className="text-right">₹{viewingSlip.allowance.toLocaleString('en-IN')}</td>
                    <td>—</td>
                    <td className="text-right">—</td>
                  </tr>
                  <tr className="payslip-subtotal-row">
                    <td>
                      <strong>Total Earnings</strong>
                    </td>
                    <td className="text-right">
                      <strong>
                        ₹{(viewingSlip.basicSalary + viewingSlip.allowance).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <strong>Total Deductions</strong>
                    </td>
                    <td className="text-right">
                      <strong>₹{viewingSlip.deduction.toLocaleString('en-IN')}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="payslip-net-box">
              <span>Net Salary Transferred:</span>
              <strong className="payslip-net-amount">
                ₹{viewingSlip.netSalary.toLocaleString('en-IN')}
              </strong>
              <small className="payslip-status-tag">
                Payment Status: {viewingSlip.paymentStatus}
              </small>
            </div>

            <div className="payslip-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsSlipModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print Official Slip
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payroll;
