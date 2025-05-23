// Auth apis
export const REGISTER_BY_GOOGLE = "/auth/google-register/mobile";
export const LOGIN_BY_GOOGLE = "/auth/google-login/mobile";

export const REGISTER_BY_EMAIL = "/auth/email-register";
export const LOGIN_BY_EMAIL = "/auth/email-login";

export const EMAIL_VERIFY = "/auth/email-verify";
export const EMAIL_VERIFY_RESEND = "/auth/email-verify-resend";

export const FETCH_AUTH_USER_BY_ID = "/auth/me/";

export const UPDATE_AUTH_USER = "/auth/me";

export const START_AUTH_USER_KYC_VERIFICATION = "/auth/kyc/start/mobile";

export const UPDATE_MY_CARD = "/auth/me/card/mobile";

export const AUTH_REQUEST_RESET_PASSWORD = "/auth/reset-password/request";
export const AUTH_VERIFY_RESET_CODE = "/auth/reset-password/verify";
export const AUTH_RESET_PASSWORD = "/auth/reset-password/mobile";

// Stripe apis
export const FETCH_STRIPE_PUBLISHABLE_KEY = "/stripe/publishablekey";
export const CREATE_STRIPE_PAYMENT_INTENT = "/stripe/create/payment-intent";
export const FETCH_STRIPE_CLIENT_SECRET = "/stripe/create-payment-intent";
export const FETCH_STRIPE_BALANCE = "/stripe/balance";
export const TRANSFER_STRIPE_FUNDS = "/stripe/transfer";

// Party apis
export const FETCH_ALL_PARTIES = "/party/all";

// Ticket apis
export const FETCH_ALL_TICKETS = "/sticker/all";
export const EXCHANGE_STICKER = "/exchange-sticker/exchange";

// Card Transaction apis
export const SAVE_CARD_TRASACTION = "/card-transaction/save";

// Crypto Transaction apis
export const SAVE_CRYPTO_TRANSACTION = "/crypto-transaction/save";

// Mail apis
export const SEND_TOPUP_MESSAGE_TO_OWNER = "/mail/top-up";

// Web3 apis
export const PAY_USER_SELL = "/web3/sell";

// Users apis
export const FETCH_USER_BY_ID = "/user/";
export const UPDATE_USER = "/user/update";

// Message apis
export const FETCH_SELECTED_MESSAGES = "/message/";
export const FETCH_ALL_MESSAGES = "/message/all/";
export const UPDATE_MESSAGES_READ = "/message/read";
