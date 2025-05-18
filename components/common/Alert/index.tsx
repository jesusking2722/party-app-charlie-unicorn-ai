import { FC, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Feather } from "@expo/vector-icons"; // Using Expo Icons
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/ThemeContext"; // Import your theme context

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

const Alert: FC<AlertProps> = ({ type, title, message }) => {
  const { isDarkMode } = useTheme(); // Get the current theme mode

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  // Start animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get color configurations based on type and theme
  const getColors = () => {
    switch (type) {
      case "success":
        return {
          gradient: isDarkMode
            ? ["rgba(16, 185, 129, 0.15)", "rgba(20, 184, 166, 0.15)"]
            : ["rgba(16, 185, 129, 0.2)", "rgba(20, 184, 166, 0.2)"],
          border: isDarkMode
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(16, 185, 129, 0.3)",
          icon: isDarkMode ? "#2dd4ab" : "#34d399",
          title: isDarkMode ? "#2dd4ab" : "#34d399",
          message: isDarkMode
            ? "rgba(220, 220, 220, 0.9)"
            : "rgba(50, 50, 50, 0.8)",
        };
      case "info":
        return {
          gradient: isDarkMode
            ? ["rgba(59, 130, 246, 0.15)", "rgba(6, 182, 212, 0.15)"]
            : ["rgba(59, 130, 246, 0.2)", "rgba(6, 182, 212, 0.2)"],
          border: isDarkMode
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(59, 130, 246, 0.3)",
          icon: isDarkMode ? "#60a5fa" : "#3b82f6",
          title: isDarkMode ? "#60a5fa" : "#3b82f6",
          message: isDarkMode
            ? "rgba(220, 220, 220, 0.9)"
            : "rgba(50, 50, 50, 0.8)",
        };
      case "warning":
        return {
          gradient: isDarkMode
            ? ["rgba(245, 158, 11, 0.15)", "rgba(234, 179, 8, 0.15)"]
            : ["rgba(245, 158, 11, 0.2)", "rgba(234, 179, 8, 0.2)"],
          border: isDarkMode
            ? "rgba(245, 158, 11, 0.4)"
            : "rgba(245, 158, 11, 0.3)",
          icon: isDarkMode ? "#fbbf24" : "#f59e0b",
          title: isDarkMode ? "#fbbf24" : "#f59e0b",
          message: isDarkMode
            ? "rgba(220, 220, 220, 0.9)"
            : "rgba(50, 50, 50, 0.8)",
        };
      case "error":
        return {
          gradient: isDarkMode
            ? ["rgba(239, 68, 68, 0.15)", "rgba(236, 72, 153, 0.15)"]
            : ["rgba(239, 68, 68, 0.2)", "rgba(236, 72, 153, 0.2)"],
          border: isDarkMode
            ? "rgba(239, 68, 68, 0.4)"
            : "rgba(239, 68, 68, 0.3)",
          icon: isDarkMode ? "#f87171" : "#ef4444",
          title: isDarkMode ? "#f87171" : "#ef4444",
          message: isDarkMode
            ? "rgba(220, 220, 220, 0.9)"
            : "rgba(50, 50, 50, 0.8)",
        };
      default:
        return {
          gradient: isDarkMode
            ? ["rgba(99, 102, 241, 0.15)", "rgba(168, 85, 247, 0.15)"]
            : ["rgba(99, 102, 241, 0.2)", "rgba(168, 85, 247, 0.2)"],
          border: isDarkMode
            ? "rgba(99, 102, 241, 0.4)"
            : "rgba(99, 102, 241, 0.3)",
          icon: isDarkMode ? "#818cf8" : "#6366f1",
          title: isDarkMode ? "#818cf8" : "#6366f1",
          message: isDarkMode
            ? "rgba(220, 220, 220, 0.9)"
            : "rgba(50, 50, 50, 0.8)",
        };
    }
  };

  const colors = getColors();

  // Get icon name based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return "check-circle";
      case "info":
        return "info";
      case "warning":
        return "alert-triangle";
      case "error":
        return "x-circle";
      default:
        return "info";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: isDarkMode
            ? "rgba(15, 23, 42, 0.6)"
            : "rgba(255, 255, 255, 0.8)",
        },
      ]}
    >
      <LinearGradient
        colors={colors.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      />

      <BlurView
        intensity={isDarkMode ? 30 : 50}
        tint={isDarkMode ? "dark" : "light"}
        style={styles.blurOverlay}
      />

      <View
        style={[
          styles.iconContainer,
          {
            borderColor: colors.border,
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.07)"
              : "rgba(255, 255, 255, 0.3)",
          },
        ]}
      >
        <Feather name={getIcon()} size={20} color={colors.icon} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.message }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
    position: "relative",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  blurOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 16,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    zIndex: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
});

export default Alert;
