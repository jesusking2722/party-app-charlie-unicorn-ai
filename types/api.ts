import { User } from "./data";

export interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}
