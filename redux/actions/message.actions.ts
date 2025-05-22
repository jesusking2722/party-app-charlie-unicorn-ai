import { Message, User } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Create thunks with proper handling of promises
export const setMessageSliceAsync = createAsyncThunk(
  "message/setMessageSlice",
  async (payload: Message[]) => {
    return payload;
  }
);

export const setCurrentSenderIdSliceAsync = createAsyncThunk(
  "message/setCurrentSenderIdSlice",
  async (payload: string) => {
    return payload;
  }
);

export const setCurrentMessageIdSliceAsync = createAsyncThunk(
  "message/setCurrentMessageIdSlice",
  async (payload: string) => {
    return payload;
  }
);

export const setTypingUserSliceAsync = createAsyncThunk(
  "message/setTypingUserSlice",
  async (payload: User | null) => {
    return payload;
  }
);

export const addNewMessageSliceAsync = createAsyncThunk(
  "message/addNewMessageSlice",
  async (payload: Message) => {
    return payload;
  }
);

export const addNewMessagesSliceAsync = createAsyncThunk(
  "message/addNewMessagesSlice",
  async (payload: Message[]) => {
    return payload;
  }
);

export const updateMessageToReadSliceAsync = createAsyncThunk(
  "message/updateMessageToReadSlice",
  async (payload: Message[]) => {
    return payload;
  }
);

export const updateMessageSliceAsync = createAsyncThunk(
  "message/updateMessageSlice",
  async (payload: Message) => {
    return payload;
  }
);
