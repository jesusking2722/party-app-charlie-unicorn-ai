import { Party } from "@/types/data";
import { createSlice } from "@reduxjs/toolkit";
import { addNewPartyAsync, setPartySliceAsync } from "../actions/party.actions";

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
    builder.addCase(addNewPartyAsync.fulfilled, (state, action) => {
      state.parties.unshift(action.payload);
    });
  },
});

export default partySlice.reducer;
