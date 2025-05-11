import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  THEME,
} from "@/app/theme";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  animated?: boolean;
  variant?: "standard" | "filled" | "outlined" | "glass" | "frosted";
  isDark?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  isPassword = false,
  keyboardType = "default",
  autoCapitalize = "none",
  containerStyle,
  labelStyle,
  inputStyle,
  error,
  icon,
  iconPosition = "right",
  animated = true,
  variant = "standard",
  isDark: forceDark,
  onFocus,
  onBlur,
  ...restProps
}) => {
  const colorScheme = useColorScheme();
  const isDark = forceDark !== undefined ? forceDark : colorScheme === "dark";

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelPositionAnim = useRef(new Animated.Value(0)).current;
  const labelSizeAnim = useRef(new Animated.Value(0)).current;

  // Derived animated values
  const inputBorderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const inputBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? COLORS.DARK_BORDER : COLORS.LIGHT_BORDER,
      isDark ? COLORS.ACCENT_PURPLE_LIGHT : COLORS.PRIMARY,
    ],
  });

  const accentOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2],
  });

  // Animation for mounting
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.MEDIUM,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 2,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, []);

  // Handle focus state animations
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();

    if (animated) {
      Animated.parallel([
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: ANIMATIONS.FAST,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          speed: 20,
          bounciness: 2,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();

    if (animated) {
      Animated.parallel([
        Animated.timing(focusAnim, {
          toValue: 0,
          duration: ANIMATIONS.FAST,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 20,
          bounciness: 2,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const toggleVisibility = (): void => {
    setIsVisible(!isVisible);
  };

  // Get the placeholder text color based on theme
  const getPlaceholderColor = () => {
    return isDark
      ? THEME.DARK.PLACEHOLDER_COLOR
      : THEME.LIGHT.PLACEHOLDER_COLOR;
  };

  // Get input background color based on variant and theme
  const getInputBackgroundColor = () => {
    switch (variant) {
      case "filled":
        return isDark ? COLORS.DARK_INPUT : COLORS.LIGHT_INPUT;
      case "outlined":
        return "transparent";
      case "glass":
        return isDark ? "rgba(31, 41, 55, 0.3)" : "rgba(255, 255, 255, 0.2)";
      case "frosted":
        return isDark ? "rgba(31, 41, 55, 0.01)" : "rgba(255, 255, 255, 0.01)";
      default:
        return isDark ? COLORS.INPUT_BG_DARK : COLORS.INPUT_BG_LIGHT;
    }
  };

  // Get text color based on theme
  const getTextColor = () => {
    return isDark ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;
  };

  // Get label color based on theme
  const getLabelColor = () => {
    return isDark ? COLORS.DARK_TEXT_SECONDARY : COLORS.LIGHT_TEXT_SECONDARY;
  };

  // Get border style based on variant
  const getBorderStyle = () => {
    if (variant === "outlined") {
      return {
        borderWidth: 1,
        borderColor: isDark ? COLORS.DARK_BORDER : COLORS.LIGHT_BORDER,
      };
    }
    return {};
  };

  const renderInput = () => {
    const inputWrapperStyle = [
      styles.inputWrapper,
      getBorderStyle(),
      {
        backgroundColor: getInputBackgroundColor(),
        borderRadius:
          variant === "frosted" || variant === "glass"
            ? BORDER_RADIUS.XL
            : BORDER_RADIUS.L,
      },
      error && styles.inputWrapperError,
      isFocused && styles.inputWrapperFocused,
    ];

    const inputContent = (
      <>
        {iconPosition === "left" && icon && (
          <View style={styles.iconContainer}>{icon}</View>
        )}

        <TextInput
          style={[styles.input, { color: getTextColor() }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={getPlaceholderColor()}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !isVisible : secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...restProps}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={toggleVisibility}
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          >
            <View
              style={[
                styles.eyeIconCircle,
                {
                  backgroundColor: isDark
                    ? "rgba(55, 65, 81, 0.7)"
                    : "rgba(247, 249, 252, 0.7)",
                },
                isVisible && styles.eyeIconActive,
              ]}
            >
              <FontAwesome
                name={isVisible ? "eye" : "eye-slash"}
                size={16}
                color={
                  isDark
                    ? COLORS.DARK_TEXT_SECONDARY
                    : COLORS.LIGHT_TEXT_SECONDARY
                }
              />
            </View>
          </TouchableOpacity>
        )}

        {iconPosition === "right" && icon && !isPassword && (
          <View style={styles.iconContainer}>{icon}</View>
        )}

        {/* Animated accent line when focused */}
        {variant !== "outlined" && variant !== "frosted" && (
          <Animated.View
            style={[
              styles.focusIndicator,
              {
                opacity: accentOpacity,
                backgroundColor: isDark
                  ? COLORS.ACCENT_PURPLE_LIGHT
                  : COLORS.PRIMARY,
              },
            ]}
          />
        )}
      </>
    );

    // For frosted glass effect, wrap with BlurView
    if (variant === "frosted" && Platform.OS !== "web") {
      return (
        <Animated.View
          style={[
            inputWrapperStyle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
              overflow: "hidden",
            },
          ]}
        >
          <BlurView
            intensity={isDark ? 40 : 30}
            tint={isDark ? "dark" : "light"}
            style={styles.blurContainer}
          >
            {inputContent}
          </BlurView>
        </Animated.View>
      );
    }

    // For standard, filled, outlined, and glass variants
    return (
      <Animated.View
        style={[
          inputWrapperStyle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {inputContent}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text
          style={[styles.inputLabel, { color: getLabelColor() }, labelStyle]}
        >
          {label}
        </Text>
      )}

      {renderInput()}

      {error && (
        <Text style={[styles.errorText, { color: COLORS.ERROR }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: SPACING.M,
    width: "100%",
  },
  inputLabel: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
    marginBottom: SPACING.XS,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    position: "relative",
    overflow: "hidden",
  },
  blurContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  inputWrapperError: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  inputWrapperFocused: {
    // Styles applied when input is focused
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: SPACING.M,
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.REGULAR,
  },
  iconContainer: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIconActive: {
    opacity: 0.9,
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
    fontFamily: FONTS.REGULAR,
  },
  focusIndicator: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 4,
    height: "100%",
    borderTopRightRadius: BORDER_RADIUS.S,
    borderBottomRightRadius: BORDER_RADIUS.S,
  },
});

export default Input;
