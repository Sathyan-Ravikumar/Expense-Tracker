import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import systemAdminNotificationService from './systemAdminNotificationService';

const initialState = {
  notifications: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get system admin notifications
export const getSystemAdminNotifications = createAsyncThunk('systemAdminNotifications/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    return await systemAdminNotificationService.getSystemAdminNotifications(token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Mark all as read
export const markAllAsRead = createAsyncThunk('systemAdminNotifications/markAllAsRead', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    return await systemAdminNotificationService.markAllAsRead(token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const systemAdminNotificationSlice = createSlice({
  name: 'systemAdminNotifications',
  initialState,
  reducers: {
    reset: (state) => initialState,
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSystemAdminNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSystemAdminNotifications.fulfilled, (state, action) => {
        console.log('getSystemAdminNotifications fulfilled:', action.payload);
        state.isLoading = false;
        state.isSuccess = true;
        state.notifications = action.payload.data;
      })
      .addCase(getSystemAdminNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map(n => ({...n, isRead: true}));
      });
  },
});

export const { reset } = systemAdminNotificationSlice.actions;
export default systemAdminNotificationSlice.reducer;
