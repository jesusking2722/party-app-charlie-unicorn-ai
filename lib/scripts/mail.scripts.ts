import { ApiResponse } from "@/types/api";
import { SEND_TOPUP_MESSAGE_TO_OWNER } from "../apis";
import axiosInstance from "../axiosInstance";

export const sendTopUpMessageToOwner = async (
  message: string
): Promise<ApiResponse<Boolean>> => {
  return await axiosInstance.post(SEND_TOPUP_MESSAGE_TO_OWNER, { message });
};
