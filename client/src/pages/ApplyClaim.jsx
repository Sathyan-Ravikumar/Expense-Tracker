import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createClaim } from '../features/claims/claimSlice';
import Sidebar from '../components/Sidebar';
import { FaBars } from 'react-icons/fa';

function ApplyClaim() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    claimType: 'Travel',
    amount: '',
    description: '',
  });
  const [file, setFile] = useState(null);

  const { claimType, amount, description } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const claimData = new FormData();
    claimData.append('claimType', claimType);
    claimData.append('amount', amount);
    claimData.append('description', description);
    if (file) {
      claimData.append('attachment', file);
    }

    dispatch(createClaim(claimData));
    navigate('/dashboard');
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
              <label htmlFor="claimType" className="block text-gray-700 font-semibold mb-2">Claim Type</label>
              <select
                id="claimType"
                name="claimType"
                value={claimType}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="Travel">Travel</option>
                <option value="Medical">Medical</option>
                <option value="Food">Food</option>
                <option value="OfficeEquipment">Office Equipment</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="amount" className="block text-gray-700 font-semibold mb-2">Amount</label>
              <input 
                  type="number" 
                  id="amount" 
                  name="amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300" 
                  value={amount} 
                  onChange={onChange} 
                  placeholder="Enter amount"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea 
                  id="description" 
                  name="description"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300" 
                  value={description} 
                  onChange={onChange} 
                  placeholder="Enter description"
              ></textarea>
            </div>
            <div className="mb-6">
              <label htmlFor="attachment" className="block text-gray-700 font-semibold mb-2">Attachment</label>
              <input 
                  type="file" 
                  id="attachment" 
                  name="attachment"
                  onChange={onFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300" 
              />
            </div>
            <button 
                type="submit" 
                className="w-full bg-blue-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
            >
                Submit Claim
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ApplyClaim;
