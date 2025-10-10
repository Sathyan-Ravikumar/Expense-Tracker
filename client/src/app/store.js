import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import claimReducer from '../features/claims/claimSlice';
import claimTypeReducer from '../features/claimTypes/claimTypeSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    claims: claimReducer,
    claimTypes: claimTypeReducer,
    notifications: notificationReducer,
  },
});
