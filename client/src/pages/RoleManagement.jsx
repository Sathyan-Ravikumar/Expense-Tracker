import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRoles, deleteRole, reset } from '../features/roles/roleSlice';
import DashboardLayout from '../components/DashboardLayout';
import Spinner from '../components/Spinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// This will be a new component we create in the next step
// import RoleModal from '../components/RoleModal'; 

function RoleManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const dispatch = useDispatch();
  const { roles, isLoading, isError, message } = useSelector((state) => state.roles);

  useEffect(() => {
    dispatch(getRoles());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleOpenModal = (role = null) => {
    setRoleToEdit(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRoleToEdit(null);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteRole(roleToDelete._id));
    toast.success(`Role '${roleToDelete.roleName}' deleted.`);
    setIsDeleteConfirmOpen(false);
    setRoleToDelete(null);
  };

  if (isLoading && !roles.length) {
    return <Spinner />;
  }

  if (isError) {
    return <h3>{message}</h3>;
  }

  return (
    <DashboardLayout pageTitle="Role Management">
      {/* <RoleModal isOpen={isModalOpen} onClose={handleCloseModal} roleToEdit={roleToEdit} /> */}
      <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the role '${roleToDelete?.roleName}'?`}
      />

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Roles</h2>
            <button onClick={() => handleOpenModal()} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Add Role</button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Role Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map(role => (
                        <tr key={role._id} className="border-b">
                            <td className="py-3 px-4">{role.roleName}</td>
                            <td className="py-3 px-4 flex items-center space-x-4">
                                <button onClick={() => handleOpenModal(role)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                                <button onClick={() => handleDeleteClick(role)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RoleManagement;
