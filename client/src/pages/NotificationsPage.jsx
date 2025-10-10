import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAllAsRead } from '../features/notifications/notificationSlice';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications, isLoading, isError, message } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
    toast.success('All notifications marked as read.');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout pageTitle="Notifications">
      {isLoading && notifications.length === 0 ? <Spinner /> : (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-800">Your Notifications</h2>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-blue-500 hover:underline font-semibold">Mark all as read</button>
                )}
            </div>
            <div className="divide-y divide-gray-200">
                {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
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
