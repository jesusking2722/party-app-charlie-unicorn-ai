import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
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
import { Button, Input, ThemeToggle } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { setAuthToken } from "@/lib/axiosInstance";
import { registerByEmail } from "@/lib/scripts/auth.scripts";
import { setAuthAsync } from "@/redux/actions/auth.actions";
import { useAppDispatch } from "@/redux/store";

const PartyImage = require("@/assets/images/register_bg.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

const RegisterScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const socialBtnAnimations = [0, 1].map(
    () => useRef(new Animated.Value(0)).current
  );

  const { showToast } = useToast();

  const dispatch = useAppDispatch();

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

      // Staggered form elements
      Animated.sequence([
        Animated.delay(animationDelay),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered social buttons
      socialBtnAnimations.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(
            animationDelay + 150 + index * ANIMATIONS.STAGGER_INTERVAL
          ),
          Animated.spring(anim, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
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

  const validateInputs = (): boolean => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;
    try {
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

      const response = await registerByEmail(email, password);
      if (response.ok) {
        const { user, token } = response.data;
        setAuthToken(token);

        // Use the unwrap() method to wait for the async thunk to complete
        await dispatch(setAuthAsync({ isAuthenticated: true, user })).unwrap();

        showToast("Please check your mailbox to verify your mail", "success");
        router.push("/auth/verify");
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
      console.error("handle register error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = (): void => {
    
  };

  const handleSignIn = (): void => {
    router.push("/auth/login");
  };

  const handlePrivacyPolicy = (): void => {
    console.log("Navigate to privacy policy");
  };

  const handleTermsOfService = (): void => {
    console.log("Navigate to terms of service");
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
      <StatusBar style="light" />

      {/* Theme toggle button */}
      <View style={styles.themeToggle}>
        <ThemeToggle />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
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

          {/* Register Card (overlapping both sections) */}
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
                    Join the Party!
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
                    Create your account to get started
                  </Text>

                  {/* Form Inputs */}
                  <View style={styles.formContainer}>
                    <Input
                      label="Email"
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon={
                        <FontAwesome
                          name="envelope-o"
                          size={16}
                          color={
                            isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY
                          }
                        />
                      }
                      error={errors.email}
                    />

                    <Input
                      label="Password"
                      placeholder="Create a password"
                      value={password}
                      onChangeText={setPassword}
                      isPassword={true}
                      icon={
                        <FontAwesome
                          name="lock"
                          size={16}
                          color={
                            isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY
                          }
                        />
                      }
                      error={errors.password}
                    />

                    <Input
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      isPassword={true}
                      icon={
                        <FontAwesome
                          name="check-circle"
                          size={16}
                          color={
                            isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY
                          }
                        />
                      }
                      error={errors.confirmPassword}
                    />

                    <View style={styles.termsContainer}>
                      <Text
                        style={[
                          styles.termsText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        By signing up, you agree to our{" "}
                        <Text
                          style={[
                            styles.termsLink,
                            { color: getAccentColor() },
                          ]}
                          onPress={handleTermsOfService}
                        >
                          Terms of Service
                        </Text>{" "}
                        and{" "}
                        <Text
                          style={[
                            styles.termsLink,
                            { color: getAccentColor() },
                          ]}
                          onPress={handlePrivacyPolicy}
                        >
                          Privacy Policy
                        </Text>
                      </Text>
                    </View>

                    {/* Register Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.S,
                      }}
                    >
                      <Button
                        title="Create Account"
                        onPress={handleRegister}
                        loading={loading}
                        variant={isDarkMode ? "primary" : "secondary"}
                        small={true}
                      />
                    </Animated.View>

                    {/* Social login section */}
                    <Text
                      style={[
                        styles.orText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      Or sign up with
                    </Text>

                    <View style={styles.socialButtonsContainer}>
                      <Button
                        title="Sign up with Google"
                        variant={isDarkMode ? "secondary" : "primary"}
                        icon={
                          <FontAwesome name="google" size={18} color="white" />
                        }
                        onPress={handleGoogleRegister}
                      />
                    </View>

                    {/* Sign In Text */}
                    <View style={styles.signInContainer}>
                      <Text
                        style={[
                          styles.signInText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        Already have an account?
                      </Text>
                      <TouchableOpacity onPress={handleSignIn}>
                        <Text
                          style={[
                            styles.signInButtonText,
                            {
                              color: getAccentColor(),
                            },
                          ]}
                        >
                          Sign In
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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
  formContainer: {
    width: "100%",
  },
  termsContainer: {
    marginBottom: SPACING.M,
    marginTop: SPACING.XS,
  },
  termsText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: FONTS.MEDIUM,
  },
  orText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
    marginVertical: SPACING.M,
  },
  socialButtonsContainer: {
    width: "100%",
    marginBottom: SPACING.M,
  },
  socialButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING.M,
    borderWidth: 1,
    ...SHADOWS.SMALL,
  },
  signInContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.XS,
  },
  signInText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginRight: SPACING.XS,
  },
  signInButtonText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XS,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});

export default RegisterScreen;
