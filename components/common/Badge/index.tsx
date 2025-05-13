import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  BORDER_RADIUS,
  EVENT_PREVIEW,
  FONTS,
  FONT_SIZES,
  SPACING,
} from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface BadgeProps {
  icon: string;
  label: string;
  colors?: string[];
  onPress?: () => void;
}

const Badge: React.FC<BadgeProps> = ({ icon, label, colors, onPress }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "DARK" : "LIGHT";

  // Default to verified badge colors if none provided
  const badgeColors =
    colors ||
    (isDarkMode
      ? EVENT_PREVIEW.DARK.VERIFIED_BADGE
      : EVENT_PREVIEW.LIGHT.VERIFIED_BADGE);

  const BadgeContent = () => (
    <LinearGradient
      colors={badgeColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.badgeGradient}
    >
      <FontAwesome5 name={icon} size={12} color="#FFFFFF" />
      <Text style={styles.badgeText}>{label}</Text>
    </LinearGradient>
  );

  // If onPress is provided, wrap in TouchableOpacity
  return onPress ? (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <BadgeContent />
    </TouchableOpacity>
  ) : (
    <View style={styles.container}>
      <BadgeContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: SPACING.S,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.M,
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginLeft: SPACING.XS,
  },
});

export default Badge;
