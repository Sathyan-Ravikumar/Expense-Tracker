import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import claimReducer from '../features/claims/claimSlice';
import claimTypeReducer from '../features/claimTypes/claimTypeSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import approvalRuleReducer from '../features/approvalRules/approvalRuleSlice';
import userReducer from '../features/users/userSlice';
import roleReducer from '../features/roles/roleSlice';

import systemAdminNotificationsReducer from '../features/notifications/systemAdminNotificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    claims: claimReducer,
    claimTypes: claimTypeReducer,
    approvalRules: approvalRuleReducer,
    notifications: notificationReducer,
    systemAdminNotifications: systemAdminNotificationsReducer,
    roles: roleReducer,
    users: userReducer,
  },
});
