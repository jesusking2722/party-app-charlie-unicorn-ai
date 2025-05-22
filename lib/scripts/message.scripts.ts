import { Message } from "@/types/data";
import { ApiResponse, MessageResponse } from "@/types/api";
import {
  FETCH_ALL_MESSAGES,
  FETCH_SELECTED_MESSAGES,
  UPDATE_MESSAGES_READ,
} from "../apis";
import axiosInstance from "../axiosInstance";

export const fetchAllMessages = async (
  userId: string
): Promise<ApiResponse<MessageResponse>> => {
  return await axiosInstance.get(FETCH_ALL_MESSAGES + userId);
};

export const fetchSelectedMessages = async (
  userId: string,
  contacterId: string
): Promise<ApiResponse<MessageResponse>> => {
  return await axiosInstance.get(
    FETCH_SELECTED_MESSAGES + `${userId}/${contacterId}`
  );
};

export const updateMessagesRead = async (
  messages: Message[]
): Promise<ApiResponse<MessageResponse>> => {
  return await axiosInstance.patch(UPDATE_MESSAGES_READ, { messages });
};
