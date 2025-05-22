import { Ticket } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const setTicketSliceAsync = createAsyncThunk(
  "ticket/setTicketSlice",
  async (payload: Ticket[]) => {
    return payload;
  }
);
