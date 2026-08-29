import { createAsyncThunk } from '@reduxjs/toolkit';

export const wishListGet = createAsyncThunk('wishlist/get', async () => [] as unknown[]);

export const wishListSearch = createAsyncThunk('wishlist/search', async (query: string) => {
  void query;
  return [] as unknown[];
});

export const wishListDetail = createAsyncThunk('wishlist/detail', async (templateId: string) => {
  void templateId;
  return {};
});

export const wishListDelete = createAsyncThunk('wishlist/delete', async (templateId: string) => {
  void templateId;
  return {};
});
