import { User } from "@/types/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthSliceState {
  isAuthenticated: boolean;
  user: User | null;
}

const initialAuthSliceState: AuthSliceState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthSliceState,
  reducers: {
    setAuth(state: AuthSliceState, action: PayloadAction<AuthSliceState>) {
      state = action.payload;
    },
    setAuthUser(state: AuthSliceState, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
});

export const { setAuth, setAuthUser } = authSlice.actions;
export default authSlice.reducer;
