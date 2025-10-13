import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Spinner from './Spinner';
import claimTypeService from '../features/claimTypes/claimTypeService';
import axios from 'axios';

function EditClaimModal({ isOpen, claimId, onClose }) {
  const [formData, setFormData] = useState({ claimType: '', amount: '', description: '', attachment: null });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [claimTypes, setClaimTypes] = useState([]);

  const { claimType, amount, description, attachment } = formData;

  useEffect(() => {
    const fetchClaimTypes = async () => {
      try {
        const types = await claimTypeService.getClaimTypes();
        setClaimTypes(types);
      } catch (error) {
        toast.error('Failed to fetch claim types');
      }
    };
    fetchClaimTypes();
  }, []);

  useEffect(() => {
    if (isOpen && claimId) {
      const fetchClaim = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const config = {
                headers: {
                'x-auth-token': token,
                },
            };
            const response = await axios.get(`http://localhost:5000/api/claims/${claimId}`, config);
            const { claimType, amount, description, attachments } = response.data.data;
            setFormData({ claimType: claimType._id, amount, description, attachment: attachments.length > 0 ? attachments[0] : null });
        } catch (error) {
            toast.error('Failed to fetch claim data.');
        }
        setIsLoading(false);
      };
      fetchClaim();
    }
  }, [isOpen, claimId]);

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validate = () => {
    let tempErrors = {};
    if (!claimType) tempErrors.claimType = 'Claim type is required';
    if (!amount) tempErrors.amount = 'Amount is required';
    else if (amount <= 0) tempErrors.amount = 'Amount must be a positive number';
    if (!description) tempErrors.description = 'Description is required';
    else if (description.length < 10) tempErrors.description = 'Description must be at least 10 characters long';
    return tempErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
        const token = localStorage.getItem('accessToken');
        const config = {
            headers: {
                'x-auth-token': token,
                'Content-Type': 'multipart/form-data',
            },
        };
        const claimData = new FormData();
        claimData.append('claimType', claimType);
        claimData.append('amount', amount);
        claimData.append('description', description);
        if (file) {
            claimData.append('attachment', file);
        }

        await axios.put(`http://localhost:5000/api/claims/${claimId}`, claimData, config);
        toast.success('Claim updated successfully!');
        onClose();
    } catch (error) {
        toast.error('Failed to update claim.');
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Claim</h2>
        {isLoading ? <Spinner /> : (
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
                    <label htmlFor="attachment" className="block text-gray-700 font-semibold mb-2">Attachment</label>
                    {attachment && <div className="mb-2"><a href={`http://localhost:5000/${attachment}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 font-semibold">View Current Attachment</a></div>}
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