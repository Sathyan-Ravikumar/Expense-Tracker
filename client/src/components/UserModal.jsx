import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getRoles } from '../features/roles/roleSlice';
import { createUser, updateUser } from '../features/users/userSlice';
import Spinner from './Spinner';

function UserModal({ isOpen, onClose, userToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();

  const { roles, isLoading: rolesLoading } = useSelector((state) => state.roles);
  const { isLoading: userLoading } = useSelector((state) => state.users);

  const isEditMode = Boolean(userToEdit);

  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        password: '', // Do not pre-fill password
        role: userToEdit.role?._id || '',
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: '' });
    }
  }, [userToEdit, isEditMode]);

  if (!isOpen) return null;

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = 'Name is required';
    if (!formData.email) tempErrors.email = 'Email is required';
    if (!isEditMode && !formData.password) tempErrors.password = 'Password is required';
    if (!formData.role) tempErrors.role = 'Role is required';
    return tempErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const userData = { ...formData };
    if (isEditMode) {
      delete userData.password; // Do not send empty password on update
      if(formData.password === '') delete userData.password;

      dispatch(updateUser({ id: userToEdit._id, userData })).then(() => {
        toast.success('User updated successfully!');
        onClose();
      });
    } else {
      dispatch(createUser(userData)).then(() => {
        toast.success('User created successfully!');
        onClose();
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
        {rolesLoading || userLoading ? <Spinner /> : (
            <form onSubmit={onSubmit} noValidate>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={onChange} className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`} disabled={isEditMode} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={onChange} className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`} disabled={isEditMode} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                {!isEditMode && (
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={onChange} className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                )}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Role</label>
                    <div className="space-y-2">
                        {roles.map(role => (
                            <label key={role._id} className="flex items-center">
                                <input type="radio" name="role" value={role._id} checked={formData.role === role._id} onChange={onChange} className="mr-2" />
                                {role.roleName}
                            </label>
                        ))}
                    </div>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-blue-600">
                    {isEditMode ? 'Update User' : 'Create User'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
}

export default UserModal;
