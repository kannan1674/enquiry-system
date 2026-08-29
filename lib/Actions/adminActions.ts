import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAdminProfileInfo = createAsyncThunk('legacyAdmin/getProfileInfo', async () => ({}));

export const updateProfile = createAsyncThunk(
  'legacyAdmin/updateProfile',
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    void payload;
    return rejectWithValue('Profile update is not available');
  },
);

export const adminProfileChangePassword = createAsyncThunk(
  'legacyAdmin/changePassword',
  async (
    payload: { CurrentPassword: string; NewPassword: string },
    { rejectWithValue },
  ) => {
    void payload;
    return rejectWithValue('Password change is not available');
  },
);
