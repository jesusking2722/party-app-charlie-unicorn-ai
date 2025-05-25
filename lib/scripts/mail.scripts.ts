import { ApiResponse } from "@/types/api";
import {
  SEND_MESSAGE_TO_SUPPORT_TEAM,
  SEND_TOPUP_MESSAGE_TO_OWNER,
} from "../apis";
import axiosInstance from "../axiosInstance";

export const sendTopUpMessageToOwner = async (
  message: string
): Promise<ApiResponse<Boolean>> => {
  return await axiosInstance.post(SEND_TOPUP_MESSAGE_TO_OWNER, { message });
};

export const sendMessageToSupportTeam = async (
  email: string,
  subject: string,
  content: string,
  username: string
): Promise<ApiResponse<boolean>> => {
  return await axiosInstance.post(SEND_MESSAGE_TO_SUPPORT_TEAM, {
    email,
    subject,
    content,
    username,
  });
};
