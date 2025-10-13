import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications/';

// Get user notifications
const getNotifications = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get('http://localhost:5000/api/notifications/', config);
  return response.data.data;
};

// Get all notifications for admin
const getAllNotifications = async (token) => {
  const config = {
    headers: {
      'x-auth-token': token,
    },
  };

  const response = await axios.get('http://localhost:5000/api/notifications/all', config);
  return response.data.data;
};

// Mark all as read
const markAllAsRead = async (token) => {
    const config = {
        headers: {
          'x-auth-token': token,
        },
      };
    
      const response = await axios.put('http://localhost:5000/api/notifications/readall', {}, config);
      return response.data;
}

const notificationService = {
  getNotifications,
  getAllNotifications,
  markAllAsRead,
};

export default notificationService;
