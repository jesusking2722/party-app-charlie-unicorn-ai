import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  BORDER_RADIUS,
  COLORS,
  EVENT_PREVIEW,
  FONTS,
  FONT_SIZES,
  SPACING,
} from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import Translate from "../Translate";

interface TabsProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
  badgeCounts?: number[];
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeIndex,
  onTabPress,
  badgeCounts,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={`tab-${index}`}
          style={[
            styles.tab,
            activeIndex === index && {
              borderBottomColor: isDarkMode
                ? EVENT_PREVIEW.DARK.TAB_INDICATOR
                : EVENT_PREVIEW.LIGHT.TAB_INDICATOR,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => onTabPress(index)}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeIndex === index
                      ? isDarkMode
                        ? EVENT_PREVIEW.DARK.TAB_INDICATOR
                        : EVENT_PREVIEW.LIGHT.TAB_INDICATOR
                      : isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  fontFamily:
                    activeIndex === index ? FONTS.MEDIUM : FONTS.REGULAR,
                },
              ]}
            >
              {tab === "PLN" ? "PLN" : <Translate>{tab}</Translate>}
            </Text>

            {/* Display badge count if provided */}
            {badgeCounts && badgeCounts[index] > 0 && (
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={
                    activeIndex === index
                      ? isDarkMode
                        ? (EVENT_PREVIEW.DARK.TAB_ACTIVE_BG as any)
                        : (EVENT_PREVIEW.LIGHT.TAB_ACTIVE_BG as any)
                      : [
                          isDarkMode
                            ? "rgba(75, 85, 99, 0.8)"
                            : "rgba(209, 213, 219, 0.8)",
                          isDarkMode
                            ? "rgba(55, 65, 81, 0.8)"
                            : "rgba(229, 231, 235, 0.8)",
                        ]
                  }
                  style={styles.badgeGradient}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          activeIndex === index
                            ? "#FFFFFF"
                            : isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    {badgeCounts[index]}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.3)",
    marginBottom: SPACING.M,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.S,
    alignItems: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
  },
  badgeContainer: {
    marginLeft: SPACING.XS,
    borderRadius: BORDER_RADIUS.CIRCLE,
    overflow: "hidden",
  },
  badgeGradient: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.CIRCLE,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
});

export default Tabs;
