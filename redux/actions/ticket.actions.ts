import { Ticket } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const setTicketSliceAsync = createAsyncThunk(
  "party/setTicketSlice",
  async (payload: Ticket[]) => {
    return payload;
  }
);
