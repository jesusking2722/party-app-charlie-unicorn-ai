import { ApiResponse, Web3SellResponse } from "@/types/api";
import axiosInstance from "../axiosInstance";
import { PAY_USER_SELL } from "../apis";

export const payUserSell = async (
  amount: number,
  address: string,
  chrleAmount: number
): Promise<ApiResponse<Web3SellResponse>> => {
  return await axiosInstance.post(PAY_USER_SELL, {
    amount,
    address,
    chrleAmount,
  });
};
