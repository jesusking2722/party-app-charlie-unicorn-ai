import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { Rating } from "@/components/common";
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/redux/store";
import { Applicant } from "@/types/data";
import { FontAwesome5 } from "@expo/vector-icons";
import CountryFlag from "react-native-country-flag";
import { useSelector } from "react-redux";
import { ProfileBadge } from "..";

// Format time ago function (simplified)
const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const diffTime = Math.abs(new Date(date).getTime() - now.getTime());
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }
};

interface ApplicantGroupProps {
  applicants: Applicant[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onChat: (id: string) => void;
  onSeeTicket?: (applicant: Applicant) => void;
  type: "pending" | "accepted" | "declined";
}

// Custom Button Component with Gradient Background
interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  gradientColors: string[];
  textColor: string;
  style?: any;
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  icon,
  gradientColors,
  textColor,
  style,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[styles.buttonBase, style]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={gradientColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradientContainer, disabled && styles.disabledButton]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const ApplicantGroup: React.FC<ApplicantGroupProps> = ({
  applicants,
  onAccept,
  onDecline,
  onChat,
  onSeeTicket,
  type,
}) => {
  const { isDarkMode } = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);

  // Empty state
  if (applicants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
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
          No {type} applications
        </Text>
      </View>
    );
  }

  // Button Gradient Colors
  const acceptGradient = ["#8B5CF6", "#6D28D9"];
  const declineGradient = ["#F1F5F9", "#E2E8F0"];
  const chatGradient = ["#F87171", "#EF4444"];
  const ticketGradient = ["#3B82F6", "#2563EB"];

  return (
    <View style={styles.container}>
      {applicants.map((applicant, index) => (
        <View
          key={applicant._id || index}
          style={[
            styles.applicantCard,
            {
              backgroundColor: isDarkMode ? COLORS.DARK_CARD_GLASS : "#FFFFFF",
            },
          ]}
        >
          {/* Profile Section */}
          <View style={styles.profileRow}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {applicant.applier.avatar ? (
                <Image
                  source={{ uri: BACKEND_BASE_URL + applicant.applier.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {applicant.applier.name
                      ? applicant.applier.name.slice(0, 2).toUpperCase()
                      : "NA"}
                  </Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text
                  style={[
                    styles.userName,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {applicant.applier.name}
                </Text>

                {/* Premium Badge */}
                {applicant.applier.membership === "premium" && (
                  <ProfileBadge type="premium" />
                )}
              </View>

              {/* Rating Stars */}
              <Rating value={applicant.applier.rate ?? 0} />

              {/* Location */}
              <View style={styles.locationRow}>
                <CountryFlag
                  isoCode={applicant.applier.country?.toLowerCase() || "us"}
                  size={14}
                />
                <Text
                  style={[
                    styles.locationText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : "#6B7280",
                    },
                  ]}
                >
                  {applicant.applier.region}, {applicant.applier.country}
                </Text>
              </View>
            </View>

            {/* Time */}
            <Text
              style={[
                styles.timeText,
                { color: isDarkMode ? COLORS.DARK_TEXT_SECONDARY : "#6B7280" },
              ]}
            >
              {formatTimeAgo(applicant.appliedAt || new Date())}
            </Text>
          </View>

          {/* Application Message */}
          <View style={styles.messageContainer}>
            <Text
              style={[
                styles.messageText,
                {
                  color: isDarkMode ? COLORS.DARK_TEXT_SECONDARY : "#374151",
                },
              ]}
              numberOfLines={3}
            >
              {applicant.applicant || "No message provided."}
            </Text>
          </View>

          {/* Action Buttons */}
          {user?._id !== applicant.applier._id && (
            <View style={styles.buttonContainer}>
              {type === "pending" && (
                <View style={styles.mainButtonRow}>
                  <GradientButton
                    title="Accept"
                    icon={
                      <FontAwesome5
                        name="check"
                        size={14}
                        color="#FFFFFF"
                        style={styles.buttonIcon}
                      />
                    }
                    gradientColors={acceptGradient}
                    textColor="#FFFFFF"
                    onPress={() => onAccept(applicant._id || "")}
                    style={styles.halfButton}
                  />

                  <GradientButton
                    title="Decline"
                    icon={
                      <FontAwesome5
                        name="times"
                        size={14}
                        color="#334155"
                        style={styles.buttonIcon}
                      />
                    }
                    gradientColors={declineGradient}
                    textColor="#334155"
                    onPress={() => onDecline(applicant._id || "")}
                    style={styles.halfButton}
                  />
                </View>
              )}

              <View style={styles.secondaryButtonRow}>
                <GradientButton
                  title="Chat"
                  icon={
                    <FontAwesome5
                      name="comment"
                      size={14}
                      color="#FFFFFF"
                      style={styles.buttonIcon}
                    />
                  }
                  gradientColors={chatGradient}
                  textColor="#FFFFFF"
                  onPress={() => onChat(applicant.applier._id || "")}
                  style={styles.halfButton}
                />

                {/* Ticket button */}
                {applicant.stickers &&
                  applicant.stickers.length > 0 &&
                  onSeeTicket && (
                    <GradientButton
                      title="Ticket"
                      icon={
                        <FontAwesome5
                          name="ticket-alt"
                          size={14}
                          color="#FFFFFF"
                          style={styles.buttonIcon}
                        />
                      }
                      gradientColors={ticketGradient}
                      textColor="#FFFFFF"
                      onPress={() => onSeeTicket(applicant)}
                      style={styles.halfButton}
                    />
                  )}
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.M,
  },
  emptyText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.M,
  },
  // Applicant card
  applicantCard: {
    borderRadius: BORDER_RADIUS.M,
    marginBottom: SPACING.M,
    padding: SPACING.M,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  // Profile row
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  // Avatar
  avatarContainer: {
    marginRight: SPACING.S,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: "#B249F8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.M,
  },
  // User info
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
    marginRight: SPACING.XS,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginLeft: 6,
  },
  timeText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  // Message
  messageContainer: {
    marginBottom: SPACING.M,
  },
  messageText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
  },
  // Buttons
  buttonContainer: {
    gap: SPACING.S,
  },
  mainButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.S,
    marginBottom: SPACING.XS,
  },
  secondaryButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.S,
  },
  // Base button styles
  buttonBase: {
    height: 40,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  halfButton: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.S,
  },
  buttonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  buttonIcon: {
    marginRight: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ApplicantGroup;
