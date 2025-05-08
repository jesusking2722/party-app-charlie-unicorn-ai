import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const OnboardingLogo = require("@/assets/images/logo.png");

const StartOnboarding = () => {
  // Animation values
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const slideUpAnimation = useRef(new Animated.Value(50)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Run the animations in sequence

    // 1. Fade in text content
    Animated.timing(fadeInAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2. Slide up text content
    Animated.timing(slideUpAnimation, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 3. Progress bar animation
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 3000, // 3 seconds
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      // Navigate to the next screen after animation completes
      setTimeout(() => {
        router.push("/onboarding/profileSetup");
      }, 200);
    });

    // 4. Pulse animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolate the progress value to width percentage
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Interpolate the progress value to percentage text
  const progressPercent = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#7F00FF", "#E100FF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeInAnimation,
              transform: [{ translateY: slideUpAnimation }],
            },
          ]}
        >
          <View style={styles.header}>
            {/* Icon with gradient background */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnimation }],
                },
              ]}
            >
              <LinearGradient
                colors={["#FF0099", "#7F00FF"]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome name="user-secret" size={40} color="white" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.title}>Let's Get Started</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>
              Welcome to your personalized experience
            </Text>
            <Text style={styles.description}>
              We'll guide you through setting up your profile, verifying your
              identity, and customizing your experience to match your needs.
            </Text>
            <Text style={styles.steps}>
              • Personal details{"\n"}• Professional information{"\n"}• Identity
              verification{"\n"}• Membership setup
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Setting up your account</Text>
              <Animated.Text style={styles.progressPercentage}>
                {progressPercent.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                })}
              </Animated.Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                  },
                ]}
              >
                <LinearGradient
                  colors={["#FF0099", "#7F00FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>

            <Text style={styles.loadingText}>
              Preparing your personalized journey...
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 40,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    marginBottom: 16,
  },
  divider: {
    width: "60%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: 8,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  subtitle: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
    lineHeight: 24,
    marginBottom: 24,
  },
  steps: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Montserrat-Medium",
    lineHeight: 26,
    alignSelf: "flex-start",
    marginLeft: 30,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: "white",
    fontFamily: "Montserrat-Medium",
  },
  progressPercentage: {
    fontSize: 16,
    color: "white",
    fontFamily: "Montserrat-Bold",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressFill: {
    height: "100%",
  },
  progressGradient: {
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
  },
});

export default StartOnboarding;
