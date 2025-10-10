import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMyClaims, reset, deleteClaim } from '../features/claims/claimSlice';
import { toast } from 'react-hot-toast';
import { FaFileInvoiceDollar, FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import ConfirmationModal from '../components/ConfirmationModal';
import EditClaimModal from '../components/EditClaimModal';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import ClaimsAccordion from '../components/ClaimsAccordion';

function Dashboard() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [claimIdToDelete, setClaimIdToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [claimIdToEdit, setClaimIdToEdit] = useState(null);

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
      dispatch(getMyClaims());
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

  const handleDeleteClick = (claimId) => {
    setClaimIdToDelete(claimId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteClaim(claimIdToDelete));
    setIsDeleteModalOpen(false);
    setClaimIdToDelete(null);
    toast.success('Claim deleted successfully');
  };

  const handleEditClick = (claimId) => {
    setClaimIdToEdit(claimId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setClaimIdToEdit(null);
    dispatch(getMyClaims());
  };

  if (isLoading) {
    return <Spinner />;
  }

  const totalClaims = claims ? claims.length : 0;
  const pendingClaims = claims ? claims.filter((claim) => claim.status && claim.status.statusName.startsWith('Pending')).length : 0;
  const approvedClaims = claims ? claims.filter((claim) => claim.status && claim.status.statusName === 'Approved').length : 0;
  const rejectedClaims = claims ? claims.filter((claim) => claim.status && claim.status.statusName === 'Rejected').length : 0;

  const renderHeader = () => (
    <>
        <div className="w-1/4 font-semibold text-gray-600">Claim ID</div>
        <div className="w-1/4 font-semibold text-gray-600">Claim Type</div>
        <div className="w-1/4 font-semibold text-gray-600">Amount</div>
        <div className="w-1/4 font-semibold text-gray-600">Status</div>
    </>
  );

  const renderRow = (claim, getStatusColor) => (
    <>
        <div className="w-1/4 text-gray-800 font-medium">{claim.claimId}</div>
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
    const hasBeenApproved = claim.approvalHistory?.some(h => h.status && h.status.statusName === 'Approved');
    const canEditOrDelete = claim.status?.statusName === 'Returned' || !hasBeenApproved;

    return canEditOrDelete ? (
        <>
            <button onClick={() => handleEditClick(claim._id)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                <FaEdit />
            </button>
            <button onClick={() => handleDeleteClick(claim._id)} className="text-red-600 hover:text-red-900" title="Delete">
                <FaTrash />
            </button>
        </>
    ) : (
        <div className="w-12"></div> // Placeholder for alignment
    );
  };

  return (
    <DashboardLayout pageTitle="My Claims">
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this claim? This action cannot be undone."
      />
      {isEditModalOpen && (
        <EditClaimModal 
            claimId={claimIdToEdit} 
            onClose={handleCloseEditModal} 
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <StatCard icon={<FaFileInvoiceDollar className="text-4xl text-blue-500 mr-4" />} title="Total Claims" value={totalClaims} />
        <StatCard icon={<FaClock className="text-4xl text-yellow-500 mr-4" />} title="Pending" value={pendingClaims} />
        <StatCard icon={<FaCheckCircle className="text-4xl text-green-500 mr-4" />} title="Approved" value={approvedClaims} />
        <StatCard icon={<FaTimesCircle className="text-4xl text-red-500 mr-4" />} title="Rejected" value={rejectedClaims} />
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

export default Dashboard;
