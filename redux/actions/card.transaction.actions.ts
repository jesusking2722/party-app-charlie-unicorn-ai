import { CardTransaction } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const setCardTransactionSliceAsync = createAsyncThunk(
  "party/setCardTransactionSlice",
  async (payload: CardTransaction[]) => {
    return payload;
  }
);

export const addNewCardTransactionSliceAsync = createAsyncThunk(
  "party/addNewCardTransactionSlice",
  async (payload: CardTransaction) => {
    return payload;
  }
);
