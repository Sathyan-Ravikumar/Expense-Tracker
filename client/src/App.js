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
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import { useSelector } from 'react-redux';

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
            <Route path="/manager/dashboard" element={<PrivateRoute roles={['Manager']}><ManagerDashboard /></PrivateRoute>} />
            <Route path="/finance/dashboard" element={<PrivateRoute roles={['Finance Officer']}><FinanceDashboard /></PrivateRoute>} />
            <Route path="/admin/dashboard" element={<PrivateRoute roles={['Admin/Finance Head']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/system-admin/dashboard" element={<PrivateRoute roles={['System Admin']}><SystemAdminDashboard /></PrivateRoute>} />
          </Route>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
