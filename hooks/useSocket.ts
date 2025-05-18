import { useToast } from "@/contexts/ToastContext";
import {
  addNewNotificationAsync,
  setAuthUserAsync,
} from "@/redux/actions/auth.actions";
import { Notification, User } from "@/types/data";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../lib/socketInstance";
import { RootState, useAppDispatch } from "../redux/store";

const useSocket = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const socket = getSocket();

  const { showToast } = useToast();

  // disconnect socket
  const socketDisconnect = () => {
    if (!socket) return;
    socket.disconnect();
  };

  useEffect(() => {
    if (!user) return;

    // const handleNewParty = async (newParty: Party) => {
    //   await dispatch(addNewPartyAsync(newParty)).unwrap();
    // };

    // const handleUpdatePartyStatus = (
    //   partyId: string,
    //   status: "opening" | "accepted" | "playing" | "finished" | "cancelled"
    // ) => {
    //   dispatch(updatePartyStatus({ partyId, status }));
    // };

    // const handleRemoveParty = (partyId: string) => {
    //   dispatch(removePartyById({ partyId }));
    // };

    // const handleUpdatePartyFinishApproved = (selectedParty: Party) => {
    //   if (
    //     selectedParty.applicants.filter(
    //       (applicant) => applicant.status === "accepted"
    //     ).length === selectedParty.finishApproved.length
    //   ) {
    //     toast.success(
    //       `Congratulations !!! you can finish your ${selectedParty.title} party now`
    //     );
    //   }
    //   dispatch(updateSelectedParty({ selectedParty }));
    // };

    const handleNewNotification = async (newNotification: Notification) => {
      await dispatch(addNewNotificationAsync(newNotification)).unwrap();
      showToast("New notification added", "info");
    };

    // const handleNewApplied = (newApplicant: Applicant, partyId: string) => {
    //   dispatch(
    //     addNewApplicantToSelectedParty({
    //       newApplicant,
    //       selectedPartyId: partyId,
    //     })
    //   );
    //   dispatch(addNewApplicant({ newApplicant }));
    // };

    // const handleAcceptedApplicant = (partyId: string, applicantId: string) => {
    //   dispatch(
    //     updateApplicantStatusInSelectedParty({
    //       partyId,
    //       applicantId,
    //       status: "accepted",
    //     })
    //   );
    // };

    // const handleDeclinedApplicant = (partyId: string, applicantId: string) => {
    //   dispatch(
    //     updateApplicantStatusInSelectedParty({
    //       partyId,
    //       applicantId,
    //       status: "declined",
    //     })
    //   );
    // };

    const handleUpdateMeViaSocket = async (user: User) => {
      await dispatch(setAuthUserAsync(user)).unwrap();
    };

    // const handleNewMessage = (
    //   newMessage: Message,
    //   senderId: string,
    //   messageId: string
    // ) => {
    //   dispatch(addNewMessage({ newMessage }));
    //   dispatch(setCurrentSenderId({ senderId }));
    //   dispatch(setCurrentMessageId({ messageId }));
    // };

    // const handleNewFilesMessages = (
    //   newMessages: Message[],
    //   senderId: string,
    //   messageId: string
    // ) => {
    //   dispatch(addNewMessages({ newMessages }));
    //   dispatch(setCurrentSenderId({ senderId }));
    //   dispatch(setCurrentMessageId({ messageId }));
    // };

    // const handleUpdateMessage = (updatedMessage: Message) => {
    //   dispatch(updateMessage({ updatedMessage }));
    // };

    // const handleUpdateMultipleMessagesRead = (updatedMessages: Message[]) => {
    //   dispatch(updateMessageToRead({ updatedMessages }));
    // };

    // const handleTypingUser = (typingUser: User | null) => {
    //   dispatch(setTypingUser({ typingUser }));
    // };

    // const handlePartyUpdate = (party: Party) => {
    //   dispatch(updateSelectedParty({ selectedParty: party }));
    // };

    // const handleError = () => {
    //   toast.error("Permant error, please retry a few minutes later");
    // };

    // party
    // socket.on("party:created", handleNewParty);
    // socket.on("accepted:party", handleUpdatePartyStatus);
    // socket.on("cancelled:party", handleUpdatePartyStatus);
    // socket.on("removed:party", handleRemoveParty);
    // socket.on("playing:party", handleUpdatePartyStatus);
    // socket.on("finished:party", handleUpdatePartyStatus);
    // socket.on(
    //   "responsed:party-finish-approved",
    //   handleUpdatePartyFinishApproved
    // );

    // // applicant
    // socket.on("applicant:created", handleNewApplied);
    // socket.on("accepted:applicant", handleAcceptedApplicant);
    // socket.on("declined:applicant", handleDeclinedApplicant);

    // notification
    socket.on("notification", handleNewNotification);

    // direct
    socket.on("update-me", handleUpdateMeViaSocket);

    // // message
    // socket.on("message-received:text", handleNewMessage);
    // socket.on("message-received:files", handleNewFilesMessages);
    // socket.on("message:update", handleUpdateMessage);
    // socket.on(
    //   "message:updated-multiple-read",
    //   handleUpdateMultipleMessagesRead
    // );
    // socket.on("message:user-typing", handleTypingUser);

    // // sticker transaction
    // socket.on("send-to-owner:sticker", handlePartyUpdate);
    // socket.on("approved-from-applier:sticker", handlePartyUpdate);

    // // error
    // socket.on("error", handleError);

    return () => {
      // party
      // socket.off("party:created", handleNewParty);
      //   socket.off("accepted:party", handleUpdatePartyStatus);
      //   socket.off("playing:party", handleUpdatePartyStatus);
      //   socket.off("cancelled:party", handleUpdatePartyStatus);
      //   socket.off("removed:party", handleRemoveParty);
      //   socket.off("finished:party", handleUpdatePartyStatus);
      //   socket.off(
      //     "responsed:party-finish-approved",
      //     handleUpdatePartyFinishApproved
      //   );
      //   // applicant
      // socket.off("applicant:created", handleNewApplied);
      //   socket.off("accepted:applicant", handleAcceptedApplicant);
      //   socket.off("declined:applicant", handleDeclinedApplicant);

      // notification
      socket.off("notification", handleNewNotification);

      // user
      socket.off("update-me", handleUpdateMeViaSocket);
      //   // message
      //   socket.off("message-received:text", handleNewMessage);
      //   socket.off("message-received:files", handleNewFilesMessages);
      //   socket.off("message:update", handleUpdateMessage);
      //   socket.off(
      //     "message:updated-multiple-read",
      //     handleUpdateMultipleMessagesRead
      //   );
      //   socket.off("message:user-typing", handleTypingUser);
      //   // sticker transaction
      //   socket.off("send-to-owner:sticker", handlePartyUpdate);
      //   // error
      //   socket.off("error", handleError);
    };
  }, [dispatch, user]);

  return { socketDisconnect };
};

export default useSocket;
