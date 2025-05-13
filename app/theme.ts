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

  // New colors for pickers and modals
  MODAL_BG_DARK: "#1F2937",
  MODAL_BG_LIGHT: "#7F00FF",
  INPUT_BG_DARK: "rgba(55, 65, 81, 0.7)",
  INPUT_BG_LIGHT: "rgba(255, 255, 255, 0.1)",

  // New colors for premium login design
  LIGHT_BG: "#F8F9FC",
  DARK_BG: "#111827",
  DARK_BG_SECONDARY: "#1F2937",
  LIGHT_INPUT: "rgba(247, 249, 252, 0.7)",
  DARK_INPUT: "rgba(55, 65, 81, 0.5)",
  LIGHT_TEXT_PRIMARY: "#333333",
  LIGHT_TEXT_SECONDARY: "#777777",
  DARK_TEXT_PRIMARY: "#F3F4F6",
  DARK_TEXT_SECONDARY: "#D1D5DB",
  DARK_BORDER: "rgba(75, 85, 99, 0.5)",
  LIGHT_BORDER: "rgba(230, 234, 240, 0.8)",
  LIGHT_CARD_GLASS: "rgba(255, 255, 255, 0.8)",
  DARK_CARD_GLASS: "rgba(31, 41, 55, 0.8)",
  ACCENT_PURPLE_LIGHT: "#A78BFA",
};

// Gradient presets
export const GRADIENTS = {
  PRIMARY: ["#7F00FF", "#E100FF"] as readonly [ColorValue, ColorValue],
  SECONDARY: ["#FF0099", "#7F00FF"] as readonly [ColorValue, ColorValue],
  BUTTON: ["#FF0099", "#7F00FF"] as readonly [ColorValue, ColorValue],
  DISABLED: ["#888888", "#666666"] as readonly [ColorValue, ColorValue],

  // New gradients
  MODAL_HEADER_LIGHT: ["#7F00FF", "#E100FF"] as readonly [
    ColorValue,
    ColorValue
  ],
  MODAL_HEADER_DARK: ["#111827", "#1F2937"] as readonly [
    ColorValue,
    ColorValue
  ],

  // New gradients for premium login design
  LIGHT_BG: ["#F7F9FC", "#EEF2F7"] as readonly [ColorValue, ColorValue],
  DARK_BG: ["#111827", "#1F2937"] as readonly [ColorValue, ColorValue],
  LIGHT_CARD: [
    "rgba(255, 255, 255, 0.85)",
    "rgba(255, 255, 255, 0.75)",
  ] as readonly [ColorValue, ColorValue],
  DARK_CARD: ["rgba(31, 41, 55, 0.75)", "rgba(17, 24, 39, 0.85)"] as readonly [
    ColorValue,
    ColorValue
  ],
  LIGHT_INPUT: [
    "rgba(247, 249, 252, 0.7)",
    "rgba(247, 249, 252, 0.7)",
  ] as readonly [ColorValue, ColorValue],
  DARK_INPUT: ["rgba(55, 65, 81, 0.5)", "rgba(55, 65, 81, 0.4)"] as readonly [
    ColorValue,
    ColorValue
  ],
  SOCIAL_BUTTON_DARK: [
    "rgba(55, 65, 81, 0.6)",
    "rgba(31, 41, 55, 0.6)",
  ] as readonly [ColorValue, ColorValue],
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
  XXL: 30, // New radius for login card
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
  HUGE: 36, // New size for app title
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
  // New premium shadow style
  PREMIUM: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
  },
};

// Animation timings
export const ANIMATIONS = {
  FAST: 200,
  MEDIUM: 400,
  SLOW: 700,
  VERY_SLOW: 1000,
  STAGGER_INTERVAL: 100,
};

// New blur effect constants
export const BLUR = {
  LIGHT: 10,
  MEDIUM: 20,
  HEAVY: 30,
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

    // Modal specific colors
    MODAL_BG: "#7F00FF",
    INPUT_BG: "rgba(255, 255, 255, 0.1)",
    PLACEHOLDER_COLOR: "rgba(255, 255, 255, 0.6)",

    // New login screen specific colors
    LOGIN_BG: "#F8F9FC",
    LOGIN_BG_PATTERN: "#F0F2F7",
    LOGIN_CARD_BG: "rgba(255, 255, 255, 0.8)",
    LOGIN_INPUT_BG: "rgba(247, 249, 252, 0.7)",
    LOGIN_INPUT_BORDER: "rgba(230, 234, 240, 0.8)",
    LOGIN_TEXT_PRIMARY: "#333333",
    LOGIN_TEXT_SECONDARY: "#777777",
    LOGIN_ACCENT: "#7F00FF",
    LOGIN_CARD_ACCENT: "rgba(127, 0, 255, 0.1)",
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

    // Modal specific colors
    MODAL_BG: "#1F2937",
    INPUT_BG: "rgba(55, 65, 81, 0.7)",
    PLACEHOLDER_COLOR: "rgba(255, 255, 255, 0.6)",

    // New login screen specific colors
    LOGIN_BG: "#111827",
    LOGIN_BG_PATTERN: "#2C3648",
    LOGIN_CARD_BG: "rgba(31, 41, 55, 0.8)",
    LOGIN_INPUT_BG: "rgba(55, 65, 81, 0.5)",
    LOGIN_INPUT_BORDER: "rgba(75, 85, 99, 0.5)",
    LOGIN_TEXT_PRIMARY: "#F3F4F6",
    LOGIN_TEXT_SECONDARY: "#D1D5DB",
    LOGIN_ACCENT: "#A78BFA",
    LOGIN_CARD_ACCENT: "rgba(127, 0, 255, 0.12)",
  },
};

export const NEW_LIGHT_THEME_GRADIENTS = {
  // These gradients match the party type options
  MUSIC_GRADIENT: ["#6366f1", "#2563eb"] as [string, string],
  NIGHTCLUB_GRADIENT: ["#8b5cf6", "#7c3aed"] as [string, string],
  PRIVATE_GRADIENT: ["#ec4899", "#db2777"] as [string, string],
  BEACH_GRADIENT: ["#34d399", "#10b981"] as [string, string],
  CORPORATE_GRADIENT: ["#10b981", "#059669"] as [string, string],
  BIRTHDAY_GRADIENT: ["#ec4899", "#9333ea"] as [string, string],
  WEDDING_GRADIENT: ["#6366f1", "#2563eb"] as [string, string],
  SPORT_GRADIENT: ["#ef4444", "#dc2626"] as [string, string],
  DEFAULT_GRADIENT: ["#f59e0b", "#ea580c"] as [string, string],

  // Status gradients
  ACTIVE_GRADIENT: ["#10b981", "#059669"] as [string, string],
  CANCELLED_GRADIENT: ["#ef4444", "#dc2626"] as [string, string],
  FINISHED_GRADIENT: ["#6366f1", "#4f46e5"] as [string, string],

  // Payment gradients
  FREE_GRADIENT: ["#10b981", "#059669"] as [string, string],
  PAID_GRADIENT: ["#f59e0b", "#d97706"] as [string, string],

  // Badge background gradients (for light mode)
  BADGE_BG_LIGHT: ["rgba(229, 231, 235, 0.8)", "rgba(243, 244, 246, 0.8)"] as [
    string,
    string
  ],

  // Pagination gradients
  PAGINATION_ACTIVE: ["#7F00FF", "#E100FF"] as [string, string],
  PAGINATION_INACTIVE: [
    "rgba(229, 231, 235, 0.8)",
    "rgba(243, 244, 246, 0.8)",
  ] as [string, string],
};

// Add these new gradient colors to THEME.DARK
export const NEW_DARK_THEME_GRADIENTS = {
  // These gradients match the party type options
  MUSIC_GRADIENT: ["#4338ca", "#3730a3"] as [string, string],
  NIGHTCLUB_GRADIENT: ["#7c3aed", "#6d28d9"] as [string, string],
  PRIVATE_GRADIENT: ["#db2777", "#be185d"] as [string, string],
  BEACH_GRADIENT: ["#10b981", "#059669"] as [string, string],
  CORPORATE_GRADIENT: ["#059669", "#047857"] as [string, string],
  BIRTHDAY_GRADIENT: ["#be185d", "#6d28d9"] as [string, string],
  WEDDING_GRADIENT: ["#4338ca", "#3730a3"] as [string, string],
  SPORT_GRADIENT: ["#dc2626", "#b91c1c"] as [string, string],
  DEFAULT_GRADIENT: ["#d97706", "#b45309"] as [string, string],

  // Status gradients
  ACTIVE_GRADIENT: ["#059669", "#047857"] as [string, string],
  CANCELLED_GRADIENT: ["#dc2626", "#b91c1c"] as [string, string],
  FINISHED_GRADIENT: ["#4f46e5", "#4338ca"] as [string, string],

  // Payment gradients
  FREE_GRADIENT: ["#059669", "#047857"] as [string, string],
  PAID_GRADIENT: ["#d97706", "#b45309"] as [string, string],

  // Badge background gradients (for dark mode)
  BADGE_BG_DARK: ["rgba(31, 41, 55, 0.8)", "rgba(55, 65, 81, 0.8)"] as [
    string,
    string
  ],

  // Pagination gradients
  PAGINATION_ACTIVE: ["#4F46E5", "#7C3AED"] as [string, string],
  PAGINATION_INACTIVE: ["rgba(31, 41, 55, 0.8)", "rgba(55, 65, 81, 0.8)"] as [
    string,
    string
  ],
};

// Add these new color variations for badges in light mode
export const NEW_LIGHT_THEME_COLORS = {
  // Badge text colors for light mode
  BADGE_TEXT_MUSIC: "#4f46e5",
  BADGE_TEXT_NIGHTCLUB: "#7c3aed",
  BADGE_TEXT_PRIVATE: "#db2777",
  BADGE_TEXT_BEACH: "#10b981",
  BADGE_TEXT_CORPORATE: "#059669",
  BADGE_TEXT_BIRTHDAY: "#ec4899",
  BADGE_TEXT_WEDDING: "#4f46e5",
  BADGE_TEXT_SPORT: "#dc2626",
  BADGE_TEXT_DEFAULT: "#ea580c",

  // Status text colors
  BADGE_TEXT_ACTIVE: "#059669",
  BADGE_TEXT_CANCELLED: "#dc2626",
  BADGE_TEXT_FINISHED: "#4f46e5",

  // Payment text colors
  BADGE_TEXT_FREE: "#059669",
  BADGE_TEXT_PAID: "#d97706",

  // Filter related colors
  FILTER_EXPANDED_BG: "rgba(255, 0, 153, 0.2)",
  FILTER_COLLAPSED_BG: "rgba(0, 0, 0, 0.05)",
  FILTER_CONTAINER_BG: "rgba(255, 255, 255, 0.8)",
  FILTER_CONTAINER_BORDER: "rgba(0, 0, 0, 0.05)",

  // List related colors
  LIST_EMPTY_ICON: "rgba(0, 0, 0, 0.2)",
};

// Add these new color variations for badges in dark mode
export const NEW_DARK_THEME_COLORS = {
  // Badge text colors for dark mode are generally white
  BADGE_TEXT_COLOR: "#FFFFFF",

  // Filter related colors
  FILTER_EXPANDED_BG: "rgba(127, 0, 255, 0.3)",
  FILTER_COLLAPSED_BG: "rgba(55, 65, 81, 0.7)",
  FILTER_CONTAINER_BG: "rgba(31, 41, 55, 0.8)",
  FILTER_CONTAINER_BORDER: "rgba(75, 85, 99, 0.3)",

  // List related colors
  LIST_EMPTY_ICON: "rgba(255, 255, 255, 0.2)",
};

export const EVENT_PREVIEW = {
  LIGHT: {
    PROGRESS_BG: "rgba(229, 231, 235, 0.3)",
    PROGRESS_FILL: ["#10b981", "#059669"],
    PROFILE_CARD_BG: "rgba(255, 255, 255, 0.8)",
    PROFILE_CARD_BORDER: "rgba(229, 231, 235, 0.8)",
    TAB_INACTIVE: "rgba(107, 114, 128, 0.2)",
    TAB_ACTIVE_BG: ["#7F00FF", "#E100FF"],
    TAB_ACTIVE_TEXT: "#FFFFFF",
    TAB_INDICATOR: "#7F00FF",
    APPLY_BUTTON_BG: ["#FF0099", "#7F00FF"],
    APPLY_TEXTAREA_BG: "rgba(255, 255, 255, 0.8)",
    MEDIA_OVERLAY: "rgba(0, 0, 0, 0.3)",
    STEPPER_BG: "rgba(255, 255, 255, 0.1)",
    STEPPER_ACTIVE: ["#7F00FF", "#E100FF"],
    STEPPER_COMPLETED: ["rgba(127, 0, 255, 0.6)", "rgba(225, 0, 255, 0.6)"],
    VERIFIED_BADGE: ["#10b981", "#059669"],
    PREMIUM_BADGE: ["#f59e0b", "#d97706"],
    RATING_STAR_FILLED: "#f59e0b",
    RATING_STAR_EMPTY: "rgba(245, 158, 11, 0.3)",
  },
  DARK: {
    PROGRESS_BG: "rgba(31, 41, 55, 0.3)",
    PROGRESS_FILL: ["#059669", "#047857"],
    PROFILE_CARD_BG: "rgba(31, 41, 55, 0.8)",
    PROFILE_CARD_BORDER: "rgba(55, 65, 81, 0.8)",
    TAB_INACTIVE: "rgba(156, 163, 175, 0.2)",
    TAB_ACTIVE_BG: ["#4F46E5", "#7C3AED"],
    TAB_ACTIVE_TEXT: "#FFFFFF",
    TAB_INDICATOR: "#4F46E5",
    APPLY_BUTTON_BG: ["#4F46E5", "#7C3AED"],
    APPLY_TEXTAREA_BG: "rgba(55, 65, 81, 0.5)",
    MEDIA_OVERLAY: "rgba(0, 0, 0, 0.5)",
    STEPPER_BG: "rgba(31, 41, 55, 0.3)",
    STEPPER_ACTIVE: ["#4F46E5", "#7C3AED"],
    STEPPER_COMPLETED: ["rgba(79, 70, 229, 0.6)", "rgba(124, 58, 237, 0.6)"],
    VERIFIED_BADGE: ["#059669", "#047857"],
    PREMIUM_BADGE: ["#d97706", "#b45309"],
    RATING_STAR_FILLED: "#f59e0b",
    RATING_STAR_EMPTY: "rgba(245, 158, 11, 0.2)",
  },
};
