import { GRADIENTS, SHADOWS } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Light theme accent colors (matching secondary button)
const LIGHT_THEME_GRADIENT = ["#FF0099", "#FF6D00"];

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <BlurView
        intensity={10}
        tint={isDarkMode ? "dark" : "light"}
        style={styles.buttonBlur}
      >
        <LinearGradient
          colors={
            isDarkMode ? (GRADIENTS.PRIMARY as any) : LIGHT_THEME_GRADIENT
          }
          style={styles.gradientBackground}
        >
          <View style={styles.button}>
            <Feather
              name={isDarkMode ? "sun" : "moon"}
              size={20}
              color="white"
            />
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    ...SHADOWS.SMALL,
  },
  buttonBlur: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  gradientBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  button: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});

export default ThemeToggle;
