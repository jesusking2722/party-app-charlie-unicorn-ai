export interface Geo {
  lat: number;
  lng: number;
}

export type CurrencyType = "usd" | "eur" | "pln";

export interface User {
  _id?: string;
  name: string | null;
  shortname: string | null;
  email: string | null;
  avatar: string | null;
  banner?: string;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  paymentVerified: boolean;
  kycVerified: boolean;
  reviews: Review[] | null;
  createdAt: Date | null;
  membership?: "premium" | "free" | null;
  membershipPeriod?: 0 | 1 | 3 | 6 | 12;
  country?: string;
  region?: string;
  address?: string;
  geo?: Geo;
  title?: string;
  about?: string;
  rate?: number;
  totalCompleted?: number;
  kyc?: Kyc;
  notifications?: Notification[];
  stickers?: Ticket[];
  status?: "online" | "offline";
  contacts: User[];
  card?: ICard;
  premiumStartedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isBlocked?: boolean;
}

export interface Review {
  reviewer: User;
  rate: number;
  partyTitle: string;
  partyType: string;
  description: string;
  createdAt: Date;
}

export interface Applicant {
  _id?: string;
  applier: User;
  applicant: string;
  appliedAt?: Date;
  stickerLocked?: boolean;
  stickerSold?: boolean;
  stickers: Ticket[];
  status: "pending" | "accepted" | "declined";
}

export interface Notification {
  _id?: string;
  title: string;
  content: string;
  createdAt: Date;
  read: boolean;
  link: string | null;
}

export interface Ticket {
  _id?: string;
  name: string;
  image: string;
  price: number;
  currency: CurrencyType;
}

export type PartyType =
  | "birthday"
  | "common"
  | "wedding"
  | "corporate"
  | "movie"
  | "sport";

export interface Party {
  _id?: string;
  type: PartyType | string;
  title: string;
  description: string;
  openingAt: Date;
  country: string | null;
  address: string | null;
  region: string | null;
  creator: User | null;
  geo: {
    lat: number;
    lng: number;
  };
  applicants: Applicant[];
  finishApproved: Applicant[];
  status: "opening" | "accepted" | "playing" | "finished" | "cancelled";
  paidOption: "paid" | "free";
  currency: string;
  fee?: number;
  stickerCounts?: number;
  stickerConfirmed?: boolean;
  createdAt: Date;
}

export interface Kyc {
  sessionId: string;
  sessionNumber: number;
  sessionToken: string;
  vendorData: string;
  status:
    | "Not Started"
    | "In Progress"
    | "Completed"
    | "Approved"
    | "Declined"
    | "Expired"
    | "Abandoned";
  url: string;
}

export interface IChatItem {
  _id: string;
  avatar: string;
  alt: string;
  title: string;
  subtitle: string;
  date: Date;
  unread: number;
  status: "online" | "offline";
}

export interface IMessage {
  _id: string;
  position: "left" | "right";
  title: string;
  type: "photo" | "video" | "audio" | "file" | "text";
  text: string;
  date: Date;
  status: "read" | "waiting" | "sent" | "received";
  focus: boolean;
  forwarded: boolean;
  retracted: boolean;
  photo?: string;
  file?: string;
  video?: string;
  audio?: string;
  unread: number;
}

export interface Message {
  _id?: string;
  title: string;
  type: "photo" | "video" | "audio" | "file" | "text";
  date: Date;
  status: "read" | "waiting" | "sent" | "received";
  focus: boolean;
  text: string;
  forwarded: boolean;
  retracted: boolean;
  photo?: string;
  file?: string;
  video?: string;
  audio?: string;
  sender: User;
  receiver: User;
  lastMessaged: User;
}

export interface CardTransaction {
  _id?: string;
  type: "buy" | "exchange" | "subscription";
  status: "pending" | "completed";
  amount: number;
  currency: string;
  user: User;
  createdAt: Date;
}

export interface ICard {
  stripeId?: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  funding: string;
}
