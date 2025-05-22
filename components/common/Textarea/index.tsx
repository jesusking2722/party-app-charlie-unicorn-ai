import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Translate from "../Translate";
import { useTranslator } from "@/contexts/TranslatorContext";

interface TextAreaProps extends Omit<TextInputProps, "style"> {
  label?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  textAreaStyle?: TextStyle;
  error?: string;
  minHeight?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder = "Type your message here...",
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  containerStyle,
  labelStyle,
  textAreaStyle,
  error,
  minHeight = 120,
  maxLength,
  showCharCount = false,
  ...restProps
}) => {
  const { isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [translattedPlaceholder, setTranslattedPlaceholder] =
    useState<string>("");

  const { translateText } = useTranslator();

  // Animation for error text
  const fadeAnim = useRef(new Animated.Value(error ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(error ? 0 : 20)).current;

  // Custom light theme accent color (matching the Input component)
  const LIGHT_THEME_ACCENT = "#FF0099";

  // Theme-based styles
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;
  const getPlaceholderColor = () =>
    isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.35)";
  const getLabelColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;
  const getBackgroundColor = () =>
    isDarkMode
      ? isFocused
        ? "rgba(40, 45, 55, 0.65)"
        : "rgba(30, 35, 45, 0.5)"
      : isFocused
      ? "rgba(255, 255, 255, 0.65)"
      : "rgba(255, 255, 255, 0.5)";
  const getBorderColor = () =>
    isDarkMode
      ? isFocused
        ? COLORS.SECONDARY
        : "rgba(255, 255, 255, 0.1)"
      : isFocused
      ? LIGHT_THEME_ACCENT
      : "rgba(0, 0, 0, 0.05)";
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;
  const getCharCountColor = () => {
    if (remainingChars !== null && remainingChars < 20) {
      return COLORS.ERROR;
    }
    return isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)";
  };
  const getCharCountBgColor = () =>
    isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)";

  // Update animation when error state changes
  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  // Calculate remaining characters
  const remainingChars = maxLength ? maxLength - (value?.length || 0) : null;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    const translatePlaceholder = async () => {
      if (!placeholder) return;
      const translatted = await translateText(placeholder);
      setTranslattedPlaceholder(translatted);
    };

    translatePlaceholder();
  }, [placeholder]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: getLabelColor() }, labelStyle]}>
          <Translate>{label}</Translate>
        </Text>
      )}

      <View
        style={[
          styles.textAreaWrapper,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 1 : 0.5,
            minHeight,
          },
          error && styles.textAreaWrapperError,
        ]}
      >
        <TextInput
          style={[
            styles.textArea,
            {
              color: getTextColor(),
              minHeight: minHeight - SPACING.M * 2, // Account for padding
            },
            textAreaStyle,
          ]}
          placeholder={translattedPlaceholder}
          placeholderTextColor={getPlaceholderColor()}
          value={value}
          onChangeText={onChangeText}
          multiline
          textAlignVertical="top"
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...restProps}
        />

        {showCharCount && maxLength && (
          <View
            style={[
              styles.charCountContainer,
              { backgroundColor: getCharCountBgColor() },
            ]}
          >
            <Text
              style={[styles.charCountText, { color: getCharCountColor() }]}
            >
              {remainingChars}
            </Text>
          </View>
        )}

        {/* Accent indicator for focused state */}
        {isFocused && (
          <View
            style={[
              styles.focusAccent,
              {
                backgroundColor: getAccentColor(),
              },
            ]}
          />
        )}
      </View>

      {error && (
        <Animated.Text
          style={[
            styles.errorText,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              color: COLORS.ERROR,
            },
          ]}
        >
          <Translate>{error}</Translate>
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.M,
    width: "100%",
  },
  label: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
    marginBottom: SPACING.XS,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textAreaWrapper: {
    borderRadius: BORDER_RADIUS.L,
    position: "relative",
    overflow: "hidden",
  },
  focusAccent: {
    position: "absolute",
    left: 0,
    width: 3,
    height: "100%",
    borderTopRightRadius: BORDER_RADIUS.S,
    borderBottomRightRadius: BORDER_RADIUS.S,
  },
  textAreaWrapperError: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  textArea: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
    padding: SPACING.M,
    textAlignVertical: "top",
    width: "100%",
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
    fontFamily: FONTS.REGULAR,
  },
  charCountContainer: {
    position: "absolute",
    bottom: SPACING.XS,
    right: SPACING.S,
    borderRadius: BORDER_RADIUS.M,
    padding: 4,
    paddingHorizontal: 8,
  },
  charCountText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
});

export default TextArea;
