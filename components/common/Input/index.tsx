import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState, useTransition } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Translate from "../Translate";
import { useTranslator } from "@/contexts/TranslatorContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  error?: string;
  readonly?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  containerStyle,
  icon,
  error,
  readonly,
  ...restProps
}) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [translattedPlaceholder, setTranslattedPlaceholder] =
    useState<string>("");

  const { translateText } = useTranslator();
  const { language } = useLanguage();

  const toggleVisibility = (): void => {
    setIsVisible(!isVisible);
  };

  // Custom light theme accent color (matching the secondary button)
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

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    const translatePlaceholder = async () => {
      if (!placeholder) return;
      const translatted = await translateText(placeholder);
      setTranslattedPlaceholder(translatted);
    };

    translatePlaceholder();
  }, [placeholder, language]);

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text style={[styles.inputLabel, { color: getLabelColor() }]}>
          <Translate>{label}</Translate>
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 1 : 0.5,
          },
          error && styles.inputWrapperError,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <TextInput
          style={[styles.input, { color: getTextColor() }]}
          placeholder={translattedPlaceholder}
          placeholderTextColor={getPlaceholderColor()}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !isVisible : false}
          readOnly={readonly}
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
            <View style={styles.eyeIconCircle}>
              <FontAwesome
                name={isVisible ? "eye" : "eye-slash"}
                size={14}
                color={
                  isDarkMode
                    ? COLORS.DARK_TEXT_SECONDARY
                    : COLORS.LIGHT_TEXT_SECONDARY
                }
              />
            </View>
          </TouchableOpacity>
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
        <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
          <Translate>{error}</Translate>
        </Text>
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
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
    marginBottom: SPACING.XS,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    position: "relative",
  },
  focusAccent: {
    position: "absolute",
    left: 0,
    width: 3,
    height: "100%",
    borderTopRightRadius: BORDER_RADIUS.S,
    borderBottomRightRadius: BORDER_RADIUS.S,
  },
  inputWrapperError: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: SPACING.M,
    fontSize: FONT_SIZES.XS,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
    fontFamily: FONTS.REGULAR,
  },
});

export default Input;
