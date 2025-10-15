import axios from 'axios';

const API_URL = 'http://localhost:5000/api/system-admin-notifications/';

// Get all system admin notifications
const getSystemAdminNotifications = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Mark all as read
const markAllAsRead = async (token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    
      const response = await axios.put(API_URL + 'readall', {}, config);
      return response.data;
}

const systemAdminNotificationService = {
  getSystemAdminNotifications,
  markAllAsRead,
};

export default systemAdminNotificationService;
