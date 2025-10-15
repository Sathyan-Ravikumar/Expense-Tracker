import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import managerService from './managerService';

const initialState = {
  managers: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all managers
export const getManagers = createAsyncThunk('managers/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    return await managerService.getManagers(token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const managerSlice = createSlice({
  name: 'managers',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getManagers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getManagers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.managers = action.payload;
      })
      .addCase(getManagers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = managerSlice.actions;
export default managerSlice.reducer;
