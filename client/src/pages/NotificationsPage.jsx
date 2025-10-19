import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAllAsRead } from '../features/notifications/notificationSlice';
import { getSystemAdminNotifications, markAllAsRead as markAllSystemAdminAsRead } from '../features/notifications/systemAdminNotificationSlice';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import NotificationDetails from '../components/NotificationDetails';

function NotificationsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, isLoading, isError, message } = useSelector((state) => state.notifications);
  const { notifications: systemAdminNotifications, isLoading: systemAdminIsLoading, isError: systemAdminIsError, message: systemAdminMessage } = useSelector((state) => state.systemAdminNotifications);
  const [activeTab, setActiveTab] = useState('user');
  const [currentPage, setCurrentPage] = useState(1);

  const isSystemAdmin = user && user.role.roleName === 'System Admin';

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (systemAdminIsError) {
      toast.error(systemAdminMessage);
    }
  }, [isError, message, systemAdminIsError, systemAdminMessage]);

  useEffect(() => {
    if (isSystemAdmin) {
      dispatch(getSystemAdminNotifications());
    }
    dispatch(getNotifications());
  }, [dispatch, isSystemAdmin]);

  const handleMarkAllRead = () => {
    if (activeTab === 'user') {
      dispatch(markAllAsRead());
      toast.success('All user notifications marked as read.');
    } else {
      dispatch(markAllSystemAdminAsRead());
      toast.success('All system admin notifications marked as read.');
    }
  };

  const currentNotifications = activeTab === 'user' ? notifications : systemAdminNotifications;
  const currentIsLoading = activeTab === 'user' ? isLoading : systemAdminIsLoading;
  const unreadCount = currentNotifications.filter(n => !n.isRead).length;

  const itemsPerPage = 10;
  const totalPages = Math.ceil(currentNotifications.length / itemsPerPage);
  const paginatedNotifications = currentNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getNotificationMessage = (notification) => {
    const { action, details } = notification;
    switch (action) {
        case 'user_created':
            return `A new user, ${details ? details.email : 'N/A'}, has been created.`;
        case 'user_updated':
            return `User ${details ? details.previous.email : 'N/A'} has been updated.`;
        case 'user_deleted':
            return `User ${details ? details.email : 'N/A'} has been deleted.`;
        case 'approval_rule_created':
            return `A new approval rule has been created.`;
        case 'approval_rule_updated':
            return `An approval rule has been updated.`;
        case 'approval_rule_deleted':
            return `An approval rule has been deleted.`;
        default:
            return notification.message;
    }
  }

  return (
    <DashboardLayout pageTitle="Notifications">
        {isSystemAdmin && (
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
                <h2 className="text-xl font-bold text-gray-800">{isSystemAdmin && activeTab === 'admin' ? 'System Admin Notifications' : 'Your Notifications'}</h2>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-blue-500 hover:underline font-semibold">Mark all as read</button>
                )}
            </div>
            <div className="divide-y divide-gray-200">
                {paginatedNotifications && paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((notification) => (
                        <div key={notification._id} className={`p-4 ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}>
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-800">{isSystemAdmin && activeTab === 'admin' ? getNotificationMessage(notification) : notification.message}</p>
                            </div>
                            {isSystemAdmin && activeTab === 'admin' && <NotificationDetails notification={notification} />}
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
      <Pagination
        pagination={{
          page: currentPage,
          limit: itemsPerPage,
          total: currentNotifications.length,
          totalPages: totalPages,
          next: currentPage < totalPages ? { page: currentPage + 1, limit: itemsPerPage } : null,
          prev: currentPage > 1 ? { page: currentPage - 1, limit: itemsPerPage } : null,
        }}
        onPageChange={handlePageChange}
      />
    </DashboardLayout>
  );
}

export default NotificationsPage;
