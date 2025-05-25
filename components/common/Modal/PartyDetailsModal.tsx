import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/redux/store";
import { Party } from "@/types/data";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { FC } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import Button from "../Button";
import Slider from "../Slider";
import Translate from "../Translate";

interface PartyDetailsModalProps {
  party: Party | null;
  visible: boolean;
  onClose: () => void;
  onJoin: (party: Party) => void;
}

// Get party type icon
const getPartyTypeIcon = (type: string) => {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case "birthday":
      return "birthday-cake";
    case "wedding":
      return "heart";
    case "corporate":
      return "building";
    case "sport":
      return "futbol";
    case "movie":
      return "film";
    case "common":
    default:
      return "glass-cheers";
  }
};

// Get party type color - matching your EventDetailScreen exactly
const getPartyTypeColor = (type: string) => {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case "birthday":
      return "#ec4899"; // pink
    case "wedding":
      return "#6366f1"; // indigo
    case "corporate":
      return "#10b981"; // emerald
    case "sport":
      return "#ef4444"; // red
    case "movie":
      return "#8b5cf6"; // violet
    case "common":
    default:
      return "#f59e0b"; // amber
  }
};

// Get party type gradient - matching your EventDetailScreen style
const getPartyTypeGradient = (type: string, isDarkMode: boolean) => {
  const normalizedType = type.toLowerCase();

  if (isDarkMode) {
    // Dark mode gradients
    switch (normalizedType) {
      case "birthday":
        return ["#9D174D", "#6D28D9"];
      case "wedding":
        return ["#4338CA", "#3730A3"];
      case "corporate":
        return ["#065F46", "#064E3B"];
      case "sport":
        return ["#991B1B", "#9F1239"];
      case "movie":
        return ["#6D28D9", "#5B21B6"];
      case "common":
      default:
        return ["#B45309", "#C2410C"];
    }
  } else {
    // Light mode gradients
    switch (normalizedType) {
      case "birthday":
        return ["#ec4899", "#9333ea"];
      case "wedding":
        return ["#6366f1", "#2563eb"];
      case "corporate":
        return ["#10b981", "#0d9488"];
      case "sport":
        return ["#ef4444", "#e11d48"];
      case "movie":
        return ["#8b5cf6", "#6d28d9"];
      case "common":
      default:
        return ["#f59e0b", "#ea580c"];
    }
  }
};

// Get status badge info with your exact color scheme
const getStatusInfo = (status: string, isDarkMode: boolean) => {
  if (isDarkMode) {
    const baseColors = {
      opening: ["#059669", "#047857"],
      accepted: ["#4F46E5", "#4338CA"],
      playing: ["#d97706", "#b45309"],
      finished: ["#6b7280", "#4b5563"],
      cancelled: ["#dc2626", "#b91c1c"],
    };
    return {
      gradient:
        baseColors[status as keyof typeof baseColors] || baseColors.finished,
      text: getStatusText(status),
    };
  } else {
    const baseColors = {
      opening: ["#10b981", "#059669"],
      accepted: ["#6366f1", "#4f46e5"],
      playing: ["#f59e0b", "#d97706"],
      finished: ["#9ca3af", "#6b7280"],
      cancelled: ["#ef4444", "#dc2626"],
    };
    return {
      gradient:
        baseColors[status as keyof typeof baseColors] || baseColors.finished,
      text: getStatusText(status),
    };
  }
};

const getStatusText = (status: string) => {
  const textMap = {
    opening: "Open for Applications",
    accepted: "Applications Accepted",
    playing: "Event in Progress",
    finished: "Event Finished",
    cancelled: "Event Cancelled",
  };
  return (
    <Translate>
      {textMap[status as keyof typeof textMap] || "Unknown Status"}
    </Translate>
  );
};

// Get accent color - exactly like your EventDetailScreen
const getAccentColor = (isDarkMode: boolean) => {
  return isDarkMode ? COLORS.SECONDARY : "#FF0099";
};

// Format date for display
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const PartyDetailsModal: FC<PartyDetailsModalProps> = ({
  party,
  visible,
  onClose,
}) => {
  if (!party) return null;

  const { user } = useSelector((state: RootState) => state.auth);

  const { isDarkMode } = useTheme();

  const statusInfo = getStatusInfo(party.status, isDarkMode);
  const partyGradient = getPartyTypeGradient(party.type, isDarkMode);
  const partyIcon = getPartyTypeIcon(party.type);
  const accentColor = getAccentColor(isDarkMode);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
        style={styles.modalContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={partyGradient as any}
                style={styles.partyTypeIcon}
              >
                <FontAwesome5 name={partyIcon} size={20} color="white" />
              </LinearGradient>
              <View>
                <Text
                  style={[
                    styles.partyTypeText,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  <Translate>
                    {party.type.charAt(0).toUpperCase() + party.type.slice(1)}
                  </Translate>{" "}
                  <Translate>Party</Translate>
                </Text>
                <Text
                  style={[
                    styles.locationText,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  {party.region}, {party.country}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome5 name="times" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Media Slider Space */}
          <View style={styles.mediaSliderSpace}>
            <View
              style={[
                styles.mediaPlaceholder,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(31, 41, 55, 0.3)"
                    : "rgba(255, 255, 255, 0.8)",
                  borderColor: isDarkMode
                    ? "rgba(156, 163, 175, 0.5)"
                    : "rgba(156, 163, 175, 0.3)",
                },
              ]}
            >
              <Slider images={party.medias} />
            </View>
          </View>

          {/* Party Details */}
          <View style={styles.contentContainer}>
            {/* Title and Status */}
            <View style={styles.titleSection}>
              <Text
                style={[
                  styles.partyTitle,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_PRIMARY
                      : COLORS.LIGHT_TEXT_PRIMARY,
                  },
                ]}
              >
                <Translate>{party.title}</Translate>
              </Text>

              <LinearGradient
                colors={statusInfo.gradient as any}
                style={styles.statusBadge}
              >
                <Text style={styles.statusText}>{statusInfo.text}</Text>
              </LinearGradient>
            </View>

            {/* Description */}
            <View style={styles.section}>
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
                <Translate>Description</Translate>
              </Text>
              <Text
                style={[
                  styles.description,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  },
                ]}
              >
                <Translate>{party.description}</Translate>
              </Text>
            </View>

            {/* Event Details */}
            <View style={styles.detailsGrid}>
              {/* Date & Time */}
              <View
                style={[
                  styles.detailItem,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(17, 24, 39, 0.95)"
                      : "rgba(255, 255, 255, 0.6)",
                    borderColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(230, 234, 240, 0.8)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.detailIconContainer,
                    { backgroundColor: accentColor },
                  ]}
                >
                  <FontAwesome5 name="calendar-alt" size={16} color="white" />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    <Translate>Event Date</Translate>
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    <Translate>{formatDate(party.openingAt)}</Translate>
                  </Text>
                </View>
              </View>

              {/* Attendees */}
              <View
                style={[
                  styles.detailItem,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(17, 24, 39, 0.95)"
                      : "rgba(255, 255, 255, 0.6)",
                    borderColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(230, 234, 240, 0.8)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.detailIconContainer,
                    { backgroundColor: accentColor },
                  ]}
                >
                  <FontAwesome5 name="users" size={16} color="white" />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    <Translate>Attendees</Translate>
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    {party.applicants?.length || 0}{" "}
                    <Translate>applied</Translate>
                  </Text>
                </View>
              </View>

              {/* Payment Option */}
              <View
                style={[
                  styles.detailItem,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(17, 24, 39, 0.95)"
                      : "rgba(255, 255, 255, 0.6)",
                    borderColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(230, 234, 240, 0.8)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.detailIconContainer,
                    {
                      backgroundColor:
                        party.paidOption === "paid"
                          ? isDarkMode
                            ? "#d97706"
                            : "#f59e0b"
                          : isDarkMode
                          ? "#059669"
                          : "#10b981",
                    },
                  ]}
                >
                  <FontAwesome5
                    name={party.paidOption === "paid" ? "credit-card" : "gift"}
                    size={16}
                    color="white"
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    <Translate>Entry Fee</Translate>
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    {party.paidOption === "paid" ? (
                      `${party.fee || 0} ${party.currency?.toUpperCase()}`
                    ) : (
                      <Translate>Free</Translate>
                    )}
                  </Text>
                </View>
              </View>

              {/* Host */}
              <View
                style={[
                  styles.detailItem,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(17, 24, 39, 0.95)"
                      : "rgba(255, 255, 255, 0.6)",
                    borderColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(230, 234, 240, 0.8)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.detailIconContainer,
                    { backgroundColor: accentColor },
                  ]}
                >
                  <FontAwesome5 name="user-tie" size={16} color="white" />
                </View>
                <View style={styles.detailContent}>
                  <Text
                    style={[
                      styles.detailLabel,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    <Translate>Hosted by</Translate>
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    {party.creator?.name || "Unknown"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Join Button */}
        {user?._id !== party.creator?._id && (
          <View
            style={[
              styles.bottomContainer,
              {
                backgroundColor: isDarkMode
                  ? COLORS.DARK_BG_SECONDARY
                  : COLORS.LIGHT_BG,
                borderTopColor: isDarkMode
                  ? "rgba(75, 85, 99, 0.3)"
                  : "rgba(230, 234, 240, 0.8)",
              },
            ]}
          >
            {!user ? (
              <Button
                title="Sign in to join"
                variant={isDarkMode ? "primary" : "secondary"}
                icon={
                  <Feather
                    name="log-in"
                    color="white"
                    style={styles.joinButtonIcon}
                  />
                }
                onPress={() => {
                  router.push("/auth/login");
                  onClose();
                }}
                small={true}
              />
            ) : (
              <Button
                title="Join"
                variant={isDarkMode ? "primary" : "secondary"}
                icon={
                  <FontAwesome5
                    name="plus"
                    color="white"
                    style={styles.joinButtonIcon}
                  />
                }
                onPress={() => {
                  router.push({
                    pathname: "/parties/[id]",
                    params: { id: party._id as string },
                  });
                  onClose();
                }}
                small={true}
              />
            )}
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.XXL,
    paddingBottom: SPACING.M,
    paddingHorizontal: SPACING.M,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  partyTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.M,
    ...SHADOWS.SMALL,
  },
  partyTypeText: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
  },
  locationText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollContent: {
    flex: 1,
  },
  mediaSliderSpace: {
    margin: SPACING.M,
    height: 300,
    borderRadius: BORDER_RADIUS.L,
  },
  mediaPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.L,
  },
  mediaPlaceholderText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    marginTop: SPACING.S,
  },
  contentContainer: {
    padding: SPACING.M,
  },
  titleSection: {
    marginBottom: SPACING.L,
  },
  partyTitle: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONTS.BOLD,
    marginBottom: SPACING.S,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.S,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.L,
    ...SHADOWS.SMALL,
  },
  statusText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    color: "white",
  },
  section: {
    marginBottom: SPACING.L,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
    marginBottom: SPACING.S,
  },
  description: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.REGULAR,
    lineHeight: 20,
  },
  detailsGrid: {
    gap: SPACING.S,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 1,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.S,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
  },
  bottomContainer: {
    padding: SPACING.M,
    borderTopWidth: 1,
  },
  joinButton: {
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  joinButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.M,
  },
  joinButtonIcon: {
    marginRight: SPACING.S,
  },
  joinButtonText: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.BOLD,
    color: "white",
  },
});

export default PartyDetailsModal;
