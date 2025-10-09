import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaPlus, FaSignOutAlt, FaUserShield, FaMoneyBillWave } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const NavLink = ({ to, icon, children }) => (
    <Link
      to={to}
      className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${ 
        location.pathname === to ? 'bg-gray-700' : 'hover:bg-gray-800'
      }`}>
      {icon}
      {children}
    </Link>
  );

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen p-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors duration-200">
          <FaSignOutAlt />
        </button>
      </div>
      <nav className="flex-grow mt-8 space-y-2">
        {/* Common Links */}
        <NavLink to="/dashboard" icon={<FaTachometerAlt className="mr-3" />}>My Claims</NavLink>
        <NavLink to="/apply-claim" icon={<FaPlus className="mr-3" />}>Apply Claim</NavLink>

        {/* Role-specific Links */}
        {user && user.role && (
          <>
            {(user.role.roleName === 'Manager' || user.role.roleName === 'Admin/Finance Head') && (
              <NavLink to="/manager/dashboard" icon={<FaUserShield className="mr-3" />}>Manager Dashboard</NavLink>
            )}
            {(user.role.roleName === 'Finance Officer' || user.role.roleName === 'Admin/Finance Head') && (
              <NavLink to="/finance/dashboard" icon={<FaMoneyBillWave className="mr-3" />}>Finance Dashboard</NavLink>
            )}
            {/* Add other role-specific links here */}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;