// theme.ts - Create this file to maintain consistent styling
import { ColorValue } from "react-native";

// Font constants
export const FONTS = {
  REGULAR: "Montserrat-Regular",
  MEDIUM: "Montserrat-Medium",
  SEMIBOLD: "Montserrat-SemiBold",
  BOLD: "Montserrat-Bold",
};

// Color palette
export const COLORS = {
  PRIMARY: "#7F00FF",
  SECONDARY: "#E100FF",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TRANSPARENT_WHITE: "rgba(255, 255, 255, 0.2)",
  TRANSPARENT_WHITE_BORDER: "rgba(255, 255, 255, 0.3)",
  ERROR: "rgba(255, 100, 100, 0.9)",
  DISABLED: "#888888",
};

// Gradient presets
export const GRADIENTS = {
  PRIMARY: ["#7F00FF", "#E100FF"] as readonly [ColorValue, ColorValue],
  SECONDARY: ["#FF0099", "#7F00FF"] as readonly [ColorValue, ColorValue],
  BUTTON: ["#FF0099", "#7F00FF"] as readonly [ColorValue, ColorValue],
  DISABLED: ["#888888", "#666666"] as readonly [ColorValue, ColorValue],
};

// Spacing
export const SPACING = {
  XS: 4,
  S: 8,
  M: 16,
  L: 24,
  XL: 32,
  XXL: 40,
};

// Border radius
export const BORDER_RADIUS = {
  S: 4,
  M: 8,
  L: 12,
  XL: 16,
  CIRCLE: 9999,
};

// Font sizes
export const FONT_SIZES = {
  XS: 12,
  S: 14,
  M: 16,
  L: 18,
  XL: 20,
  XXL: 24,
  XXXL: 28,
};

// Shadow styles
export const SHADOWS = {
  SMALL: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  MEDIUM: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  LARGE: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Theme colors
export const THEME = {
  LIGHT: {
    GRADIENT: ["#7F00FF", "#E100FF"] as [string, string],
    FAB_GRADIENT: ["#FF0099", "#FF6D00"] as [string, string],
    MUSIC_GRADIENT: ["#6366f1", "#2563eb"] as [string, string],
    CORPORATE_GRADIENT: ["#10b981", "#0d9488"] as [string, string],
    BIRTHDAY_GRADIENT: ["#ec4899", "#9333ea"] as [string, string],
    WEDDING_GRADIENT: ["#6366f1", "#2563eb"] as [string, string],
    SPORT_GRADIENT: ["#ef4444", "#e11d48"] as [string, string],
    DEFAULT_GRADIENT: ["#f59e0b", "#ea580c"] as [string, string],
    ACCENT_COLOR: "rgba(255, 0, 153, 0.4)",
    ACCENT_BG: "rgba(255, 0, 153, 0.2)",
    CARD_BG: "rgba(0, 0, 0, 0.15)",
    BUTTON_BG: "rgba(255, 255, 255, 0.15)",
    BORDER_COLOR: "rgba(255, 255, 255, 0.1)",
    TEXT_COLOR: "white",
    TEXT_SECONDARY: "rgba(255, 255, 255, 0.8)",
    FILTER_BG: "rgba(0, 0, 0, 0.15)",
  },
  DARK: {
    GRADIENT: ["#111827", "#1F2937"],
    FAB_GRADIENT: ["#4F46E5", "#7C3AED"],
    MUSIC_GRADIENT: ["#4338CA", "#3730A3"],
    CORPORATE_GRADIENT: ["#065F46", "#064E3B"],
    BIRTHDAY_GRADIENT: ["#9D174D", "#6D28D9"],
    WEDDING_GRADIENT: ["#4338CA", "#3730A3"],
    SPORT_GRADIENT: ["#991B1B", "#9F1239"],
    DEFAULT_GRADIENT: ["#B45309", "#C2410C"],
    ACCENT_COLOR: "rgba(79, 70, 229, 0.4)",
    ACCENT_BG: "rgba(79, 70, 229, 0.2)",
    CARD_BG: "rgba(17, 24, 39, 0.95)",
    BUTTON_BG: "rgba(55, 65, 81, 0.7)",
    BORDER_COLOR: "rgba(75, 85, 99, 0.3)",
    TEXT_COLOR: "#F3F4F6",
    TEXT_SECONDARY: "#D1D5DB",
    FILTER_BG: "rgba(31, 41, 55, 0.95)",
  },
};
