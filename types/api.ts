import { CardTransaction, Message, Party, Ticket, User } from "./data";

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

export interface TicketResponse {
  stickers: Ticket[];
}

export interface CardTransactionResponse {
  transaction: CardTransaction;
}

export interface PaymentVerifyResponse {
  redirectUrl: string;
}

export interface StripeBalanceResponse {
  balance: number;
}

export interface StripeTransferResponse {
  transfer: any;
}

export interface Web3SellResponse {
  hash: string;
}

export interface TransactionResponse {
  _id?: string;
  type: "buy" | "exchange" | "subscription";
  hash?: string;
  user?: User;
  address: String;
  totalAmount: string;
  botAmount?: string;
  success: boolean;
  boughtTokens?: string;
  status: "pending" | "completed";
  createdAt: Date;
}

export interface TransactionApiResponse {
  transaction: TransactionResponse;
}

export interface UserResponse {
  user: User;
}

export interface MessageResponse {
  messages: Message[];
}
