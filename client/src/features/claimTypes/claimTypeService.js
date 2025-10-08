import axios from 'axios';

const API_URL = 'http://localhost:5000/api/claim-types/';

// Get all claim types
const getClaimTypes = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

const claimTypeService = {
  getClaimTypes,
};

export default claimTypeService;
