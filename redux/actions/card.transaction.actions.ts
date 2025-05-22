import { CardTransaction } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const setCardTransactionSliceAsync = createAsyncThunk(
  "card/setCardTransactionSlice",
  async (payload: CardTransaction[]) => {
    return payload;
  }
);

export const addNewCardTransactionSliceAsync = createAsyncThunk(
  "card/addNewCardTransactionSlice",
  async (payload: CardTransaction) => {
    return payload;
  }
);
