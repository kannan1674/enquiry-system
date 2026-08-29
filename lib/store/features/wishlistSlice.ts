import { createSlice } from '@reduxjs/toolkit';

export type WishlistState = {
  content: any;
  loading: boolean;
  [key: string]: any;
};

const initialState: WishlistState = {
  content: [],
  loading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
});

export default wishlistSlice.reducer;
