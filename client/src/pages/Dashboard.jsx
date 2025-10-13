import React, { useState, useEffect, useCallback } from 'react';
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
import Pagination from '../components/Pagination';
import FilterPanel from '../components/FilterPanel';

function Dashboard() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [claimIdToDelete, setClaimIdToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [claimIdToEdit, setClaimIdToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({ claimType: '', minAmount: '', maxAmount: '', startDate: '', endDate: '', searchTerm: '' });
  const [activeTab, setActiveTab] = useState('Pending');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const claims = useSelector((state) => state.claims.claims);
  const pagination = useSelector((state) => state.claims.pagination);
  const isLoading = useSelector((state) => state.claims.isLoading);
  const isError = useSelector((state) => state.claims.isError);
  const message = useSelector((state) => state.claims.message);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const { claimType, minAmount, maxAmount, startDate, endDate, searchTerm } = activeFilters;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getMyClaims({ page: currentPage, limit: 10, claimType, minAmount, maxAmount, startDate, endDate }));
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch, currentPage, claimType, minAmount, maxAmount, startDate, endDate]);

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
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApplyFilters = useCallback((filters) => {
    setCurrentPage(1);
    setActiveFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const handleSearch = useCallback((term) => {
    setCurrentPage(1);
    setActiveFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  const filteredClaims = claims ? claims.filter(claim => {
    if (searchTerm === '') {
      return claim;
    } else if (
      claim.claimId.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return claim;
    }
  }) : [];

  const pendingClaims = filteredClaims ? filteredClaims.filter((claim) => claim.status?.statusName?.startsWith('Pending')) : [];
  const approvedClaims = filteredClaims ? filteredClaims.filter((claim) => claim.status && claim.status.statusName === 'Approved') : [];
  const rejectedClaims = filteredClaims ? filteredClaims.filter((claim) => claim.status && (claim.status.statusName === 'Rejected' || claim.status.statusName === 'Returned')) : [];

  const displayedClaims = () => {
    switch (activeTab) {
      case 'Pending':
        return pendingClaims;
      case 'Approved':
        return approvedClaims;
      case 'Rejected':
        return rejectedClaims;
      default:
        return [];
    }
  };

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

  const TabButton = ({ tabName, list }) => (
    <button 
        onClick={() => setActiveTab(tabName)}
        className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${activeTab === tabName ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
        {tabName} ({list.length})
    </button>
  );

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
            isOpen={isEditModalOpen}
            claimId={claimIdToEdit} 
            onClose={handleCloseEditModal} 
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <StatCard icon={<FaFileInvoiceDollar className="text-4xl text-blue-500 mr-4" />} title="Total Claims" value={pagination?.total || 0} />
        <StatCard icon={<FaClock className="text-4xl text-yellow-500 mr-4" />} title="Pending" value={pendingClaims.length} />
        <StatCard icon={<FaCheckCircle className="text-4xl text-green-500 mr-4" />} title="Approved" value={approvedClaims.length} />
        <StatCard icon={<FaTimesCircle className="text-4xl text-red-500 mr-4" />} title="Rejected" value={rejectedClaims.length} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <TabButton tabName="Pending" list={pendingClaims} />
                <TabButton tabName="Approved" list={approvedClaims} />
                <TabButton tabName="Rejected" list={rejectedClaims} />
            </nav>
        </div>
        <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                  type="text"
                  placeholder="&#xF002; Search by claim ID"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="border rounded-lg px-4 py-2 pl-10"
                />
            </div>
            <FilterPanel onApplyFilters={handleApplyFilters} />
        </div>
      </div>

      <ClaimsAccordion
        claims={displayedClaims()}
        headerRenderer={renderHeader}
        rowRenderer={renderRow}
        actionsRenderer={renderActions}
      />

      <Pagination pagination={pagination} onPageChange={handlePageChange} />

    </DashboardLayout>
  );
}

export default Dashboard;
