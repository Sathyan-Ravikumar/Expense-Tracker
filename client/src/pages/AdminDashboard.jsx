import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
import { getClaims, reset, approveClaim } from '../features/claims/claimSlice';
import { toast } from 'react-hot-toast';
import { FaFileInvoiceDollar, FaClock, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import ReturnClaimModal from '../components/ReturnClaimModal';
import RejectClaimModal from '../components/RejectClaimModal';
import ConfirmationModal from '../components/ConfirmationModal';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import ClaimsAccordion from '../components/ClaimsAccordion';

function AdminDashboard() {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [claimIdToApprove, setClaimIdToApprove] = useState(null);

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
  }, [isError, message]);

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

  const handleApproveClick = (claimId) => {
    setClaimIdToApprove(claimId);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    dispatch(approveClaim(claimIdToApprove));
    setIsApproveModalOpen(false);
    setClaimIdToApprove(null);
    toast.success('Claim approved');
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

  const pendingClaimsForHead = claims.filter(c => c.status?.statusName === 'Pending: Admin/Finance Head');

  const renderHeader = () => (
    <>
        <div className="w-1/4 font-semibold text-gray-600">Employee</div>
        <div className="w-1/4 font-semibold text-gray-600">Claim Type</div>
        <div className="w-1/4 font-semibold text-gray-600">Amount</div>
        <div className="w-1/4 font-semibold text-gray-600">Status</div>
    </>
  );

  const renderRow = (claim, getStatusColor) => (
    <>
        <div className="w-1/4 text-gray-800 font-medium">{claim.user.name}</div>
        <div className="w-1/4 text-gray-600">{claim.claimType?.typeName}</div>
        <div className="w-1/4 text-gray-800 font-bold">${claim.amount}</div>
        <div className="w-1/4">
        {claim.status && (
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(claim.status.statusName)}`}>
            {claim.status.statusName}
            </span>
        )}
        </div>
    </>
  );

  const renderActions = (claim) => {
    const isActionable = claim.status?.statusName === 'Pending: Admin/Finance Head' && user.role?.roleName === 'Admin/Finance Head';
    return isActionable && (
        <>
            <button onClick={() => handleApproveClick(claim._id)} className="text-green-600 hover:text-green-900" title="Approve"><FaCheck /></button>
            <button onClick={() => handleReject(claim._id)} className="text-red-600 hover:text-red-900" title="Reject"><FaTimes /></button>
            <button onClick={() => handleReturn(claim._id)} className="text-yellow-600 hover:text-yellow-900" title="Return"><FaUndo /></button>
        </>
    );
  };

  return (
    <DashboardLayout pageTitle="Admin Dashboard">
      {showReturnModal && <ReturnClaimModal claimId={selectedClaimId} closeModal={closeReturnModal} />}
      {showRejectModal && <RejectClaimModal claimId={selectedClaimId} closeModal={closeRejectModal} />}
      <ConfirmationModal 
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Confirm Approval"
        message="Are you sure you want to approve this claim?"
        confirmButtonClass="bg-green-500 hover:bg-green-600"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <StatCard icon={<FaFileInvoiceDollar className="text-4xl text-blue-500 mr-4" />} title="Total Claims in System" value={claims.length} />
        <StatCard icon={<FaClock className="text-4xl text-yellow-500 mr-4" />} title="Needs Your Action" value={pendingClaimsForHead.length} />
      </div>
      
      <ClaimsAccordion
        claims={claims}
        headerRenderer={renderHeader}
        rowRenderer={renderRow}
        actionsRenderer={renderActions}
      />
    </DashboardLayout>
  );
}

export default AdminDashboard;
