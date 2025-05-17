import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { promiseTrackingMiddleware } from "./middlewares/promise.tracking.middleware";
import authReducer from "./slices/auth.slice";
import partyReducer from "./slices/party.slice";
import ticketReducer from "./slices/ticket.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    party: partyReducer,
    ticket: ticketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/setAuth/fulfilled",
          "auth/setAuthUser/fulfilled",
          "auth/clearAuth/fulfilled",
        ],
        ignoredActionPaths: ["meta.promiseId"],
        ignoredPaths: [],
      },
    }).concat(promiseTrackingMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Correctly type the dispatch to handle thunks
export type AppDispatch = typeof store.dispatch;

// Custom hooks for dispatch and selector with types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
