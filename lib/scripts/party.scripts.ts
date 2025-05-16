import { ApiResponse, PartyAllResponse } from "@/types/api";
import { FETCH_ALL_PARTIES } from "../apis";
import axiosInstance from "../axiosInstance";

export const fetchAllParties = async (): Promise<
  ApiResponse<PartyAllResponse>
> => {
  return await axiosInstance.get(FETCH_ALL_PARTIES);
};
