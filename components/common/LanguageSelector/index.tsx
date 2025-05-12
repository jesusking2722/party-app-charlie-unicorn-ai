import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Flag images - update with your actual flag paths
const FLAGS = {
  EN: require("@/assets/images/flags/en.png"),
  PL: require("@/assets/images/flags/pl.png"),
  DE: require("@/assets/images/flags/de.png"),
  ES: require("@/assets/images/flags/es.png"),
  FR: require("@/assets/images/flags/fr.png"),
};

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  containerStyle?: ViewStyle;
  hideLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage = "EN",
  onLanguageChange,
  containerStyle,
  hideLabel = false,
}) => {
  const { isDarkMode } = useTheme();

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Helper function to get text color based on theme
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Helper function to get secondary text color based on theme
  const getSecondaryTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_SECONDARY : COLORS.LIGHT_TEXT_SECONDARY;

  // Language options
  const languageOptions = [
    { code: "EN", name: "English" },
    { code: "PL", name: "Polski" },
    { code: "DE", name: "Deutsch" },
    { code: "ES", name: "Español" },
    { code: "FR", name: "Français" },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!hideLabel && (
        <Text style={[styles.sectionTitle, { color: getTextColor() }]}>
          Language
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {languageOptions.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              {
                backgroundColor:
                  currentLanguage === language.code
                    ? isDarkMode
                      ? "rgba(127, 0, 255, 0.2)"
                      : "rgba(255, 0, 153, 0.1)"
                    : isDarkMode
                    ? "rgba(31, 41, 55, 0.7)"
                    : "rgba(240, 240, 240, 0.9)",
                borderColor:
                  currentLanguage === language.code
                    ? getAccentColor()
                    : isDarkMode
                    ? "rgba(55, 65, 81, 0.5)"
                    : "rgba(230, 234, 240, 0.8)",
              },
            ]}
            onPress={() => handleLanguageSelect(language.code)}
            activeOpacity={0.7}
          >
            <Image
              source={FLAGS[language.code as keyof typeof FLAGS]}
              style={styles.flagImage}
              resizeMode="cover"
            />
            <Text
              style={[
                styles.languageCode,
                {
                  color:
                    currentLanguage === language.code
                      ? getAccentColor()
                      : getTextColor(),
                  fontFamily:
                    currentLanguage === language.code
                      ? FONTS.BOLD
                      : FONTS.MEDIUM,
                },
              ]}
            >
              {language.code}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
    marginBottom: SPACING.M,
    marginLeft: SPACING.XS,
  },
  scrollContent: {
    paddingBottom: SPACING.XS,
  },
  languageItem: {
    width: 66,
    height: 80,
    marginRight: SPACING.S,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.XS,
  },
  flagImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: SPACING.XS,
  },
  languageCode: {
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
  },
});

export default LanguageSelector;
