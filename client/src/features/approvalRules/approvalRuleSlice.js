import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import approvalRuleService from './approvalRuleService';

const initialState = {
  rules: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all approval rules
export const getApprovalRules = createAsyncThunk(
  'approvalRules/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      return await approvalRuleService.getApprovalRules(token);
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

// Create new approval rule
export const createApprovalRule = createAsyncThunk(
    'approvalRules/create',
    async (ruleData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.accessToken;
            return await approvalRuleService.createApprovalRule(ruleData, token);
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

// Update approval rule
export const updateApprovalRule = createAsyncThunk(
    'approvalRules/update',
    async ({ id, ruleData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.accessToken;
            return await approvalRuleService.updateApprovalRule(id, ruleData, token);
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

// Delete approval rule
export const deleteApprovalRule = createAsyncThunk(
    'approvalRules/delete',
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.accessToken;
            return await approvalRuleService.deleteApprovalRule(id, token);
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

export const approvalRuleSlice = createSlice({
  name: 'approvalRules',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getApprovalRules.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getApprovalRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rules = action.payload;
      })
      .addCase(getApprovalRules.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createApprovalRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createApprovalRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rules.push(action.payload);
      })
      .addCase(createApprovalRule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateApprovalRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateApprovalRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rules = state.rules.map((rule) => 
            rule._id === action.payload._id ? action.payload : rule
        );
      })
      .addCase(updateApprovalRule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteApprovalRule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteApprovalRule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rules = state.rules.filter(
          (rule) => rule._id !== action.meta.arg
        );
      })
      .addCase(deleteApprovalRule.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = approvalRuleSlice.actions;
export default approvalRuleSlice.reducer;