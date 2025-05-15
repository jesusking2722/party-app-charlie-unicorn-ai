import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
} from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

// Simplified button variants
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  small = false,
  style = {},
  textStyle = {},
}) => {
  const { isDarkMode } = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Get gradient colors based on variant and theme
  const getGradientColors = () => {
    if (disabled) return GRADIENTS.DISABLED;

    switch (variant) {
      case "primary":
        return GRADIENTS.PRIMARY;
      case "secondary":
        // Custom secondary gradient for light theme
        if (!isDarkMode) {
          return ["#FF0099", "#FF6D00"]; // Custom secondary gradient for light theme
        }
        return GRADIENTS.SECONDARY;
      default:
        return GRADIENTS.PRIMARY;
    }
  };

  // Get text color based on variant and theme
  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return isDarkMode
          ? COLORS.DARK_TEXT_PRIMARY
          : COLORS.LIGHT_TEXT_PRIMARY;
      default:
        return COLORS.WHITE;
    }
  };

  // Get border color for outlined buttons
  const getBorderColor = () => {
    return isDarkMode ? COLORS.DARK_BORDER : COLORS.LIGHT_BORDER;
  };

  // Determine if we should show gradient
  const shouldShowGradient = () => {
    return !["outline", "ghost"].includes(variant);
  };

  // Handle press animations
  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle the onPress event with animation
  const handlePress = () => {
    // Add a slight delay to make the animation visible
    setTimeout(() => {
      onPress();
    }, 100);
  };

  // Render button content (text and/or loading indicator)
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} size="small" />;
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

  // Button with gradient background
  if (shouldShowGradient()) {
    return (
      <Animated.View
        style={[
          styles.shadowContainer,
          small && styles.smallShadow,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Pressable
          style={[
            styles.button,
            small && styles.smallButton,
            disabled && styles.disabledButton,
            style,
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
        >
          <LinearGradient
            colors={getGradientColors() as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Non-gradient buttons (outline, ghost)
  const buttonStyle: ViewStyle =
    variant === "outline"
      ? { ...styles.outlineButton, borderColor: getBorderColor() }
      : styles.ghostButton;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        width: "100%",
      }}
    >
      <Pressable
        style={[
          styles.button,
          buttonStyle,
          small && styles.smallButton,
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    ...SHADOWS.MEDIUM,
  },
  smallShadow: {
    ...SHADOWS.SMALL,
  },
  button: {
    borderRadius: BORDER_RADIUS.L,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
    fontSize: FONT_SIZES.XS,
  },
  smallButton: {
    height: 40,
    borderRadius: BORDER_RADIUS.M,
    fontSize: FONT_SIZES.XS,
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
    fontSize: FONT_SIZES.XS,
    fontWeight: "600",
    fontFamily: FONTS.SEMIBOLD,
  },
  smallButtonText: {
    fontSize: FONT_SIZES.XS,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
