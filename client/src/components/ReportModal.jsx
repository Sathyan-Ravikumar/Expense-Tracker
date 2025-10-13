import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function ReportModal({ isOpen, onClose }) {
  const [reportType, setReportType] = useState('department');

  const generateReport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = {
        headers: {
          'x-auth-token': token,
        },
        responseType: 'blob', // Important for file downloads
      };
      const response = await axios.get(`http://localhost:5000/api/reports?reportType=${reportType}`, config);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Report generated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to generate report.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Report</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select
              id="reportType"
              name="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="department">Department-wise Expenses</option>
              <option value="category">Category-wise Claims</option>
              <option value="timeline">Approval Timelines</option>
            </select>
          </div>
          <button onClick={generateReport} className="w-full bg-blue-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
