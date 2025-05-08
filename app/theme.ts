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
