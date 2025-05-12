import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
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
import { Button, ThemeToggle } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";

const CelebrateImage = require("@/assets/images/congratulations.png");
const LogoImage = require("@/assets/images/logo.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

const CongratulationsScreen = () => {
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

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

      // Checkmark animation
      Animated.sequence([
        Animated.delay(animationDelay / 2),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animation
      Animated.sequence([
        Animated.delay(animationDelay),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

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

  // Handle navigation to the home screen
  const handleJoinNow = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 200,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();

    router.push("/main");
  };

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

      {/* Top Half - Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={CelebrateImage}
          style={styles.celebrateImage}
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

      {/* Bottom Half with Card and Content */}
      <View style={styles.bottomHalf}>
        <LinearGradient
          colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
          style={styles.bottomGradient}
        />

        {/* Congratulations Card */}
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
                {/* Success Icon */}
                <Animated.View
                  style={[
                    styles.checkIconContainer,
                    {
                      transform: [{ scale: checkmarkScale }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.checkIconGradient}
                  >
                    <FontAwesome name="trophy" size={24} color="white" solid />
                  </LinearGradient>
                </Animated.View>

                <Text
                  style={[
                    styles.congratsTitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Congratulations!
                </Text>
                <Text
                  style={[
                    styles.congratsSubtitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  You've successfully completed the onboarding
                </Text>

                {/* Message */}
                <Text
                  style={[
                    styles.congratsMessage,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  You're all set to explore our platform and discover all the
                  amazing features we have to offer
                </Text>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text
                      style={[
                        styles.progressText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      Onboarding Complete
                    </Text>
                    <Text
                      style={[
                        styles.progressStep,
                        {
                          color: getAccentColor(),
                        },
                      ]}
                    >
                      4 of 4
                    </Text>
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
                    <View style={styles.progressFill}>
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
                    </View>
                  </View>
                </View>

                {/* Join Now Button */}
                <Animated.View
                  style={{
                    width: "100%",
                    transform: [{ scale: buttonScale }],
                    marginTop: SPACING.M,
                  }}
                >
                  <Button
                    title="Join Now"
                    onPress={handleJoinNow}
                    variant={isDarkMode ? "primary" : "secondary"}
                    icon={
                      <FontAwesome5
                        name="arrow-right"
                        size={14}
                        color="white"
                        style={{ marginLeft: SPACING.S }}
                      />
                    }
                    iconPosition="right"
                  />
                </Animated.View>
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
  imageContainer: {
    height: height * 0.4,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  celebrateImage: {
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
  bottomHalf: {
    minHeight: height * 0.6,
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
    top: -height * 0.06,
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
    padding: SPACING.L,
    alignItems: "center",
  },
  checkIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: SPACING.M,
    ...SHADOWS.MEDIUM,
  },
  checkIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  congratsTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
    textAlign: "center",
  },
  congratsSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
    textAlign: "center",
  },
  congratsMessage: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
    marginBottom: SPACING.M,
    lineHeight: 22,
  },
  progressContainer: {
    width: "100%",
    marginTop: SPACING.S,
    marginBottom: SPACING.M,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  progressText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  progressStep: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XS,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: BORDER_RADIUS.S,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "100%",
  },
  progressGradient: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    zIndex: 100,
  },
});

export default CongratulationsScreen;
