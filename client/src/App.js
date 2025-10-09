import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplyClaim from './pages/ApplyClaim';
import ManagerDashboard from './pages/ManagerDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import PrivateRoute from './components/PrivateRoute';
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
            {/* <Route path="/manager/dashboard" element={<PrivateRoute roles={['Manager']}><ManagerDashboard /></PrivateRoute>} /> */}
            <Route path="/finance/dashboard" element={<PrivateRoute roles={['Finance Officer']}><FinanceDashboard /></PrivateRoute>} />
                        <Route path="/manager/dashboard" element={<ManagerDashboard />} />

          </Route>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
