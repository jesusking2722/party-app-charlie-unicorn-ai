import { useToast } from "@/contexts/ToastContext";
import {
  addNewNotificationAsync,
  setAuthUserAsync,
} from "@/redux/actions/auth.actions";
import { Applicant, Message, Notification, Party, User } from "@/types/data";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../lib/socketInstance";
import { RootState, useAppDispatch } from "../redux/store";
import {
  addNewApplicantToSelectedPartyAsync,
  addNewPartyAsync,
  updateApplicantStatusInSelectedPartyAsync,
  updatePartyStatusSliceAsync,
  updateSelectedPartyAsnyc,
} from "@/redux/actions/party.actions";
import {
  addNewMessageSliceAsync,
  addNewMessagesSliceAsync,
  setCurrentMessageIdSliceAsync,
  setCurrentSenderIdSliceAsync,
  setTypingUserSliceAsync,
  updateMessageSliceAsync,
  updateMessageToReadSliceAsync,
} from "@/redux/actions/message.actions";

const useSocket = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const socket = getSocket();

  const { showToast } = useToast();

  // disconnect socket
  const socketDisconnect = () => {
    if (!socket || !user?._id) return;
    socket.emit("manual-disconnect", user._id);
    socket.disconnect();
  };

  useEffect(() => {
    if (!user) return;

    const handleNewParty = async (newParty: Party) => {
      await dispatch(addNewPartyAsync(newParty)).unwrap();
    };

    const handleUpdatePartyStatus = async (
      partyId: string,
      status: "opening" | "accepted" | "playing" | "finished" | "cancelled"
    ) => {
      await dispatch(updatePartyStatusSliceAsync({ partyId, status }));
    };

    // const handleRemoveParty = (partyId: string) => {
    //   dispatch(removePartyById({ partyId }));
    // };

    const handleUpdatePartyFinishApproved = async (selectedParty: Party) => {
      if (
        selectedParty.applicants.filter(
          (applicant) => applicant.status === "accepted"
        ).length === selectedParty.finishApproved.length &&
        selectedParty.creator?._id === user._id
      ) {
        showToast(
          `Congratulations !!! you can finish your ${selectedParty.title} party now`,
          "success"
        );
      }
      await dispatch(updateSelectedPartyAsnyc(selectedParty)).unwrap();
    };

    const handleNewNotification = async (newNotification: Notification) => {
      await dispatch(addNewNotificationAsync(newNotification)).unwrap();
      showToast("New notification added", "info");
    };

    const handleNewApplied = async (
      newApplicant: Applicant,
      partyId: string
    ) => {
      await dispatch(
        addNewApplicantToSelectedPartyAsync({ partyId, newApplicant })
      ).unwrap();
    };

    const handleAcceptedApplicant = async (
      partyId: string,
      applicantId: string
    ) => {
      await dispatch(
        updateApplicantStatusInSelectedPartyAsync({
          partyId,
          applicantId,
          status: "accepted",
        })
      ).unwrap();
    };

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

    const handleNewMessage = async (
      newMessage: Message,
      senderId: string,
      messageId: string
    ) => {
      await dispatch(addNewMessageSliceAsync(newMessage)).unwrap();
      await dispatch(setCurrentSenderIdSliceAsync(senderId)).unwrap();
      await dispatch(setCurrentMessageIdSliceAsync(messageId)).unwrap();
    };

    const handleNewFilesMessages = async (
      newMessages: Message[],
      senderId: string,
      messageId: string
    ) => {
      await dispatch(addNewMessagesSliceAsync(newMessages)).unwrap();
      await dispatch(setCurrentSenderIdSliceAsync(senderId)).unwrap();
      await dispatch(setCurrentMessageIdSliceAsync(messageId)).unwrap();
    };

    const handleUpdateMessage = async (updatedMessage: Message) => {
      await dispatch(updateMessageSliceAsync(updatedMessage)).unwrap();
    };

    const handleUpdateMultipleMessagesRead = async (
      updatedMessages: Message[]
    ) => {
      await dispatch(updateMessageToReadSliceAsync(updatedMessages)).unwrap();
    };

    const handleTypingUser = async (typingUser: User | null) => {
      await dispatch(setTypingUserSliceAsync(typingUser)).unwrap();
    };

    const handlePartyUpdate = async (party: Party) => {
      await dispatch(updateSelectedPartyAsnyc(party)).unwrap();
    };

    // const handleError = () => {
    //   toast.error("Permant error, please retry a few minutes later");
    // };

    // party
    socket.on("party:created", handleNewParty);
    socket.on("accepted:party", handleUpdatePartyStatus);
    socket.on("cancelled:party", handleUpdatePartyStatus);
    // socket.on("removed:party", handleRemoveParty);
    socket.on("playing:party", handleUpdatePartyStatus);
    socket.on("finished:party", handleUpdatePartyStatus);
    socket.on(
      "responsed:party-finish-approved",
      handleUpdatePartyFinishApproved
    );

    // // applicant
    socket.on("applicant:created", handleNewApplied);
    socket.on("accepted:applicant", handleAcceptedApplicant);
    // socket.on("declined:applicant", handleDeclinedApplicant);

    // notification
    socket.on("notification", handleNewNotification);

    // direct
    socket.on("update-me", handleUpdateMeViaSocket);

    // // message
    socket.on("message-received:text", handleNewMessage);
    socket.on("message-received:files", handleNewFilesMessages);
    socket.on("message:update", handleUpdateMessage);
    socket.on(
      "message:updated-multiple-read",
      handleUpdateMultipleMessagesRead
    );
    socket.on("message:user-typing", handleTypingUser);

    // // sticker transaction
    socket.on("send-to-owner:sticker", handlePartyUpdate);
    socket.on("approved-from-applier:sticker", handlePartyUpdate);

    // // error
    // socket.on("error", handleError);

    return () => {
      // party
      socket.off("party:created", handleNewParty);
      socket.off("accepted:party", handleUpdatePartyStatus);
      socket.off("playing:party", handleUpdatePartyStatus);
      socket.off("cancelled:party", handleUpdatePartyStatus);
      // socket.off("removed:party", handleRemoveParty);
      socket.off("finished:party", handleUpdatePartyStatus);
      socket.off(
        "responsed:party-finish-approved",
        handleUpdatePartyFinishApproved
      );

      // applicant
      socket.off("applicant:created", handleNewApplied);
      socket.off("accepted:applicant", handleAcceptedApplicant);
      //   socket.off("declined:applicant", handleDeclinedApplicant);

      // notification
      socket.off("notification", handleNewNotification);

      // user
      socket.off("update-me", handleUpdateMeViaSocket);

      // message
      socket.off("message-received:text", handleNewMessage);
      socket.off("message-received:files", handleNewFilesMessages);
      socket.off("message:update", handleUpdateMessage);
      socket.off(
        "message:updated-multiple-read",
        handleUpdateMultipleMessagesRead
      );
      socket.off("message:user-typing", handleTypingUser);

      //   // sticker transaction
      socket.off("send-to-owner:sticker", handlePartyUpdate);
      socket.off("approved-from-applier:sticker", handlePartyUpdate);

      //   // error
      //   socket.off("error", handleError);
    };
  }, [dispatch, user]);

  return { socketDisconnect };
};

export default useSocket;
