import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import claimReducer from '../features/claims/claimSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    claims: claimReducer,
  },
});
