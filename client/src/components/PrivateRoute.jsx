import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  console.log('User role:', user?.role?.roleName);
  console.log('Allowed roles:', roles);

  if (roles && !roles.includes(user.role.roleName)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
