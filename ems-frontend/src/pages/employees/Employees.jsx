import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

const initialEmployeeState = {
  fname: '',
  email: '',
  mobile: '',
  gender: 'Male',
  dob: '',
  address: '',
  jdate: '',
  desig: '',
  department: 'Engineering',
  sal: '',
  inc: '0',
  bloodgrp: 'O+',
  role: 'EMPLOYEE',
  status: 'ACTIVE',
  skills: '',
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals & Forms
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [currentEmp, setCurrentEmp] = useState(initialEmployeeState);
  const [viewingEmp, setViewingEmp] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.allSettled([
        api.get('/api/employees'),
        api.get('/api/departments'),
      ]);

      if (empRes.status === 'fulfilled') {
        setEmployees(empRes.value.data);
      }
      if (deptRes.status === 'fulfilled') {
        setDepartments(deptRes.value.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenAdd = () => {
    setCurrentEmp(initialEmployeeState);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setCurrentEmp({
      ...emp,
      sal: emp.sal ? String(emp.sal) : '',
      inc: emp.inc ? String(emp.inc) : '0',
      mobile: emp.mobile ? String(emp.mobile) : '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenView = (emp) => {
    setViewingEmp(emp);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmp((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentEmp,
        sal: currentEmp.sal ? Number(currentEmp.sal) : 0,
        inc: currentEmp.inc ? Number(currentEmp.inc) : 0,
        mobile: currentEmp.mobile ? Number(currentEmp.mobile) : 0,
      };

      if (currentEmp.id) {
        // Update
        await api.put('/update', payload);
        showToast('Employee details updated successfully!');
      } else {
        // Add
        await api.post('/add', payload);
        showToast('New employee onboarded successfully!');
      }

      setIsFormModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error saving employee data', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/delete/${deletingId}`);
      showToast('Employee deleted successfully');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error deleting employee record', 'error');
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = emp.fname?.toLowerCase().includes(term);
    const emailMatch = emp.email?.toLowerCase().includes(term);
    const idMatch = (emp.empId || `EMP-${emp.id}`)?.toLowerCase().includes(term);
    const desigMatch = emp.desig?.toLowerCase().includes(term);
    const matchesSearch = nameMatch || emailMatch || idMatch || desigMatch;

    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="employees-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Top Action Bar */}
      <div className="page-header-row">
        <div>
          <h2>Employee Directory</h2>
          <p className="page-header-sub">
            Manage personnel records, departments, salaries, and employment profiles
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <UserPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="filter-bar-card">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, employee ID, email, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-select-wrap">
            <Building2 size={16} className="filter-icon" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <Filter size={16} className="filter-icon" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-count-label">
            Showing <strong>{filteredEmployees.length}</strong> of{' '}
            <strong>{employees.length}</strong> employees
          </span>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading employee directory...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <Users size={40} className="text-muted" />
            <h4>No employees found</h4>
            <p>Try adjusting your search criteria or add a new employee.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="table-row-hover">
                    <td>
                      <code className="emp-code">{emp.empId || `EMP-${emp.id}`}</code>
                    </td>
                    <td>
                      <div className="employee-name-cell">
                        <div className="emp-mini-avatar">
                          {emp.fname ? emp.fname.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div>
                          <strong>{emp.fname}</strong>
                          <span className="emp-email-sub">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="department-tag">{emp.department || 'Engineering'}</span>
                    </td>
                    <td>{emp.desig || 'Staff'}</td>
                    <td>
                      <strong>₹{emp.sal ? emp.sal.toLocaleString('en-IN') : '0'}</strong>
                    </td>
                    <td>{emp.mobile || '—'}</td>
                    <td>
                      <span
                        className={`status-pill status-${(emp.status || 'ACTIVE').toLowerCase()}`}
                      >
                        {emp.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="btn-icon"
                          title="View Details"
                          onClick={() => handleOpenView(emp)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Employee"
                          onClick={() => handleOpenEdit(emp)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          title="Delete Employee"
                          onClick={() => handleOpenDelete(emp.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={currentEmp.id ? 'Edit Employee Information' : 'Onboard New Employee'}
        maxWidth="750px"
      >
        <form onSubmit={handleSaveEmployee} className="modal-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fname"
                value={currentEmp.fname}
                onChange={handleFormChange}
                placeholder="e.g. Aarti Verma"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={currentEmp.email}
                onChange={handleFormChange}
                placeholder="aarti@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="number"
                name="mobile"
                value={currentEmp.mobile}
                onChange={handleFormChange}
                placeholder="e.g. 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={currentEmp.gender} onChange={handleFormChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={currentEmp.dob}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Joining Date</label>
              <input
                type="date"
                name="jdate"
                value={currentEmp.jdate}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={currentEmp.department}
                onChange={handleFormChange}
                required
              >
                {departments.length > 0 ? (
                  departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Operations">Operations</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Designation *</label>
              <input
                type="text"
                name="desig"
                value={currentEmp.desig}
                onChange={handleFormChange}
                placeholder="e.g. Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label>Basic Salary (INR) *</label>
              <input
                type="number"
                name="sal"
                value={currentEmp.sal}
                onChange={handleFormChange}
                placeholder="e.g. 50000"
                required
              />
            </div>

            <div className="form-group">
              <label>Allowance / Increment (INR)</label>
              <input
                type="number"
                name="inc"
                value={currentEmp.inc}
                onChange={handleFormChange}
                placeholder="e.g. 5000"
              />
            </div>

            <div className="form-group">
              <label>System Role</label>
              <select name="role" value={currentEmp.role} onChange={handleFormChange}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={currentEmp.status} onChange={handleFormChange}>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Blood Group</label>
              <input
                type="text"
                name="bloodgrp"
                value={currentEmp.bloodgrp}
                onChange={handleFormChange}
                placeholder="e.g. O+, B+, A+"
              />
            </div>

            <div className="form-group">
              <label>Key Skills</label>
              <input
                type="text"
                name="skills"
                value={currentEmp.skills}
                onChange={handleFormChange}
                placeholder="e.g. Java, React, Spring Boot, MySQL"
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Residential Address</label>
            <textarea
              name="address"
              rows={2}
              value={currentEmp.address}
              onChange={handleFormChange}
              placeholder="Full address details"
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentEmp.id ? 'Save Changes' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Employee Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Employee Profile Dossier"
        maxWidth="600px"
      >
        {viewingEmp && (
          <div className="emp-detail-view">
            <div className="detail-header-card">
              <div className="detail-avatar">
                {viewingEmp.fname ? viewingEmp.fname.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="detail-meta">
                <h3>{viewingEmp.fname}</h3>
                <span className="detail-id">{viewingEmp.empId || `EMP-${viewingEmp.id}`}</span>
                <p className="detail-desig">
                  {viewingEmp.desig} • {viewingEmp.department || 'Engineering'}
                </p>
                <span className={`status-pill status-${(viewingEmp.status || 'ACTIVE').toLowerCase()}`}>
                  {viewingEmp.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="item-label">Email Address</span>
                <span className="item-val">{viewingEmp.email}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Mobile Phone</span>
                <span className="item-val">{viewingEmp.mobile || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Date of Birth</span>
                <span className="item-val">{viewingEmp.dob || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Joining Date</span>
                <span className="item-val">{viewingEmp.jdate || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Gender</span>
                <span className="item-val">{viewingEmp.gender || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Blood Group</span>
                <span className="item-val">{viewingEmp.bloodgrp || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Basic Salary</span>
                <span className="item-val">
                  ₹{viewingEmp.sal ? viewingEmp.sal.toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <div className="detail-item">
                <span className="item-label">System Role</span>
                <span className="item-val">{viewingEmp.role || 'EMPLOYEE'}</span>
              </div>
            </div>

            {viewingEmp.skills && (
              <div className="detail-skills-section">
                <span className="item-label">Technical Competencies & Skills</span>
                <div className="skills-chips-row">
                  {viewingEmp.skills.split(',').map((s, i) => (
                    <span key={i} className="skill-chip">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {viewingEmp.address && (
              <div className="detail-address-section">
                <span className="item-label">Address</span>
                <p>{viewingEmp.address}</p>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(viewingEmp);
                }}
              >
                Edit Employee
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Employee Deletion"
        message="Are you sure you want to delete this employee? This will permanently remove their records from the database."
        confirmText="Delete Record"
      />
    </div>
  );
};

export default Employees;
