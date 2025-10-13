import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import claimService from './claimService';

const initialState = {
  claims: [],
  claim: {},
  pagination: null,
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
export const getMyClaims = createAsyncThunk(
  'claims/getMy',
  async (filters = {}, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.getMyClaims(token, filters);
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

// Get all claims for reviewer
export const getClaims = createAsyncThunk(
  'claims/getAll',
  async (filters = {}, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.getClaims(token, filters);
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

// Get single claim
export const getClaim = createAsyncThunk(
  'claims/get',
  async (claimId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.getClaim(claimId, token);
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

// Update user claim
export const updateClaim = createAsyncThunk(
  'claims/update',
  async ({ id, claimData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.updateClaim(id, claimData, token);
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
  async ({ id, remarks }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.rejectClaim(id, remarks, token);
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
  async ({ id, remarks }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await claimService.returnClaim(id, remarks, token);
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
    resetCurrentClaim: (state) => {
        state.claim = {};
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
    }
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
        state.claims = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getClaims.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMyClaims.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyClaims.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.claims = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyClaims.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.claim = action.payload;
      })
      .addCase(getClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateClaim.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateClaim.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.claims.findIndex(
          (claim) => claim._id === action.payload.data._id
        );
        if (index !== -1) {
          state.claims[index] = action.payload.data;
        }
      })
      .addCase(updateClaim.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteClaim.pending, (state) => {
        state.isLoading = true;
      })
    .addCase(deleteClaim.fulfilled, (state, action) => {
      state.isLoading = false;
      // The id of the deleted claim is in action.meta.arg
      state.claims = state.claims.filter((claim) => claim._id !== action.meta.arg);
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

export const { reset, resetCurrentClaim } = claimSlice.actions;
export default claimSlice.reducer;
