import { Party } from "@/types/data";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addNewApplicantToSelectedPartyAsync,
  addNewPartyAsync,
  setPartySliceAsync,
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
  reducers: {
    updateApplicantStatusInSelectedParty(
      state: PartySliceState,
      action: PayloadAction<{
        partyId: string;
        applicantId: string;
        status: "pending" | "accepted" | "declined";
      }>
    ) {
      const { partyId, applicantId, status } = action.payload;
      state.parties.forEach((party) => {
        if (party._id === partyId) {
          let selectedApplicant = party.applicants.find(
            (applicant) => applicant._id === applicantId
          );
          if (selectedApplicant) {
            selectedApplicant.status = status;
          }
        }
      });
    },
  },
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
        const party = state.parties.find((p) => p._id === partyId);
        if (party) {
          party.applicants.unshift(newApplicant);
        }
      }
    );
    builder.addCase(updateSelectedPartyAsnyc.fulfilled, (state, action) => {
      const selectedParty = action.payload;
      state.parties.forEach((party) => {
        if (party._id === selectedParty._id) {
          party = selectedParty;
        }
      });
    });
  },
});

export const { updateApplicantStatusInSelectedParty } = partySlice.actions;
export default partySlice.reducer;
