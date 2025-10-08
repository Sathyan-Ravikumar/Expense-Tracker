import axios from 'axios';

const API_URL = 'http://localhost:5000/api/claims/';

// Create new claim
const createClaim = async (claimData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.post(API_URL, claimData, config);
  return response.data;
};

// Get user claims
const getClaims = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_URL + 'my', config);
  return response.data.data;
};

// Delete user claim
const deleteClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.delete(API_URL + claimId, config);
  return response.data;
};

const claimService = {
  createClaim,
  getClaims,
  deleteClaim,
};

export default claimService;
