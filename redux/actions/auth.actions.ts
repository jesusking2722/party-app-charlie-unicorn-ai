import { Notification, User } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

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

export const addNewNotificationAsync = createAsyncThunk(
  "auth/addNewNotification",
  async (notification: Notification) => {
    return notification;
  }
);
