import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaPlus, FaSignOutAlt, FaMoneyBillWave } from 'react-icons/fa';
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

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen p-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors duration-200">
          <FaSignOutAlt />
        </button>
      </div>
      <nav className="flex-grow mt-8">
        {user && user.role === 'Manager' ? (
          <>
            <Link
              to="/manager/dashboard"
              className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${ 
                location.pathname === '/manager/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              Manager Dashboard
            </Link>
            <Link
              to="/apply-claim"
              className={`flex items-center py-3 px-4 mt-2 rounded-lg transition-colors duration-200 ${ 
                location.pathname === '/apply-claim' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <FaPlus className="mr-3" />
              Apply Claim
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${ 
                location.pathname === '/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              Track Claims
            </Link>
          </>
        ) : user && user.role === 'Finance Officer' ? (
          <Link
            to="/finance/dashboard"
            className={`flex items-center py-3 px-4 mt-2 rounded-lg transition-colors duration-200 ${ 
              location.pathname === '/finance/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <FaMoneyBillWave className="mr-3" />
            Finance Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/dashboard"
              className={`flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${ 
                location.pathname === '/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <FaTachometerAlt className="mr-3" />
              Claim Details
            </Link>
            <Link
              to="/apply-claim"
              className={`flex items-center py-3 px-4 mt-2 rounded-lg transition-colors duration-200 ${ 
                location.pathname === '/apply-claim' ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <FaPlus className="mr-3" />
              Apply Claim
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
