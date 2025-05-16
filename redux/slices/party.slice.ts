import { Party } from "@/types/data";
import { createSlice } from "@reduxjs/toolkit";
import { setPartySliceAsync } from "../actions/party.actions";

interface PartySliceState {
  parties: Party[];
}

const initialPartySliceState: PartySliceState = {
  parties: [],
};

const partySlice = createSlice({
  name: "party",
  initialState: initialPartySliceState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setPartySliceAsync.fulfilled, (state, action) => {
      state.parties = action.payload;
    });
  },
});

export default partySlice.reducer;
