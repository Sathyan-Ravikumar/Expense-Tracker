import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import { getApprovalRules, deleteApprovalRule, reset } from '../features/approvalRules/approvalRuleSlice';
import ClaimsAccordion from '../components/ClaimsAccordion';
import ApprovalRuleModal from '../components/ApprovalRuleModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaEdit, FaTrash } from 'react-icons/fa';

function ApprovalRulesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const dispatch = useDispatch();

  const { rules, isLoading, isError, message } = useSelector((state) => state.approvalRules);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getApprovalRules());
    return () => dispatch(reset());
  }, [dispatch, isError, message]);

  const handleOpenModal = (rule = null) => {
    setRuleToEdit(rule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRuleToEdit(null);
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteApprovalRule(ruleToDelete._id));
    toast.success('Rule deleted successfully');
    setIsDeleteConfirmOpen(false);
    setRuleToDelete(null);
  };

  const renderHeader = () => (
    <>
        <div className="w-1/3 font-semibold text-gray-600">Claim Type</div>
        <div className="w-1/3 font-semibold text-gray-600">Amount Range</div>
        <div className="w-1/3 font-semibold text-gray-600">Approvers</div>
    </>
  );

  const renderRow = (rule) => (
    <>
        <div className="w-1/3 text-gray-800 font-medium">{rule.claimType?.typeName}</div>
        <div className="w-1/3 text-gray-600">${rule.amountMin} - ${rule.amountMax === Infinity ? 'And Up' : rule.amountMax}</div>
        <div className="w-1/3 text-gray-600">
            {rule.approvers.map(a => a.approverId.roleName).join(' → ' )}
        </div>
    </>
  );

  const renderActions = (rule) => {
    return (
        <div className="flex items-center space-x-4">
            <button onClick={() => handleOpenModal(rule)} className="text-indigo-600 hover:text-indigo-900" title="Edit"><FaEdit /></button>
            <button onClick={() => handleDeleteClick(rule)} className="text-red-600 hover:text-red-900" title="Delete"><FaTrash /></button>
        </div>
    );
  };

  if (isLoading && !rules.length) {
    return <Spinner />;
  }

  return (
    <DashboardLayout pageTitle="Configure Approval Rules">
        {isModalOpen && <ApprovalRuleModal isOpen={isModalOpen} onClose={handleCloseModal} ruleToEdit={ruleToEdit} />}
        <ConfirmationModal 
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete this approval rule? This action cannot be undone.`}
        />

        <div className="flex justify-end mb-4">
            <button onClick={() => handleOpenModal()} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Add New Rule
            </button>
        </div>
        <ClaimsAccordion
            claims={rules} // Using the generic prop name from the component
            headerRenderer={renderHeader}
            rowRenderer={renderRow}
            actionsRenderer={renderActions}
        />
    </DashboardLayout>
  );
}

export default ApprovalRulesPage;
