// src/components/chat/ChatScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { isEqual } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { Translate } from "@/components/common";
import {
  ChatInput,
  ChatList,
  ContactProfile,
  MessageList,
  TypingIndicator,
  UploadGroup,
} from "@/components/molecules";
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { uploadMultipleToImgBB } from "@/lib/services/imgbb.uploads.servce";
import socket from "@/lib/socketInstance";
import { RootState } from "@/redux/store";
import { IChatItem, IMessage, Message, User } from "@/types/data";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { MediaItem } from "../parties/create";

const { width, height } = Dimensions.get("window");

const ChatScreen = () => {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { contactId } = useLocalSearchParams();

  // Refs
  const listRef = useRef<any>(null);
  const prevMessageIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const prevMessagesRef = useRef<Message[]>([]);
  const prevChatListRef = useRef<IChatItem[]>([]);

  // Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    messages,
    currentSenderId,
    currentMessageId,
    typingUser: reduxTypingUser,
  } = useSelector((state: RootState) => state.message);

  // Component state
  const [text, setText] = useState<string>("");
  const [chatList, setChatList] = useState<IChatItem[]>([]);
  const [selectedChatItem, setSelectedChatItem] = useState<IChatItem | null>(
    null
  );
  const [selectedContacter, setSelectedContacter] = useState<User | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<IMessage[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [sendLoading, setSendLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showTypingIndicator, setShowTypingIndicator] =
    useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<User | null>(null);
  const [selectedMessageLoading, setSelectedMessageLoading] =
    useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // View states
  const [view, setView] = useState<"list" | "chat" | "profile">("list");

  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const profileAnimation = useRef(new Animated.Value(0)).current;

  // Initial setup for contact from route params
  useEffect(() => {
    if (contactId && user) {
      const contacter = user.contacts.find(
        (contact) => contact._id === contactId
      );

      if (contacter) {
        const contactChatItem = buildChatList().find(
          (chat) => chat._id === contacter._id
        );
        if (contactChatItem) {
          handleChatItemSelect(contactChatItem);
        }
      }
    }
  }, [contactId, user]);

  // Handle back button on Android
  useEffect(() => {
    const handleBackPress = () => {
      if (view === "chat") {
        setView("list");
        return true;
      } else if (view === "profile") {
        setView("chat");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [view]);

  // Animation for view transitions
  useEffect(() => {
    const animations = [];

    // Standard view animations
    animations.push(
      Animated.timing(slideAnimation, {
        toValue: view === "list" ? 0 : view === "chat" ? -1 : -2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    );

    // Special animation for profile view
    if (view === "profile") {
      Animated.timing(profileAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(profileAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    // Start animations sequentially to avoid the frozen object error
    Animated.sequence([
      Animated.delay(10), // Small delay to ensure previous animations are completed
      Animated.parallel(animations),
    ]).start();

    // Cleanup function
    return () => {
      // Cancel any pending animations
      slideAnimation.stopAnimation();
      fadeAnimation.stopAnimation();
      scaleAnimation.stopAnimation();
      profileAnimation.stopAnimation();
    };
  }, [view, slideAnimation, fadeAnimation, scaleAnimation, profileAnimation]);

  // Build chat list from contacts and messages
  const buildChatList = useCallback(() => {
    if (!user || !user.contacts) return [];

    return user.contacts.map((contact) => {
      // Get messages for this contact
      const contactMessages = messages.filter(
        (message) =>
          (message.sender._id === contact._id &&
            message.receiver._id === user._id) ||
          (message.sender._id === user._id &&
            message.receiver._id === contact._id)
      );

      // Get latest message
      const latestMessage =
        contactMessages.length > 0
          ? contactMessages[contactMessages.length - 1]
          : null;

      // Count unread messages
      const unreadCount = contactMessages.filter(
        (message) =>
          message.sender._id === contact._id && message.status !== "read"
      ).length;

      return {
        _id: contact._id ?? "",
        avatar: contact.avatar ?? "",
        alt: contact.name ?? "",
        status: contact.status ?? "offline",
        date: latestMessage ? new Date(latestMessage.date) : new Date(),
        title: contact.name ?? "",
        subtitle: latestMessage ? latestMessage.text : "",
        unread: unreadCount,
      };
    });
  }, [user, messages]);

  // Convert messages to the format needed for MessageList
  const convertMessagesToIMessages = useCallback(
    (contactMessages: Message[], userId: string): IMessage[] => {
      return contactMessages.map((message) => ({
        ...message,
        _id: message._id as string,
        position: message.sender._id === userId ? "right" : "left",
        unread: message.status !== "read" ? 1 : 0,
      }));
    },
    []
  );

  // Handle chat item selection
  const handleChatItemSelect = useCallback(
    async (chatItem: IChatItem) => {
      setSelectedMessageLoading(true);

      if (!user) {
        setSelectedMessageLoading(false);
        return;
      }

      const contacter = user.contacts.find(
        (contact) => contact._id === chatItem._id
      );

      if (!contacter) {
        setSelectedMessageLoading(false);
        return;
      }

      // Find messages between user and selected contacter
      const contacterMessages = messages.filter(
        (message) =>
          (message.sender._id === user._id &&
            message.receiver._id === contacter._id) ||
          (message.sender._id === contacter._id &&
            message.receiver._id === user._id)
      );

      // Update messages to read if there are unread messages
      const unreadMessages = contacterMessages.filter(
        (message) =>
          message.sender._id === contacter._id && message.status !== "read"
      );

      if (unreadMessages.length > 0) {
        socket.emit("message:multiple-update-read", unreadMessages);

        // Get fresh messages after marking as read
        const updatedContacterMessages = messages.filter(
          (message) =>
            (message.sender._id === user._id &&
              message.receiver._id === contacter._id) ||
            (message.sender._id === contacter._id &&
              message.receiver._id === user._id)
        );

        const convertedMessages = convertMessagesToIMessages(
          updatedContacterMessages,
          user._id as string
        );
        setSelectedMessages(convertedMessages);
      } else {
        const convertedMessages = convertMessagesToIMessages(
          contacterMessages,
          user._id as string
        );
        setSelectedMessages(convertedMessages);
      }

      // Update selected chat item
      const updatedChatItem: IChatItem = { ...chatItem, unread: 0 };
      setSelectedChatItem(updatedChatItem);
      setSelectedContacter(contacter);
      setSelectedMessageLoading(false);

      // Change view to chat
      setView("chat");
    },
    [user, messages, convertMessagesToIMessages]
  );

  // Function to pick images from library
  const pickImage = async () => {
    try {
      // Request permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        showToast("Camera roll permission is required", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Images only
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        setIsUploading(true);

        // Process each selected asset
        const newMediaItems: MediaItem[] = [];

        for (const asset of result.assets) {
          // Get file name from URI
          const uriParts = asset.uri.split("/");
          const fileName = uriParts[uriParts.length - 1];

          // Check file size
          try {
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            if (fileInfo.exists && fileInfo.size) {
              const fileSizeInMB = fileInfo.size / (1024 * 1024);

              if (fileSizeInMB > 10) {
                // 10MB limit
                showToast(`File ${fileName} too large (max 10MB)`, "error");
                continue;
              }
            }
          } catch (error) {
            console.error(`Error getting file size for ${fileName}:`, error);
          }

          // Add the image
          newMediaItems.push({
            uri: asset.uri,
            id: asset.assetId || Date.now().toString(),
          });
        }

        setMediaItems((prevItems) => [...prevItems, ...newMediaItems]);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      setIsUploading(false);
      Alert.alert("Error", "Failed to select images. Please try again.");
    }
  };

  // Handle media removal
  const handleMediaRemove = useCallback((index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    try {
      if (!user || !selectedContacter || !selectedChatItem) return;
      if (text.trim() === "" && mediaItems.length === 0) return;

      // Clear typing indicator
      if (isTyping) {
        setIsTyping(false);
        socket.emit("stop-typing", user._id, selectedContacter._id);
      }

      setSendLoading(true);

      // Handle media uploads
      if (mediaItems.length > 0) {
        setUploadLoading(true);
        const imageUrls = await uploadMultipleToImgBB(mediaItems);
        setUploadLoading(false);

        if (imageUrls.length > 0) {
          socket.emit(
            "message-send:files",
            user._id,
            selectedContacter._id,
            user.name,
            text,
            imageUrls
          );
        }
      } else {
        if (text.trim() === "") return;

        socket.emit(
          "message-send:text",
          user._id,
          selectedContacter._id,
          user.name,
          text
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const latestMessage = messages[messages.length - 1];

      // Update selected chat item with latest message
      const updatedSelectedChatItem: IChatItem = {
        ...selectedChatItem,
        subtitle: latestMessage.text,
        date: new Date(latestMessage.date),
      };

      setSelectedChatItem(updatedSelectedChatItem);

      // Update chat list
      setChatList((prevChatList) =>
        prevChatList.map((chat) =>
          chat._id === selectedContacter._id
            ? {
                ...chat,
                subtitle: latestMessage.text,
                date: new Date(latestMessage.date),
              }
            : chat
        )
      );

      // Clear input and media
      setMediaItems([]);
      setText("");
    } catch (error) {
      console.error("Send message error:", error);
      showToast("Failed to send message", "error");
    } finally {
      setSendLoading(false);
    }
  }, [
    user,
    selectedContacter,
    selectedChatItem,
    text,
    mediaItems,
    messages,
    isTyping,
    showToast,
  ]);

  // Handle text input change and typing indicator
  const handleTextInputChange = useCallback(
    (value: string) => {
      if (!selectedContacter || !user) return;
      setText(value);

      // Handle typing indicator logic
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        socket.emit("typing", user._id, selectedContacter._id);

        // Clear previous timeout if it exists
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after inactivity
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.emit("stop-typing", user._id, selectedContacter._id);
        }, 2000);
      } else if (value.length === 0 && isTyping) {
        setIsTyping(false);
        socket.emit("stop-typing", user._id, selectedContacter._id);

        // Clear timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      } else if (value.length > 0 && isTyping) {
        // Reset the timeout if already typing
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.emit("stop-typing", user._id, selectedContacter._id);
        }, 2000);
      }
    },
    [selectedContacter, user, isTyping]
  );

  // Update chat list when messages change
  useEffect(() => {
    if (!user) return;

    // Skip if messages haven't changed
    if (isEqual(messages, prevMessagesRef.current)) return;

    prevMessagesRef.current = messages;
    const newChatList = buildChatList();

    // Check if we need to mark any messages as read
    const handleMessageUpdate = async () => {
      if (
        selectedContacter &&
        currentSenderId &&
        selectedContacter._id === currentSenderId &&
        currentMessageId &&
        currentMessageId !== prevMessageIdRef.current
      ) {
        prevMessageIdRef.current = currentMessageId;

        socket.emit("message:read", currentMessageId);

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update the chat list with read status for selected contacter
        setChatList(
          newChatList.map((chat) =>
            chat._id === currentSenderId ? { ...chat, unread: 0 } : chat
          )
        );
      } else {
        // Simply update chat list
        setChatList(newChatList);
      }
    };

    handleMessageUpdate();
  }, [
    user,
    messages,
    currentSenderId,
    currentMessageId,
    selectedContacter,
    buildChatList,
  ]);

  // Update selected messages when the selected contact or messages change
  useEffect(() => {
    if (!user || !selectedContacter) return;

    const selectedContacterMessages = messages.filter(
      (message) =>
        (message.sender._id === user._id &&
          message.receiver._id === selectedContacter._id) ||
        (message.sender._id === selectedContacter._id &&
          message.receiver._id === user._id)
    );

    const convertedIMessages = convertMessagesToIMessages(
      selectedContacterMessages,
      user._id as string
    );

    setSelectedMessages(convertedIMessages);

    // Scroll to the bottom when new messages arrive
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [user, selectedContacter, messages, convertMessagesToIMessages]);

  // Setup socket listeners for typing events
  useEffect(() => {
    // Listen for typing events from other users
    socket.on(
      "typing-received",
      (typingUserId: string, typingUserData: User) => {
        if (
          selectedContacter &&
          typingUserId === selectedContacter._id &&
          user
        ) {
          setShowTypingIndicator(true);
          setTypingUser(typingUserData);
        }
      }
    );

    // Listen for stop typing events
    socket.on("stop-typing-received", (typingUserId: string) => {
      if (selectedContacter && typingUserId === selectedContacter._id) {
        setShowTypingIndicator(false);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("typing-received");
      socket.off("stop-typing-received");
    };
  }, [selectedContacter, user]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Make sure to also stop typing on unmount if it was active
      if (isTyping && user && selectedContacter) {
        socket.emit("stop-typing", user._id, selectedContacter._id);
      }
    };
  }, [isTyping, user, selectedContacter]);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "#22C55E"; // Green
      case "away":
        return "#F59E0B"; // Amber
      case "busy":
        return "#EF4444"; // Red
      default:
        return isDarkMode ? "#6b7280" : "#9ca3af"; // Gray
    }
  };

  // Handle back navigation
  const handleGoBack = useCallback(() => {
    if (view === "profile") {
      setView("chat");
    } else if (view === "chat") {
      setView("list");
    } else {
      router.back();
    }
  }, [view, router]);

  // Render header based on current view
  const renderHeader = () => {
    const headerStyle = {
      paddingTop:
        insets.top > 0
          ? insets.top
          : Platform.OS === "ios"
          ? 8
          : StatusBar.currentHeight || 0,
      paddingBottom: SPACING.XS,
      paddingHorizontal: SPACING.M,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDarkMode
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.08)",
      backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG,
      zIndex: 1000,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    };

    if (view === "list") {
      return (
        <View style={headerStyle}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={
                  isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY
                }
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY,
                },
              ]}
            >
              <Translate>Messages</Translate>
            </Text>
          </View>
          {/* <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={
                  isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="add"
                size={22}
                color={
                  isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY
                }
              />
            </TouchableOpacity>
          </View> */}
        </View>
      );
    } else if (view === "chat" && selectedContacter) {
      return (
        <View style={headerStyle}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={
                  isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY
                }
              />
            </TouchableOpacity>

            <Pressable
              style={styles.contactHeaderInfo}
              onPress={() => setView("profile")}
            >
              <View style={styles.avatarWrapper}>
                {selectedContacter.avatar ? (
                  <Image
                    source={{
                      uri: BACKEND_BASE_URL + selectedContacter.avatar,
                    }}
                    style={styles.contactAvatar}
                  />
                ) : (
                  <LinearGradient
                    colors={
                      isDarkMode
                        ? ["#6366F1", "#4F46E5"]
                        : ["#6366F1", "#4338CA"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.contactAvatarGradient}
                  >
                    <Text style={styles.avatarText}>
                      {selectedContacter.name
                        ? selectedContacter.name.charAt(0).toUpperCase() +
                          (selectedContacter.name.split(" ")[1]
                            ? selectedContacter.name
                                .split(" ")[1]
                                .charAt(0)
                                .toUpperCase()
                            : "")
                        : ""}
                    </Text>
                  </LinearGradient>
                )}
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: getStatusColor(
                        selectedContacter.status || "offline"
                      ),
                    },
                  ]}
                />
              </View>

              <View style={styles.contactTextInfo}>
                <Text
                  style={[
                    styles.contactName,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {selectedContacter.name}
                </Text>
                <Text style={styles.contactStatus}>
                  {selectedContacter.status || "offline"}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.headerActions}>
            {/* <TouchableOpacity
              style={styles.headerIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={
                  isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY
                }
              />
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.headerIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setView("profile")}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={
                  isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (view === "profile" && selectedContacter) {
      return (
        <View style={headerStyle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={
                isDarkMode
                  ? COLORS.DARK_TEXT_PRIMARY
                  : COLORS.LIGHT_TEXT_PRIMARY
              }
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_PRIMARY
                  : COLORS.LIGHT_TEXT_PRIMARY,
              },
            ]}
          >
            <Translate>Contact Info</Translate>
          </Text>
          <View style={{ width: 40 }} />
        </View>
      );
    }

    return null;
  };

  // Render chat list
  const renderChatList = () => (
    <Animated.View
      style={[
        styles.chatListContainer,
        {
          transform: [
            {
              translateX: slideAnimation.interpolate({
                inputRange: [-2, -1, 0],
                outputRange: [-(width * 2), -width, 0],
              }),
            },
          ],
          opacity: fadeAnimation,
        },
      ]}
    >
      <View style={styles.listContainer}>
        <ChatList
          chatItems={chatList}
          selectedItem={selectedChatItem}
          onSelectChat={handleChatItemSelect}
          isDarkMode={isDarkMode}
        />
      </View>
    </Animated.View>
  );

  // Render chat messages
  const renderChatMessages = () => (
    <Animated.View
      style={[
        styles.chatMessagesContainer,
        {
          transform: [
            {
              translateX: slideAnimation.interpolate({
                inputRange: [-2, -1, 0],
                outputRange: [-width, 0, width],
              }),
            },
            { scale: scaleAnimation },
          ],
          opacity: fadeAnimation,
        },
      ]}
    >
      {selectedContacter ? (
        <>
          {/* Messages List */}
          {selectedMessageLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={isDarkMode ? "#6366F1" : "#4F46E5"}
              />
            </View>
          ) : (
            <View style={styles.messagesContainer}>
              <MessageList
                messages={selectedMessages}
                listRef={listRef}
                isDarkMode={isDarkMode}
              />

              {showTypingIndicator && typingUser && (
                <TypingIndicator
                  name={typingUser.name || ""}
                  isDarkMode={isDarkMode}
                />
              )}
            </View>
          )}

          {/* Chat Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={styles.inputContainer}
          >
            <View
              style={[
                styles.inputContainerInner,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(30, 30, 30, 0.6)"
                    : "rgba(245, 245, 245, 0.9)",
                },
              ]}
            >
              {mediaItems.length > 0 && (
                <UploadGroup
                  mediaItems={mediaItems}
                  loading={uploadLoading}
                  onDelete={handleMediaRemove}
                  isDarkMode={isDarkMode}
                />
              )}

              <ChatInput
                value={text}
                onChange={handleTextInputChange}
                onSend={handleSendMessage}
                onPickImage={pickImage}
                loading={sendLoading || isUploading}
                isDarkMode={isDarkMode}
              />
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View style={styles.noContactContainer}>
          <View
            style={[
              styles.noContactContent,
              {
                backgroundColor: isDarkMode
                  ? "rgba(30, 30, 30, 0.6)"
                  : "rgba(245, 245, 245, 0.8)",
              },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={60}
              color={isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
            />
            <Text
              style={[
                styles.noContactText,
                {
                  color: isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY,
                },
              ]}
            >
              <Translate>Select a conversation to start messaging</Translate>
            </Text>
            <TouchableOpacity
              style={[
                styles.backToChatsButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
              onPress={() => setView("list")}
            >
              <Text
                style={[
                  styles.backToChatsText,
                  { color: isDarkMode ? COLORS.WHITE : COLORS.BLACK },
                ]}
              >
                <Translate>Back to Contacts</Translate>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );

  // Render contact profile
  const renderContactProfile = () => (
    <View style={styles.profileOverlayContainer}>
      <Animated.View
        style={[
          styles.profileBackdrop,
          {
            opacity: profileAnimation,
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(0, 0, 0, 0.3)",
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setView("chat")} />
      </Animated.View>

      <Animated.View
        style={[
          styles.profileContainer,
          {
            transform: [
              {
                translateY: profileAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
            opacity: profileAnimation,
          },
        ]}
      >
        <BlurView
          intensity={isDarkMode ? 30 : 50}
          tint={isDarkMode ? "dark" : "light"}
          style={styles.profileBlurContainer}
        >
          {selectedContacter && (
            <ContactProfile
              contact={selectedContacter}
              onClose={() => setView("chat")}
              isDarkMode={isDarkMode}
            />
          )}
        </BlurView>
      </Animated.View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      {renderHeader()}

      <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
        {renderChatList()}
        {renderChatMessages()}
        {view === "profile" && renderContactProfile()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  headerTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
    marginLeft: SPACING.S,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.XS,
    borderRadius: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  contactHeaderInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.XS,
    marginLeft: SPACING.XS,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: SPACING.S,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
  },
  contactAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
  },
  statusIndicator: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
  },
  contactTextInfo: {
    flex: 1,
    justifyContent: "center",
  },
  contactName: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginBottom: 2,
  },
  contactStatus: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: "rgba(150,150,150,0.9)",
    textTransform: "capitalize",
  },

  // Chat list styles
  chatListContainer: {
    position: "absolute",
    width: width,
    height: "100%",
    left: 0,
    top: 0,
    zIndex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.S,
  },

  // Chat messages styles
  chatMessagesContainer: {
    position: "absolute",
    width: width,
    height: "100%",
    left: 0,
    top: 0,
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: SPACING.S,
    paddingBottom: SPACING.S,
    paddingTop: SPACING.S,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150,150,150,0.2)",
  },
  inputContainerInner: {
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.S,
  },
  noContactContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.M,
  },
  noContactContent: {
    width: "100%",
    paddingVertical: SPACING.XL * 2,
    borderRadius: BORDER_RADIUS.L,
    justifyContent: "center",
    alignItems: "center",
  },
  noContactText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.M,
    textAlign: "center",
    marginTop: SPACING.M,
    marginBottom: SPACING.L,
    paddingHorizontal: SPACING.L,
  },
  backToChatsButton: {
    paddingVertical: SPACING.S,
    paddingHorizontal: SPACING.M,
    borderRadius: BORDER_RADIUS.M,
  },
  backToChatsText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },

  // Profile container
  profileOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  profileBackdrop: {},
  profileContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    overflow: "hidden",
  },
  profileBlurContainer: {
    flex: 1,
  },
});

export default ChatScreen;
