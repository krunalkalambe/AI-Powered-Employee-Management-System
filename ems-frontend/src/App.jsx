import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Core Modules
import Dashboard from './pages/dashboard/Dashboard';
import Employees from './pages/employees/Employees';
import Departments from './pages/departments/Departments';
import Attendance from './pages/attendance/Attendance';
import Leave from './pages/leave/Leave';
import Payroll from './pages/payroll/Payroll';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';

// AI Intelligence Modules
import Chatbot from './pages/ai/Chatbot';
import ResumeAnalyzer from './pages/ai/ResumeAnalyzer';
import AttritionPredictor from './pages/ai/AttritionPredictor';
import PerformancePredictor from './pages/ai/PerformancePredictor';
import SalaryPredictor from './pages/ai/SalaryPredictor';
import EmailGenerator from './pages/ai/EmailGenerator';

// Layout with persistent Sidebar & Navbar
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`main-content-wrapper ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes inside AppLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                <AppLayout>
                  <Employees />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <AppLayout>
                  <Departments />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Attendance />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Leave />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payroll"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'EMPLOYEE']}>
                <AppLayout>
                  <Payroll />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* AI Features */}
          <Route
            path="/ai/chatbot"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Chatbot />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/resume-analyzer"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <AppLayout>
                  <ResumeAnalyzer />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/attrition"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <AppLayout>
                  <AttritionPredictor />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/performance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                <AppLayout>
                  <PerformancePredictor />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/salary"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR']}>
                <AppLayout>
                  <SalaryPredictor />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/email-generator"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                <AppLayout>
                  <EmailGenerator />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;