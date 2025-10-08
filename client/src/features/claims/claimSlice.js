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

// Reimburse user claim
export const reimburseClaim = createAsyncThunk(
  'claims/reimburse',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.reimburseClaim(id, token);
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

// Approve user claim
export const approveClaim = createAsyncThunk(
  'claims/approve',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.approveClaim(id, token);
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

// Reject user claim
export const rejectClaim = createAsyncThunk(
  'claims/reject',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.rejectClaim(id, token);
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

// Return user claim
export const returnClaim = createAsyncThunk(
  'claims/return',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.returnClaim(id, token);
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
      })
      .addCase(reimburseClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reimburseClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.claims.findIndex(
          (claim) => claim._id === action.payload.data._id
        );
        if (index !== -1) {
          state.claims[index] = action.payload.data;
        }
      })
      .addCase(reimburseClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(approveClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.claims.findIndex(
          (claim) => claim._id === action.payload.data._id
        );
        if (index !== -1) {
          state.claims[index] = action.payload.data;
        }
      })
      .addCase(approveClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(rejectClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rejectClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.claims.findIndex(
          (claim) => claim._id === action.payload.data._id
        );
        if (index !== -1) {
          state.claims[index] = action.payload.data;
        }
      })
      .addCase(rejectClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(returnClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(returnClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.claims.findIndex(
          (claim) => claim._id === action.payload.data._id
        );
        if (index !== -1) {
          state.claims[index] = action.payload.data;
        }
      })
      .addCase(returnClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = claimSlice.actions;
export default claimSlice.reducer;
