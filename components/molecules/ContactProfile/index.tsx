// src/components/chat/ContactProfile.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { User } from "@/types/data";
import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { BACKEND_BASE_URL } from "@/constant";
import CountryFlag from "react-native-country-flag";
import { Translate } from "@/components/common";

interface ContactProfileProps {
  contact: User;
  onClose: () => void;
  isDarkMode: boolean;
}

const { width } = Dimensions.get("window");

const ContactProfile = ({
  contact,
  onClose,
  isDarkMode,
}: ContactProfileProps) => {
  const insets = useSafeAreaInsets();

  // Animation values
  const translateYAnimation = useRef(new Animated.Value(50)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.95)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // UI States
  const [activeTab, setActiveTab] = useState<"profile" | "media" | "files">(
    "profile"
  );

  // Start entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateYAnimation, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateYAnimation, opacityAnimation, scaleAnimation]);

  // Handle close button press - kept for animation purposes but actual onClose is handled by parent
  const handleClosePress = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnimation, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 0.95,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  }, [onClose, opacityAnimation, translateYAnimation, scaleAnimation]);

  // Helper function to get status color
  const getStatusColor = useCallback(
    (status: string) => {
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
    },
    [isDarkMode]
  );

  // Format joined date
  const formatJoinedDate = () => {
    if (!contact.createdAt) return "Unknown";

    const date = new Date(contact.createdAt);
    const month = date.toLocaleString("default", { month: "long" });
    return `${month} ${date.getFullYear()}`;
  };

  // Handle scroll for header animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Rating component with modern design
  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {Array(fullStars)
            .fill(0)
            .map((_, i) => (
              <Ionicons
                key={`full-${i}`}
                name="star"
                size={14}
                color="#F59E0B"
                style={styles.starIcon}
              />
            ))}
          {hasHalfStar && (
            <Ionicons
              key="half"
              name="star-half"
              size={14}
              color="#F59E0B"
              style={styles.starIcon}
            />
          )}
          {Array(emptyStars)
            .fill(0)
            .map((_, i) => (
              <Ionicons
                key={`empty-${i}`}
                name="star-outline"
                size={14}
                color="rgba(245, 158, 11, 0.5)"
                style={styles.starIcon}
              />
            ))}
        </View>
        <Text
          style={[
            styles.ratingText,
            {
              color: isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
            },
          ]}
        >
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  // Tab bar component
  const TabBar = () => (
    <View style={styles.tabContainer}>
      <Pressable
        style={[styles.tabButton, activeTab === "profile" && styles.activeTab]}
        onPress={() => setActiveTab("profile")}
      >
        <Ionicons
          name="person"
          size={18}
          color={
            activeTab === "profile"
              ? isDarkMode
                ? "#6366F1"
                : "#4F46E5"
              : isDarkMode
              ? "rgba(255,255,255,0.6)"
              : "rgba(0,0,0,0.4)"
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "profile" && styles.activeTabText,
            {
              color:
                activeTab === "profile"
                  ? isDarkMode
                    ? "#6366F1"
                    : "#4F46E5"
                  : isDarkMode
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(0,0,0,0.4)",
            },
          ]}
        >
          Profile
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tabButton, activeTab === "media" && styles.activeTab]}
        onPress={() => setActiveTab("media")}
      >
        <Ionicons
          name="images"
          size={18}
          color={
            activeTab === "media"
              ? isDarkMode
                ? "#6366F1"
                : "#4F46E5"
              : isDarkMode
              ? "rgba(255,255,255,0.6)"
              : "rgba(0,0,0,0.4)"
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "media" && styles.activeTabText,
            {
              color:
                activeTab === "media"
                  ? isDarkMode
                    ? "#6366F1"
                    : "#4F46E5"
                  : isDarkMode
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(0,0,0,0.4)",
            },
          ]}
        >
          Media
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tabButton, activeTab === "files" && styles.activeTab]}
        onPress={() => setActiveTab("files")}
      >
        <Ionicons
          name="document"
          size={18}
          color={
            activeTab === "files"
              ? isDarkMode
                ? "#6366F1"
                : "#4F46E5"
              : isDarkMode
              ? "rgba(255,255,255,0.6)"
              : "rgba(0,0,0,0.4)"
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "files" && styles.activeTabText,
            {
              color:
                activeTab === "files"
                  ? isDarkMode
                    ? "#6366F1"
                    : "#4F46E5"
                  : isDarkMode
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(0,0,0,0.4)",
            },
          ]}
        >
          Files
        </Text>
      </Pressable>
    </View>
  );

  // Section title component
  const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <View style={styles.sectionTitleContainer}>
      <Ionicons
        name={icon as any}
        size={18}
        color={isDarkMode ? "#6366F1" : "#4F46E5"}
        style={styles.sectionIcon}
      />
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_PRIMARY
              : COLORS.LIGHT_TEXT_PRIMARY,
          },
        ]}
      >
        <Translate>{title}</Translate>
      </Text>
    </View>
  );

  // Info item component
  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string;
  }) => (
    <View style={styles.infoItem}>
      <View
        style={[
          styles.infoIconContainer,
          {
            backgroundColor: isDarkMode
              ? "rgba(99, 102, 241, 0.15)"
              : "rgba(79, 70, 229, 0.1)",
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={16}
          color={isDarkMode ? "#6366F1" : "#4F46E5"}
        />
      </View>
      <View style={styles.infoTextContainer}>
        <Text
          style={[
            styles.infoLabel,
            {
              color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.infoValue,
            {
              color: isDarkMode
                ? COLORS.DARK_TEXT_PRIMARY
                : COLORS.LIGHT_TEXT_PRIMARY,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  // Media Grid (placeholder)
  const MediaGrid = () => (
    <View style={styles.mediaGridContainer}>
      <Text
        style={[
          styles.emptyContentText,
          {
            color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
          },
        ]}
      >
        No shared media yet
      </Text>
    </View>
  );

  // Files List (placeholder)
  const FilesList = () => (
    <View style={styles.filesListContainer}>
      <Text
        style={[
          styles.emptyContentText,
          {
            color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
          },
        ]}
      >
        No shared files yet
      </Text>
    </View>
  );

  // Set background color to match chat screen
  const backgroundColor = isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnimation,
          transform: [
            { translateY: translateYAnimation },
            { scale: scaleAnimation },
          ],
          backgroundColor: "transparent",
        },
      ]}
    >
      {/* Main Content */}
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: "transparent" }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {contact.avatar ? (
              <Image
                source={{ uri: BACKEND_BASE_URL + contact.avatar }}
                style={styles.avatar}
              />
            ) : (
              <LinearGradient
                colors={
                  isDarkMode ? ["#6366F1", "#4F46E5"] : ["#6366F1", "#4338CA"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.placeholderAvatarText}>
                  {contact.name
                    ? contact.name.charAt(0).toUpperCase() +
                      (contact.name.split(" ")[1]
                        ? contact.name.split(" ")[1].charAt(0).toUpperCase()
                        : "")
                    : ""}
                </Text>
              </LinearGradient>
            )}

            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: getStatusColor(contact.status || "offline"),
                },
              ]}
            />

            {(contact.kycVerified || contact.membership === "premium") && (
              <View style={styles.badgeContainer}>
                {contact.kycVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#6366F1"
                    style={styles.verifiedBadge}
                  />
                )}
              </View>
            )}
          </View>

          <Text
            style={[
              styles.nameText,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_PRIMARY
                  : COLORS.LIGHT_TEXT_PRIMARY,
              },
            ]}
          >
            {contact.name}
          </Text>

          <Text
            style={[
              styles.usernameText,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
              },
            ]}
          >
            @
            {contact.shortname ||
              contact.name?.toLowerCase().replace(/\s/g, "") ||
              "user"}
          </Text>

          {/* Status Pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: getStatusColor(contact.status || "offline"),
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: isDarkMode
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(0,0,0,0.7)",
                },
              ]}
            >
              {contact.status || "offline"}
            </Text>
          </View>

          {/* Location Info with Flag */}
          {contact.country && (
            <View style={styles.locationContainer}>
              <CountryFlag
                isoCode={contact.country?.toLowerCase() ?? "us"}
                size={14}
                style={styles.countryFlag}
              />
              <Text
                style={[
                  styles.locationText,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  },
                ]}
              >
                {contact.region?.split(",")[0]}, {contact.country}
              </Text>
            </View>
          )}

          {/* Rating Stars */}
          {contact.rate && contact.rate > 0 && (
            <RatingStars rating={contact.rate} />
          )}
        </View>

        {/* Tab Bar */}
        {/* <TabBar /> */}

        {/* Tab Content */}
        {activeTab === "profile" && (
          <View style={styles.tabContent}>
            {/* About Section if available */}
            {contact.about && (
              <View
                style={[
                  styles.sectionContainer,
                  {
                    backgroundColor: "transparent",
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <SectionTitle icon="information-circle" title="About" />
                <Text
                  style={[
                    styles.aboutText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  <Translate>{contact.about}</Translate>
                </Text>
              </View>
            )}

            {/* Contact Info */}
            {/* <View
              style={[
                styles.sectionContainer,
                {
                  backgroundColor: "transparent",
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <SectionTitle icon="call" title="Contact Info" />

              <InfoItem
                icon="mail"
                label="Email"
                value={contact.email || "Not available"}
              />
            </View> */}

            {/* Stats Section */}
            {contact.totalCompleted !== undefined && (
              <View
                style={[
                  styles.sectionContainer,
                  {
                    backgroundColor: "transparent",
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <SectionTitle icon="stats-chart" title="Statistics" />

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statIconContainer,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(16, 185, 129, 0.1)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10B981"
                      />
                    </View>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      {contact.totalCompleted}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      <Translate>Completed</Translate>
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statIconContainer,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(245, 158, 11, 0.1)",
                        },
                      ]}
                    >
                      <Ionicons name="star" size={20} color="#F59E0B" />
                    </View>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      {contact.rate ? contact.rate.toFixed(1) : "0.0"}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      <Translate>Rating</Translate>
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <View
                      style={[
                        styles.statIconContainer,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(99, 102, 241, 0.15)"
                            : "rgba(99, 102, 241, 0.1)",
                        },
                      ]}
                    >
                      <Ionicons name="calendar" size={20} color="#6366F1" />
                    </View>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      <Translate>{formatJoinedDate()}</Translate>
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      <Translate>Joined</Translate>
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Membership Section */}
            {contact.membership && (
              <View
                style={[
                  styles.sectionContainer,
                  {
                    backgroundColor: "transparent",
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <SectionTitle icon="diamond" title="Membership" />

                <View style={styles.membershipCard}>
                  <LinearGradient
                    colors={["#6366F1", "#4F46E5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.membershipCardGradient}
                  >
                    <View style={styles.membershipContent}>
                      <View style={styles.membershipTopRow}>
                        <Text style={styles.membershipLevel}>
                          {contact.membership === "premium" ? (
                            <Translate>Premium Member</Translate>
                          ) : (
                            <Translate>Standard Member</Translate>
                          )}
                        </Text>
                        <Ionicons
                          name={
                            contact.membership === "premium"
                              ? "diamond"
                              : "person"
                          }
                          size={20}
                          color="#FFFFFF"
                        />
                      </View>

                      <View style={styles.membershipBottomRow}>
                        <Text style={styles.membershipName}>
                          {contact.name}
                        </Text>
                        <View>
                          <Text style={styles.membershipSince}>
                            <Translate>Since</Translate>
                          </Text>
                          <Text style={styles.membershipSince}>
                            <Translate>{formatJoinedDate()}</Translate>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === "media" && <MediaGrid />}

        {activeTab === "files" && <FilesList />}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.XL,
    paddingHorizontal: SPACING.M,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: SPACING.L,
    paddingTop: SPACING.L,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.M,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  placeholderAvatarText: {
    fontFamily: FONTS.BOLD,
    fontSize: 36,
    color: COLORS.WHITE,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  verifiedBadge: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  nameText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
    textAlign: "center",
  },
  usernameText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.S,
    textAlign: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: SPACING.S,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    textTransform: "capitalize",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  countryFlag: {
    marginRight: 6,
    borderRadius: 2,
    overflow: "hidden",
  },
  locationText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
  },
  ratingContainer: {
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: SPACING.M,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
  },
  tabText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginLeft: 6,
  },
  activeTabText: {
    fontFamily: FONTS.SEMIBOLD,
  },
  tabContent: {
    paddingTop: SPACING.XS,
  },
  sectionContainer: {
    borderRadius: 16,
    marginBottom: SPACING.M,
    padding: SPACING.M,
    borderWidth: 1,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  sectionIcon: {
    marginRight: SPACING.XS,
  },
  sectionTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
  },
  aboutText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    lineHeight: FONT_SIZES.XL,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
    paddingVertical: 6,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.S,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.M,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  membershipCard: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  membershipCardGradient: {
    borderRadius: 16,
    padding: SPACING.M,
  },
  membershipContent: {
    height: 100,
    justifyContent: "space-between",
  },
  membershipTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  membershipLevel: {
    color: "#FFFFFF",
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
  },
  membershipBottomRow: {
    marginTop: SPACING.S,
  },
  membershipName: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginBottom: 2,
  },
  membershipSince: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  mediaGridContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.M,
  },
  filesListContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.M,
  },
  emptyContentText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
  },
});

export default ContactProfile;
