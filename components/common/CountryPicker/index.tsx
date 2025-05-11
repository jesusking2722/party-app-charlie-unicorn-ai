import { COLORS, FONTS, THEME } from "@/app/theme";
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
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";

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
  containerStyle?: any;
  labelStyle?: any;
  error?: string;
}

const CustomCountryPicker: React.FC<CustomCountryPickerProps> = ({
  label = "Country",
  placeholder = "Select a country",
  value = null,
  onSelect,
  containerStyle,
  labelStyle,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Get theme context
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

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
  };

  // Format display text
  const getSelectedCountryName = () => {
    if (!value) return placeholder;
    return `${value.flag} ${value.name}`;
  };

  // Setup custom headers and modals components
  const GradientBackground = () => (
    <LinearGradient
      colors={theme.GRADIENT as any}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
    />
  );

  const ListHeaderComponent = () => (
    <View style={styles.listHeaderContainer}>
      <GradientBackground />
      <View
        style={[styles.modalHeader, { borderBottomColor: theme.BORDER_COLOR }]}
      >
        <Text style={[styles.modalTitle, { color: theme.TEXT_COLOR }]}>
          Select a Country
        </Text>
      </View>
    </View>
  );

  // Background color for the modal
  const modalBgColor = isDarkMode
    ? "#1F2937" // Dark gray for dark mode
    : "#7F00FF"; // Purple for light mode

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.TEXT_COLOR }, labelStyle]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.pickerContainer,
          {
            backgroundColor: theme.BUTTON_BG,
            borderColor: theme.BORDER_COLOR,
          },
          error && styles.pickerContainerError,
        ]}
        onPress={() => setShowModal(true)}
      >
        <Text
          style={[
            styles.selectedText,
            { color: theme.TEXT_COLOR },
            !value && {
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
            },
          ]}
        >
          {getSelectedCountryName()}
        </Text>
        <FontAwesome name="chevron-down" size={14} color={theme.TEXT_COLOR} />
      </TouchableOpacity>

      {error && (
        <Animated.Text
          style={[
            styles.errorText,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {error}
        </Animated.Text>
      )}

      {/* Country Picker Modal */}
      <CountryPicker
        lang="en"
        show={showModal}
        enableModalAvoiding={true}
        pickerButtonOnPress={(item) => handleSelect(item)}
        onBackdropPress={() => setShowModal(false)}
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
            backgroundColor: theme.BORDER_COLOR,
            height: 1,
          },
          // Text input
          textInput: {
            backgroundColor: isDarkMode
              ? "rgba(55, 65, 81, 0.7)"
              : "rgba(255, 255, 255, 0.1)",
            color: theme.TEXT_COLOR,
            borderRadius: 8,
            marginHorizontal: 16,
            marginVertical: 16,
            paddingHorizontal: 16,
            height: 40,
            fontFamily: FONTS.REGULAR,
            fontSize: 16,
          },
          // Country button
          countryButtonStyles: {
            backgroundColor: "transparent",
            borderBottomWidth: 1,
            borderBottomColor: theme.BORDER_COLOR,
            height: 60,
            paddingHorizontal: 16,
          },
          // Search message
          searchMessageText: {
            color: theme.TEXT_COLOR,
            fontFamily: FONTS.REGULAR,
            fontSize: 16,
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
            color: theme.TEXT_SECONDARY,
            fontFamily: FONTS.REGULAR,
            fontSize: 14,
            marginLeft: 8,
          },
          // Country name
          countryName: {
            color: theme.TEXT_COLOR,
            fontFamily: FONTS.MEDIUM,
            fontSize: 16,
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
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  pickerContainerError: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: FONTS.REGULAR,
  },
  // Gradient and header styles
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listHeaderContainer: {
    width: "100%",
    position: "relative",
    zIndex: 10, // Added to ensure header content is above gradient
  },
  modalHeader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
  },
});

export default CustomCountryPicker;
