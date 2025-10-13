import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/approval-rules/';

// Get all approval rules
const getApprovalRules = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_BASE_URL, config);
  return response.data.data;
};

// Create new approval rule
const createApprovalRule = async (ruleData, token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    
      const response = await axios.post(API_BASE_URL, ruleData, config);
      return response.data.data;
}

// Update approval rule
const updateApprovalRule = async (id, ruleData, token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    
      const response = await axios.put(API_BASE_URL + id, ruleData, config);
      return response.data.data;
}

// Delete approval rule
const deleteApprovalRule = async (id, token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    
      const response = await axios.delete(API_BASE_URL + id, config);
      return response.data.data;
}

const approvalRuleService = {
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
};

export default approvalRuleService;