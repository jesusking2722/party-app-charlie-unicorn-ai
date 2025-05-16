import { Party } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const setPartySliceAsync = createAsyncThunk(
  "party/setPartySlice",
  async (payload: Party[]) => {
    return payload;
  }
);
