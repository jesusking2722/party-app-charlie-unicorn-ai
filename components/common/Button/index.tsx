import { FONTS } from "@/app/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  ColorValue,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

// Extended button variants including new modern designs
type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "ghost"
  | "glass"
  | "google"
  | "apple"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "dark"
  | "neomorphic";

// Expanded props interface
interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  pill?: boolean; // For rounded pill-shaped buttons
  small?: boolean; // For smaller buttons
  elevated?: boolean; // For shadow effect
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  pill = false,
  small = false,
  elevated = false,
  style = {},
  textStyle = {},
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  ...restProps
}) => {
  // ===== THEME COLOR PALETTES =====

  // Default gradient colors (purple-pink)
  const primaryGradientColors: readonly [ColorValue, ColorValue] = [
    "#FF0099",
    "#7F00FF",
  ];

  // Teal to blue gradient
  const secondaryGradientColors: readonly [ColorValue, ColorValue] = [
    "#0EA5E9",
    "#2563EB",
  ];

  // Vibrant orange to red
  const accentGradientColors: readonly [ColorValue, ColorValue] = [
    "#F59E0B",
    "#EF4444",
  ];

  // Success gradient (green to teal)
  const successGradientColors: readonly [ColorValue, ColorValue] = [
    "#10B981",
    "#059669",
  ];

  // Danger gradient (red to crimson)
  const dangerGradientColors: readonly [ColorValue, ColorValue] = [
    "#F87171",
    "#DC2626",
  ];

  // Warning gradient (yellow to orange)
  const warningGradientColors: readonly [ColorValue, ColorValue] = [
    "#FBBF24",
    "#F59E0B",
  ];

  // Info gradient (light blue to indigo)
  const infoGradientColors: readonly [ColorValue, ColorValue] = [
    "#60A5FA",
    "#4F46E5",
  ];

  // Dark gradient (dark gray to black)
  const darkGradientColors: readonly [ColorValue, ColorValue] = [
    "#374151",
    "#111827",
  ];

  // Google brand colors
  const googleGradientColors: readonly [ColorValue, ColorValue] = [
    "#4285F4",
    "#34A853",
  ];

  // Apple colors (dark mode)
  const appleGradientColors: readonly [ColorValue, ColorValue] = [
    "#333333",
    "#000000",
  ];

  // Disabled state color
  const disabledGradientColors: readonly [ColorValue, ColorValue] = [
    "#9CA3AF",
    "#6B7280",
  ];

  // Glass effect color
  const glassGradientColors: readonly [ColorValue, ColorValue] = [
    "rgba(255, 255, 255, 0.2)",
    "rgba(255, 255, 255, 0.1)",
  ];

  // Determine which colors to use based on variant and state
  const getGradientColors = () => {
    if (disabled) return disabledGradientColors;
    if (gradientColors) return gradientColors;

    switch (variant) {
      case "primary":
        return primaryGradientColors;
      case "secondary":
        return secondaryGradientColors;
      case "accent":
        return accentGradientColors;
      case "success":
        return successGradientColors;
      case "danger":
        return dangerGradientColors;
      case "warning":
        return warningGradientColors;
      case "info":
        return infoGradientColors;
      case "dark":
        return darkGradientColors;
      case "google":
        return googleGradientColors;
      case "apple":
        return appleGradientColors;
      case "glass":
        return glassGradientColors;
      default:
        return primaryGradientColors;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return "#FFFFFF";
      case "warning":
        return "#1F2937"; // Dark text for light background
      default:
        return "#FFFFFF";
    }
  };

  // Determine if we should show gradient
  const shouldShowGradient = () => {
    return !["outline", "ghost", "neomorphic"].includes(variant);
  };

  // Render button content (text and/or loading indicator)
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={getTextColor()}
          size={small ? "small" : "small"}
        />
      );
    }

    return (
      <View style={styles.buttonContent}>
        {icon && iconPosition === "left" && (
          <View style={styles.iconLeftContainer}>{icon}</View>
        )}
        <Text
          style={[
            styles.buttonText,
            small && styles.smallButtonText,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && iconPosition === "right" && (
          <View style={styles.iconRightContainer}>{icon}</View>
        )}
      </View>
    );
  };

  // Button with gradient background
  if (shouldShowGradient()) {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          pill && styles.pillButton,
          small && styles.smallButton,
          elevated && styles.elevatedButton,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        {...restProps}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={gradientStart}
          end={gradientEnd}
          style={[styles.gradient, pill && styles.pillGradient]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Non-gradient buttons (outline, ghost, neomorphic)
  let buttonStyle: ViewStyle = {};

  switch (variant) {
    case "outline":
      buttonStyle = styles.outlineButton;
      break;
    case "ghost":
      buttonStyle = styles.ghostButton;
      break;
    case "neomorphic":
      buttonStyle = styles.neomorphicButton;
      break;
    default:
      buttonStyle = {};
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
        pill && styles.pillButton,
        small && styles.smallButton,
        elevated && variant !== "neomorphic" && styles.elevatedButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...restProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
  smallButton: {
    height: 40,
    borderRadius: 10,
  },
  pillButton: {
    borderRadius: 28, // Half of height 56px
  },
  pillGradient: {
    borderRadius: 28,
  },
  elevatedButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeftContainer: {
    marginRight: 8,
  },
  iconRightContainer: {
    marginLeft: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: FONTS.SEMIBOLD,
  },
  smallButtonText: {
    fontSize: 14,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  neomorphicButton: {
    backgroundColor: "#2A2D3E",
    borderWidth: 1,
    borderColor: "#333853",
    shadowColor: "#1E2132",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  googleButton: {
    backgroundColor: "#4285F4",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
