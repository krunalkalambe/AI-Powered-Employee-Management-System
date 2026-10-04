import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Toast from '../../components/Toast';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  ShieldCheck,
  Save,
  MapPin,
} from 'lucide-react';

const Profile = () => {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    mobile: '',
    address: '',
    bloodgrp: '',
    dob: '',
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadProfile();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/me');
      setProfile(res.data);
      setFormData({
        mobile: res.data.mobile ? String(res.data.mobile) : '',
        address: res.data.address || '',
        bloodgrp: res.data.bloodgrp || '',
        dob: res.data.dob || '',
      });
    } catch (e) {
      console.error(e);
      showToast('Error loading profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/update', {
        email: user.email,
        mobile: formData.mobile ? Number(formData.mobile) : null,
        address: formData.address,
        bloodgrp: formData.bloodgrp,
        dob: formData.dob,
      });
      showToast('Profile updated successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      console.error(err);
      showToast('Error saving changes', 'error');
    }
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading personal profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      <div className="page-header-row">
        <div>
          <h2>Personnel Profile</h2>
          <p className="page-header-sub">
            Review your credential records, department assignment, and contact preferences
          </p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Left: User Card */}
        <div className="profile-side-card">
          <div className="profile-avatar-large">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3>{profile?.name || user?.name}</h3>
          <span className="profile-id-tag">{profile?.employeeId || 'EMP-1001'}</span>
          <span className={`role-pill role-${role?.toLowerCase()} mt-2`}>{role}</span>

          <div className="profile-meta-block">
            <div className="profile-meta-row">
              <Mail size={16} className="text-muted" />
              <span>{profile?.email}</span>
            </div>
            {profile?.department && (
              <div className="profile-meta-row">
                <Building2 size={16} className="text-muted" />
                <span>{profile?.department}</span>
              </div>
            )}
            {profile?.designation && (
              <div className="profile-meta-row">
                <Briefcase size={16} className="text-muted" />
                <span>{profile?.designation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed Information & Edit Form */}
        <div className="profile-main-card">
          <div className="card-top-bar">
            <h3>Employee Credentials & Information</h3>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Contact Details'}
            </button>
          </div>

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Full Legal Name</label>
                <input type="text" value={profile?.name || ''} disabled className="input-disabled" />
              </div>

              <div className="form-group">
                <label>Work Email</label>
                <input type="email" value={profile?.email || ''} disabled className="input-disabled" />
              </div>

              <div className="form-group">
                <label>Assigned Department</label>
                <input type="text" value={profile?.department || 'Engineering'} disabled className="input-disabled" />
              </div>

              <div className="form-group">
                <label>Designation</label>
                <input type="text" value={profile?.designation || 'Staff'} disabled className="input-disabled" />
              </div>

              <div className="form-group">
                <label>System Role & Authorization</label>
                <input type="text" value={profile?.role || 'EMPLOYEE'} disabled className="input-disabled" />
              </div>

              <div className="form-group">
                <label>Base Salary (INR)</label>
                <input
                  type="text"
                  value={profile?.salary ? `₹${profile.salary.toLocaleString('en-IN')}` : '₹50,000'}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="form-group">
                <label>Contact Mobile Number</label>
                <input
                  type="number"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <input
                  type="text"
                  placeholder="e.g. O+"
                  value={formData.bloodgrp}
                  onChange={(e) => setFormData({ ...formData, bloodgrp: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Residential Address</label>
              <textarea
                rows={2}
                placeholder="Residential address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
              ></textarea>
            </div>

            {isEditing && (
              <div className="form-actions mt-3">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Save Profile Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
