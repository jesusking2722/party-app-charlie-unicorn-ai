import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { BORDER_RADIUS, EVENT_PREVIEW } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface CountdownProgressProps {
  percentage: number; // 0-100
  height?: number;
  animated?: boolean;
  animationDuration?: number;
  delay?: number;
  colors?: string[];
}

const CountdownProgress: React.FC<CountdownProgressProps> = ({
  percentage,
  height = 8,
  animated = true,
  animationDuration = 1000,
  delay = 0,
  colors,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "DARK" : "LIGHT";

  // Default colors if not provided
  const progressColors =
    colors ||
    (isDarkMode
      ? EVENT_PREVIEW.DARK.PROGRESS_FILL
      : EVENT_PREVIEW.LIGHT.PROGRESS_FILL);

  // Clamp percentage to valid range
  const safePercentage = Math.min(100, Math.max(0, percentage));

  // Animation value
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Track if animation has run
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (animated && !hasAnimated) {
      // Start with 0 width
      progressWidth.setValue(0);

      // Animate to target width
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progressWidth, {
          toValue: safePercentage,
          duration: animationDuration,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setHasAnimated(true);
      });
    } else if (!animated) {
      // Set directly without animation
      progressWidth.setValue(safePercentage);
    }
  }, [percentage, animated]);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: isDarkMode
            ? EVENT_PREVIEW.DARK.PROGRESS_BG
            : EVENT_PREVIEW.LIGHT.PROGRESS_BG,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.progressContainer,
          {
            width: progressWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={progressColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: BORDER_RADIUS.S,
    overflow: "hidden",
  },
  progressContainer: {
    height: "100%",
  },
  gradient: {
    flex: 1,
    borderRadius: BORDER_RADIUS.S,
  },
});

export default CountdownProgress;
