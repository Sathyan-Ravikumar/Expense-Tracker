import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  if (user && user.role) {
    switch (user.role.roleName) {
      case 'Manager':
        return <Navigate to="/manager/dashboard" />;
      case 'Finance Officer':
        return <Navigate to="/finance/dashboard" />;
      case 'Admin/Finance Head':
        // Assuming there might be an admin dashboard in the future
        return <Navigate to="/admin/dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return <Navigate to="/login" />;
};

export default Home;
