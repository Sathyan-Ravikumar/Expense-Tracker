import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Get users by role
const getUsersByRole = async (roleName, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_URL + `role/${roleName}`, config);
  return response.data.data;
};

const reportingUserService = {
  getUsersByRole,
};

export default reportingUserService;
