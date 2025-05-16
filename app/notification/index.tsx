import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { NotificationAlert } from "@/components/molecules";
import { useTheme } from "@/contexts/ThemeContext";

const NotificationBannerImage = require("@/assets/images/notification-banner.png");

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

// Define notification type
export type NotificationType = "success" | "warning" | "error" | "info";

interface Notification {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  type?: NotificationType;
  path?: string;
  isRead: boolean;
}

// Sample notification data for demo purposes
const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "New Event Invitation",
    description:
      "You've been invited to attend the 'Summer Beach Party' this weekend. Check your events list for details.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: "success",
    path: "/main/events",
    isRead: false,
  },
  {
    id: "2",
    title: "Payment Confirmation",
    description:
      "Your payment for 'Music Festival Tickets' has been processed successfully.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    type: "info",
    isRead: true,
  },
  {
    id: "3",
    title: "Profile Verification Required",
    description:
      "Please complete your profile verification to access all features of the app.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    type: "warning",
    path: "/main/profile/edit",
    isRead: false,
  },
  {
    id: "4",
    title: "Event Cancellation",
    description:
      "The 'Networking Summit' scheduled for next week has been cancelled due to unforeseen circumstances.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    type: "error",
    isRead: true,
  },
  {
    id: "5",
    title: "New Message",
    description:
      "You have a new message from Alex Johnson regarding the upcoming event. Check your messages for details.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    type: "info",
    path: "/main/messages",
    isRead: false,
  },
  {
    id: "6",
    title: "Event Reminder",
    description:
      "Don't forget about the 'Workshop on Digital Marketing' tomorrow at 10:00 AM.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    type: "info",
    isRead: true,
  },
  {
    id: "7",
    title: "Birthday Discount",
    description:
      "Happy Birthday month! Enjoy a special 20% discount on all premium events this month.",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    type: "success",
    isRead: false,
  },
];

// Animation interface
interface ParticleAnimation {
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  speed: number;
}

interface NotificationAnimation {
  scale: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
}

// Filter type
type FilterType = "all" | "unread" | "read";

// Format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

// Main component
const NotificationScreen: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  // Animation values for each notification
  const [notificationAnims] = useState<NotificationAnimation[]>(() =>
    sampleNotifications.map(() => ({
      scale: new Animated.Value(0.95),
      translateY: new Animated.Value(20),
      opacity: new Animated.Value(0),
    }))
  );

  // State
  const [notifications, setNotifications] =
    useState<Notification[]>(sampleNotifications);
  const [filter, setFilter] = useState<FilterType>("all"); // "all", "unread", "read"

  // Animated background particles
  const particles: ParticleAnimation[] = Array(6)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.35)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.4 + 0.3)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.4 + 0.2)).current,
      speed: Math.random() * 3000 + 2000,
    }));

  // Run animations when component mounts
  useEffect(() => {
    const animationDelay = Platform.OS === "ios" ? 200 : 300;

    // Main elements fade in
    setTimeout(() => {
      Animated.parallel([
        // Fade in entire view
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.MEDIUM,
          useNativeDriver: true,
        }),
        // Slide up animation
        Animated.spring(translateY, {
          toValue: 0,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        // Card scale animation
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animation
      Animated.sequence([
        Animated.delay(animationDelay),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Start particle animations
      animateParticles();
    }, 100);
  }, []);

  // Animate notifications when they appear
  useEffect(() => {
    // Animate each notification with a staggered delay
    const filteredNotifications = getFilteredNotifications();

    filteredNotifications.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(index * 100), // Stagger the animations
        Animated.parallel([
          Animated.spring(notificationAnims[index].scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(notificationAnims[index].opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(notificationAnims[index].translateY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [filter, notifications]);

  // Continuous animation for floating particles
  const animateParticles = (): void => {
    particles.forEach((particle) => {
      // Animate vertical position
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.3) + height * 0.05,
            duration: particle.speed,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.3) + height * 0.05,
            duration: particle.speed,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
        ])
      ).start();

      // Animate scale
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: Math.random() * 0.3 + 0.4,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: Math.random() * 0.3 + 0.4,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate opacity
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.2 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.2 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  // Render particles for background effect
  const renderParticles = (): React.ReactNode => {
    return particles.map((particle, index) => (
      <Animated.View
        key={`particle-${index}`}
        style={[
          styles.particle,
          {
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
            backgroundColor: isDarkMode
              ? `rgba(${127 + Math.floor(Math.random() * 128)}, ${Math.floor(
                  Math.random() * 100
                )}, ${Math.floor(Math.random() * 255)}, 0.7)`
              : `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                  Math.random() * 255
                )}, ${Math.floor(Math.random() * 255)}, 0.5)`,
          },
        ]}
      />
    ));
  };

  // Filter notifications
  const getFilteredNotifications = (): Notification[] => {
    switch (filter) {
      case "unread":
        return notifications.filter((notification) => !notification.isRead);
      case "read":
        return notifications.filter((notification) => notification.isRead);
      default:
        return notifications;
    }
  };

  // Mark notification as read
  const markAsRead = (id: string): void => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Delete notification
  const deleteNotification = (id: string): void => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Handle notification press
  const handleNotificationPress = (notification: Notification): void => {
    markAsRead(notification.id);
    if (notification.path) {
      router.push(notification.path as any);
    }
  };

  // Get accent color based on theme
  const getAccentColor = (): string =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Render notification item
  const renderNotificationItem = (
    notification: Notification,
    index: number
  ): React.ReactNode => {
    return (
      <Animated.View
        key={notification.id}
        style={[
          styles.notificationContainer,
          {
            backgroundColor: isDarkMode
              ? "rgba(31, 41, 55, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
            borderColor: isDarkMode ? COLORS.DARK_BORDER : COLORS.LIGHT_BORDER,
            opacity: notificationAnims[index].opacity,
            transform: [
              { scale: notificationAnims[index].scale },
              { translateY: notificationAnims[index].translateY },
            ],
          },
          !notification.isRead && {
            borderLeftWidth: 3,
            borderLeftColor: getAccentColor(),
          },
        ]}
      >
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_PRIMARY
                  : COLORS.LIGHT_TEXT_PRIMARY,
                fontFamily: notification.isRead
                  ? FONTS.REGULAR
                  : FONTS.SEMIBOLD,
              },
            ]}
          >
            {notification.title}
          </Text>
          <Text
            style={[
              styles.timeAgo,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
              },
            ]}
          >
            {formatTimeAgo(notification.createdAt)}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDarkMode
                  ? "rgba(55, 65, 81, 0.7)"
                  : "rgba(0, 0, 0, 0.05)",
              },
            ]}
            onPress={() =>
              notification.isRead ? markAsRead(notification.id) : null
            }
          >
            <FontAwesome5
              name={notification.isRead ? "envelope-open" : "envelope"}
              size={12}
              color={
                isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDarkMode
                  ? "rgba(55, 65, 81, 0.7)"
                  : "rgba(0, 0, 0, 0.05)",
              },
            ]}
            onPress={() => deleteNotification(notification.id)}
          >
            <FontAwesome5
              name="trash-alt"
              size={12}
              color={
                isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY
              }
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.notificationDescription,
            {
              color: isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY,
            },
          ]}
        >
          {notification.description}
        </Text>

        {notification.type && (
          <NotificationAlert
            type={notification.type}
            message={`This is a ${notification.type} notification.`}
            path={notification.path ? "View details" : null}
            onNavigate={() => handleNotificationPress(notification)}
          />
        )}
      </Animated.View>
    );
  };

  // Get filtered notifications
  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Slider Section (Top 35%) */}
        <View style={styles.sliderContainer}>
          <Image
            source={NotificationBannerImage}
            alt="Banner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Add floating particles for fun effect */}
          {renderParticles()}
        </View>

        {/* Bottom Content Section */}
        <View style={styles.bottomHalf}>
          <LinearGradient
            colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
            style={styles.bottomGradient}
          />

          {/* Content Card */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                transform: [{ translateY }, { scale: cardScale }],
                opacity: fadeAnim,
                backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG,
              },
            ]}
          >
            <BlurView
              intensity={isDarkMode ? 40 : 30}
              tint={isDarkMode ? "dark" : "light"}
              style={styles.cardBlur}
            >
              {/* Accent Bar */}
              <View
                style={[
                  styles.cardAccentBar,
                  {
                    backgroundColor: getAccentColor(),
                  },
                ]}
              />

              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.screenTitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Notifications
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  Stay updated with the latest events and activities
                </Text>

                {/* Filter buttons */}
                <View style={styles.filterButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filter === "all" && {
                        backgroundColor: isDarkMode
                          ? "rgba(79, 70, 229, 0.2)"
                          : "rgba(255, 0, 153, 0.1)",
                        borderColor: isDarkMode
                          ? "rgba(79, 70, 229, 0.4)"
                          : "rgba(255, 0, 153, 0.3)",
                      },
                    ]}
                    onPress={() => setFilter("all")}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        {
                          color:
                            filter === "all"
                              ? getAccentColor()
                              : isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filter === "unread" && {
                        backgroundColor: isDarkMode
                          ? "rgba(79, 70, 229, 0.2)"
                          : "rgba(255, 0, 153, 0.1)",
                        borderColor: isDarkMode
                          ? "rgba(79, 70, 229, 0.4)"
                          : "rgba(255, 0, 153, 0.3)",
                      },
                    ]}
                    onPress={() => setFilter("unread")}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        {
                          color:
                            filter === "unread"
                              ? getAccentColor()
                              : isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      Unread
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filter === "read" && {
                        backgroundColor: isDarkMode
                          ? "rgba(79, 70, 229, 0.2)"
                          : "rgba(255, 0, 153, 0.1)",
                        borderColor: isDarkMode
                          ? "rgba(79, 70, 229, 0.4)"
                          : "rgba(255, 0, 153, 0.3)",
                      },
                    ]}
                    onPress={() => setFilter("read")}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        {
                          color:
                            filter === "read"
                              ? getAccentColor()
                              : isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      Read
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Notification count */}
                <View style={styles.resultsInfo}>
                  <View style={styles.resultCountContainer}>
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["rgba(79, 70, 229, 0.2)", "rgba(67, 56, 202, 0.2)"]
                          : ["rgba(127, 0, 255, 0.1)", "rgba(225, 0, 255, 0.1)"]
                      }
                      style={styles.resultCountBadge}
                    >
                      <Text
                        style={[
                          styles.resultCount,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        {filteredNotifications.length}{" "}
                        {filteredNotifications.length === 1
                          ? "notification"
                          : "notifications"}
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Mark all as read button */}
                  <Animated.View
                    style={[
                      styles.markAllButtonContainer,
                      { transform: [{ scale: buttonScale }] },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.markAllButton}
                      onPress={() => {
                        setNotifications((prevNotifications) =>
                          prevNotifications.map((notification) => ({
                            ...notification,
                            isRead: true,
                          }))
                        );
                      }}
                    >
                      <LinearGradient
                        colors={
                          isDarkMode
                            ? ["#4F46E5", "#7C3AED"]
                            : ["#FF0099", "#FF6D00"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.markAllGradient}
                      >
                        <FontAwesome5 name="check" size={12} color="#FFFFFF" />
                        <Text style={styles.markAllText}>Mark All as Read</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                  <View style={styles.notificationsListContainer}>
                    {filteredNotifications.map((notification, index) =>
                      renderNotificationItem(notification, index)
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                      <LinearGradient
                        colors={
                          isDarkMode
                            ? [
                                "rgba(79, 70, 229, 0.8)",
                                "rgba(67, 56, 202, 0.8)",
                              ]
                            : [
                                "rgba(127, 0, 255, 0.8)",
                                "rgba(225, 0, 255, 0.8)",
                              ]
                        }
                        style={styles.emptyIconGradient}
                      >
                        <FontAwesome5
                          name="bell-slash"
                          size={50}
                          color="#FFFFFF"
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
                      No Notifications
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
                      You're all caught up! Check back later for updates.
                    </Text>
                  </View>
                )}
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Decorative elements */}
      <View
        style={[
          styles.decorativeCircle1,
          {
            backgroundColor: isDarkMode
              ? "rgba(79, 70, 229, 0.1)"
              : "rgba(255, 0, 153, 0.08)",
          },
        ]}
      />
      <View
        style={[
          styles.decorativeCircle2,
          {
            backgroundColor: isDarkMode
              ? "rgba(124, 58, 237, 0.08)"
              : "rgba(255, 255, 255, 0.06)",
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  sliderContainer: {
    height: height * 0.35, // 35% of screen height
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomHalf: {
    minHeight: height * 0.75,
    width: "100%",
    position: "relative",
    paddingBottom: SPACING.XL,
  },
  bottomGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    position: "relative",
    top: -height * 0.1,
    marginHorizontal: width * 0.05,
    width: width * 0.9,
    zIndex: 10,
    height: "auto",
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  cardBlur: {
    width: "100%",
    height: "100%",
  },
  cardAccentBar: {
    height: 6,
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
  },
  cardContent: {
    padding: SPACING.M,
  },
  screenTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.M,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.S,
    borderRadius: BORDER_RADIUS.M,
    alignItems: "center",
    marginHorizontal: SPACING.XS,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  resultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  resultCountContainer: {
    overflow: "hidden",
    borderRadius: BORDER_RADIUS.M,
  },
  resultCountBadge: {
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.M,
  },
  resultCount: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  markAllButtonContainer: {
    justifyContent: "center",
  },
  markAllButton: {
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  markAllGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  markAllText: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginLeft: 8,
  },
  notificationsListContainer: {
    marginBottom: SPACING.M,
  },
  notificationContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginBottom: SPACING.M,
    borderWidth: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.XS,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.M,
    flex: 1,
    marginRight: SPACING.S,
  },
  timeAgo: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: SPACING.S,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  notificationDescription: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    lineHeight: 20,
    marginBottom: SPACING.S,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.XL,
    marginTop: SPACING.M,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: SPACING.M,
    ...SHADOWS.MEDIUM,
  },
  emptyIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
    marginTop: SPACING.M,
    marginBottom: SPACING.S,
  },
  emptyText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    marginBottom: SPACING.L,
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    top: -width * 0.3,
    right: -width * 0.25,
    zIndex: 0,
  },
  decorativeCircle2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    bottom: -width * 0.2,
    left: -width * 0.2,
    zIndex: 0,
  },
});

export default NotificationScreen;
