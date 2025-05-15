import { ApiResponse, AuthResponse, UserResponse } from "@/types/api";
import { User } from "@/types/data";
import {
  EMAIL_VERIFY,
  EMAIL_VERIFY_RESEND,
  FETCH_AUTH_USER_BY_ID,
  LOGIN_BY_EMAIL,
  REGISTER_BY_EMAIL,
  START_AUTH_USER_KYC_VERIFICATION,
  UPDATE_AUTH_USER,
} from "../apis";
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

// Verify email
export const emailVerify = async (
  code: string,
  email: string
): Promise<ApiResponse<AuthResponse>> => {
  return await axiosInstance.post(EMAIL_VERIFY, { code, email });
};

// Resend verification code
export const resendEmailVerify = async (
  email: string
): Promise<ApiResponse<AuthResponse>> => {
  return await axiosInstance.post(EMAIL_VERIFY_RESEND, {
    email,
  });
};

// Fetch my info
export const fetchAuthUserById = async (
  id: string
): Promise<ApiResponse<UserResponse>> => {
  return await axiosInstance.get(FETCH_AUTH_USER_BY_ID + id);
};

// Update my info
export const updateAuthUser = async (
  user: User
): Promise<ApiResponse<UserResponse>> => {
  return await axiosInstance.patch(UPDATE_AUTH_USER, { user });
};

// KYC verification
export const startAuthUserKyc = async (
  user: User
): Promise<ApiResponse<UserResponse>> => {
  return await axiosInstance.post(START_AUTH_USER_KYC_VERIFICATION, { user });
};
