import { FONTS, THEME } from "@/app/theme";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Flag images - update with your actual flag paths
const FLAGS = {
  EN: require("@/assets/images/flags/en.png"),
  PL: require("@/assets/images/flags/pl.png"),
  DE: require("@/assets/images/flags/de.png"),
  ES: require("@/assets/images/flags/es.png"),
  FR: require("@/assets/images/flags/fr.png"),
};

// Language options
const languageOptions = [
  { code: "EN", name: "English" },
  { code: "PL", name: "Polski" },
  { code: "DE", name: "Deutsch" },
  { code: "ES", name: "Español" },
  { code: "FR", name: "Français" },
];

interface LanguageDropdownProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  isDarkMode?: boolean; // Added isDarkMode prop
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLanguage = "EN",
  onLanguageChange,
  isDarkMode = false, // Default to light mode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Animation for dropdown
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Select language
  const selectLanguage = (code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  // Calculate dropdown position - ensure it doesn't go off screen
  const dropdownPosition = () => {
    // If screen is narrow, adjust position more towards center
    if (screenWidth < 375) {
      return { right: -60 };
    }
    return { right: -70 };
  };

  return (
    <View style={styles.container}>
      {/* Language Selector Button */}
      <TouchableOpacity
        style={[styles.buttonContainer, { borderColor: theme.BORDER_COLOR }]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <BlurView
          intensity={isDarkMode ? 25 : 10}
          tint="dark"
          style={styles.buttonBlur}
        >
          <View style={[styles.button, { backgroundColor: theme.BUTTON_BG }]}>
            <Image
              source={FLAGS[currentLanguage as keyof typeof FLAGS]}
              style={styles.flagIcon}
              resizeMode="cover"
            />
          </View>
        </BlurView>
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <Animated.View
            style={[
              styles.dropdown,
              dropdownPosition(),
              {
                opacity: dropdownOpacity,
                borderColor: theme.BORDER_COLOR,
                transform: [
                  {
                    translateY: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Using theme-specific gradient */}
            <LinearGradient
              colors={theme.GRADIENT as [string, string]}
              style={styles.dropdownGradient}
              start={{ x: 0, y: 0 }}
              end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
            >
              <View style={styles.dropdownContent}>
                {languageOptions.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      { borderBottomColor: theme.BORDER_COLOR },
                      currentLanguage === lang.code && [
                        styles.selectedLanguage,
                        { backgroundColor: theme.BUTTON_BG },
                      ],
                    ]}
                    onPress={() => selectLanguage(lang.code)}
                  >
                    <Image
                      source={FLAGS[lang.code as keyof typeof FLAGS]}
                      style={styles.dropdownFlag}
                    />
                    <Text
                      style={[styles.languageName, { color: theme.TEXT_COLOR }]}
                    >
                      {lang.name}
                    </Text>
                    {currentLanguage === lang.code && (
                      <Feather
                        name="check"
                        size={14}
                        color={theme.TEXT_COLOR}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Backdrop to close dropdown when clicking outside */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 40,
    height: 40,
    zIndex: 100,
  },
  buttonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  buttonBlur: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  button: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  flagIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dropdown: {
    position: "absolute",
    top: 45,
    width: 180,
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 200,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dropdownGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  dropdownContent: {
    // Content container
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  selectedLanguage: {
    // Selected state - background color applied dynamically
  },
  dropdownFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  languageName: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    flex: 1,
  },
  backdrop: {
    position: "absolute",
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    zIndex: 150,
  },
});

export default LanguageDropdown;
