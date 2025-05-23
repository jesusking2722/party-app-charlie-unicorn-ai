import { ApiResponse, UserResponse } from "@/types/api";
import { User } from "@/types/data";
import { FETCH_USER_BY_ID, UPDATE_USER } from "../apis";
import axiosInstance from "../axiosInstance";

export const fetchUserById = async (
  userId: string
): Promise<ApiResponse<UserResponse>> => {
  return await axiosInstance.get(FETCH_USER_BY_ID + userId);
};

export const updateUser = async (
  user: User
): Promise<ApiResponse<UserResponse>> => {
  return await axiosInstance.patch(UPDATE_USER, { user });
};
