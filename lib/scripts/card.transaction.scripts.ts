import { CardTransaction } from "@/types/data";
import axiosInstance from "../axiosInstance";
import { ApiResponse, CardTransactionResponse } from "@/types/api";
import { SAVE_CARD_TRASACTION } from "../apis";

export const saveCardTransaction = async (
  transaction: CardTransaction
): Promise<ApiResponse<CardTransactionResponse>> => {
  return await axiosInstance.post(SAVE_CARD_TRASACTION, { transaction });
};
