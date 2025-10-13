import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roleService from './roleService';

const initialState = {
  roles: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all roles
export const getRoles = createAsyncThunk('roles/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    return await roleService.getRoles(token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Create role
export const createRole = createAsyncThunk('roles/create', async (roleData, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.accessToken;
        return await roleService.createRole(roleData, token);
    } catch (error) {
        const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Update role
export const updateRole = createAsyncThunk('roles/update', async ({ id, roleData }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.accessToken;
        return await roleService.updateRole(id, roleData, token);
    } catch (error) {
        const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Delete role
export const deleteRole = createAsyncThunk('roles/delete', async (id, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.accessToken;
        await roleService.deleteRole(id, token);
        return id;
    } catch (error) {
        const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRoles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.roles = action.payload;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.roles = state.roles.map((role) =>
          role._id === action.payload._id ? action.payload : role
        );
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter(
          (role) => role._id !== action.payload
        );
      });
  },
});

export const { reset } = roleSlice.actions;
export default roleSlice.reducer;