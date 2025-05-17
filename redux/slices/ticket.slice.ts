import { Ticket } from "@/types/data";
import { createSlice } from "@reduxjs/toolkit";
import { setTicketSliceAsync } from "../actions/ticket.actions";

interface TicketSliceState {
  tickets: Ticket[];
}

const initialTicketSliceState: TicketSliceState = {
  tickets: [],
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState: initialTicketSliceState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setTicketSliceAsync.fulfilled, (state, action) => {
      state.tickets = action.payload;
    });
  },
});

export default ticketSlice.reducer;
