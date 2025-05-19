import { Applicant, Party } from "@/types/data";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const setPartySliceAsync = createAsyncThunk(
  "party/setPartySlice",
  async (payload: Party[]) => {
    return payload;
  }
);

export const addNewPartyAsync = createAsyncThunk(
  "party/addNewPartySlice",
  async (payload: Party) => {
    return payload;
  }
);

export const addNewApplicantToSelectedPartyAsync = createAsyncThunk(
  "party/addNewApplicantToSelectedParty",
  async (payload: { partyId: string; newApplicant: Applicant }) => {
    return payload;
  }
);

export const updateSelectedPartyAsnyc = createAsyncThunk(
  "party/updateSelectedParty",
  async (payload: Party) => {
    return payload;
  }
);

// export const updateApplicantStatusInSelectedPartyAsync = createAsyncThunk(
//   "party/updateApplicantStatusInSelectedParty",
//   async (payload: {
//     partyId: string;
//     applicantId: string;
//     status: "pending" | "accepted" | "declined";
//   }) => {
//     return payload;
//   }
// );
