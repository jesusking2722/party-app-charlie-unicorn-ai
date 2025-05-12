import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { ThemeToggle } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";

const PartyImage = require("@/assets/images/start_onboarding.png");
const LogoImage = require("@/assets/images/logo.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

const StartOnboarding = () => {
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Particle animations for the background
  const particles = Array(6)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.4)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.4 + 0.3)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.4 + 0.2)).current,
      speed: Math.random() * 3000 + 2000,
    }));

  // Interpolate the progress value to width percentage
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Interpolate the progress value to percentage text
  const progressPercent = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  // Run animations when component mounts
  useEffect(() => {
    const animationDelay = Platform.OS === "ios" ? 200 : 300;

    // Main elements fade in
    setTimeout(() => {
      Animated.parallel([
        // Fade in entire view
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.MEDIUM,
          useNativeDriver: true,
        }),
        // Slide up animation
        Animated.spring(translateY, {
          toValue: 0,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        // Card scale animation
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        // Logo animation with bounce
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000, // 3 seconds
        useNativeDriver: false,
      }).start(() => {
        // Navigate to the next screen after animation completes
        setTimeout(() => {
          router.push("/onboarding/profileSetup");
        }, 200);
      });

      // Start particle animations
      animateParticles();
    }, 100);
  }, []);

  // Continuous animation for floating particles
  const animateParticles = () => {
    particles.forEach((particle) => {
      // Animate vertical position
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.3) + height * 0.05,
            duration: particle.speed,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.3) + height * 0.05,
            duration: particle.speed,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
        ])
      ).start();

      // Animate scale
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: Math.random() * 0.3 + 0.4,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: Math.random() * 0.3 + 0.4,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate opacity
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.2 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.2 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const renderParticles = () => {
    return particles.map((particle, index) => (
      <Animated.View
        key={`particle-${index}`}
        style={[
          styles.particle,
          {
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
            backgroundColor: isDarkMode
              ? `rgba(${127 + Math.floor(Math.random() * 128)}, ${Math.floor(
                  Math.random() * 100
                )}, ${Math.floor(Math.random() * 255)}, 0.7)`
              : `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                  Math.random() * 255
                )}, ${Math.floor(Math.random() * 255)}, 0.5)`,
          },
        ]}
      />
    ));
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Theme toggle button */}
      <View style={styles.themeToggle}>
        <ThemeToggle />
      </View>

      {/* Party Image Section (Top Half) */}
      <View style={styles.partyImageContainer}>
        <Image
          source={PartyImage}
          style={styles.partyImage}
          resizeMode="cover"
        />

        {/* Add floating particles for fun effect */}
        {renderParticles()}

        {/* Overlay gradient for readability */}
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0)"]}
          style={styles.imageOverlay}
        />
      </View>

      {/* Bottom Half with Animated Background */}
      <View style={styles.bottomHalf}>
        <LinearGradient
          colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
          style={styles.bottomGradient}
        />

        {/* Onboarding Content Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateY: translateY }, { scale: cardScale }],
              opacity: fadeAnim,
            },
          ]}
        >
          <BlurView
            intensity={isDarkMode ? 40 : 30}
            tint={isDarkMode ? "dark" : "light"}
            style={styles.cardBlur}
          >
            <LinearGradient
              colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
              style={styles.cardGradient}
            >
              {/* Accent Bar */}
              <View
                style={[
                  styles.cardAccentBar,
                  {
                    backgroundColor: getAccentColor(),
                  },
                ]}
              />

              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.welcomeText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Let's Get Started
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  Welcome to your personalized experience
                </Text>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                  <Text
                    style={[
                      styles.descriptionText,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    We'll guide you through setting up your profile, verifying
                    your identity, and customizing your experience to match your
                    needs.
                  </Text>

                  {/* Steps Section */}
                  <View style={styles.stepsContainer}>
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepIcon,
                          { backgroundColor: getAccentColor() },
                        ]}
                      >
                        <FontAwesome name="user" size={12} color="white" />
                      </View>
                      <Text
                        style={[
                          styles.stepText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        Personal details
                      </Text>
                    </View>

                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepIcon,
                          { backgroundColor: getAccentColor() },
                        ]}
                      >
                        <FontAwesome name="briefcase" size={12} color="white" />
                      </View>
                      <Text
                        style={[
                          styles.stepText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        Professional information
                      </Text>
                    </View>

                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepIcon,
                          { backgroundColor: getAccentColor() },
                        ]}
                      >
                        <FontAwesome name="id-card" size={12} color="white" />
                      </View>
                      <Text
                        style={[
                          styles.stepText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        Identity verification
                      </Text>
                    </View>

                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepIcon,
                          { backgroundColor: getAccentColor() },
                        ]}
                      >
                        <FontAwesome name="star" size={12} color="white" />
                      </View>
                      <Text
                        style={[
                          styles.stepText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        Membership setup
                      </Text>
                    </View>
                  </View>

                  {/* Progress Section */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text
                        style={[
                          styles.progressText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        Setting up your account
                      </Text>
                      <Animated.Text
                        style={[
                          styles.progressPercentage,
                          {
                            color: getAccentColor(),
                          },
                        ]}
                      >
                        {progressPercent.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["0%", "100%"],
                        })}
                      </Animated.Text>
                    </View>

                    <View
                      style={[
                        styles.progressBarContainer,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: progressWidth,
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={
                            isDarkMode
                              ? GRADIENTS.PRIMARY
                              : ["#FF0099", "#FF6D00"]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.progressGradient}
                        />
                      </Animated.View>
                    </View>

                    <Text
                      style={[
                        styles.loadingText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      Preparing your personalized journey...
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  partyImageContainer: {
    height: height * 0.42,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  partyImage: {
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  logoContainer: {
    position: "absolute",
    top: height * 0.1,
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  partyTitle: {
    marginTop: SPACING.S,
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    color: COLORS.WHITE,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  partySubtitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    color: COLORS.WHITE,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  bottomHalf: {
    minHeight: height * 0.58,
    width: "100%",
    position: "relative",
    paddingBottom: SPACING.XL,
  },
  bottomGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    position: "relative",
    top: -height * 0.08,
    marginHorizontal: width * 0.05,
    width: width * 0.9,
    zIndex: 10,
    height: "auto",
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  cardBlur: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
  },
  cardAccentBar: {
    height: 6,
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
  },
  cardContent: {
    padding: SPACING.M,
  },
  welcomeText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  contentContainer: {
    width: "100%",
  },
  descriptionText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    lineHeight: 22,
    marginBottom: SPACING.M,
  },
  stepsContainer: {
    marginBottom: SPACING.L,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.S,
  },
  stepText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  progressContainer: {
    marginTop: SPACING.S,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  progressText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  progressPercentage: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.S,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    marginBottom: SPACING.S,
  },
  progressFill: {
    height: "100%",
  },
  progressGradient: {
    flex: 1,
  },
  loadingText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
    marginTop: SPACING.XS,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    zIndex: 100,
  },
});

export default StartOnboarding;
