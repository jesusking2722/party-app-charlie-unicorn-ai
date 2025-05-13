import { ApiResponse, AuthResponse } from "@/types/api";
import { LOGIN_BY_EMAIL, REGISTER_BY_EMAIL } from "../apis";
import axiosInstance from "../axiosInstance";

// Register scripts
export const registerByEmail = async (
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> => {
  return await axiosInstance.post(REGISTER_BY_EMAIL, {
    user: { email, password },
  });
};

// Login scripts
export const loginByEmail = async (
  email: string,
  password: string
): Promise<ApiResponse<AuthResponse>> => {
  return await axiosInstance.post(LOGIN_BY_EMAIL, {
    user: { email, password },
  });
};
