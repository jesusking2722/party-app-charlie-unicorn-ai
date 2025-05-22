import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BORDER_RADIUS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Translate } from "@/components/common";

// Badge type definitions
export type BadgeType = "premium" | "verified" | "new" | "featured" | "popular";

// Gradient color schemes for different badge types
const BADGE_GRADIENTS = {
  LIGHT: {
    premium: {
      text: "#FFFFFF",
      gradient: ["#FF0099", "#7F00FF"], // Pink to Indigo
      icon: "crown",
    },
    verified: {
      text: "#FFFFFF",
      gradient: ["#00D89E", "#00A1E4"], // Green to Blue
      icon: "id-badge",
    },
    new: {
      text: "#FFFFFF",
      gradient: ["#10B981", "#059669"], // Green shades
      icon: "star",
    },
    featured: {
      text: "#FFFFFF",
      gradient: ["#F59E0B", "#D97706"], // Amber shades
      icon: "certificate",
    },
    popular: {
      text: "#FFFFFF",
      gradient: ["#EF4444", "#B91C1C"], // Red shades
      icon: "fire",
    },
  },
  DARK: {
    premium: {
      text: "#FFFFFF",
      gradient: ["#BD00FF", "#4F00BC"], // Brighter Pink to Deeper Purple
      icon: "crown",
    },
    verified: {
      text: "#FFFFFF",
      gradient: ["#00E5B0", "#0087D0"], // Brighter Green to Deeper Blue
      icon: "id-badge",
    },
    new: {
      text: "#FFFFFF",
      gradient: ["#00E170", "#00A050"], // Bright Green shades
      icon: "star",
    },
    featured: {
      text: "#FFFFFF",
      gradient: ["#FFC107", "#FF8C00"], // Bright Amber to Orange
      icon: "certificate",
    },
    popular: {
      text: "#FFFFFF",
      gradient: ["#FF4D4D", "#C11F1F"], // Bright Red shades
      icon: "fire",
    },
  },
};

type BadgeProps = {
  /**
   * The type of badge to display, which determines colors and icon
   */
  type: BadgeType;

  /**
   * Optional custom label (if not provided, the type name will be capitalized and used)
   */
  label?: string;

  /**
   * Optional size override for the icon
   * @default 12
   */
  iconSize?: number;

  /**
   * Optional custom icon to override the default for the badge type
   */
  customIcon?: string;

  /**
   * Optional style override for the badge container
   */
  style?: object;
};

/**
 * A badge component with vibrant gradient backgrounds for different badge types
 * and automatic dark/light mode switching
 */
const Badge = ({
  type,
  label,
  iconSize = 12,
  customIcon,
  style,
}: BadgeProps) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "DARK" : "LIGHT";

  // Get the badge configuration based on type and theme
  const badgeConfig = BADGE_GRADIENTS[theme][type];

  // Use custom label or capitalize the type name
  const displayLabel = label || type.charAt(0).toUpperCase() + type.slice(1);

  // Use custom icon or the default icon for the badge type
  const iconName = customIcon || badgeConfig.icon;

  return (
    <View style={[styles.badgeContainer, style]}>
      <LinearGradient
        colors={badgeConfig.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      >
        <FontAwesome5
          name={iconName}
          size={iconSize}
          color={badgeConfig.text}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: badgeConfig.text }]}>
          <Translate>{displayLabel}</Translate>
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    marginRight: SPACING.XS,
  },
  gradientBackground: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
  },
  icon: {
    marginRight: SPACING.XS,
  },
  text: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
});

export default Badge;
