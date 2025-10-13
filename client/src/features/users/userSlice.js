import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from './userService';

const initialState = {
  users: [],
  pagination: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get users
export const getUsers = createAsyncThunk('users/getAll', async (filters, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    return await userService.getUsers(token, filters);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Create user
export const createUser = createAsyncThunk('users/create', async (userData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.accessToken;
        return await userService.createUser(userData, token);
    } catch (error) {
        const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Update user
export const updateUser = createAsyncThunk('users/update', async ({ id, userData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.accessToken;
        return await userService.updateUser(id, userData, token);
    } catch (error) {
        const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Delete user
export const deleteUser = createAsyncThunk('users/delete', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.accessToken;
        return await userService.deleteUser(id, token);
    } catch (error) {
        const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});


export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload.data);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user._id === action.payload.data._id ? action.payload.data : user
        );
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => user._id !== action.meta.arg
        );
      });
  },
});

export const { reset } = userSlice.actions;
export default userSlice.reducer;
