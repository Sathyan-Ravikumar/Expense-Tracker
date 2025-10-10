import axios from 'axios';

const API_URL = 'http://localhost:5000/api/claims/';

// Create new claim
const createClaim = async (claimData, token) => {
  console.log(API_URL);
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.post(API_URL, claimData, config);
  return response.data;
};

// Get all claims for reviewer
const getClaims = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data.data;
};

// Get user claims
const getMyClaims = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_URL + 'my', config);
  return response.data.data;
};

// Get single claim
const getClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_URL + claimId, config);
  return response.data.data;
};

// Update user claim
const updateClaim = async (claimId, claimData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(API_URL + claimId, claimData, config);
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

// Reimburse user claim
const reimburseClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(API_URL + claimId + '/reimburse', {}, config);
  return response.data;
};

// Approve user claim
const approveClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(API_URL + claimId + '/approve', {}, config);
  return response.data;
};

// Reject user claim
const rejectClaim = async (claimId, remarks, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(API_URL + claimId + '/reject', { remarks }, config);
  return response.data;
};

// Return user claim
const returnClaim = async (claimId, remarks, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(API_URL + claimId + '/return', { remarks }, config);
  return response.data;
};

const claimService = {
  createClaim,
  getClaims,
  getMyClaims,
  deleteClaim,
  reimburseClaim,
  approveClaim,
  rejectClaim,
  returnClaim,
};

export default claimService;
