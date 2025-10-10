import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createClaim, reset as resetClaims } from '../features/claims/claimSlice';
import { getClaimTypes, reset as resetClaimTypes } from '../features/claimTypes/claimTypeSlice';
import Sidebar from '../components/Sidebar';
import { FaBars } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

function ApplyClaim() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    claimType: '',
    amount: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const { claimType, amount, description } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { claimTypes } = useSelector((state) => state.claimTypes);
  const { isError, message } = useSelector((state) => state.claims);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getClaimTypes());
    return () => {
      dispatch(resetClaims());
      dispatch(resetClaimTypes());
    };
  }, [dispatch, isError, message]);

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
    if (!file) errors.attachment = 'Attachment is required';
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
    claimData.append('attachment', file);

    const resultAction = await dispatch(createClaim(claimData));

    if (createClaim.fulfilled.match(resultAction)) {
      toast.success('Claim submitted successfully!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-gray-900 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Apply for a New Claim</h1>
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars className="text-2xl text-gray-800" />
          </button>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
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
              <label htmlFor="attachment" className="block text-gray-700 font-semibold mb-2">Attachment <span className="text-red-500">*</span></label>
              <input type="file" id="attachment" name="attachment" onChange={onFileChange} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.attachment ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.attachment && <p className="text-red-500 text-sm mt-1">{errors.attachment}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300">
                Submit Claim
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ApplyClaim;