import { User } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createTrackedPromise } from "../middlewares/promise.tracking.middleware";

// Create thunks with proper handling of promises
export const setAuthAsync = createAsyncThunk(
  "auth/setAuth",
  async (payload: { isAuthenticated: boolean; user: User | null }) => {
    // Return the payload directly - the middleware will handle the promise
    return payload;
  }
);

export const setAuthUserAsync = createAsyncThunk(
  "auth/setAuthUser",
  async (user: User) => {
    // Return the user directly - the middleware will handle the promise
    return user;
  }
);

export const clearAuthAsync = createAsyncThunk("auth/clearAuth", async () => {
  // No payload needed for this action
  return null;
});

// Helper functions to create tracked promises for these actions
export const trackSetAuth = (
  payload: { isAuthenticated: boolean; user: User | null },
  dispatch: any
): Promise<any> => {
  const action = createTrackedPromise(setAuthAsync, payload);
  dispatch(action);
  return Promise.resolve(); // This will be resolved by the middleware
};

export const trackSetAuthUser = (user: User, dispatch: any): Promise<any> => {
  const action = createTrackedPromise(setAuthUserAsync, user);
  dispatch(action);
  return Promise.resolve(); // This will be resolved by the middleware
};

export const trackClearAuth = (dispatch: any): Promise<any> => {
  const action = createTrackedPromise(clearAuthAsync);
  dispatch(action);
  return Promise.resolve(); // This will be resolved by the middleware
};
