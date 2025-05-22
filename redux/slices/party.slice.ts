import { Party } from "@/types/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addNewApplicantToSelectedPartyAsync,
  addNewPartyAsync,
  setPartySliceAsync,
  updateApplicantStatusInSelectedPartyAsync,
  updatePartyStatusSliceAsync,
  updateSelectedPartyAsnyc,
} from "../actions/party.actions";

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
    builder.addCase(
      addNewApplicantToSelectedPartyAsync.fulfilled,
      (state, action) => {
        const { partyId, newApplicant } = action.payload;
        const party = state.parties.find(
          (p) => p._id?.toString() === partyId?.toString()
        );
        if (party && Array.isArray(party.applicants)) {
          party.applicants.unshift(newApplicant);
        }
      }
    );
    builder.addCase(updateSelectedPartyAsnyc.fulfilled, (state, action) => {
      const selectedParty = action.payload;
      const index = state.parties.findIndex(
        (party) => party._id?.toString() === selectedParty._id?.toString()
      );
      if (index !== -1) {
        state.parties[index] = selectedParty;
      }
    });
    builder.addCase(
      updateApplicantStatusInSelectedPartyAsync.fulfilled,
      (state, action) => {
        const { partyId, applicantId, status } = action.payload;
        const party = state.parties.find(
          (p) => p._id?.toString() === partyId?.toString()
        );
        if (party && Array.isArray(party.applicants)) {
          const selectedApplicant = party.applicants.find(
            (applicant) => applicant._id?.toString() === applicantId?.toString()
          );
          if (selectedApplicant) {
            selectedApplicant.status = status;
          }
        }
      }
    );

    builder.addCase(updatePartyStatusSliceAsync.fulfilled, (state, action) => {
      const { partyId, status } = action.payload;
      const party = state.parties.find(
        (p) => p._id?.toString() === partyId?.toString()
      );
      if (party) {
        party.status = status;
      }
    });
  },
});

export default partySlice.reducer;
