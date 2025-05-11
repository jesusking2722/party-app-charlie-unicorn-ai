import { FONTS, THEME } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import {
  Image,
  ScrollView,
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

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange?: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage = "EN",
  onLanguageChange,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  const handleLanguageSelect = (languageCode: string) => {
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Language</Text>

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
              currentLanguage === language.code && styles.selectedLanguageItem,
              {
                borderColor:
                  currentLanguage === language.code
                    ? "#7F00FF"
                    : "rgba(255, 255, 255, 0.2)",
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
            <Text style={styles.languageCode}>{language.code}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  languageItem: {
    width: 66,
    height: 80,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  selectedLanguageItem: {
    backgroundColor: "rgba(127, 0, 255, 0.2)",
  },
  flagImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  languageCode: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    color: "white",
  },
});

export default LanguageSelector;
