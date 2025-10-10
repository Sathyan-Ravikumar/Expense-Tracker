import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications/';

// Get user notifications
const getNotifications = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data.data;
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

const notificationService = {
  getNotifications,
  markAllAsRead,
};

export default notificationService;
