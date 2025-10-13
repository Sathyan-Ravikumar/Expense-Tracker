import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getClaimTypes } from '../features/claimTypes/claimTypeSlice';
import { getRoles } from '../features/roles/roleSlice';
import { createApprovalRule, updateApprovalRule } from '../features/approvalRules/approvalRuleSlice';
import Spinner from './Spinner';

function ApprovalRuleModal({ isOpen, onClose, ruleToEdit }) {
  const [claimType, setClaimType] = useState('');
  const [amountMin, setAmountMin] = useState(0);
  const [amountMax, setAmountMax] = useState(1000);
  const [approvers, setApprovers] = useState([{ approverId: '', level: 1 }]);

  const dispatch = useDispatch();

  const { claimTypes } = useSelector((state) => state.claimTypes);
  const { roles } = useSelector((state) => state.roles);
  const { isLoading } = useSelector((state) => state.approvalRules);

  const isEditMode = Boolean(ruleToEdit);

  useEffect(() => {
    dispatch(getClaimTypes());
    dispatch(getRoles());
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && ruleToEdit) {
      setClaimType(ruleToEdit.claimType?._id || '');
      setAmountMin(ruleToEdit.amountMin || 0);
      setAmountMax(ruleToEdit.amountMax === Infinity ? 999999 : ruleToEdit.amountMax || 1000);
      setApprovers(ruleToEdit.approvers.map(a => ({ approverId: a.approverId._id, level: a.level })) || [{ approverId: '', level: 1 }]);
    } else {
      // Reset form for Add mode
      setClaimType('');
      setAmountMin(0);
      setAmountMax(1000);
      setApprovers([{ approverId: '', level: 1 }]);
    }
  }, [ruleToEdit, isEditMode]);

  if (!isOpen) return null;

  const handleApproverChange = (index, field, value) => {
    const newApprovers = [...approvers];
    newApprovers[index][field] = value;
    setApprovers(newApprovers);
  };

  const addApprover = () => {
    setApprovers([...approvers, { approverId: '', level: approvers.length + 1 }]);
  };

  const removeApprover = (index) => {
    setApprovers(approvers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ruleData = { 
        claimType, 
        amountMin, 
        amountMax: amountMax === 999999 ? Infinity : amountMax, 
        approvers 
    };

    if (isEditMode) {
      dispatch(updateApprovalRule({ id: ruleToEdit._id, ruleData })).then(() => {
        toast.success('Rule updated successfully!');
        onClose();
      });
    } else {
      dispatch(createApprovalRule(ruleData)).then(() => {
        toast.success('Rule created successfully!');
        onClose();
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit Approval Rule' : 'Add New Rule'}</h2>
        {isLoading ? <Spinner /> : (
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Claim Type</label>
                    <select value={claimType} onChange={(e) => setClaimType(e.target.value)} className="w-full p-2 border rounded">
                        <option value="">Select Claim Type</option>
                        {claimTypes.map(ct => <option key={ct._id} value={ct._id}>{ct.typeName}</option>)}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Amount Range</label>
                    <div className="flex items-center space-x-2">
                        <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="Min" className="w-1/2 p-2 border rounded" />
                        <input type="number" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="Max" className="w-1/2 p-2 border rounded" />
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Approvers</label>
                    {approvers.map((approver, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <span className="font-bold">Level {index + 1}:</span>
                            <select value={approver.approverId} onChange={(e) => handleApproverChange(index, 'approverId', e.target.value)} className="flex-grow p-2 border rounded">
                                <option value="">Select Role</option>
                                {roles.map(r => <option key={r._id} value={r._id}>{r.roleName}</option>)}
                            </select>
                            <button type="button" onClick={() => removeApprover(index)} className="text-red-500">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addApprover} className="text-blue-500 mt-2">+ Add Approver Level</button>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-600">
                    {isEditMode ? 'Update Rule' : 'Create Rule'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
}

export default ApprovalRuleModal;
