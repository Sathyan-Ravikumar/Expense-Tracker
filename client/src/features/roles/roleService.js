import axios from 'axios';

const API_URL = 'http://localhost:5000/api/roles/';

// Get all roles
const getRoles = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data.data;
};

// Create a role
const createRole = async (roleData, token) => {
    const config = {
        headers: {
            'x-auth-token': token,
        },
    };
    const response = await axios.post(API_URL, roleData, config);
    return response.data.data;
}

// Update a role
const updateRole = async (id, roleData, token) => {
    const config = {
        headers: {
            'x-auth-token': token,
        },
    };
    const response = await axios.put(API_URL + id, roleData, config);
    return response.data.data;
}

// Delete a role
const deleteRole = async (id, token) => {
    const config = {
        headers: {
            'x-auth-token': token,
        },
    };
    const response = await axios.delete(API_URL + id, config);
    return response.data.data;
}

const roleService = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};

export default roleService;