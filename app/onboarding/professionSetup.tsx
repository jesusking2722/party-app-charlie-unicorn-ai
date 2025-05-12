import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import { Button, Input, Textarea, ThemeToggle } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";

const PartyImage = require("@/assets/images/professional_onboarding.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Define types for our form errors
interface FormErrorsType {
  professionalTitle?: string;
  description?: string;
}

const ProfessionalSetupScreen = () => {
  const { isDarkMode } = useTheme();

  // Form state
  const [professionalTitle, setProfessionalTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrorsType>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

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

  const validateForm = () => {
    const newErrors: FormErrorsType = {};

    if (!professionalTitle.trim()) {
      newErrors.professionalTitle = "Professional title is required";
    }

    if (!description.trim()) {
      newErrors.description = "About section is required";
    } else if (description.trim().length < 20) {
      newErrors.description = "Please provide at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // if (validateForm()) {
    setLoading(true);

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

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push("/onboarding/kycSetup");
    }, 1500);
    // }
  };

  const handleBack = () => {
    router.back();
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

      {/* Back button */}
      <TouchableOpacity
        style={[
          styles.backButton,
          {
            backgroundColor: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
          },
        ]}
        onPress={handleBack}
      >
        <FontAwesome5
          name="arrow-left"
          size={16}
          color={isDarkMode ? COLORS.WHITE : COLORS.BLACK}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
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

            {/* Form Card */}
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
                      Professional Profile
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
                      Tell us about your expertise
                    </Text>

                    {/* Form Inputs */}
                    <View style={styles.formContainer}>
                      <Input
                        label="Professional Title"
                        placeholder="e.g. Software Engineer, Designer, Teacher"
                        value={professionalTitle}
                        onChangeText={(text) => {
                          setProfessionalTitle(text);
                          if (errors.professionalTitle)
                            setErrors({
                              ...errors,
                              professionalTitle: undefined,
                            });
                        }}
                        icon={
                          <FontAwesome
                            name="briefcase"
                            size={16}
                            color={
                              isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY
                            }
                          />
                        }
                        error={errors.professionalTitle}
                      />

                      <Textarea
                        label="About You"
                        placeholder="Describe your expertise, experience, and what you're passionate about..."
                        value={description}
                        onChangeText={(text) => {
                          setDescription(text);
                          if (errors.description)
                            setErrors({ ...errors, description: undefined });
                        }}
                        error={errors.description}
                        minHeight={150}
                        maxLength={500}
                        showCharCount={true}
                      />

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
                            Professional Profile
                          </Text>
                          <Text
                            style={[
                              styles.progressStep,
                              {
                                color: getAccentColor(),
                              },
                            ]}
                          >
                            Step 2 of 4
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
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: "50%", // 2 of 4 steps
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
                          </View>
                        </View>
                      </View>

                      {/* Continue Button */}
                      <Animated.View
                        style={{
                          width: "100%",
                          transform: [{ scale: buttonScale }],
                          marginTop: SPACING.M,
                        }}
                      >
                        <Button
                          title={loading ? "Saving..." : "Continue"}
                          onPress={handleSubmit}
                          loading={loading}
                          variant={isDarkMode ? "primary" : "secondary"}
                          small={true}
                          icon={
                            !loading && (
                              <FontAwesome5
                                name="arrow-right"
                                size={14}
                                color="white"
                                style={{ marginLeft: SPACING.S }}
                              />
                            )
                          }
                          iconPosition="right"
                        />
                      </Animated.View>
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  partyImageContainer: {
    height: height * 0.4, // Shorter top image area for more form space
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
  bottomHalf: {
    minHeight: height * 0.75, // More space for form
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
  formContainer: {
    width: "100%",
  },
  progressContainer: {
    marginTop: SPACING.M,
    marginBottom: SPACING.S,
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
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});

export default ProfessionalSetupScreen;
