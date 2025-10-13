import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers, deleteUser, reset } from '../features/users/userSlice';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import UserModal from '../components/UserModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dispatch = useDispatch();
  const { users, pagination, isLoading, isError, message } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getUsers({ page: currentPage, limit: rowsPerPage, searchTerm }));
  }, [dispatch, currentPage, rowsPerPage, searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page
  }

  const handleOpenModal = (user = null) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteUser(userToDelete._id));
    toast.success(`User ${userToDelete.name} deleted.`);
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  if (isLoading && !users.length) {
    return <Spinner />;
  }

  if (isError) {
    return <h3>{message}</h3>;
  }

  return (
    <DashboardLayout pageTitle="User Management">
      {isModalOpen && <UserModal isOpen={isModalOpen} onClose={handleCloseModal} userToEdit={userToEdit} />}
      <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the user ${userToDelete?.name}? This action cannot be undone.`}
      />

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Users</h2>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 mr-4"
              />
              <button onClick={() => handleOpenModal()} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Add User</button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.filter(user => {
                      if (searchTerm === '') {
                        return user;
                      } else if (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return user;
                      }
                    }).map(user => (
                        <tr key={user._id} className="border-b">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.role?.roleName}</td>
                            <td className="py-3 px-4 flex items-center space-x-4">
                                <button onClick={() => handleOpenModal(user)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                <button onClick={() => handleDeleteClick(user)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-2">
                <span>Rows per page:</span>
                <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="border rounded-lg px-2 py-1">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>
            </div>
            {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserManagement;
