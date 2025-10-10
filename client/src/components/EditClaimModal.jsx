import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClaim, updateClaim, resetCurrentClaim } from '../features/claims/claimSlice';
import { getClaimTypes } from '../features/claimTypes/claimTypeSlice';
import { toast } from 'react-hot-toast';
import Spinner from './Spinner';

function EditClaimModal({ claimId, onClose }) {
  const [formData, setFormData] = useState({
    claimType: '',
    amount: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const { claimType, amount, description } = formData;

  const dispatch = useDispatch();

  const { claimTypes } = useSelector((state) => state.claimTypes);
  const claim = useSelector((state) => state.claims.claim);
  const isLoading = useSelector((state) => state.claims.isLoading);
  const isError = useSelector((state) => state.claims.isError);
  const message = useSelector((state) => state.claims.message);

  // Effect for fetching initial data
  useEffect(() => {
    if (claimId) {
      dispatch(getClaim(claimId));
    }
    dispatch(getClaimTypes());

    return () => {
      dispatch(resetCurrentClaim());
    }
  }, [dispatch, claimId]);

  // Effect for handling errors
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  // Effect for populating form when claim data is loaded
  useEffect(() => {
    if (claim && claim._id === claimId) {
      setFormData({
        claimType: claim.claimType._id,
        amount: claim.amount,
        description: claim.description,
      });
    }
  }, [claim, claimId]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validate = () => {
    let errors = {};
    if (!claimType) errors.claimType = 'Claim type is required';
    if (!amount) errors.amount = 'Amount is required';
    else if (amount <= 0) errors.amount = 'Amount must be a positive number';
    if (!description) errors.description = 'Description is required';
    else if (description.length < 10) errors.description = 'Description must be at least 10 characters long';
    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const claimData = new FormData();
    claimData.append('claimType', claimType);
    claimData.append('amount', amount);
    claimData.append('description', description);
    if (file) {
      claimData.append('attachment', file);
    }

    const resultAction = await dispatch(updateClaim({ id: claimId, claimData }));
    if (updateClaim.fulfilled.match(resultAction)) {
        toast.success('Claim updated successfully!');
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Claim</h2>
        {isLoading || !claim ? <Spinner /> : (
            <form onSubmit={onSubmit}>
                <div className="mb-6">
                    <label htmlFor="claimType" className="block text-gray-700 font-semibold mb-2">Claim Type <span className="text-red-500">*</span></label>
                    <select id="claimType" name="claimType" value={claimType} onChange={onChange} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.claimType ? 'border-red-500' : 'border-gray-300'}`}>
                        <option value="">Select Claim Type</option>
                        {claimTypes.map((ct) => (
                        <option key={ct._id} value={ct._id}>{ct.typeName}</option>
                        ))}
                    </select>
                    {errors.claimType && <p className="text-red-500 text-xs mt-1">{errors.claimType}</p>}
                </div>
                <div className="mb-6">
                    <label htmlFor="amount" className="block text-gray-700 font-semibold mb-2">Amount <span className="text-red-500">*</span></label>
                    <input type="number" id="amount" name="amount" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} value={amount} onChange={onChange} placeholder="Enter amount" />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>
                <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description <span className="text-red-500">*</span></label>
                    <textarea id="description" name="description" rows="4" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`} value={description} onChange={onChange} placeholder="Enter description"></textarea>
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                <div className="mb-6">
                    <label htmlFor="attachment" className="block text-gray-700 font-semibold mb-2">Attachment (Optional)</label>
                    <input type="file" id="attachment" name="attachment" onChange={onFileChange} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.attachment ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.attachment && <p className="text-red-500 text-sm mt-1">{errors.attachment}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300">
                    Update Claim
                </button>
            </form>
        )}
      </div>
    </div>
  );
}

export default EditClaimModal;
