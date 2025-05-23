// src/components/chat/MessageList.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ANIMATIONS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { Translate } from "@/components/common";
import { IMessage } from "@/types/data";

interface MessageListProps {
  messages: IMessage[];
  listRef: React.RefObject<FlatList>;
  isDarkMode: boolean;
  onMessageLongPress?: (message: IMessage) => void;
}

const { width } = Dimensions.get("window");

const MessageList = ({
  messages,
  listRef,
  isDarkMode,
  onMessageLongPress,
}: MessageListProps) => {
  // State for image modal
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Animation values for image modal
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;

  // Animation values for each message
  const animationValues = useRef<
    Map<
      string,
      {
        opacity: Animated.Value;
        translateY: Animated.Value;
        scale: Animated.Value;
      }
    >
  >(new Map());

  // Format message timestamp
  const formatMessageTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get date for message grouping
  const getMessageDate = (date: Date | string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (new Date(date).toDateString() === today.toDateString()) {
      return "Today";
    } else if (new Date(date).toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return new Date(date).toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Ensure animations are setup for all messages
  useEffect(() => {
    messages.forEach((message) => {
      if (!animationValues.current.has(message._id)) {
        animationValues.current.set(message._id, {
          opacity: new Animated.Value(0),
          translateY: new Animated.Value(20),
          scale: new Animated.Value(0.95),
        });

        // Animate new message
        const animations = animationValues.current.get(message._id);
        if (animations) {
          Animated.parallel([
            Animated.timing(animations.opacity, {
              toValue: 1,
              duration: ANIMATIONS.FAST,
              useNativeDriver: true,
            }),
            Animated.timing(animations.translateY, {
              toValue: 0,
              duration: ANIMATIONS.FAST,
              useNativeDriver: true,
            }),
            Animated.spring(animations.scale, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    });
  }, [messages]);

  // Open image modal
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);

    // Animate modal opening
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close image modal
  const closeImageModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setImageModalVisible(false);
      setSelectedImage(null);
      imageScale.setValue(0.8);
    });
  };

  // Handle long press on message
  const handleLongPress = (message: IMessage) => {
    if (onMessageLongPress) {
      onMessageLongPress(message);
    } else {
      console.log("Long press on message:", message._id);
    }
  };

  // Get status icon for message
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return "checkmark-outline";
      case "received":
        return "checkmark-outline";
      case "read":
        return "checkmark-done-outline";
      default:
        return "time-outline";
    }
  };

  // Get message gradient colors
  const getMessageGradient = (position: string) => {
    if (position === "right") {
      return isDarkMode
        ? ["#7C3AED", "#5B21B6"] // Purple gradient for sent messages
        : ["#6366F1", "#4F46E5"]; // Blue gradient for sent messages
    } else {
      return isDarkMode
        ? ["#374151", "#1F2937"] // Dark gray gradient for received messages
        : ["#F3F4F6", "#E5E7EB"]; // Light gray gradient for received messages
    }
  };

  // Get text color based on message position
  const getMessageTextColor = (position: string) => {
    if (position === "right") {
      return "#FFFFFF"; // White text for sent messages
    } else {
      return isDarkMode ? "#F9FAFB" : "#111827"; // Light text for dark mode, dark text for light mode
    }
  };

  // Get time text color with better contrast
  const getTimeTextColor = (position: string) => {
    if (position === "right") {
      return "rgba(255, 255, 255, 0.8)"; // Semi-transparent white for sent messages
    } else {
      return isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)"; // Better contrast for received messages
    }
  };

  // Should show date separator
  const shouldShowDateSeparator = (
    currentMessage: IMessage,
    previousMessage: IMessage | null
  ) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.date).toDateString();
    const previousDate = new Date(previousMessage.date).toDateString();

    return currentDate !== previousDate;
  };

  // Date separator component
  const DateSeparator = ({ date }: { date: Date }) => (
    <View style={styles.dateSeparatorContainer}>
      <View
        style={[
          styles.dateSeparatorLine,
          {
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          },
        ]}
      />
      <View
        style={[
          styles.dateSeparatorTextContainer,
          {
            backgroundColor: isDarkMode
              ? "rgba(31, 41, 55, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: isDarkMode
              ? "rgba(55, 65, 81, 0.8)"
              : "rgba(229, 231, 235, 0.8)",
          },
        ]}
      >
        <Text
          style={[
            styles.dateSeparatorText,
            {
              color: isDarkMode ? "#D1D5DB" : "#6B7280",
            },
          ]}
        >
          <Translate>{getMessageDate(date)}</Translate>
        </Text>
      </View>
      <View
        style={[
          styles.dateSeparatorLine,
          {
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          },
        ]}
      />
    </View>
  );

  // Message time component
  const MessageTime = ({
    date,
    status,
    position,
  }: {
    date: Date;
    status: string;
    position: string;
  }) => (
    <View
      style={[
        styles.messageTimeContainer,
        position === "right" ? styles.messageTimeRight : styles.messageTimeLeft,
      ]}
    >
      <Text
        style={[styles.messageTimeText, { color: getTimeTextColor(position) }]}
      >
        {formatMessageTime(date)}
      </Text>

      {position === "right" && (
        <Ionicons
          name={getStatusIcon(status)}
          size={12}
          color={
            status === "read"
              ? "#10B981" // Green for read messages
              : "rgba(255, 255, 255, 0.8)"
          }
          style={styles.statusIcon}
        />
      )}
    </View>
  );

  // Photo message component
  const PhotoMessage = ({
    photo,
    position,
    message,
  }: {
    photo: string;
    position: string;
    message: IMessage;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => handleLongPress(message)}
        onPress={() => openImageModal(photo)}
        style={[
          styles.photoContainer,
          position === "right"
            ? styles.photoContainerRight
            : styles.photoContainerLeft,
        ]}
      >
        <Image
          source={{ uri: photo }}
          style={styles.photoImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          style={styles.photoOverlay}
        />
        <View style={styles.photoTimeContainer}>
          <MessageTime
            date={message.date}
            status={message.status}
            position={position}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Text message component
  const TextMessage = ({
    text,
    position,
    message,
  }: {
    text: string;
    position: string;
    message: IMessage;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => handleLongPress(message)}
        style={[
          styles.messageContainer,
          position === "right"
            ? styles.messageContainerRight
            : styles.messageContainerLeft,
        ]}
      >
        <LinearGradient
          colors={getMessageGradient(position) as any}
          style={[
            styles.messageGradient,
            position === "right"
              ? styles.messageGradientRight
              : styles.messageGradientLeft,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: getMessageTextColor(position),
              },
            ]}
          >
            {text}
          </Text>
          <MessageTime
            date={message.date}
            status={message.status}
            position={position}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Forwarded message component
  const ForwardedMessage = ({ message }: { message: IMessage }) => {
    const isPhotoMessage = message.type === "photo" && message.photo;
    const position = message.position;

    return (
      <View
        style={[
          styles.forwardedContainer,
          position === "right"
            ? styles.forwardedContainerRight
            : styles.forwardedContainerLeft,
        ]}
      >
        <View style={styles.forwardedHeader}>
          <Ionicons
            name="arrow-redo-outline"
            size={12}
            color={isDarkMode ? "#9CA3AF" : "#6B7280"}
            style={styles.forwardedIcon}
          />
          <Text
            style={[
              styles.forwardedText,
              {
                color: isDarkMode ? "#9CA3AF" : "#6B7280",
              },
            ]}
          >
            Forwarded
          </Text>
        </View>

        {isPhotoMessage ? (
          <PhotoMessage
            photo={message.photo!}
            position={position}
            message={message}
          />
        ) : (
          <TextMessage
            text={message.text}
            position={position}
            message={message}
          />
        )}
      </View>
    );
  };

  // Retracted message component
  const RetractedMessage = ({ message }: { message: IMessage }) => {
    const position = message.position;

    return (
      <View
        style={[
          styles.retractedContainer,
          position === "right"
            ? styles.retractedContainerRight
            : styles.retractedContainerLeft,
        ]}
      >
        <LinearGradient
          colors={
            isDarkMode
              ? ["rgba(55, 65, 81, 0.6)", "rgba(31, 41, 55, 0.6)"]
              : ["rgba(229, 231, 235, 0.8)", "rgba(209, 213, 219, 0.8)"]
          }
          style={styles.retractedGradient}
        >
          <Ionicons
            name="close-circle-outline"
            size={14}
            color={isDarkMode ? "#9CA3AF" : "#6B7280"}
            style={styles.retractedIcon}
          />
          <Text
            style={[
              styles.retractedText,
              {
                color: isDarkMode ? "#9CA3AF" : "#6B7280",
              },
            ]}
          >
            This message was deleted
          </Text>
          <MessageTime
            date={message.date}
            status={message.status}
            position={position}
          />
        </LinearGradient>
      </View>
    );
  };

  // Render message item
  const renderMessageItem = useCallback(
    ({ item, index }: { item: IMessage; index: number }) => {
      const isFirstMessage = index === 0;
      const isPreviousSameUser =
        !isFirstMessage && messages[index - 1].position === item.position;
      const previousMessage = index > 0 ? messages[index - 1] : null;
      const showDateSeparator = shouldShowDateSeparator(item, previousMessage);

      const animations = animationValues.current.get(item._id) || {
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
      };

      // Determine message spacing
      const messageSpacing = isPreviousSameUser
        ? styles.messageSpacingSmall
        : styles.messageSpacingLarge;

      return (
        <>
          {showDateSeparator && <DateSeparator date={item.date} />}

          <Animated.View
            style={[
              styles.messageItemContainer,
              item.position === "right"
                ? styles.messageItemRight
                : styles.messageItemLeft,
              messageSpacing,
              {
                opacity: animations.opacity,
                transform: [
                  { translateY: animations.translateY },
                  { scale: animations.scale },
                ],
              },
            ]}
          >
            {/* Message Content */}
            {item.forwarded ? (
              <ForwardedMessage message={item} />
            ) : item.retracted ? (
              <RetractedMessage message={item} />
            ) : item.type === "photo" && item.photo ? (
              <PhotoMessage
                photo={item.photo}
                position={item.position}
                message={item}
              />
            ) : (
              <TextMessage
                text={item.text}
                position={item.position}
                message={item}
              />
            )}
          </Animated.View>
        </>
      );
    },
    [messages, isDarkMode]
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor: isDarkMode
              ? "rgba(55, 65, 81, 0.5)"
              : "rgba(243, 244, 246, 0.8)",
          },
        ]}
      >
        <Ionicons
          name="chatbubbles-outline"
          size={32}
          color={isDarkMode ? "#6B7280" : "#9CA3AF"}
        />
      </View>
      <Text
        style={[
          styles.emptyText,
          {
            color: isDarkMode ? "#D1D5DB" : "#6B7280",
          },
        ]}
      >
        No messages yet. Start the conversation!
      </Text>
    </View>
  );

  // Key extractor for FlatList
  const keyExtractor = (item: IMessage, index: number) =>
    item._id ? `${item._id}-${index}` : `message-${index}`;

  // Image Modal Component
  const ImageModal = () => {
    if (!selectedImage) return null;

    return (
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeImageModal}
      >
        <StatusBar hidden />
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={closeImageModal}
          />

          {/* Header with close button */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeImageModal}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Image Container */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{ scale: imageScale }],
              },
            ]}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={Platform.OS === "android"}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            listRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (messages.length > 0) {
            listRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      <ImageModal />
    </>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: SPACING.M,
    paddingHorizontal: SPACING.M,
    flexGrow: 1,
  },
  messageItemContainer: {
    width: "100%",
    marginBottom: SPACING.XS,
  },
  messageItemRight: {
    alignItems: "flex-end",
  },
  messageItemLeft: {
    alignItems: "flex-start",
  },
  messageSpacingSmall: {
    marginTop: 3,
  },
  messageSpacingLarge: {
    marginTop: SPACING.S,
  },
  messageContainer: {
    maxWidth: "85%",
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  messageContainerRight: {
    borderTopRightRadius: 8,
  },
  messageContainerLeft: {
    borderTopLeftRadius: 8,
  },
  messageGradient: {
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.S,
    borderRadius: 20,
  },
  messageGradientRight: {
    borderTopRightRadius: 8,
  },
  messageGradientLeft: {
    borderTopLeftRadius: 8,
  },
  messageText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.XS,
    lineHeight: FONT_SIZES.S * 1.5,
  },
  messageTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  messageTimeLeft: {
    justifyContent: "flex-start",
  },
  messageTimeRight: {
    justifyContent: "flex-end",
  },
  messageTimeText: {
    fontSize: 11,
    fontFamily: FONTS.MEDIUM,
  },
  statusIcon: {
    marginLeft: 4,
  },
  photoContainer: {
    borderRadius: 20,
    overflow: "hidden",
    maxWidth: width * 0.65,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  photoContainerRight: {
    borderTopRightRadius: 8,
  },
  photoContainerLeft: {
    borderTopLeftRadius: 8,
  },
  photoImage: {
    width: width * 0.65,
    aspectRatio: 4 / 3,
    borderRadius: 20,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  photoTimeContainer: {
    position: "absolute",
    bottom: SPACING.S,
    right: SPACING.S,
  },
  forwardedContainer: {
    maxWidth: "85%",
  },
  forwardedContainerRight: {
    alignItems: "flex-end",
  },
  forwardedContainerLeft: {
    alignItems: "flex-start",
  },
  forwardedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.XS,
    paddingHorizontal: SPACING.XS,
  },
  forwardedIcon: {
    marginRight: SPACING.XS,
  },
  forwardedText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  retractedContainer: {
    maxWidth: "70%",
    borderRadius: 20,
    overflow: "hidden",
  },
  retractedContainerRight: {
    borderTopRightRadius: 8,
  },
  retractedContainerLeft: {
    borderTopLeftRadius: 8,
  },
  retractedGradient: {
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.S,
    borderRadius: 20,
    alignItems: "center",
  },
  retractedIcon: {
    marginBottom: SPACING.XS,
  },
  retractedText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.XS,
    fontStyle: "italic",
    textAlign: "center",
  },
  dateSeparatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.L,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
  },
  dateSeparatorTextContainer: {
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.S,
    borderRadius: 16,
    marginHorizontal: SPACING.M,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dateSeparatorText: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.XL * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.L,
  },
  emptyText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
  },
  // Image Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: SPACING.M,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: width,
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});

export default MessageList;
