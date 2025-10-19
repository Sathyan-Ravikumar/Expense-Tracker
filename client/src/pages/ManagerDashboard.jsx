import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../components/Spinner';
import { getClaims, reset, approveClaim } from '../features/claims/claimSlice';
import { toast } from 'react-hot-toast';
import { FaFileInvoiceDollar, FaClock, FaCheck, FaTimes, FaUndo, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import ReturnClaimModal from '../components/ReturnClaimModal';
import RejectClaimModal from '../components/RejectClaimModal';
import ConfirmationModal from '../components/ConfirmationModal';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import ClaimsAccordion from '../components/ClaimsAccordion';
import Pagination from '../components/Pagination';
import FilterPanel from '../components/FilterPanel';
import ReportModal from '../components/ReportModal';

function ManagerDashboard() {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [claimIdToApprove, setClaimIdToApprove] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({ claimType: '', minAmount: '', maxAmount: '', startDate: '', endDate: '', searchTerm: '' });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { claims, pagination, isLoading, isError, message } = useSelector(
    (state) => state.claims
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const { claimType, minAmount, maxAmount, startDate, endDate, searchTerm } = activeFilters;

  useEffect(() => {
    if (user) {
      const status = activeTab === 'Pending' ? 'Pending: Manager' : activeTab;
      dispatch(getClaims({ page: currentPage, limit: 10, status, claimType, minAmount, maxAmount, startDate, endDate }));
    } else {
      navigate('/login');
    }

    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch, currentPage, activeTab, claimType, minAmount, maxAmount, startDate, endDate]);

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

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setSelectedClaimId(null);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedClaimId(null);
  };

  const displayedClaims = useMemo(() => claims.filter(claim => {
    if (searchTerm === '') {
      return claim;
    } else if (
      claim.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimId.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return claim;
    }
    return false;
  }), [claims, searchTerm]);

  if (isLoading && !claims.length) {
    return <Spinner />;
  }

  const renderHeader = () => (
    <>
        <div className="w-1/5 font-semibold text-gray-600">Claim ID</div>
        <div className="w-1/5 font-semibold text-gray-600">Employee</div>
        <div className="w-1/5 font-semibold text-gray-600">Claim Type</div>
        <div className="w-1/5 font-semibold text-gray-600">Amount</div>
        <div className="w-1/5 font-semibold text-gray-600">Status</div>
    </>
  );

  const renderRow = (claim, getStatusColor) => (
    <>
        <div className="w-1/5 text-gray-800 font-medium">{claim.claimId}</div>
        <div className="w-1/5 text-gray-800 font-medium">{claim.user.name}</div>
        <div className="w-1/5 text-gray-600">{claim.claimType?.typeName}</div>
        <div className="w-1/5 text-gray-800 font-bold">${claim.amount}</div>
        <div className="w-1/5">
        {claim.status && (
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(claim.status.statusName)}`}>
            {claim.status.statusName}
            </span>
        )}
        </div>
    </>
  );

  const renderActions = (claim) => {
    const isActionable = claim.status?.statusName === 'Pending: Manager' && user.role?.roleName === 'Manager';
    if (isActionable) {
        return (
            <>
                <button onClick={() => handleApproveClick(claim._id)} className="text-green-600 hover:text-green-900" title="Approve"><FaCheck /></button>
                <button onClick={() => handleReject(claim._id)} className="text-red-600 hover:text-red-900" title="Reject"><FaTimes /></button>
                <button onClick={() => handleReturn(claim._id)} className="text-yellow-600 hover:text-yellow-900" title="Return"><FaUndo /></button>
            </>
        );
    }
    return null;
  };

  const TabButton = ({ tabName, count }) => (
    <button 
        onClick={() => setActiveTab(tabName)}
        className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${activeTab === tabName ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
        {tabName} ({count})
    </button>
  );

  return (
    <DashboardLayout pageTitle="Manager Dashboard">
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
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <StatCard icon={<FaFileInvoiceDollar className="text-4xl text-blue-500 mr-4" />} title="Total Claims in View" value={pagination?.total || 0} />
        <StatCard icon={<FaClock className="text-4xl text-yellow-500 mr-4" />} title="Pending" value={pagination?.counts?.pending || 0} />
        <StatCard icon={<FaCheckCircle className="text-4xl text-green-500 mr-4" />} title="Approved" value={pagination?.counts?.approved || 0} />
        <StatCard icon={<FaTimesCircle className="text-4xl text-red-500 mr-4" />} title="Rejected/Returned" value={pagination?.counts?.rejected || 0} />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <TabButton tabName="Pending" count={pagination?.counts?.pending || 0} />
                <TabButton tabName="Approved" count={pagination?.counts?.approved || 0} />
                <TabButton tabName="Rejected" count={pagination?.counts?.rejected || 0} />
            </nav>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={() => setIsReportModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Generate Report</button>
            <div className="relative">
              <input
                  type="text"
                  placeholder="Search by employee or claim ID"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="border rounded-lg px-4 py-2 pl-10"
                />
            </div>
            <FilterPanel onApplyFilters={handleApplyFilters} />
        </div>
      </div>

      <ClaimsAccordion
        claims={displayedClaims}
        headerRenderer={renderHeader}
        rowRenderer={renderRow}
        actionsRenderer={renderActions}
      />

      <Pagination pagination={pagination} onPageChange={handlePageChange} />

    </DashboardLayout>
  );
}

export default ManagerDashboard;