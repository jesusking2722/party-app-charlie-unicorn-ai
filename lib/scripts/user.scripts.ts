import { ApiResponse, UserResponse } from "@/types/api";
import axiosInstance from "../axiosInstance";
import { FETCH_USER_BY_ID } from "../apis";

export const fetchUserById = async (
  userId: string
): Promise<ApiResponse<UserResponse>> => {
  return await axiosInstance.get(FETCH_USER_BY_ID + userId);
};
