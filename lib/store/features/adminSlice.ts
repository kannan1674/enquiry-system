import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AdminProfileInfo = {
  FirstName?: string;
  LastName?: string;
  Email?: string;
  MobileNumber?: string;
  MobileNumberCc?: string;
  MobileNumberCcId?: string;
  BusinessName?: string;
  State?: string;
  Country?: string;
  CountryId?: string;
  CountryIso?: string;
  CityName?: string;
  CityId?: string;
  StateId?: string;
  CreatedDate?: string;
  CreatedDateText?: string;
  ModifiedDate?: string;
  ModifiedDateText?: string;
  RoleId?: number;
};

export type AdminState = {
  profileInfo: AdminProfileInfo | null;
};

const initialState: AdminState = {
  profileInfo: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminProfile(state, action: PayloadAction<AdminProfileInfo | null>) {
      state.profileInfo = action.payload;
    },
  },
});

export const { setAdminProfile } = adminSlice.actions;
export default adminSlice.reducer;
