import { ApiResponse, TicketResponse } from "@/types/api";
import { EXCHANGE_STICKER, FETCH_ALL_TICKETS } from "../apis";
import axiosInstance from "../axiosInstance";
import { Party, Ticket } from "@/types/data";

export const fetchAllTickets = async (): Promise<
  ApiResponse<TicketResponse>
> => {
  return await axiosInstance.get(FETCH_ALL_TICKETS);
};

export const exchangeSticker = async (
  applicantId: string,
  partyId: string,
  sticker: Ticket
): Promise<ApiResponse<Party>> => {
  return await axiosInstance.post(EXCHANGE_STICKER, {
    applicantId,
    partyId,
    sticker,
  });
};
