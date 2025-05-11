import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  FONTS,
  GRADIENTS,
  SHADOWS,
} from "@/app/theme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ColorValue,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
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
  | "indigo"
  | "neomorphic"
  | "frosted"; // New frosted glass variant

// Expanded props interface
interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title?: string;
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
  animated?: boolean; // Added to enable/disable animations
  isDark?: boolean; // Added for theme support
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
  elevated = true, // Default to elevated for more premium feel
  style = {},
  textStyle = {},
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 0 },
  animated = true,
  isDark = false,
  ...restProps
}) => {
  // Animation references
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;

  // Create derived animations for button press effect
  const buttonScale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  const shadowOpacity = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.1],
  });

  // Mount animation
  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: ANIMATIONS.FAST,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATIONS.FAST,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  // ===== THEME COLOR PALETTES =====

  // Default gradient colors (purple-pink) - use theme constants
  const primaryGradientColors = GRADIENTS.PRIMARY;

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
  const darkGradientColors = GRADIENTS.DARK_BG;

  // Indigo gradient (deep indigo to purple)
  const indigoGradientColors: readonly [ColorValue, ColorValue] = [
    "#4338CA",
    "#5B21B6",
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
  const disabledGradientColors = GRADIENTS.DISABLED;

  // Glass effect colors - using theme constants
  const glassGradientColors = isDark
    ? ["rgba(31, 41, 55, 0.6)", "rgba(31, 41, 55, 0.4)"]
    : ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.15)"];

  // Frosted glass effect colors
  const frostedGradientColors = isDark
    ? GRADIENTS.DARK_CARD
    : GRADIENTS.LIGHT_CARD;

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
      case "indigo":
        return indigoGradientColors;
      case "google":
        return googleGradientColors;
      case "apple":
        return appleGradientColors;
      case "glass":
        return glassGradientColors;
      case "frosted":
        return frostedGradientColors;
      default:
        return primaryGradientColors;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return isDark ? COLORS.DARK_TEXT_PRIMARY : COLORS.WHITE;
      case "warning":
        return "#1F2937"; // Dark text for light background
      case "frosted":
      case "glass":
        return isDark ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;
      default:
        return COLORS.WHITE;
    }
  };

  // Get border color for outlined buttons
  const getBorderColor = () => {
    return isDark ? COLORS.DARK_BORDER : COLORS.TRANSPARENT_WHITE_BORDER;
  };

  // Determine if we should show gradient
  const shouldShowGradient = () => {
    return !["outline", "ghost", "neomorphic"].includes(variant);
  };

  // Handle button press animations
  const handlePressIn = () => {
    if (animated) {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      Animated.spring(pressAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
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
            { color: getTextColor(), fontFamily: FONTS.SEMIBOLD },
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

  // Render the frosted glass effect button
  if (variant === "frosted" && Platform.OS !== "web") {
    return (
      <Animated.View
        style={[
          styles.button,
          pill && styles.pillButton,
          small && styles.smallButton,
          elevated && styles.premiumShadow,
          { transform: [{ scale: buttonScale }] },
          style,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.pressableContainer}
        >
          <BlurView
            intensity={isDark ? 30 : 50}
            tint={isDark ? "dark" : "light"}
            style={styles.blurContainer}
          >
            {renderContent()}
          </BlurView>
        </Pressable>
      </Animated.View>
    );
  }

  // Button with gradient background
  if (shouldShowGradient()) {
    return (
      <Animated.View
        style={[
          elevated &&
            (variant === "glass" ? styles.glassShadow : styles.premiumShadow),
          {
            transform: [{ scale: buttonScale }],
            opacity: opacityAnim,
            shadowOpacity: elevated ? shadowOpacity : 0,
          },
        ]}
      >
        <Pressable
          style={[
            styles.button,
            pill && styles.pillButton,
            small && styles.smallButton,
            style,
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: false }}
        >
          <LinearGradient
            colors={getGradientColors() as any}
            start={gradientStart}
            end={gradientEnd}
            style={[styles.gradient, pill && styles.pillGradient]}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Non-gradient buttons (outline, ghost, neomorphic)
  let buttonStyle: ViewStyle = {};

  switch (variant) {
    case "outline":
      buttonStyle = {
        ...styles.outlineButton,
        borderColor: getBorderColor(),
      };
      break;
    case "ghost":
      buttonStyle = styles.ghostButton;
      break;
    case "neomorphic":
      buttonStyle = isDark
        ? styles.neomorphicButtonDark
        : styles.neomorphicButtonLight;
      break;
    default:
      buttonStyle = {};
  }

  return (
    <Animated.View
      style={[
        elevated &&
          variant !== "ghost" &&
          (variant === "neomorphic" ? {} : styles.premiumShadow),
        {
          transform: [{ scale: buttonScale }],
          opacity: opacityAnim,
          shadowOpacity:
            elevated && variant !== "neomorphic" ? shadowOpacity : 0,
        },
      ]}
    >
      <Pressable
        style={[
          styles.button,
          buttonStyle,
          pill && styles.pillButton,
          small && styles.smallButton,
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        android_ripple={{
          color:
            variant === "outline" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          borderless: false,
        }}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.L,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
  pressableContainer: {
    width: "100%",
    height: "100%",
  },
  blurContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
  },
  smallButton: {
    height: 40,
    borderRadius: BORDER_RADIUS.M,
  },
  pillButton: {
    borderRadius: 28, // Half of height 56px
  },
  pillGradient: {
    borderRadius: 28,
  },
  premiumShadow: {
    ...SHADOWS.PREMIUM,
  },
  glassShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L,
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
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.M,
    fontWeight: "600",
    fontFamily: FONTS.SEMIBOLD,
  },
  smallButtonText: {
    fontSize: FONT_SIZES.S,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  neomorphicButtonLight: {
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: {
      width: -5,
      height: -5,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  neomorphicButtonDark: {
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
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
