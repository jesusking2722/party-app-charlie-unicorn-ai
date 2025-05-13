import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BORDER_RADIUS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";

// Alert type definitions with corresponding colors and icons
const ALERT_TYPES: any = {
  success: {
    gradientLight: ["#10b981", "#059669"],
    gradientDark: ["#059669", "#047857"],
    bgLight: "rgba(16, 185, 129, 0.1)",
    bgDark: "rgba(5, 150, 105, 0.2)",
    textLight: "#059669",
    textDark: "#34d399",
    icon: "check-circle",
  },
  warning: {
    gradientLight: ["#f59e0b", "#d97706"],
    gradientDark: ["#d97706", "#b45309"],
    bgLight: "rgba(245, 158, 11, 0.1)",
    bgDark: "rgba(217, 119, 6, 0.2)",
    textLight: "#d97706",
    textDark: "#fbbf24",
    icon: "exclamation-triangle",
  },
  error: {
    gradientLight: ["#ef4444", "#dc2626"],
    gradientDark: ["#dc2626", "#b91c1c"],
    bgLight: "rgba(239, 68, 68, 0.1)",
    bgDark: "rgba(220, 38, 38, 0.2)",
    textLight: "#dc2626",
    textDark: "#f87171",
    icon: "times-circle",
  },
  info: {
    gradientLight: ["#3b82f6", "#2563eb"],
    gradientDark: ["#2563eb", "#1d4ed8"],
    bgLight: "rgba(59, 130, 246, 0.1)",
    bgDark: "rgba(37, 99, 235, 0.2)",
    textLight: "#2563eb",
    textDark: "#60a5fa",
    icon: "info-circle",
  },
};

const NotificationAlert = ({
  type = "info",
  message,
  path,
  onNavigate,
}: {
  type: "info" | "success" | "error" | "warning";
  message: string;
  path?: string;
  onNavigate: () => void;
}) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const alertStyle = ALERT_TYPES[type] || ALERT_TYPES.info;

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else if (path) {
      router.push(path as any);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? alertStyle.bgDark : alertStyle.bgLight,
        },
      ]}
    >
      <View style={styles.content}>
        <LinearGradient
          colors={
            isDarkMode ? alertStyle.gradientDark : alertStyle.gradientLight
          }
          style={styles.iconContainer}
        >
          <FontAwesome5 name={alertStyle.icon} size={14} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.message,
              {
                color: isDarkMode ? alertStyle.textDark : alertStyle.textLight,
              },
            ]}
          >
            {message}
          </Text>

          {path && (
            <TouchableOpacity onPress={handleNavigate}>
              <Text
                style={[
                  styles.path,
                  {
                    color: isDarkMode
                      ? alertStyle.textDark
                      : alertStyle.textLight,
                  },
                ]}
              >
                {path}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.M,
    padding: SPACING.S,
    marginTop: SPACING.S,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.S,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  path: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    textDecorationLine: "underline",
    marginTop: SPACING.XS,
  },
});

export default NotificationAlert;
