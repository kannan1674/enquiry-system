import { createAsyncThunk } from '@reduxjs/toolkit';
import { logout as logoutAction } from '@/lib/store/features/authSlice';

export const getProfileInfo = createAsyncThunk('legacyAuth/getProfileInfo', async () => ({}));

export const getSessionInfo = createAsyncThunk('legacyAuth/getSessionInfo', async () => ({}));

export const getStates = createAsyncThunk(
  'legacyAuth/getStates',
  async (payload: { countryId: string }) => {
    void payload;
    return { data: [] as unknown[] };
  },
);

export const getCities = createAsyncThunk(
  'legacyAuth/getCities',
  async (payload: { stateId: string }) => {
    void payload;
    return { data: [] as unknown[] };
  },
);

export const updateProfile = createAsyncThunk(
  'legacyAuth/updateProfile',
  async (payload: Record<string, unknown>, { rejectWithValue }) => {
    void payload;
    return rejectWithValue('Profile update is not available');
  },
);

export const refreshToken = createAsyncThunk('legacyAuth/refreshToken', async () => ({}));

export const logout = createAsyncThunk('legacyAuth/logout', async (_, { dispatch }) => {
  dispatch(logoutAction());
});
