import { Message, User } from "@/types/data";
import { createSlice } from "@reduxjs/toolkit";
import {
  addNewMessageSliceAsync,
  addNewMessagesSliceAsync,
  setCurrentMessageIdSliceAsync,
  setCurrentSenderIdSliceAsync,
  setMessageSliceAsync,
  setTypingUserSliceAsync,
  updateMessageSliceAsync,
  updateMessageToReadSliceAsync,
} from "../actions/message.actions";

interface MessageSliceState {
  messages: Message[];
  currentSenderId: string | null;
  currentMessageId: string | null;
  typingUser: User | null;
}

const initialMessageSlice: MessageSliceState = {
  messages: [],
  currentSenderId: null,
  currentMessageId: null,
  typingUser: null,
};

const messageSlice = createSlice({
  name: "message",
  initialState: initialMessageSlice,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setMessageSliceAsync.fulfilled, (state, action) => {
      state.messages = action.payload;
    });
    builder.addCase(setCurrentSenderIdSliceAsync.fulfilled, (state, action) => {
      state.currentSenderId = action.payload;
    });
    builder.addCase(
      setCurrentMessageIdSliceAsync.fulfilled,
      (state, action) => {
        state.currentMessageId = action.payload;
      }
    );
    builder.addCase(setTypingUserSliceAsync.fulfilled, (state, action) => {
      state.typingUser = action.payload;
    });
    builder.addCase(addNewMessageSliceAsync.fulfilled, (state, action) => {
      state.messages.push(action.payload);
    });
    builder.addCase(addNewMessagesSliceAsync.fulfilled, (state, action) => {
      state.messages.push(...action.payload);
    });
    builder.addCase(
      updateMessageToReadSliceAsync.fulfilled,
      (state, action) => {
        const updatedMessages = action.payload;

        state.messages.forEach((message) => {
          const existing = updatedMessages.find(
            (updatedMessage) => updatedMessage._id === message._id
          );

          if (existing) {
            message.status = "read";
          }
        });
      }
    );
    builder.addCase(updateMessageSliceAsync.fulfilled, (state, action) => {
      const updatedMessage = action.payload;
      state.messages.forEach((message, index) => {
        if (message._id === updatedMessage._id) {
          state.messages[index] = updatedMessage;
        }
      });
    });
  },
});

export default messageSlice.reducer;
