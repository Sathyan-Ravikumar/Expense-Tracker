import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
import Sidebar from '../components/Sidebar';
import { getClaims, reset } from '../features/claims/claimSlice';
import { toast } from 'react-hot-toast';
import { FaFileInvoiceDollar, FaClock, FaCheckCircle, FaTimesCircle, FaBars } from 'react-icons/fa';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { claims, isLoading, isError, message } = useSelector(
    (state) => state.claims
  );

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getClaims());
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  if (isLoading) {
    return <Spinner />;
  }

  const totalClaims = claims.length;
  const pendingClaims = claims.filter((claim) => claim.approvalHistory[claim.approvalHistory.length - 1].status === 'Pending').length;
  const approvedClaims = claims.filter((claim) => claim.approvalHistory[claim.approvalHistory.length - 1].status === 'Approved').length;
  const rejectedClaims = claims.filter((claim) => claim.approvalHistory[claim.approvalHistory.length - 1].status === 'Rejected').length;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-gray-900 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user && user.name}</h1>
            <p className="text-gray-600">{user && user.email}</p>
          </div>
          <Link to="/apply-claim" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Apply Claim
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars className="text-2xl text-gray-800" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaFileInvoiceDollar className="text-4xl text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Total Claims</h3>
              <p className="text-3xl font-bold text-gray-800">{totalClaims}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaClock className="text-4xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
              <p className="text-3xl font-bold text-gray-800">{pendingClaims}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaCheckCircle className="text-4xl text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Approved</h3>
              <p className="text-3xl font-bold text-gray-800">{approvedClaims}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaTimesCircle className="text-4xl text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Rejected</h3>
              <p className="text-3xl font-bold text-gray-800">{rejectedClaims}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Approver</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {claims.map((claim) => (
                <tr key={claim._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.claimId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.claimType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${claim.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        claim.approvalHistory[claim.approvalHistory.length - 1].status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        claim.approvalHistory[claim.approvalHistory.length - 1].status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800' 
                      }`}>
                      {claim.approvalHistory[claim.approvalHistory.length - 1].status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.currentApprover ? claim.currentApprover.name : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
