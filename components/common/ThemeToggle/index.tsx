import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <BlurView intensity={10} tint="light" style={styles.buttonBlur}>
        <View style={styles.button}>
          <Feather name={isDarkMode ? "sun" : "moon"} size={20} color="white" />
        </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ThemeToggle;
