import { User } from "@/types/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addNewNotificationAsync,
  clearAuthAsync,
  setAuthAsync,
  setAuthUserAsync,
} from "../actions/auth.actions";

export interface AuthSliceState {
  isAuthenticated: boolean;
  user: User | null;
  lastUpdated: number | null;
}

const initialAuthSliceState: AuthSliceState = {
  isAuthenticated: false,
  user: null,
  lastUpdated: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthSliceState,
  reducers: {
    setAuthUser: (state: AuthSliceState, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle setAuthAsync
    builder.addCase(setAuthAsync.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
      state.lastUpdated = Date.now();
    });

    // Handle setAuthUserAsync
    builder.addCase(setAuthUserAsync.fulfilled, (state, action) => {
      state.user = action.payload;
      state.lastUpdated = Date.now();
    });

    // Handle clearAuthAsync
    builder.addCase(clearAuthAsync.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.lastUpdated = Date.now();
    });

    builder.addCase(addNewNotificationAsync.fulfilled, (state, action) => {
      state.user?.notifications?.unshift(action.payload);
    });
  },
});

export const { setAuthUser } = authSlice.actions;
export default authSlice.reducer;
