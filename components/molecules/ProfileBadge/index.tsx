import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import {
  BORDER_RADIUS,
  FONTS,
  FONT_SIZES,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Translate } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";

// Badge type definitions
export type BadgeType =
  | "premium"
  | "verified"
  | "new"
  | "featured"
  | "popular"
  | "pro"
  | "elite"
  | "trending";

// Modern gradient color schemes with better readability and softer tones
const MODERN_BADGE_GRADIENTS = {
  LIGHT: {
    premium: {
      text: "#FFFFFF",
      gradient: ["#EC4899", "#8B5CF6"], // Premium Pink to Indigo
      shadowColor: "#EC4899",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "crown",
    },
    verified: {
      text: "#FFFFFF",
      gradient: ["#10B981", "#059669"], // Clean Green tones
      shadowColor: "#10B981",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "shield-alt",
    },
    new: {
      text: "#FFFFFF",
      gradient: ["#3B82F6", "#1D4ED8"], // Clear Blue gradient
      shadowColor: "#3B82F6",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "sparkles",
    },
    featured: {
      text: "#FFFFFF",
      gradient: ["#F59E0B", "#D97706"], // Warm Amber tones
      shadowColor: "#F59E0B",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "gem",
    },
    popular: {
      text: "#FFFFFF",
      gradient: ["#EF4444", "#DC2626"], // Clean Red gradient
      shadowColor: "#EF4444",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "fire",
    },
    pro: {
      text: "#FFFFFF",
      gradient: ["#8B5CF6", "#7C3AED"], // Soft Purple gradient
      shadowColor: "#8B5CF6",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "rocket",
    },
    elite: {
      text: "#FFFFFF",
      gradient: ["#1F2937", "#374151"], // Dark Gray gradient
      shadowColor: "#1F2937",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "trophy",
    },
    trending: {
      text: "#FFFFFF",
      gradient: ["#EC4899", "#BE185D"], // Clean Pink gradient
      shadowColor: "#EC4899",
      glassOverlay: "rgba(255, 255, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      icon: "chart-line",
    },
  },
  DARK: {
    premium: {
      text: "#FFFFFF",
      gradient: ["#F472B6", "#A78BFA"], // Bright Premium Pink to Indigo
      shadowColor: "#F472B6",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "crown",
    },
    verified: {
      text: "#FFFFFF",
      gradient: ["#34D399", "#10B981"], // Brighter Green for dark mode
      shadowColor: "#34D399",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "shield-alt",
    },
    new: {
      text: "#FFFFFF",
      gradient: ["#60A5FA", "#3B82F6"], // Brighter Blue for dark mode
      shadowColor: "#60A5FA",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "sparkles",
    },
    featured: {
      text: "#FFFFFF",
      gradient: ["#FBBF24", "#F59E0B"], // Brighter Amber for dark mode
      shadowColor: "#FBBF24",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "gem",
    },
    popular: {
      text: "#FFFFFF",
      gradient: ["#F87171", "#EF4444"], // Softer Red for dark mode
      shadowColor: "#F87171",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "fire",
    },
    pro: {
      text: "#FFFFFF",
      gradient: ["#A78BFA", "#8B5CF6"], // Consistent Purple in dark mode
      shadowColor: "#A78BFA",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "rocket",
    },
    elite: {
      text: "#FFFFFF",
      gradient: ["#4B5563", "#6B7280"], // Lighter Gray for dark mode visibility
      shadowColor: "#4B5563",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "trophy",
    },
    trending: {
      text: "#FFFFFF",
      gradient: ["#F472B6", "#EC4899"], // Softer Pink for dark mode
      shadowColor: "#F472B6",
      glassOverlay: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      icon: "chart-line",
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
   * @default 11
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

  /**
   * Enable subtle pulse animation
   * @default false
   */
  animated?: boolean;

  /**
   * Size variant for the badge
   * @default "medium"
   */
  size?: "small" | "medium" | "large";
};

/**
 * A modern badge component with glassmorphism effects, contemporary gradients,
 * and optional animations for a premium feel
 */
const Badge = ({
  type,
  label,
  iconSize,
  customIcon,
  style,
  animated = false,
  size = "medium",
}: BadgeProps) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "DARK" : "LIGHT";
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      paddingHorizontal: SPACING.XS,
      paddingVertical: SPACING.XS / 2,
      fontSize: FONT_SIZES.XS - 1,
      iconSize: iconSize || 9,
      borderRadius: BORDER_RADIUS.S,
    },
    medium: {
      paddingHorizontal: SPACING.S,
      paddingVertical: SPACING.XS,
      fontSize: FONT_SIZES.XS,
      iconSize: iconSize || 11,
      borderRadius: BORDER_RADIUS.M,
    },
    large: {
      paddingHorizontal: SPACING.M,
      paddingVertical: SPACING.S,
      fontSize: FONT_SIZES.S,
      iconSize: iconSize || 14,
      borderRadius: BORDER_RADIUS.L,
    },
  };

  const currentSize = sizeConfig[size];

  // Get the badge configuration based on type and theme
  const badgeConfig = MODERN_BADGE_GRADIENTS[theme][type];

  // Use custom label or capitalize the type name
  const displayLabel = label || type.charAt(0).toUpperCase() + type.slice(1);

  // Use custom icon or the default icon for the badge type
  const iconName = customIcon || badgeConfig.icon;

  // Pulse animation effect
  useEffect(() => {
    if (animated) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }
  }, [animated, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        {
          borderRadius: currentSize.borderRadius,
          transform: animated ? [{ scale: pulseAnim }] : [],
        },
        style,
      ]}
    >
      {/* Shadow Layer */}
      <View
        style={[
          styles.shadowLayer,
          {
            borderRadius: currentSize.borderRadius,
            shadowColor: badgeConfig.shadowColor,
            backgroundColor: badgeConfig.shadowColor + "20",
          },
        ]}
      />

      {/* Main Gradient Background */}
      <LinearGradient
        colors={badgeConfig.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradientBackground,
          {
            borderRadius: currentSize.borderRadius,
            paddingHorizontal: currentSize.paddingHorizontal,
            paddingVertical: currentSize.paddingVertical,
          },
        ]}
      >
        {/* Glassmorphism Overlay */}
        <View
          style={[
            styles.glassOverlay,
            {
              backgroundColor: badgeConfig.glassOverlay,
              borderColor: badgeConfig.borderColor,
              borderRadius: currentSize.borderRadius,
            },
          ]}
        />

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {iconName && (
            <FontAwesome5
              name={iconName}
              size={currentSize.iconSize}
              color={badgeConfig.text}
              style={[
                styles.icon,
                {
                  marginRight: displayLabel ? SPACING.XS : 0,
                },
              ]}
            />
          )}
          {displayLabel && (
            <Text
              style={[
                styles.text,
                {
                  color: badgeConfig.text,
                  fontSize: currentSize.fontSize,
                },
              ]}
            >
              <Translate>{displayLabel}</Translate>
            </Text>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: "relative",
    marginRight: SPACING.XS,
    overflow: "visible",
  },
  shadowLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    ...SHADOWS.MEDIUM,
  },
  gradientBackground: {
    position: "relative",
    overflow: "hidden",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  icon: {
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  text: {
    fontFamily: FONTS.SEMIBOLD,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
});

export default Badge;
