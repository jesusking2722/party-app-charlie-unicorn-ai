import { fetchAuthUserById } from "@/lib/scripts/auth.scripts";
import { fetchAllMessages } from "@/lib/scripts/message.scripts";
import { fetchAllParties } from "@/lib/scripts/party.scripts";
import { fetchAllTickets } from "@/lib/scripts/ticket.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { setMessageSliceAsync } from "@/redux/actions/message.actions";
import { setPartySliceAsync } from "@/redux/actions/party.actions";
import { setTicketSliceAsync } from "@/redux/actions/ticket.actions";
import { useAppDispatch } from "@/redux/store";
import { User } from "@/types/data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

interface TokenPayload {
  _id: string;
  [key: string]: any;
}

const useInit = () => {
  const [initLoading, setInitLoading] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const checkRedirectPath = (user: User) => {
    if (user.isBlocked) {
      return;
    }
    if (!user._id) {
      router.replace("/auth/login");
    } else if (!user.emailVerified) {
      router.replace("/auth/verify");
    } else if (!user.name || !user.country) {
      router.replace("/onboarding");
    } else if (!user.title) {
      router.replace("/onboarding/professionSetup");
    } else {
      router.replace("/home");
    }
  };

  const fetchAuthUser = async () => {
    setInitLoading(true);
    setInitError(null);

    try {
      const token = await AsyncStorage.getItem("Authorization");

      if (!token) {
        setInitLoading(false);
        return false;
      }

      const decoded = jwtDecode<TokenPayload>(token);

      const response = await fetchAuthUserById(decoded.id);

      if (response.ok) {
        const { user } = response.data;
        // Use the async thunk directly and wait for it to complete
        await dispatch(setAuthUserAsync(user)).unwrap();

        setInitLoading(false);
        return user;
      } else {
        setInitError(response.message || "Failed to fetch user data");
        console.error("API Error:", response.message);
        setInitLoading(false);
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setInitError(errorMessage);
      console.error("Init Error:", error);
      setInitLoading(false);
      return false;
    }
  };

  const fetchAllPartiesInfo = async () => {
    try {
      setInitLoading(true);

      const response = await fetchAllParties();

      if (response.ok) {
        await dispatch(setPartySliceAsync(response.data.parties)).unwrap();
      }
    } catch (error) {
      console.error("fetch all parties info error: ", error);
    } finally {
      setInitLoading(false);
    }
  };

  const fetchAllTicketsInfo = async () => {
    try {
      setInitLoading(true);

      const response = await fetchAllTickets();

      if (response.ok) {
        const { stickers } = response.data;
        await dispatch(setTicketSliceAsync(stickers)).unwrap();
      }
    } catch (error) {
      console.error("fetch all tickets info error: ", error);
    } finally {
      setInitLoading(false);
    }
  };

  const fetchAllMessagesInfo = async () => {
    try {
      setInitLoading(true);

      const token = await AsyncStorage.getItem("Authorization");

      if (!token) {
        setInitLoading(false);
        return false;
      }

      const decoded = jwtDecode<TokenPayload>(token);

      const response = await fetchAllMessages(decoded.id);
      if (response.ok) {
        const { messages } = response.data;
        await dispatch(setMessageSliceAsync(messages)).unwrap();
      }
    } catch (error) {
      console.error("fetch all messages info error: ", error);
      setInitLoading(false);
    }
  };

  return {
    initLoading,
    initError,
    fetchAuthUser,
    fetchAllPartiesInfo,
    fetchAllTicketsInfo,
    fetchAllMessagesInfo,
    checkRedirectPath,
  };
};

export default useInit;
