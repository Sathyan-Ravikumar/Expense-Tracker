import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAllAsRead } from '../features/notifications/notificationSlice';
import { getSystemAdminNotifications, markAllAsRead as markAllSystemAdminAsRead } from '../features/notifications/systemAdminNotificationSlice';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';

function NotificationsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, isLoading, isError, message } = useSelector((state) => state.notifications);
  const { notifications: systemAdminNotifications, isLoading: systemAdminIsLoading, isError: systemAdminIsError, message: systemAdminMessage } = useSelector((state) => state.systemAdminNotifications);
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
    } else {
      dispatch(getNotifications());
    }
  }, [dispatch, isSystemAdmin]);

  const handleMarkAllRead = () => {
    if (isSystemAdmin) {
      dispatch(markAllSystemAdminAsRead());
      toast.success('All system admin notifications marked as read.');
    } else {
      dispatch(markAllAsRead());
      toast.success('All user notifications marked as read.');
    }
  };

  const currentNotifications = isSystemAdmin ? systemAdminNotifications : notifications;
  const currentIsLoading = isSystemAdmin ? systemAdminIsLoading : isLoading;
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

  return (
    <DashboardLayout pageTitle="Notifications">
      {currentIsLoading && currentNotifications.length === 0 ? <Spinner /> : (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-800">{isSystemAdmin ? 'System Admin Notifications' : 'Your Notifications'}</h2>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-blue-500 hover:underline font-semibold">Mark all as read</button>
                )}
            </div>
            <div className="divide-y divide-gray-200">
                {paginatedNotifications && paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((notification) => (
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
