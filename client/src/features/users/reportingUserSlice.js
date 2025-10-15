import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportingUserService from './reportingUserService';

const initialState = {
  users: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get users by role
export const getUsersByRole = createAsyncThunk('reportingUsers/getByRole', async (roleName, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    return await reportingUserService.getUsersByRole(roleName, token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const reportingUserSlice = createSlice({
  name: 'reportingUsers',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsersByRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsersByRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(getUsersByRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = reportingUserSlice.actions;
export default reportingUserSlice.reducer;
