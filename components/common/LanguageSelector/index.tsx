import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslator } from "@/contexts/TranslatorContext";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import CountryFlag from "react-native-country-flag";

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  containerStyle?: ViewStyle;
  hideLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  containerStyle,
  hideLabel = false,
}) => {
  const { isDarkMode } = useTheme();

  const {
    availableLanguages,
    language: translateLanguage,
    setLanguage,
  } = useLanguage();
  const { setLanguage: setTranslatorLanguage } = useTranslator();

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
    })
  );

  const handleLanguageSelect = (languageCode: string) => {
    // if (onLanguageChange) {
    //   onLanguageChange(languageCode);
    // }

    setLanguage(languageCode.toLowerCase());
    setTranslatorLanguage(languageCode.toLowerCase());
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
                  translateLanguage === language.code.toLowerCase()
                    ? isDarkMode
                      ? "rgba(127, 0, 255, 0.2)"
                      : "rgba(255, 0, 153, 0.1)"
                    : isDarkMode
                    ? "rgba(31, 41, 55, 0.7)"
                    : "rgba(240, 240, 240, 0.9)",
                borderColor:
                  translateLanguage === language.code.toLowerCase()
                    ? getAccentColor()
                    : isDarkMode
                    ? "rgba(55, 65, 81, 0.5)"
                    : "rgba(230, 234, 240, 0.8)",
              },
            ]}
            onPress={() => handleLanguageSelect(language.code)}
            activeOpacity={0.7}
          >
            <CountryFlag
              isoCode={
                language.code.toLowerCase() === "en"
                  ? "us"
                  : language.code.toLowerCase()
              }
              size={34}
              style={styles.flagImage}
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
