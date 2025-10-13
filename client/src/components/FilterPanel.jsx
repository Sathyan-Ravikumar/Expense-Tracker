import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getClaimTypes } from '../features/claimTypes/claimTypeSlice';
import { FaFilter } from 'react-icons/fa';

function FilterPanel({ onApplyFilters }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    claimType: '', 
    minAmount: '', 
    maxAmount: '', 
    startDate: '', 
    endDate: '',
    employeeName: ''
  });

  const dispatch = useDispatch();
  const filterPanelRef = useRef(null);
  const { claimTypes } = useSelector((state) => state.claimTypes);

  useEffect(() => {
    dispatch(getClaimTypes());
  }, [dispatch]);

  // Close filter panel on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterPanelRef]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleApply = () => {
    onApplyFilters(filters);
    setShowFilters(false);
  }

  return (
    <div className="relative" ref={filterPanelRef}>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <FaFilter className="text-gray-500" />
            <span>Filters</span>
        </button>
        {showFilters && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 p-4 space-y-4">
                <h4 className="font-semibold text-gray-800">Filter Claims</h4>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Claim Type</label>
                    <select name="claimType" onChange={handleFilterChange} value={filters.claimType} className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All</option>
                        {claimTypes.map(ct => (
                            <option key={ct._id} value={ct._id}>{ct.typeName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <div className="flex items-center space-x-2">
                        <input type="number" name="minAmount" value={filters.minAmount} onChange={handleFilterChange} placeholder="Min" className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="number" name="maxAmount" value={filters.maxAmount} onChange={handleFilterChange} placeholder="Max" className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <div className="flex items-center space-x-2">
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <button onClick={handleApply} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Apply Filters</button>
            </div>
        )}
    </div>
  );
}

export default FilterPanel;