import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import {
  Building2,
  Plus,
  Users,
  MapPin,
  DollarSign,
  UserCheck,
  Edit2,
  Trash2,
  List,
} from 'lucide-react';

const initialDeptState = {
  name: '',
  description: '',
  managerName: '',
  managerEmail: '',
  location: '',
  budget: '',
};

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [currentDept, setCurrentDept] = useState(initialDeptState);
  const [activeDeptMembers, setActiveDeptMembers] = useState([]);
  const [activeDeptName, setActiveDeptName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenAdd = () => {
    setCurrentDept(initialDeptState);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setCurrentDept({
      ...dept,
      budget: dept.budget ? String(dept.budget) : '',
    });
    setIsFormOpen(true);
  };

  const handleOpenMembers = async (dept) => {
    setActiveDeptName(dept.name);
    try {
      const res = await api.get(`/api/departments/${dept.id}/employees`);
      setActiveDeptMembers(res.data);
      setIsMembersOpen(true);
    } catch (err) {
      console.error(err);
      showToast('Failed to load department members', 'error');
    }
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentDept,
        budget: currentDept.budget ? Number(currentDept.budget) : 0,
      };

      if (currentDept.id) {
        await api.put(`/api/departments/${currentDept.id}`, payload);
        showToast('Department updated successfully');
      } else {
        await api.post('/api/departments', payload);
        showToast('Department created successfully');
      }

      setIsFormOpen(false);
      loadDepartments();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error saving department', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/api/departments/${deletingId}`);
      showToast('Department removed successfully');
      loadDepartments();
    } catch (err) {
      console.error(err);
      showToast('Error deleting department', 'error');
    }
  };

  return (
    <div className="departments-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header-row">
        <div>
          <h2>Department Management</h2>
          <p className="page-header-sub">
            Organize business units, assign department managers, and monitor team allocations
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="empty-state">
          <Building2 size={40} className="text-muted" />
          <h4>No departments created yet</h4>
          <p>Click the button above to add the first department.</p>
        </div>
      ) : (
        <div className="departments-cards-grid">
          {departments.map((dept) => (
            <div key={dept.id} className="dept-card card-hover">
              <div className="dept-card-header">
                <div className="dept-icon-box">
                  <Building2 size={24} />
                </div>
                <div className="dept-actions">
                  <button
                    className="btn-icon"
                    title="View Members"
                    onClick={() => handleOpenMembers(dept)}
                  >
                    <List size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    title="Edit Department"
                    onClick={() => handleOpenEdit(dept)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    title="Delete Department"
                    onClick={() => handleOpenDelete(dept.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="dept-card-body">
                <h3 className="dept-title">{dept.name}</h3>
                <p className="dept-desc">
                  {dept.description || 'No description specified for this department.'}
                </p>

                <div className="dept-meta-list">
                  <div className="dept-meta-item">
                    <UserCheck size={16} className="text-muted" />
                    <span>Manager: <strong>{dept.managerName || 'Unassigned'}</strong></span>
                  </div>

                  <div className="dept-meta-item">
                    <Users size={16} className="text-muted" />
                    <span>Team Size: <strong>{dept.employeeCount || 0} Members</strong></span>
                  </div>

                  {dept.location && (
                    <div className="dept-meta-item">
                      <MapPin size={16} className="text-muted" />
                      <span>{dept.location}</span>
                    </div>
                  )}

                  {dept.budget > 0 && (
                    <div className="dept-meta-item">
                      <DollarSign size={16} className="text-muted" />
                      <span>Annual Budget: <strong>₹{dept.budget.toLocaleString('en-IN')}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="dept-card-footer">
                <button
                  className="btn btn-sm btn-secondary btn-block"
                  onClick={() => handleOpenMembers(dept)}
                >
                  <Users size={14} /> View Roster ({dept.employeeCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={currentDept.id ? 'Edit Department' : 'Create Department'}
        maxWidth="550px"
      >
        <form onSubmit={handleSaveDept} className="modal-form">
          <div className="form-group">
            <label>Department Name *</label>
            <input
              type="text"
              name="name"
              value={currentDept.name}
              onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
              placeholder="e.g. Quality Assurance"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={2}
              value={currentDept.description}
              onChange={(e) => setCurrentDept({ ...currentDept, description: e.target.value })}
              placeholder="Core mandate and operational scope"
            ></textarea>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Manager Name</label>
              <input
                type="text"
                name="managerName"
                value={currentDept.managerName}
                onChange={(e) => setCurrentDept({ ...currentDept, managerName: e.target.value })}
                placeholder="e.g. Krunal Kalambe"
              />
            </div>

            <div className="form-group">
              <label>Manager Email</label>
              <input
                type="email"
                name="managerEmail"
                value={currentDept.managerEmail}
                onChange={(e) => setCurrentDept({ ...currentDept, managerEmail: e.target.value })}
                placeholder="manager@ems.com"
              />
            </div>

            <div className="form-group">
              <label>Office / Building Location</label>
              <input
                type="text"
                name="location"
                value={currentDept.location}
                onChange={(e) => setCurrentDept({ ...currentDept, location: e.target.value })}
                placeholder="e.g. Tower B, Floor 3"
              />
            </div>

            <div className="form-group">
              <label>Allocated Budget (INR)</label>
              <input
                type="number"
                name="budget"
                value={currentDept.budget}
                onChange={(e) => setCurrentDept({ ...currentDept, budget: e.target.value })}
                placeholder="e.g. 1500000"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentDept.id ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Department Members Modal */}
      <Modal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        title={`Department Roster: ${activeDeptName}`}
        maxWidth="650px"
      >
        <div className="dept-members-content">
          {activeDeptMembers.length === 0 ? (
            <div className="empty-state">
              <Users size={36} className="text-muted" />
              <p>No employees are currently assigned to this department.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDeptMembers.map((emp) => (
                    <tr key={emp.id}>
                      <td><code>{emp.empId || `EMP-${emp.id}`}</code></td>
                      <td><strong>{emp.fname}</strong></td>
                      <td>{emp.desig || 'Staff'}</td>
                      <td>{emp.email}</td>
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

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsMembersOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message="Are you sure you want to delete this department? Employees currently assigned to it will remain in the system."
      />
    </div>
  );
};

export default Departments;
