import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAllAsRead } from '../features/notifications/notificationSlice';
import { getSystemAdminNotifications, markAllAsRead as markAllSystemAdminAsRead } from '../features/notifications/systemAdminNotificationSlice';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

function NotificationsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, isLoading, isError, message } = useSelector((state) => state.notifications);
  const { notifications: systemAdminNotifications, isLoading: systemAdminIsLoading, isError: systemAdminIsError, message: systemAdminMessage } = useSelector((state) => state.systemAdminNotifications);
  const [activeTab, setActiveTab] = useState('user');

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (systemAdminIsError) {
      toast.error(systemAdminMessage);
    }
  }, [isError, message, systemAdminIsError, systemAdminMessage]);

  useEffect(() => {
    if (user && user.role.roleName === 'System Admin') {
      dispatch(getSystemAdminNotifications());
    }
    dispatch(getNotifications());
  }, [dispatch, user]);

  const handleMarkAllRead = () => {
    if (activeTab === 'user') {
      dispatch(markAllAsRead());
      toast.success('All user notifications marked as read.');
    } else {
      dispatch(markAllSystemAdminAsRead());
      toast.success('All system admin notifications marked as read.');
    }
  };

  const unreadCount = activeTab === 'user' ? notifications.filter(n => !n.isRead).length : systemAdminNotifications.filter(n => !n.isRead).length;
  const currentNotifications = activeTab === 'user' ? notifications : systemAdminNotifications;
  const currentIsLoading = activeTab === 'user' ? isLoading : systemAdminIsLoading;

  return (
    <DashboardLayout pageTitle="Notifications">
      {user && user.role.roleName === 'System Admin' && (
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('user')} className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${activeTab === 'user' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              User Notifications
            </button>
            <button onClick={() => setActiveTab('admin')} className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${activeTab === 'admin' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              System Admin Notifications
            </button>
          </nav>
        </div>
      )}
      {currentIsLoading && currentNotifications.length === 0 ? <Spinner /> : (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-800">Your Notifications</h2>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-blue-500 hover:underline font-semibold">Mark all as read</button>
                )}
            </div>
            <div className="divide-y divide-gray-200">
                {currentNotifications && currentNotifications.length > 0 ? (
                    currentNotifications.map((notification) => (
                        <div key={notification._id} className={`p-4 ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}>
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        </div>
                    ))
                ) : (
                    <p className="p-8 text-center text-gray-500">You don't have any notifications yet.</p>
                )}
            </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default NotificationsPage;
