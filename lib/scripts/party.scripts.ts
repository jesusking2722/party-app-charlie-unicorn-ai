import { ApiResponse } from "@/types/api";
import { Party } from "@/types/data";
import { FETCH_ALL_PARTIES } from "../apis";
import axiosInstance from "../axiosInstance";

export const fetchAllParties = async (): Promise<ApiResponse<Party[]>> => {
  return await axiosInstance.get(FETCH_ALL_PARTIES);
};
