import axios from 'axios';

// Create new claim
const createClaim = async (claimData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.post('http://localhost:5000/api/claims/', claimData, config);
  return response.data;
};

// Get all claims for reviewer
const getClaims = async (token, { page = 1, limit = 10, claimType = '', minAmount = '', maxAmount = '', startDate = '', endDate = '', searchTerm = '' }) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
    params: { page, limit, claimType, minAmount, maxAmount, startDate, endDate, searchTerm },
  };

  const response = await axios.get('http://localhost:5000/api/claims/', config);
  return response.data;
};

// Get user claims
const getMyClaims = async (token, { page = 1, limit = 10, claimType = '', minAmount = '', maxAmount = '', startDate = '', endDate = '', searchTerm = '' }) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
    params: { page, limit, claimType, minAmount, maxAmount, startDate, endDate, searchTerm },
  };

  const response = await axios.get('http://localhost:5000/api/claims/my', config);
  return response.data;
};

// Get single claim
const getClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(`http://localhost:5000/api/claims/${claimId}`, config);
  return response.data.data;
};

// Update user claim
const updateClaim = async (claimId, claimData, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(`http://localhost:5000/api/claims/${claimId}`, claimData, config);
  return response.data;
};

// Delete user claim
const deleteClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.delete(`http://localhost:5000/api/claims/${claimId}`, config);
  return response.data;
};

// Reimburse user claim
const reimburseClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(`http://localhost:5000/api/claims/${claimId}/reimburse`, {}, config);
  return response.data;
};

// Approve user claim
const approveClaim = async (claimId, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(`http://localhost:5000/api/claims/${claimId}/approve`, {}, config);
  return response.data;
};

// Reject user claim
const rejectClaim = async (claimId, remarks, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(`http://localhost:5000/api/claims/${claimId}/reject`, { remarks }, config);
  return response.data;
};

// Return user claim
const returnClaim = async (claimId, remarks, token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.put(`http://localhost:5000/api/claims/${claimId}/return`, { remarks }, config);
  return response.data;
};

const claimService = {
  createClaim,
  getClaims,
  getMyClaims,
  getClaim,
  updateClaim,
  deleteClaim,
  reimburseClaim,
  approveClaim,
  rejectClaim,
  returnClaim,
};

export default claimService;
