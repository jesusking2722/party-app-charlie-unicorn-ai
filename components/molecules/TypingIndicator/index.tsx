// src/components/chat/TypingIndicator.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  THEME,
} from "@/app/theme";

interface TypingIndicatorProps {
  name: string;
  isDarkMode: boolean;
}

const TypingIndicator = ({ name, isDarkMode }: TypingIndicatorProps) => {
  // Animation values for dots
  const dot1Animation = useRef(new Animated.Value(0)).current;
  const dot2Animation = useRef(new Animated.Value(0)).current;
  const dot3Animation = useRef(new Animated.Value(0)).current;

  // Animation for component appearance
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const translateYAnimation = useRef(new Animated.Value(10)).current;

  // Start dot animations when component mounts
  useEffect(() => {
    // Stagger the animations of each dot
    const createDotAnimation = (dotAnimation: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnimation, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Stagger animations
    setTimeout(() => createDotAnimation(dot1Animation).start(), 0);
    setTimeout(() => createDotAnimation(dot2Animation).start(), 150);
    setTimeout(() => createDotAnimation(dot3Animation).start(), 300);

    // Animate component appearance
    Animated.parallel([
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: ANIMATIONS.FAST,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnimation, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Cleanup animations
    return () => {
      dot1Animation.stopAnimation();
      dot2Animation.stopAnimation();
      dot3Animation.stopAnimation();
    };
  }, [
    dot1Animation,
    dot2Animation,
    dot3Animation,
    opacityAnimation,
    translateYAnimation,
  ]);

  // Interpolate dot Y position from animation value
  const getDotTransform = (dotAnimation: Animated.Value) => {
    return {
      translateY: dotAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -5],
      }),
    };
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnimation,
          transform: [{ translateY: translateYAnimation }],
        },
      ]}
    >
      <View
        style={[
          styles.indicatorBubble,
          {
            backgroundColor: isDarkMode
              ? "rgba(31, 41, 55, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
            borderColor: isDarkMode
              ? "rgba(55, 65, 81, 0.5)"
              : "rgba(229, 231, 235, 0.5)",
          },
        ]}
      >
        <Text
          style={[
            styles.typingText,
            {
              color: isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY,
            },
          ]}
        >
          {name.split(" ")[0]} is typing
        </Text>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
                transform: [getDotTransform(dot1Animation)],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
                transform: [getDotTransform(dot2Animation)],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
                transform: [getDotTransform(dot3Animation)],
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.S,
    marginBottom: SPACING.S,
  },
  indicatorBubble: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.L,
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
    borderWidth: 1,
    alignSelf: "flex-start",
    maxWidth: "70%",
  },
  typingText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginRight: SPACING.XS,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
});

export default TypingIndicator;
