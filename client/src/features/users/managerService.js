import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Get all managers
const getManagers = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_URL + 'managers', config);
  return response.data.data;
};

const managerService = {
  getManagers,
};

export default managerService;
