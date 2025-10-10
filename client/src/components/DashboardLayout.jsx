import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';
import { getNotifications } from '../features/notifications/notificationSlice';

function DashboardLayout({ pageTitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      // Fetch notifications immediately on load
      dispatch(getNotifications());

      // Set up polling to fetch notifications every 30 seconds
      const intervalId = setInterval(() => {
        dispatch(getNotifications());
      }, 30000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [user, dispatch]);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-gray-900 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
            <p className="text-gray-600">Welcome, {user && user.name}</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars className="text-2xl text-gray-800" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;