import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import claimTypeService from './claimTypeService';

const initialState = {
  claimTypes: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all claim types
export const getClaimTypes = createAsyncThunk(
  'claimTypes/getAll',
  async (_, thunkAPI) => {
    try {
      return await claimTypeService.getClaimTypes();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const claimTypeSlice = createSlice({
  name: 'claimType',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClaimTypes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClaimTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.claimTypes = action.payload;
      })
      .addCase(getClaimTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = claimTypeSlice.actions;
export default claimTypeSlice.reducer;
