import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
import Sidebar from '../components/Sidebar';
import { getClaims, reset, approveClaim, rejectClaim, returnClaim } from '../features/claims/claimSlice';
import { toast } from 'react-hot-toast';
import { FaFileInvoiceDollar, FaClock,  FaBars } from 'react-icons/fa';
import ReturnClaimModal from '../components/ReturnClaimModal';
import RejectClaimModal from '../components/RejectClaimModal';

function ManagerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { claims, isLoading, isError, message } = useSelector(
    (state) => state.claims
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (!user) {
      navigate('/login');
    } else {
      dispatch(getClaims());
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch, isError, message]);

  const handleApprove = (claimId) => {
    dispatch(approveClaim(claimId));
  };

  const handleReject = (claimId) => {
    setSelectedClaimId(claimId);
    setShowRejectModal(true);
  };

  const handleReturn = (claimId) => {
    setSelectedClaimId(claimId);
    setShowReturnModal(true);
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setSelectedClaimId(null);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedClaimId(null);
  };

  if (isLoading) {
    return <Spinner />;
  }

  const totalClaims = claims.length;
  const pendingClaims = claims.filter((claim) => claim.status && claim.status.statusName === 'Pending').length;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {showReturnModal && <ReturnClaimModal claimId={selectedClaimId} closeModal={closeReturnModal} />}
      {showRejectModal && <RejectClaimModal claimId={selectedClaimId} closeModal={closeRejectModal} />}
      <div className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-gray-900 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
            <p className="text-gray-600">Welcome, {user && user.name}</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars className="text-2xl text-gray-800" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaFileInvoiceDollar className="text-4xl text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Total Pending</h3>
              <p className="text-3xl font-bold text-gray-800">{totalClaims}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaClock className="text-4xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Needs Action</h3>
              <p className="text-3xl font-bold text-gray-800">{pendingClaims}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {claims.map((claim) => (
                <tr key={claim._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.claimId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.claimType.typeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${claim.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {claim.status && (
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                          claim.status.statusName === 'Approved' ? 'bg-green-100 text-green-800' : 
                          claim.status.statusName === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800' 
                        }`}>
                        {claim.status.statusName}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user && user.role === 'Manager' && (
                      <>
                        <button onClick={() => handleApprove(claim._id)} className="text-green-600 hover:text-green-900 ml-4">Approve</button>
                        <button onClick={() => handleReject(claim._id)} className="text-red-600 hover:text-red-900 ml-4">Reject</button>
                        <button onClick={() => handleReturn(claim._id)} className="text-yellow-600 hover:text-yellow-900 ml-4">Return</button>
                      </>
                    )}
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

export default ManagerDashboard;
