import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplyClaim from './pages/ApplyClaim';
import ManagerDashboard from './pages/ManagerDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import ApprovalRulesPage from './pages/ApprovalRulesPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import NotificationsPage from './pages/NotificationsPage';
import UserManagement from './pages/UserManagement';
import { useSelector } from 'react-redux';

import FinanceHeadDashboard from './pages/FinanceHeadDashboard';
import AuditLogsPage from './pages/AuditLogsPage';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/apply-claim" element={<PrivateRoute><ApplyClaim /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
            <Route path="/approval-rules" element={<PrivateRoute roles={['Admin/Finance Head', 'System Admin']}><ApprovalRulesPage /></PrivateRoute>} />
            <Route path="/manager/dashboard" element={<PrivateRoute roles={['Manager']}><ManagerDashboard /></PrivateRoute>} />
            <Route path="/finance/dashboard" element={<PrivateRoute roles={['Finance Officer']}><FinanceDashboard /></PrivateRoute>} />
            <Route path="/finance-head/dashboard" element={<PrivateRoute roles={['Admin/Finance Head']}><FinanceHeadDashboard /></PrivateRoute>} />
            <Route path="/admin/dashboard" element={<PrivateRoute roles={['Admin/Finance Head']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/system-admin/dashboard" element={<PrivateRoute roles={['System Admin']}><SystemAdminDashboard /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute roles={['System Admin']}><UserManagement /></PrivateRoute>} />
            <Route path="/admin/logs" element={<PrivateRoute roles={['System Admin']}><AuditLogsPage /></PrivateRoute>} />
          </Route>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
