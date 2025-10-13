import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaPlus, FaSignOutAlt, FaUserShield, FaMoneyBillWave, FaUserCog, FaBell } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);

  const unreadCount = notifications ? notifications.filter((n) => !n.isRead).length : 0;

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
        {user && user.role && user.role.roleName !== 'System Admin' && user.role.roleName !== 'Admin/Finance Head' && (
          <>
            <NavLink to="/dashboard" icon={<FaTachometerAlt className="mr-3" />}>My Claims</NavLink>
            <NavLink to="/apply-claim" icon={<FaPlus className="mr-3" />}>Apply Claim</NavLink>
          </>
        )}
        <NavLink to="/notifications" icon={<FaBell className="mr-3" />}>
          Notifications {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>}
        </NavLink>

        {/* Role-specific Links */}
        {user && user.role && (
          <>
            {user.role.roleName === 'Manager' && (
              <NavLink to="/manager/dashboard" icon={<FaUserShield className="mr-3" />}>Manager Dashboard</NavLink>
            )}
            {user.role.roleName === 'Finance Officer' && (
              <NavLink to="/finance/dashboard" icon={<FaMoneyBillWave className="mr-3" />}>Finance Dashboard</NavLink>
            )}
            {user.role.roleName === 'Admin/Finance Head' && (
              <NavLink to="/admin/dashboard" icon={<FaUserCog className="mr-3" />}>Admin Dashboard</NavLink>
            )}
            {user.role.roleName === 'System Admin' && (
              <NavLink to="/system-admin/dashboard" icon={<FaUserCog className="mr-3" />}>System Admin</NavLink>
            )}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
