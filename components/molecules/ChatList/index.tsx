import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { Translate } from "@/components/common";
import { BACKEND_BASE_URL } from "@/constant";
import { IChatItem } from "@/types/data";

interface ChatListProps {
  chatItems: IChatItem[];
  selectedItem: IChatItem | null;
  onSelectChat: (chat: IChatItem) => void;
  isDarkMode: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ChatList = ({
  chatItems,
  selectedItem,
  onSelectChat,
  isDarkMode,
  onRefresh,
  refreshing = false,
}: ChatListProps) => {
  const animationMap = useRef<Map<string, Animated.Value>>(new Map());
  const scrollY = useRef(new Animated.Value(0)).current;
  const [chats, setChats] = useState<IChatItem[]>([]);

  // Initialize animation values for each chat item
  useEffect(() => {
    chatItems.forEach((item) => {
      if (!animationMap.current.has(item._id)) {
        animationMap.current.set(item._id, new Animated.Value(0));
      }
    });
    setChats(chatItems);
  }, [chatItems]);

  // Format timestamp to relative time
  const formatTime = (date: Date | string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    if (diff < 60 * 1000) {
      return "Just now";
    }

    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}m ago`;
    }

    if (diff < 24 * 60 * 60 * 1000) {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[new Date(date).getDay()];
    }

    return new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  // Group chat items by date
  const groupChatsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [] as IChatItem[],
      yesterday: [] as IChatItem[],
      lastWeek: [] as IChatItem[],
      older: [] as IChatItem[],
    };

    chats.forEach((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        groups.today.push(item);
      } else if (itemDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(item);
      } else if (itemDate >= lastWeek) {
        groups.lastWeek.push(item);
      } else {
        groups.older.push(item);
      }
    });

    return groups;
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "#10B981";
      case "away":
        return "#F59E0B";
      case "busy":
        return "#EF4444";
      default:
        return isDarkMode ? "#6B7280" : "#9CA3AF";
    }
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Handle press animation
  const handlePressIn = useCallback((id: string) => {
    const animation = animationMap.current.get(id);
    if (animation) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
  }, []);

  const handlePressOut = useCallback((id: string) => {
    const animation = animationMap.current.get(id);
    if (animation) {
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
  }, []);

  // Render chat item
  const renderChatItem = useCallback(
    ({ item }: { item: IChatItem }) => {
      const isSelected = selectedItem?._id === item._id;
      const animation =
        animationMap.current.get(item._id) || new Animated.Value(0);

      const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.96],
      });

      const timeAgo = formatTime(item.date);
      const isRecent = timeAgo === "Just now" || timeAgo.includes("m ago");

      return (
        <AnimatedTouchable
          style={[
            styles.chatItemContainer,
            {
              transform: [{ scale }],
              backgroundColor: isSelected
                ? isDarkMode
                  ? "rgba(99, 102, 241, 0.12)"
                  : "rgba(99, 102, 241, 0.08)"
                : isDarkMode
                ? COLORS.DARK_BG
                : COLORS.LIGHT_BG,
              borderColor: isSelected
                ? isDarkMode
                  ? "rgba(99, 102, 241, 0.3)"
                  : "rgba(99, 102, 241, 0.2)"
                : isDarkMode
                ? "rgba(55, 65, 81, 0.3)"
                : "rgba(229, 231, 235, 0.5)",
            },
          ]}
          onPressIn={() => handlePressIn(item._id)}
          onPressOut={() => handlePressOut(item._id)}
          onPress={() => onSelectChat(item)}
          activeOpacity={1}
        >
          {/* Selection indicator */}
          {isSelected && (
            <View
              style={[
                styles.selectedIndicator,
                {
                  backgroundColor: isDarkMode ? "#6366F1" : "#4F46E5",
                },
              ]}
            />
          )}

          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image
                source={{ uri: BACKEND_BASE_URL + item.avatar }}
                style={styles.avatar}
              />
            ) : (
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.avatar}
              >
                <Text style={styles.placeholderText}>
                  {item.title
                    ? item.title.charAt(0).toUpperCase() +
                      (item.title.split(" ")[1]
                        ? item.title.split(" ")[1].charAt(0).toUpperCase()
                        : "")
                    : ""}
                </Text>
              </LinearGradient>
            )}

            {/* Status indicator */}
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: getStatusColor(item.status),
                  borderColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG,
                },
              ]}
            />

            {/* Unread badge */}
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unread > 99 ? "99+" : item.unread}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.topRow}>
              <Text
                style={[
                  styles.titleText,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_PRIMARY
                      : COLORS.LIGHT_TEXT_PRIMARY,
                    fontFamily: item.unread > 0 ? FONTS.SEMIBOLD : FONTS.MEDIUM,
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              <View style={styles.timeContainer}>
                {isRecent && (
                  <View
                    style={[
                      styles.recentDot,
                      { backgroundColor: getStatusColor("online") },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.timeText,
                    {
                      color: isRecent
                        ? getStatusColor("online")
                        : isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                      fontFamily: isRecent ? FONTS.MEDIUM : FONTS.REGULAR,
                    },
                  ]}
                >
                  <Translate>{timeAgo}</Translate>
                </Text>
              </View>
            </View>

            <View style={styles.messagePreviewRow}>
              <Text
                style={[
                  styles.subtitleText,
                  {
                    color:
                      item.unread > 0
                        ? isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY
                        : isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    fontFamily: item.unread > 0 ? FONTS.MEDIUM : FONTS.REGULAR,
                    opacity: item.unread > 0 ? 1 : 0.8,
                  },
                ]}
                numberOfLines={2}
              >
                {truncateText(item.subtitle, 60)}
              </Text>
            </View>
          </View>

          {/* Right side indicators */}
          <View style={styles.rightContainer}>
            {item.unread > 0 && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDarkMode ? "#6B7280" : "#9CA3AF"}
                style={styles.chevronIcon}
              />
            )}
          </View>
        </AnimatedTouchable>
      );
    },
    [selectedItem, isDarkMode, handlePressIn, handlePressOut, onSelectChat]
  );

  // Render section header
  const renderSectionHeader = (title: string) => {
    if (!chats.length) return null;

    return (
      <View style={styles.sectionHeaderContainer}>
        <View
          style={[
            styles.sectionHeaderBg,
            {
              backgroundColor: isDarkMode
                ? "rgba(55, 65, 81, 0.6)"
                : "rgba(243, 244, 246, 0.8)",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionHeaderText,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
              },
            ]}
          >
            <Translate>{title}</Translate>
          </Text>
        </View>
      </View>
    );
  };

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
        <LinearGradient
          colors={isDarkMode ? ["#374151", "#4B5563"] : ["#E5E7EB", "#F3F4F6"]}
          style={styles.emptyIconGradient}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={32}
            color={isDarkMode ? "#6B7280" : "#9CA3AF"}
          />
        </LinearGradient>
      </View>

      <Text
        style={[
          styles.emptyTitle,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_PRIMARY
              : COLORS.LIGHT_TEXT_PRIMARY,
          },
        ]}
      >
        <Translate>No conversations yet</Translate>
      </Text>

      <Text
        style={[
          styles.emptyText,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_SECONDARY
              : COLORS.LIGHT_TEXT_SECONDARY,
          },
        ]}
      >
        <Translate>Start messaging with friends and family</Translate>
      </Text>

      <TouchableOpacity
        style={[
          styles.startChatButton,
          {
            backgroundColor: isDarkMode ? "#6366F1" : "#4F46E5",
          },
        ]}
      >
        <Ionicons
          name="add"
          size={20}
          color="#FFFFFF"
          style={styles.startChatIcon}
        />
        <Text style={styles.startChatButtonText}>
          <Translate>Start a chat</Translate>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const keyExtractor = (item: IChatItem, index: number) =>
    item._id ? `${item._id}-${index}` : `chatlist-${index}`;
  const groups = groupChatsByDate();

  // Create a flattened data structure with section headers and items
  let flattenedData: any[] = [];

  if (groups.today.length > 0) {
    flattenedData.push({ id: "today-header", isHeader: true, title: "Today" });
    flattenedData = [...flattenedData, ...groups.today];
  }

  if (groups.yesterday.length > 0) {
    flattenedData.push({
      id: "yesterday-header",
      isHeader: true,
      title: "Yesterday",
    });
    flattenedData = [...flattenedData, ...groups.yesterday];
  }

  if (groups.lastWeek.length > 0) {
    flattenedData.push({
      id: "lastweek-header",
      isHeader: true,
      title: "Last Week",
    });
    flattenedData = [...flattenedData, ...groups.lastWeek];
  }

  if (groups.older.length > 0) {
    flattenedData.push({ id: "older-header", isHeader: true, title: "Older" });
    flattenedData = [...flattenedData, ...groups.older];
  }

  // Render item with section headers
  const renderItem = ({ item }: { item: any }) => {
    if (item.isHeader) {
      return renderSectionHeader(item.title);
    }
    return renderChatItem({ item });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG,
        },
      ]}
    >
      <Animated.FlatList
        data={flattenedData.length > 0 ? flattenedData : chats}
        renderItem={flattenedData.length > 0 ? renderItem : renderChatItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          chats.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={Platform.OS === "android"}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? "#6366F1" : "#4F46E5"}
              colors={["#6366F1", "#4F46E5"]}
              progressBackgroundColor={
                isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG
              }
            />
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.M,
    paddingTop: SPACING.S,
    paddingBottom: SPACING.XL,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatItemContainer: {
    marginBottom: SPACING.S,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.M,
    paddingHorizontal: SPACING.M,
    minHeight: 78,
    position: "relative",
    borderWidth: 1,
  },
  selectedIndicator: {
    position: "absolute",
    left: 0,
    top: 20,
    bottom: 20,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  avatarContainer: {
    position: "relative",
    marginRight: SPACING.M,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#FFFFFF",
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
  },
  statusIndicator: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    right: -2,
    bottom: -2,
    borderWidth: 2.5,
  },
  unreadBadge: {
    position: "absolute",
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    top: -5,
    right: -5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: FONTS.SEMIBOLD,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleText: {
    fontSize: FONT_SIZES.M,
    flex: 1,
    marginRight: SPACING.S,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  timeText: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  messagePreviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  subtitleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  rightContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.S,
  },
  chevronIcon: {
    marginTop: 2,
  },
  sectionHeaderContainer: {
    marginTop: SPACING.M,
    marginBottom: SPACING.S,
    alignItems: "flex-start",
  },
  sectionHeaderBg: {
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.S,
    borderRadius: 12,
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
  sectionHeaderText: {
    fontSize: 12,
    fontFamily: FONTS.SEMIBOLD,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.XL,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: SPACING.L,
  },
  emptyIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.L,
    marginBottom: SPACING.S,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.XL,
    textAlign: "center",
    lineHeight: 20,
  },
  startChatButton: {
    paddingVertical: SPACING.M,
    paddingHorizontal: SPACING.L,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  startChatIcon: {
    marginRight: SPACING.S,
  },
  startChatButtonText: {
    color: "#FFFFFF",
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
});

export default ChatList;
