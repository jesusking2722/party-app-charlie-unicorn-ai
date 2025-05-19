import { CardTransaction } from "@/types/data";
import { createSlice } from "@reduxjs/toolkit";
import {
  addNewCardTransactionSliceAsync,
  setCardTransactionSliceAsync,
} from "../actions/card.transaction.actions";

interface CardTransactionSliceState {
  cardTransactions: CardTransaction[];
}

const initialCardTransactionSliceState: CardTransactionSliceState = {
  cardTransactions: [],
};

const cardTransactionSlice = createSlice({
  name: "cardTransaction",
  initialState: initialCardTransactionSliceState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setCardTransactionSliceAsync.fulfilled, (state, action) => {
      state.cardTransactions = action.payload;
    });

    builder.addCase(
      addNewCardTransactionSliceAsync.fulfilled,
      (state, action) => {
        state.cardTransactions = [...state.cardTransactions, action.payload];
      }
    );
  },
});

export default cardTransactionSlice.reducer;
