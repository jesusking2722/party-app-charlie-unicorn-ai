import {
  ApiResponse,
  PaymentIntentResponse,
  StripeClientSecretResponse,
} from "@/types/api";
import {
  CREATE_STRIPE_PAYMENT_INTENT,
  FETCH_STRIPE_CLIENT_SECRET,
  FETCH_STRIPE_PUBLISHABLE_KEY,
} from "../apis";
import axiosInstance from "../axiosInstance";

export const fetchStripePublishableKey = async (): Promise<
  ApiResponse<string>
> => {
  return await axiosInstance.get(FETCH_STRIPE_PUBLISHABLE_KEY);
};

export const createStripePaymentIntent = async (
  amount: number,
  currency: string
): Promise<ApiResponse<PaymentIntentResponse>> => {
  return await axiosInstance.post(CREATE_STRIPE_PAYMENT_INTENT, {
    amount,
    currency,
  });
};

export const fetchStripePaymentIntentClientSecret = async (
  amount: number,
  currency: string
): Promise<ApiResponse<StripeClientSecretResponse>> => {
  return await axiosInstance.post(FETCH_STRIPE_CLIENT_SECRET, {
    amount,
    currency,
  });
};
