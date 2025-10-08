import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import claimService from './claimService';

const initialState = {
  claims: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new claim
export const createClaim = createAsyncThunk(
  'claims/create',
  async (claimData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.createClaim(claimData, token);
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

// Get user claims
export const getClaims = createAsyncThunk(
  'claims/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.getClaims(token);
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

// Delete user claim
export const deleteClaim = createAsyncThunk(
  'claims/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.deleteClaim(id, token);
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

export const claimSlice = createSlice({
  name: 'claim',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.claims.push(action.payload);
      })
      .addCase(createClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getClaims.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClaims.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.claims = action.payload;
      })
      .addCase(getClaims.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.claims = state.claims.filter(
          (claim) => claim._id !== action.payload.id
        );
      })
      .addCase(deleteClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = claimSlice.actions;
export default claimSlice.reducer;
