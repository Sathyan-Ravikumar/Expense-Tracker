import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAllAsRead } from '../features/notifications/notificationSlice';
import { FaBell } from 'react-icons/fa';

function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const { notifications } = useSelector((state) => state.notifications);
  console.log('notifications in Notifications.jsx:', notifications);
  const { user } = useSelector((state) => state.auth);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-400 hover:text-white transition-colors duration-200">
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 text-gray-800">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-sm text-blue-500 hover:underline">Mark all as read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification._id} className={`p-4 border-b ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;