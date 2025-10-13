import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Get all users
const getUsers = async (token, { page = 1, limit = 10, searchTerm = '' }) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
    params: { page, limit, searchTerm },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Create a user
const createUser = async (userData, token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    const response = await axios.post(API_URL, userData, config);
    return response.data;
}

// Update a user
const updateUser = async (userId, userData, token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    const response = await axios.put(API_URL + userId, userData, config);
    return response.data;
}

// Delete a user
const deleteUser = async (userId, token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    const response = await axios.delete(API_URL + userId, config);
    return response.data;
}

const userService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
