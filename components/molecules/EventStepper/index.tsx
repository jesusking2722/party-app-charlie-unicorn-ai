import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { COLORS, EVENT_PREVIEW, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";

export type StepItem = {
  icon: string;
  label: string;
  completed: boolean;
};

interface EventStepperProps {
  steps: StepItem[];
  activeStep: number;
}

const EventStepper: React.FC<EventStepperProps> = ({ steps, activeStep }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "DARK" : "LIGHT";

  // Animation refs for each step
  const stepAnims = useRef(
    steps.map(() => ({
      scale: new Animated.Value(0.8),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Progress line animations
  const progressLines = useRef(
    Array(steps.length - 1)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate steps with staggered timing
    steps.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.spring(stepAnims[index].scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(stepAnims[index].opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Animate progress lines for completed steps
    steps.forEach((step, index) => {
      if (index < steps.length - 1 && steps[index].completed) {
        Animated.timing(progressLines[index], {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          useNativeDriver: false,
        }).start();
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {steps.map((step, index) => (
          <View key={`step-${index}`} style={styles.stepItem}>
            {/* Connector line between steps */}
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: isDarkMode
                      ? EVENT_PREVIEW.DARK.STEPPER_BG
                      : EVENT_PREVIEW.LIGHT.STEPPER_BG,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.connectorProgress,
                    {
                      width: progressLines[index - 1].interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: isDarkMode
                        ? EVENT_PREVIEW.DARK.STEPPER_ACTIVE[0]
                        : EVENT_PREVIEW.LIGHT.STEPPER_ACTIVE[0],
                    },
                  ]}
                />
              </View>
            )}

            {/* Step circle */}
            <Animated.View
              style={[
                styles.stepCircle,
                {
                  opacity: stepAnims[index].opacity,
                  transform: [{ scale: stepAnims[index].scale }],
                },
              ]}
            >
              {index === activeStep ? (
                // Active step with gradient
                <LinearGradient
                  colors={
                    isDarkMode
                      ? (EVENT_PREVIEW.DARK.STEPPER_ACTIVE as any)
                      : (EVENT_PREVIEW.LIGHT.STEPPER_ACTIVE as any)
                  }
                  style={styles.stepCircleGradient}
                >
                  <FontAwesome5 name={step.icon} size={14} color="#FFFFFF" />
                </LinearGradient>
              ) : (
                // Completed or future step
                <View
                  style={[
                    styles.stepCirclePlain,
                    {
                      backgroundColor: step.completed
                        ? isDarkMode
                          ? EVENT_PREVIEW.DARK.STEPPER_COMPLETED[0]
                          : EVENT_PREVIEW.LIGHT.STEPPER_COMPLETED[0]
                        : isDarkMode
                        ? "rgba(55, 65, 81, 0.5)"
                        : "rgba(229, 231, 235, 0.5)",
                    },
                  ]}
                >
                  <FontAwesome5
                    name={step.icon}
                    size={14}
                    color={
                      step.completed ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)"
                    }
                  />
                </View>
              )}
            </Animated.View>

            {/* Step Label */}
            <Text
              style={[
                styles.stepLabel,
                {
                  color:
                    index === activeStep
                      ? isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY
                      : isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  fontFamily:
                    index === activeStep ? FONTS.SEMIBOLD : FONTS.REGULAR,
                },
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: SPACING.M,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  connector: {
    position: "absolute",
    height: 2,
    width: "100%",
    top: 16,
    left: -50,
    zIndex: 1,
  },
  connectorProgress: {
    height: "100%",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.XS,
    zIndex: 2,
  },
  stepCircleGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCirclePlain: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
  },
});

export default EventStepper;
