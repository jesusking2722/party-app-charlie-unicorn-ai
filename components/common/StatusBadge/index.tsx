import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { PartyStatus, PartyType } from "@/types/data";
import Translate from "../Translate";

type BadgeType = "date" | "status" | "payment" | "eventType";
type BadgePayment = "free" | "paid";

interface StatusBadgeProps {
  type: BadgeType;
  label?: string;
  status?: PartyStatus;
  payment?: BadgePayment;
  eventType?: PartyType;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  label,
  status,
  payment,
  eventType,
  style,
  textStyle,
}) => {
  const { isDarkMode } = useTheme();

  // Get badge content and colors based on type
  const getBadgeContent = () => {
    switch (type) {
      case "date":
        return {
          text: label || "Now",
          colors: isDarkMode
            ? ["rgba(31, 41, 55, 0.8)", "rgba(55, 65, 81, 0.8)"]
            : ["rgba(229, 231, 235, 0.8)", "rgba(243, 244, 246, 0.8)"],
          textColor: isDarkMode
            ? COLORS.DARK_TEXT_SECONDARY
            : COLORS.LIGHT_TEXT_SECONDARY,
        };

      case "status":
        if (status === "opening") {
          return {
            text: "Opening",
            colors: isDarkMode
              ? ["rgba(5, 150, 105, 0.8)", "rgba(4, 120, 87, 0.8)"]
              : ["rgba(5, 150, 105, 0.2)", "rgba(4, 120, 87, 0.2)"],
            textColor: isDarkMode ? "#FFFFFF" : "#047857",
          };
        } else if (status === "cancelled") {
          return {
            text: "Cancelled",
            colors: isDarkMode
              ? ["rgba(239, 68, 68, 0.8)", "rgba(220, 38, 38, 0.8)"]
              : ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.2)"],
            textColor: isDarkMode ? "#FFFFFF" : "#DC2626",
          };
        } else {
          return {
            text: "Finished",
            colors: isDarkMode
              ? ["rgba(79, 70, 229, 0.8)", "rgba(67, 56, 202, 0.8)"]
              : ["rgba(79, 70, 229, 0.2)", "rgba(67, 56, 202, 0.2)"],
            textColor: isDarkMode ? "#FFFFFF" : "#4F46E5",
          };
        }

      case "payment":
        if (payment === "free") {
          return {
            text: "FREE",
            colors: isDarkMode
              ? ["rgba(16, 185, 129, 0.8)", "rgba(5, 150, 105, 0.8)"]
              : ["rgba(16, 185, 129, 0.2)", "rgba(5, 150, 105, 0.2)"],
            textColor: isDarkMode ? "#FFFFFF" : "#059669",
          };
        } else {
          return {
            text: "PAID",
            colors: isDarkMode
              ? ["rgba(245, 158, 11, 0.8)", "rgba(217, 119, 6, 0.8)"]
              : ["rgba(245, 158, 11, 0.2)", "rgba(217, 119, 6, 0.2)"],
            textColor: isDarkMode ? "#FFFFFF" : "#D97706",
          };
        }

      case "eventType":
        return getEventTypeBadge(eventType as any);

      default:
        return {
          text: label || "",
          colors: isDarkMode
            ? ["rgba(31, 41, 55, 0.8)", "rgba(55, 65, 81, 0.8)"]
            : ["rgba(229, 231, 235, 0.8)", "rgba(243, 244, 246, 0.8)"],
          textColor: isDarkMode
            ? COLORS.DARK_TEXT_SECONDARY
            : COLORS.LIGHT_TEXT_SECONDARY,
        };
    }
  };

  // Get event type specific badge
  const getEventTypeBadge = (type?: PartyType) => {
    switch (type) {
      case "corporate":
        return {
          text: label || "Corporate",
          colors: isDarkMode
            ? ["rgba(16, 185, 129, 0.8)", "rgba(5, 150, 105, 0.8)"]
            : ["rgba(16, 185, 129, 0.2)", "rgba(5, 150, 105, 0.2)"],
          textColor: isDarkMode ? "#FFFFFF" : "#059669",
        };
      case "birthday":
        return {
          text: label || "Birthday",
          colors: isDarkMode
            ? ["rgba(236, 72, 153, 0.8)", "rgba(147, 51, 234, 0.8)"]
            : ["rgba(236, 72, 153, 0.2)", "rgba(147, 51, 234, 0.2)"],
          textColor: isDarkMode ? "#FFFFFF" : "#EC4899",
        };
      case "wedding":
        return {
          text: label || "Wedding",
          colors: isDarkMode
            ? ["rgba(99, 102, 241, 0.8)", "rgba(79, 70, 229, 0.8)"]
            : ["rgba(99, 102, 241, 0.2)", "rgba(79, 70, 229, 0.2)"],
          textColor: isDarkMode ? "#FFFFFF" : "#4F46E5",
        };
      case "sport":
        return {
          text: label || "Sport",
          colors: isDarkMode
            ? ["rgba(239, 68, 68, 0.8)", "rgba(220, 38, 38, 0.8)"]
            : ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.2)"],
          textColor: isDarkMode ? "#FFFFFF" : "#DC2626",
        };
      default:
        return {
          text: label || "Event",
          colors: isDarkMode
            ? ["rgba(245, 158, 11, 0.8)", "rgba(234, 88, 12, 0.8)"]
            : ["rgba(245, 158, 11, 0.2)", "rgba(234, 88, 12, 0.2)"],
          textColor: isDarkMode ? "#FFFFFF" : "#EA580C",
        };
    }
  };

  const { text, colors, textColor } = getBadgeContent();

  return (
    <View style={[styles.badgeContainer, style]}>
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badgeGradient}
      >
        <Text
          style={[
            styles.badgeText,
            { color: textColor },
            type === "date" && styles.dateText,
            textStyle,
          ]}
          numberOfLines={1}
        >
          <Translate>{text}</Translate>
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    marginRight: SPACING.XS,
    marginBottom: SPACING.XS,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
  },
  badgeGradient: {
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS / 2,
    borderRadius: BORDER_RADIUS.M,
  },
  badgeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
  },
  dateText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS - 1,
  },
});

export default StatusBadge;
