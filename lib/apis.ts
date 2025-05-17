// Auth apis
export const REGISTER_BY_EMAIL = "/auth/email-register";
export const LOGIN_BY_EMAIL = "/auth/email-login";

export const EMAIL_VERIFY = "/auth/email-verify";
export const EMAIL_VERIFY_RESEND = "/auth/email-verify-resend";

export const FETCH_AUTH_USER_BY_ID = "/auth/me/";

export const UPDATE_AUTH_USER = "/auth/me";

export const START_AUTH_USER_KYC_VERIFICATION = "/auth/kyc/start/mobile";

// Stripe apis
export const FETCH_STRIPE_PUBLISHABLE_KEY = "/stripe/publishablekey";
export const CREATE_STRIPE_PAYMENT_INTENT = "/stripe/create/payment-intent";
export const FETCH_STRIPE_CLIENT_SECRET = "/stripe/create-payment-intent";

// Party apis
export const FETCH_ALL_PARTIES = "/party/all";

// Ticket apis
export const FETCH_ALL_TICKETS = "/sticker/all";
