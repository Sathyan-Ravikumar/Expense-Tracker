import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import { getSystemAdminNotifications, reset } from '../features/notifications/systemAdminNotificationSlice';
import Pagination from '../components/Pagination';
import { toast } from 'react-hot-toast';

function AuditLogsPage() {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const { notifications, isLoading, isError, message } = useSelector(
    (state) => state.systemAdminNotifications
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    dispatch(getSystemAdminNotifications());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <DashboardLayout pageTitle="Audit Logs">
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">System Notifications</h2>
        </div>
        <div>
          {paginatedNotifications.map((notification) => (
            <div key={notification._id} className="flex items-center p-4 border-b hover:bg-gray-50">
              <div className="flex-grow">
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Admin: {notification.admin.name}</p>
                {notification.affectedUser && <p>User: {notification.affectedUser.name}</p>}
                {notification.affectedRule && <p>Rule: {notification.affectedRule.claimType.typeName}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </DashboardLayout>
  );
}

export default AuditLogsPage;
