import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getRoles } from '../features/roles/roleSlice';
import { getUsersByRole } from '../features/users/reportingUserSlice';
import { createUser, updateUser } from '../features/users/userSlice';
import Spinner from './Spinner';
import Select from 'react-select';

function UserModal({ isOpen, onClose, userToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    manager: '',
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();

  const { roles, isLoading: rolesLoading } = useSelector((state) => state.roles);
  const { users: reportingUsers, isLoading: reportingUsersLoading } = useSelector((state) => state.reportingUsers);
  const { isLoading: userLoading } = useSelector((state) => state.users);

  const isEditMode = Boolean(userToEdit);

  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  useEffect(() => {
    if (formData.role) {
      const selectedRole = roles.find(r => r._id === formData.role);
      if (selectedRole) {
        let reportingRole = '';
        switch (selectedRole.roleName) {
          case 'Employee':
            reportingRole = 'Manager';
            break;
          case 'Manager':
            reportingRole = 'Finance Officer';
            break;
          case 'Finance Officer':
            reportingRole = 'Admin/Finance Head';
            break;
          case 'Admin/Finance Head':
            reportingRole = 'System Admin';
            break;
          default:
            setFormData(prevState => ({ ...prevState, manager: '' }));
            break;
        }
        if (reportingRole) {
          dispatch(getUsersByRole(reportingRole));
        }
      }
    }
  }, [dispatch, formData.role, roles]);

  useEffect(() => {
    if (isEditMode && userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        password: '', // Do not pre-fill password
        role: userToEdit.role?._id || '',
        manager: userToEdit.manager?._id || '',
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: '', manager: '' });
    }
  }, [userToEdit, isEditMode]);

  if (!isOpen) return null;

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onManagerChange = (selectedOption) => {
    setFormData((prevState) => ({ ...prevState, manager: selectedOption.value }));
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
    console.log('User data being sent to API:', userData);
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

  const managerOptions = reportingUsers.map(user => ({ value: user._id, label: user.email }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
        {rolesLoading || userLoading || reportingUsersLoading ? <Spinner /> : (
            <form onSubmit={onSubmit} noValidate>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={onChange} className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={onChange} className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
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
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={onChange}
                        className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : 'border-gray-300'}`}>
                        <option value="">Select a role</option>
                        {roles.map(role => (
                            <option key={role._id} value={role._id}>
                                {role.roleName}
                            </option>
                        ))}
                    </select>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Reporting To</label>
                    <Select
                        options={managerOptions}
                        onChange={onManagerChange}
                        isSearchable
                        value={managerOptions.find(option => option.value === formData.manager)}
                        isDisabled={roles.find(r => r._id === formData.role)?.roleName === 'System Admin'}
                    />
                    {errors.manager && <p className="text-red-500 text-xs mt-1">{errors.manager}</p>}
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
