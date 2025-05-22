import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CountryFlag from "react-native-country-flag";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslator } from "@/contexts/TranslatorContext";

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

interface LanguageToggleGroupProps {
  containerStyle?: ViewStyle;
}

const { width } = Dimensions.get("window");

const LanguageToggleGroup: React.FC<LanguageToggleGroupProps> = ({
  containerStyle,
}) => {
  const { isDarkMode } = useTheme();
  const {
    availableLanguages,
    language: translateLanguage,
    setLanguage,
  } = useLanguage();
  const { setLanguage: setTranslatorLanguage } = useTranslator();

  const [isOpen, setIsOpen] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Helper function to get text color based on theme
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Language options
  const languageOptions = Object.entries(availableLanguages).map(
    ([code, name]) => ({
      code: code.toUpperCase(),
      name,
      flagCode: code.toLowerCase() === "en" ? "us" : code.toLowerCase(),
    })
  );

  // Get current language flag
  const getCurrentFlag = () => {
    const currentLang = languageOptions.find(
      (lang) => lang.code.toLowerCase() === translateLanguage
    );
    return currentLang?.flagCode || "us";
  };

  const toggleDropdown = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    if (isOpen) {
      // Close animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      // Open animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode.toLowerCase());
    setTranslatorLanguage(languageCode.toLowerCase());

    // Close dropdown after selection
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setIsOpen(false));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Toggle Button */}
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          style={[
            styles.toggleButton,
            {
              backgroundColor: isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
              borderColor: isDarkMode
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.3)",
            },
          ]}
          onPress={toggleDropdown}
          android_ripple={{
            color: "rgba(255, 255, 255, 0.2)",
            borderless: true,
            radius: 18,
          }}
        >
          <CountryFlag
            isoCode={getCurrentFlag()}
            size={20}
            style={styles.flagIcon}
          />
        </Pressable>
      </Animated.View>

      {/* Dropdown Menu */}
      {isOpen && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <BlurView
            intensity={isDarkMode ? 40 : 30}
            tint={isDarkMode ? "dark" : "light"}
            style={styles.dropdownBlur}
          >
            <LinearGradient
              colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
              style={styles.dropdownGradient}
            >
              {/* Accent Bar */}
              <View
                style={[
                  styles.dropdownAccentBar,
                  {
                    backgroundColor: getAccentColor(),
                  },
                ]}
              />

              <View style={styles.dropdownContent}>
                {languageOptions.map((language, index) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      {
                        backgroundColor:
                          translateLanguage === language.code.toLowerCase()
                            ? isDarkMode
                              ? "rgba(127, 0, 255, 0.2)"
                              : "rgba(255, 0, 153, 0.1)"
                            : "transparent",
                        borderBottomWidth:
                          index < languageOptions.length - 1 ? 1 : 0,
                        borderBottomColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)",
                      },
                    ]}
                    onPress={() => handleLanguageSelect(language.code)}
                    activeOpacity={0.7}
                  >
                    <CountryFlag
                      isoCode={language.flagCode}
                      size={24}
                      style={styles.optionFlag}
                    />
                    <Text
                      style={[
                        styles.languageCode,
                        {
                          color:
                            translateLanguage === language.code.toLowerCase()
                              ? getAccentColor()
                              : getTextColor(),
                          fontFamily:
                            translateLanguage === language.code.toLowerCase()
                              ? FONTS.BOLD
                              : FONTS.MEDIUM,
                        },
                      ]}
                    >
                      {language.code}
                    </Text>
                    <Text
                      style={[
                        styles.languageName,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      {language.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 50,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    ...SHADOWS.SMALL,
  },
  flagIcon: {
    borderRadius: 10,
  },
  dropdown: {
    position: "absolute",
    top: 45,
    right: 0,
    minWidth: 180,
    maxWidth: 220,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  dropdownBlur: {
    width: "100%",
    height: "100%",
  },
  dropdownGradient: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
  },
  dropdownAccentBar: {
    height: 3,
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.L,
    borderTopRightRadius: BORDER_RADIUS.L,
  },
  dropdownContent: {
    padding: SPACING.XS,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.S,
    paddingHorizontal: SPACING.M,
    borderRadius: BORDER_RADIUS.S,
  },
  optionFlag: {
    borderRadius: 12,
    marginRight: SPACING.S,
  },
  languageCode: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
    minWidth: 30,
  },
  languageName: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
    marginLeft: SPACING.S,
    flex: 1,
  },
});

export default LanguageToggleGroup;
