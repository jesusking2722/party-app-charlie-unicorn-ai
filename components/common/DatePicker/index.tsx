import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Translate from "../Translate";

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  value: Date | null;
  onSelect: (date: Date) => void;
  containerStyle?: ViewStyle;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  placeholder = "Select a date",
  value,
  onSelect,
  containerStyle,
  error,
  minDate = new Date(),
  maxDate,
}) => {
  const { isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOpenPicker = () => {
    setIsFocused(true);
    setShowPicker(true);
  };

  const handleClosePicker = () => {
    setIsFocused(false);
    setShowPicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      handleClosePicker();
    }

    if (selectedDate) {
      onSelect(selectedDate);
    }
  };

  const renderIOSPicker = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPicker}
        onRequestClose={handleClosePicker}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClosePicker}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDarkMode
                  ? COLORS.DARK_BG_SECONDARY
                  : COLORS.LIGHT_BG,
              },
            ]}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity
                style={styles.pickerHeaderButton}
                onPress={handleClosePicker}
              >
                <Text
                  style={[
                    styles.pickerHeaderButtonText,
                    { color: getAccentColor() },
                  ]}
                >
                  <Translate>Cancel</Translate>
                </Text>
              </TouchableOpacity>

              <Text
                style={[styles.pickerHeaderTitle, { color: getTextColor() }]}
              >
                <Translate>Select Date</Translate>
              </Text>

              <TouchableOpacity
                style={styles.pickerHeaderButton}
                onPress={handleClosePicker}
              >
                <Text
                  style={[
                    styles.pickerHeaderButtonText,
                    { color: getAccentColor() },
                  ]}
                >
                  <Translate>Done</Translate>
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={value || new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minDate}
              maximumDate={maxDate}
              textColor={getTextColor()}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text style={[styles.inputLabel, { color: getLabelColor() }]}>
          <Translate>{label}</Translate>
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.inputWrapper,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 1 : 0.5,
          },
          error && styles.inputWrapperError,
        ]}
        onPress={handleOpenPicker}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <FontAwesome
            name="calendar"
            size={16}
            color={
              isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY
            }
          />
        </View>

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
          {value ? (
            <Translate>{formatDate(value)}</Translate>
          ) : (
            <Translate>{placeholder}</Translate>
          )}
        </Text>

        <View style={styles.chevronContainer}>
          <FontAwesome
            name="chevron-down"
            size={12}
            color={
              isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY
            }
          />
        </View>

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
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: COLORS.ERROR }]}>{error}</Text>
      )}

      {/* Date picker for Android is inline, iOS uses modal */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}

      {Platform.OS === "ios" && renderIOSPicker()}
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
  selectedText: {
    flex: 1,
    paddingHorizontal: SPACING.S,
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  iconContainer: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
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
  // Modal styles for iOS
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.M,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  pickerHeaderButton: {
    padding: SPACING.S,
  },
  pickerHeaderButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  pickerHeaderTitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.M,
  },
});

export default DatePicker;
