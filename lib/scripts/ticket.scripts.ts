import { ApiResponse, TicketResponse } from "@/types/api";
import { FETCH_ALL_TICKETS } from "../apis";
import axiosInstance from "../axiosInstance";

export const fetchAllTickets = async (): Promise<
  ApiResponse<TicketResponse>
> => {
  return await axiosInstance.get(FETCH_ALL_TICKETS);
};
