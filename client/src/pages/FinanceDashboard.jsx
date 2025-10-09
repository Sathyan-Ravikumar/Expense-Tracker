import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
import Sidebar from '../components/Sidebar';
import { getClaims, reimburseClaim, reset, approveClaim } from '../features/claims/claimSlice';
import { toast } from 'react-hot-toast';
import { FaFileInvoiceDollar, FaBars, FaClock, FaCheck, FaTimes, FaUndo, FaPaperclip, FaMoneyBillWave } from 'react-icons/fa';
import ReturnClaimModal from '../components/ReturnClaimModal';
import RejectClaimModal from '../components/RejectClaimModal';

function FinanceDashboard() {
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

  const handleReimburse = (claimId) => {
    dispatch(reimburseClaim(claimId));
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

  const pendingClaims = claims.filter(claim => {
    if (claim.status.statusName !== 'Pending') return false;
    const lastApproverEntry = claim.approvalHistory[claim.approvalHistory.length - 1];
    return lastApproverEntry && user.role && lastApproverEntry.approver._id === user.role._id && lastApproverEntry.status.statusName === 'Pending';
  });

  const approvedClaims = claims.filter((claim) => claim.status.statusName === 'Approved' && !claim.reimbursed);

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
            <h1 className="text-3xl font-bold text-gray-800">Finance Dashboard</h1>
            <p className="text-gray-600">Welcome, {user && user.name}</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars className="text-2xl text-gray-800" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaClock className="text-4xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Pending My Approval</h3>
              <p className="text-3xl font-bold text-gray-800">{pendingClaims.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaFileInvoiceDollar className="text-4xl text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Ready to Reimburse</h3>
              <p className="text-3xl font-bold text-gray-800">{approvedClaims.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto mb-8">
          <h2 className="text-xl font-bold text-gray-800 p-4">Pending My Approval</h2>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingClaims.map((claim) => (
                <tr key={claim._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.claimId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.claimType.typeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${claim.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                      {claim.status.statusName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(claim.approvalHistory.length > 0) && 
                      claim.approvalHistory[claim.approvalHistory.length - 1].remarks
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.attachments && claim.attachments.length > 0 && (
                      <a href={claim.attachments[0]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900" title="View Attachment">
                        View
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-4">
                        <button onClick={() => handleApprove(claim._id)} className="text-green-600 hover:text-green-900" title="Approve">
                          <FaCheck />
                        </button>
                        <button onClick={() => handleReject(claim._id)} className="text-red-600 hover:text-red-900" title="Reject">
                          <FaTimes />
                        </button>
                        <button onClick={() => handleReturn(claim._id)} className="text-yellow-600 hover:text-yellow-900" title="Return">
                          <FaUndo />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
           <h2 className="text-xl font-bold text-gray-800 p-4">Ready for Reimbursement</h2>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvedClaims.map((claim) => (
                <tr key={claim._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.claimId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.claimType.typeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${claim.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                      {claim.status.statusName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(claim.approvalHistory.length > 0) && 
                      claim.approvalHistory[claim.approvalHistory.length - 1].remarks
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.attachments && claim.attachments.length > 0 && (
                      <a href={claim.attachments[0]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900" title="View Attachment">
                        View
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleReimburse(claim._id)} className="text-green-600 hover:text-green-900" title="Reimburse">
                      <FaMoneyBillWave />
                    </button>
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

export default FinanceDashboard;