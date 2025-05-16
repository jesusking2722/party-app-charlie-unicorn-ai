import { Party, User } from "./data";

export interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserResponse {
  user: User;
}

export interface PaymentIntentResponse {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
}

export interface StripeClientSecretResponse {
  clientSecret: string;
}

export interface PartyAllResponse {
  parties: Party[];
}
