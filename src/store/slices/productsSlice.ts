import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getProducts } from '@/services/productService';
import type { Product } from '@/types';

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  return getProducts();
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    /** Called after a successful transaction to decrement stock locally */
    decrementStock(state, action: PayloadAction<string>) {
      const product = state.items.find((p) => p.id === action.payload);
      if (product && product.stock > 0) {
        product.stock -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load products';
      });
  },
});

export const { decrementStock } = productsSlice.actions;
export default productsSlice.reducer;
