import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../../api/axios';
import StatCard from '../../components/StatCard';
import Toast from '../../components/Toast';
import {
  FileBarChart,
  Download,
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';

const Reports = () => {
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await api.get('/api/reports/summary');
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDownloadCsv = (type) => {
    showToast(`Downloading ${type} report...`);
    window.open(`${BACKEND_URL}/api/reports/export/${type}`, '_blank');
  };

  const reportCards = [
    {
      type: 'employees',
      title: 'Employee Master Report',
      description: 'Comprehensive roster including contact information, departments, designations, joining dates, and employment status.',
      icon: Users,
      color: 'blue',
    },
    {
      type: 'departments',
      title: 'Department Allocation Report',
      description: 'Directory of functional departments, assigned department managers, office locations, budgets, and headcount distribution.',
      icon: Building2,
      color: 'purple',
    },
    {
      type: 'attendance',
      title: 'Attendance Timesheet Report',
      description: 'Daily check-in and check-out logs, punctuality metrics, late marks, and monthly attendance percentage records.',
      icon: CalendarCheck,
      color: 'green',
    },
    {
      type: 'leaves',
      title: 'Leave & Absence Audit Report',
      description: 'Leave request audit trail covering leave categories, start/end date ranges, reason justifications, and manager approvals.',
      icon: CalendarOff,
      color: 'amber',
    },
    {
      type: 'payroll',
      title: 'Payroll & Disbursal Report',
      description: 'Financial compensation ledger detailing basic pay, allowances, deductions, net salaries, and payment completion status.',
      icon: DollarSign,
      color: 'emerald',
    },
  ];

  return (
    <div className="reports-page">
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
          <h2>Organizational Analytics & Data Export</h2>
          <p className="page-header-sub">
            Generate audit-ready reports and download CSV data sheets across all HR modules
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="stats-grid mb-4">
        <StatCard
          title="Staff Count"
          value={summary.totalEmployees || 0}
          icon={Users}
          color="blue"
          subtext="Active in database"
        />
        <StatCard
          title="Divisions"
          value={summary.totalDepartments || 0}
          icon={Building2}
          color="purple"
          subtext="Configured departments"
        />
        <StatCard
          title="Present Today"
          value={summary.presentToday || 0}
          icon={CalendarCheck}
          color="green"
          subtext="On-time attendees"
        />
        <StatCard
          title="Total Net Payroll"
          value={`₹${(summary.totalPayroll || 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="emerald"
          subtext="Calculated monthly"
        />
      </div>

      {/* Reports Catalog Grid */}
      <div className="section-title-wrap">
        <h3 className="section-title">
          <FileSpreadsheet size={20} className="text-primary" /> Downloadable Data Reports
        </h3>
        <span className="section-desc">Click any module to download standard formatted CSV exports</span>
      </div>

      <div className="reports-grid">
        {reportCards.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.type} className="report-card card-hover">
              <div className="report-card-top">
                <div className={`report-icon-box bg-${r.color}`}>
                  <Icon size={24} />
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleDownloadCsv(r.type)}
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <div className="report-card-body">
                <h3>{r.title}</h3>
                <p>{r.description}</p>
              </div>

              <div className="report-card-footer">
                <span className="report-format-pill">Format: CSV</span>
                <span className="report-source-pill">Real-time DB</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
