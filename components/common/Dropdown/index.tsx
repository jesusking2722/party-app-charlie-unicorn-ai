import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
  ViewStyle,
} from "react-native";

// Enable layout animations for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
  icon?: React.ReactNode;
  maxHeight?: number;
  zIndex?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = "Select an option",
  options,
  value,
  onSelect,
  containerStyle,
  labelStyle,
  error,
  icon,
  maxHeight,
  zIndex,
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownTranslateY = useRef(new Animated.Value(-10)).current;
  const dropdownRef = useRef<View>(null);
  const { height: windowHeight } = Dimensions.get("window");

  // Position tracking for dropdown
  const [dropdownPosition, setDropdownPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
  });

  // Custom light theme accent color
  const LIGHT_THEME_ACCENT = "#FF0099";

  // Determine max height for dropdown options list
  const dropdownMaxHeight = maxHeight || Math.min(300, windowHeight * 0.4);

  // Theme-based styles
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  const getPlaceholderColor = () =>
    isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.35)";

  const getLabelColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  const getBackgroundColor = () =>
    isDarkMode
      ? isFocused || isOpen
        ? "rgba(40, 45, 55, 0.65)"
        : "rgba(30, 35, 45, 0.5)"
      : isFocused || isOpen
      ? "rgba(255, 255, 255, 0.65)"
      : "rgba(255, 255, 255, 0.5)";

  const getBorderColor = () =>
    isDarkMode
      ? isFocused || isOpen
        ? COLORS.SECONDARY
        : "rgba(255, 255, 255, 0.1)"
      : isFocused || isOpen
      ? LIGHT_THEME_ACCENT
      : "rgba(0, 0, 0, 0.05)";

  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  const getOptionsBgColor = () =>
    isDarkMode ? "rgba(30, 35, 45, 0.98)" : "rgba(255, 255, 255, 0.98)";

  const getOptionBorderColor = () =>
    isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";

  const getSelectedOptionBgColor = () =>
    isDarkMode ? "rgba(55, 65, 81, 0.7)" : "rgba(240, 240, 240, 0.7)";

  // Animation config
  const animationConfig = {
    duration: 200,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  // Function to measure and update dropdown position
  const measureDropdownPosition = () => {
    if (dropdownRef.current) {
      // Get the coordinates of the dropdown trigger in the window
      dropdownRef.current.measureInWindow((x, y, width, height) => {
        // Calculate if dropdown would go off screen bottom
        const wouldExceedBottom = y + height + dropdownMaxHeight > windowHeight;

        // Set position for dropdown options
        // Note: Setting top to y + height for exact positioning against bottom of dropdown
        setDropdownPosition({
          left: x,
          top: wouldExceedBottom ? y - dropdownMaxHeight : y + height,
          width: width,
        });
      });
    }
  };

  const toggleDropdown = () => {
    // If about to open the dropdown, measure position first
    if (!isOpen) {
      setTimeout(() => measureDropdownPosition(), 0);
    }

    // Configure animation
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    // Toggle dropdown state
    setIsOpen(!isOpen);
    setIsFocused(!isOpen);

    // Animate the chevron rotation
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: animationConfig.duration,
      easing: animationConfig.easing,
      useNativeDriver: true,
    }).start();

    // Animate dropdown appearance
    if (!isOpen) {
      // Opening
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: animationConfig.duration,
          easing: animationConfig.easing,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownTranslateY, {
          toValue: 0,
          duration: animationConfig.duration,
          easing: animationConfig.easing,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Closing
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: animationConfig.duration,
          easing: animationConfig.easing,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownTranslateY, {
          toValue: -10,
          duration: animationConfig.duration,
          easing: animationConfig.easing,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    toggleDropdown();
  };

  // Create rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    if (!isOpen) {
      setIsFocused(false);
    }
  }, [isOpen]);

  return (
    <View
      style={[styles.inputContainer, containerStyle, { zIndex: zIndex || 1 }]}
    >
      {label && (
        <Text
          style={[styles.inputLabel, { color: getLabelColor() }, labelStyle]}
        >
          {label}
        </Text>
      )}

      {/* Dropdown trigger button */}
      <View
        ref={dropdownRef}
        style={[
          styles.inputWrapper,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: isFocused || isOpen ? 1 : 0.5,
            // Set borderBottomLeftRadius and borderBottomRightRadius to 0 when open
            borderBottomLeftRadius: isOpen ? 0 : BORDER_RADIUS.L,
            borderBottomRightRadius: isOpen ? 0 : BORDER_RADIUS.L,
          },
          error && styles.inputWrapperError,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.dropdownTrigger}
          onPress={toggleDropdown}
        >
          <Text
            style={[
              styles.selectedText,
              { color: getTextColor() },
              !value && { color: getPlaceholderColor() },
            ]}
          >
            {value ? value.label : placeholder}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdownChevron}
          onPress={toggleDropdown}
          accessibilityLabel="Toggle dropdown"
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <FontAwesome
              name={isOpen ? "chevron-down" : "chevron-up"}
              size={14}
              color={
                isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY
              }
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Accent indicator for focused state */}
        {(isFocused || isOpen) && (
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

      {/* Dropdown options instead of modal for perfect positioning */}
      {isOpen && (
        <View
          style={[
            styles.dropdownOptionsWrapper,
            {
              zIndex: zIndex ? zIndex + 1 : 1000,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.dropdownOptionsContainer,
              {
                opacity: dropdownOpacity,
                transform: [{ translateY: dropdownTranslateY }],
                backgroundColor: getOptionsBgColor(),
                borderColor: getBorderColor(),
                borderWidth: isFocused || isOpen ? 1 : 0.5,
                // Remove top border and top radius to create seamless connection
                borderTopWidth: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                maxHeight: dropdownMaxHeight,
              },
            ]}
          >
            <ScrollView
              style={styles.scrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollViewContent}
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    {
                      borderBottomColor: getOptionBorderColor(),
                    },
                    value?.value === option.value && {
                      backgroundColor: getSelectedOptionBgColor(),
                    },
                    index === options.length - 1 && styles.lastOptionItem,
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[styles.optionText, { color: getTextColor() }]}>
                    {option.label}
                  </Text>

                  {value?.value === option.value && (
                    <FontAwesome
                      name="check"
                      size={14}
                      color={getAccentColor()}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      )}

      {/* Modal background overlay for closing on outside click */}
      {isOpen && (
        <Modal
          transparent={true}
          visible={isOpen}
          animationType="none"
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: SPACING.M,
    width: "100%",
    position: "relative",
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
  dropdownTrigger: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: SPACING.M,
  },
  dropdownChevron: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
    fontFamily: FONTS.REGULAR,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownOptionsWrapper: {
    position: "absolute",
    top: 65, // Adjust based on whether there's a label
    left: 0,
    right: 0,
  },
  dropdownOptionsContainer: {
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 15,
  },
  scrollView: {
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.S,
    paddingHorizontal: SPACING.M,
    borderBottomWidth: 0.5,
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
});

export default Dropdown;
