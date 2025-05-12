import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";

// Custom light theme secondary color - to match Input
const LIGHT_THEME_ACCENT = "#FF0099";

// Country type interface
export interface CountryType {
  code: string;
  name: string;
  flag: string;
}

interface CustomCountryPickerProps {
  label?: string;
  placeholder?: string;
  value?: CountryType | null;
  onSelect: (item: CountryType) => void;
  containerStyle?: ViewStyle;
  error?: string;
  isDarkMode?: boolean; // Allow overriding the theme context
}

const CustomCountryPicker: React.FC<CustomCountryPickerProps> = ({
  label = "Country",
  placeholder = "Select a country",
  value = null,
  onSelect,
  containerStyle,
  error,
  isDarkMode: forceDarkMode,
}) => {
  const { isDarkMode: contextDarkMode } = useTheme();
  const isDarkMode =
    forceDarkMode !== undefined ? forceDarkMode : contextDarkMode;

  const [showModal, setShowModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Run animations when error state changes
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

  // Handle country selection
  const handleSelect = (item: any) => {
    onSelect({
      code: item.code,
      name: item.name.en,
      flag: item.flag,
    });
    setShowModal(false);
    setIsFocused(false);
  };

  // Format display text
  const getSelectedCountryName = () => {
    if (!value) return placeholder;
    return `${value.flag} ${value.name}`;
  };

  // Theme-based styles (matching Input component)
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

  // Setup custom headers for modal
  const ListHeaderComponent = () => (
    <View style={styles.listHeaderContainer}>
      <LinearGradient
        colors={isDarkMode ? ["#111827", "#1F2937"] : ["#FF0099", "#FF6D00"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <View
        style={[
          styles.modalHeader,
          {
            borderBottomColor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          },
        ]}
      >
        <Text style={[styles.modalTitle, { color: COLORS.WHITE }]}>
          Select a Country
        </Text>
      </View>
    </View>
  );

  // Background color for the modal
  const modalBgColor = isDarkMode ? COLORS.DARK_BG_SECONDARY : "#FFFFFF";

  const handleModalOpen = () => {
    setIsFocused(true);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setIsFocused(false);
    setShowModal(false);
  };

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text style={[styles.inputLabel, { color: getLabelColor() }]}>
          {label}
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
        <View style={styles.iconContainer}>
          <FontAwesome
            name="globe"
            size={16}
            color={
              isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY
            }
          />
        </View>

        <TouchableOpacity
          style={styles.pickerTouchable}
          onPress={handleModalOpen}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.selectedText,
              {
                color: value ? getTextColor() : getPlaceholderColor(),
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getSelectedCountryName()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chevronContainer}
          onPress={handleModalOpen}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="chevron-down"
            size={12}
            color={
              isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY
            }
          />
        </TouchableOpacity>

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
        <Text style={[styles.errorText, { color: COLORS.ERROR }]}>{error}</Text>
      )}

      {/* Country Picker Modal */}
      <CountryPicker
        lang="en"
        show={showModal}
        enableModalAvoiding={true}
        pickerButtonOnPress={(item) => handleSelect(item)}
        onBackdropPress={handleModalClose}
        inputPlaceholder="Search countries..."
        searchMessage="No countries found"
        ListHeaderComponent={ListHeaderComponent}
        style={{
          // Modal container
          modal: {
            height: Dimensions.get("window").height * 0.7,
            backgroundColor: modalBgColor,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          // Backdrop
          backdrop: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          // Input line
          line: {
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
            height: 1,
          },
          // Text input
          textInput: {
            backgroundColor: isDarkMode
              ? "rgba(40, 45, 55, 0.65)"
              : "rgba(255, 255, 255, 0.8)",
            color: isDarkMode
              ? COLORS.DARK_TEXT_PRIMARY
              : COLORS.LIGHT_TEXT_PRIMARY,
            borderRadius: BORDER_RADIUS.M,
            marginHorizontal: 16,
            marginVertical: 16,
            paddingHorizontal: 16,
            height: 40,
            fontFamily: FONTS.REGULAR,
            fontSize: FONT_SIZES.S,
          },
          // Country button
          countryButtonStyles: {
            backgroundColor: "transparent",
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            height: 50,
            paddingHorizontal: 16,
          },
          // Search message
          searchMessageText: {
            color: isDarkMode
              ? COLORS.DARK_TEXT_SECONDARY
              : COLORS.LIGHT_TEXT_SECONDARY,
            fontFamily: FONTS.REGULAR,
            fontSize: FONT_SIZES.S,
            textAlign: "center",
            padding: 20,
          },
          // Flag text
          flag: {
            fontSize: 22,
            marginRight: 12,
          },
          // Dial code
          dialCode: {
            color: isDarkMode
              ? COLORS.DARK_TEXT_SECONDARY
              : COLORS.LIGHT_TEXT_SECONDARY,
            fontFamily: FONTS.REGULAR,
            fontSize: FONT_SIZES.XS,
            marginLeft: 8,
          },
          // Country name
          countryName: {
            color: isDarkMode
              ? COLORS.DARK_TEXT_PRIMARY
              : COLORS.LIGHT_TEXT_PRIMARY,
            fontFamily: FONTS.MEDIUM,
            fontSize: FONT_SIZES.S,
          },
          // Items list
          itemsList: {
            paddingHorizontal: 16,
          },
          // Country message container
          countryMessageContainer: {
            backgroundColor: "transparent",
          },
        }}
      />
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
  iconContainer: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerTouchable: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  selectedText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  chevronContainer: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
    fontFamily: FONTS.REGULAR,
  },
  // Modal styles
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listHeaderContainer: {
    width: "100%",
    position: "relative",
  },
  modalHeader: {
    paddingVertical: SPACING.M,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.BOLD,
  },
});

export default CustomCountryPicker;
