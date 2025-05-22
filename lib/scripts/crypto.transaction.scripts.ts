import axiosInstance from "../axiosInstance";
import {
  ApiResponse,
  TransactionApiResponse,
  TransactionResponse,
} from "@/types/api";
import { SAVE_CRYPTO_TRANSACTION } from "../apis";

export const saveCryptoTransaction = async (
  transaction: TransactionResponse
): Promise<ApiResponse<TransactionApiResponse>> => {
  return await axiosInstance.post(SAVE_CRYPTO_TRANSACTION, { transaction });
};
