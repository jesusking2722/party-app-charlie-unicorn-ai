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
  Pressable,
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
import {
  Button,
  Input,
  LanguageToggleGroup,
  ThemeToggle,
  Translate,
} from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import useInit from "@/hooks/useInit";
import { setAuthToken } from "@/lib/axiosInstance";
import { loginByEmail } from "@/lib/scripts/auth.scripts";
import { setAuthAsync } from "@/redux/actions/auth.actions";
import { useAppDispatch } from "@/redux/store";

import GoogleAuthService from "@/lib/services/google.auth.services";

const PartyImage = require("@/assets/images/login_bg.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

const LoginScreen = () => {
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const checkboxScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const socialBtnAnimations = [0, 1].map(
    () => useRef(new Animated.Value(0)).current
  );

  const { showToast } = useToast();

  const dispatch = useAppDispatch();

  const { checkRedirectPath } = useInit();

  // google auth
  const [googleRequest, googleResponse, promptGoogleAsync] =
    GoogleAuthService.useGoogleAuth();

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

  const toggleRememberMe = (): void => {
    setRememberMe(!rememberMe);

    // Animation for checkbox toggle
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
        Animated.timing(checkboxScale, {
          toValue: 1,
          duration: ANIMATIONS.FAST,
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
    particles.forEach((particle, index) => {
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

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
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

      // api request/response
      const response = await loginByEmail(email, password);
      if (response.ok) {
        const { user, token } = response.data;
        setAuthToken(token);
        await dispatch(setAuthAsync({ isAuthenticated: true, user })).unwrap();
        showToast("Welcome back !!!", "success");
        checkRedirectPath(user);
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
      console.error("handle login error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setGoogleLoading(true);

      // Animation for button press
      Animated.sequence([
        Animated.timing(socialBtnAnimations[0], {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(socialBtnAnimations[0], {
          toValue: 1,
          tension: 200,
          friction: 20,
          useNativeDriver: true,
        }),
      ]).start();

      // Prompt Google sign-in
      await promptGoogleAsync();
    } catch (error) {
      console.error("Error initiating Google sign in:", error);
      showToast("Failed to start Google sign in", "error");
      setGoogleLoading(false);
    }
  };

  const handleGoogleAuthResponse = async (response: any) => {
    try {
      setLoading(true);

      // Animation for button press
      Animated.sequence([
        Animated.timing(socialBtnAnimations[0], {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(socialBtnAnimations[0], {
          toValue: 1,
          tension: 200,
          friction: 20,
          useNativeDriver: true,
        }),
      ]).start();

      // Get auth token
      const { authentication } = response;

      if (!authentication?.accessToken) {
        throw new Error("No access token returned");
      }

      // Fetch user info from Google
      const userInfo = await GoogleAuthService.fetchUserInfo(
        authentication.accessToken
      );

      if (!userInfo || !userInfo.email) {
        throw new Error("Failed to get user information");
      }

      console.log("Google user info:", userInfo);

      // Call your API to login or register with Google
      // You can use the email from userInfo.email
      try {
        // Example of how you might integrate with your existing login API
        // Replace this with your actual API call

        const response = await loginByEmail(userInfo.email, userInfo.id);

        if (response.ok) {
          const { user, token } = response.data;
          setAuthToken(token);
          await dispatch(
            setAuthAsync({ isAuthenticated: true, user })
          ).unwrap();
          showToast("Signed in with Google!", "success");
          checkRedirectPath(user);
        } else {
          showToast(response.message, "error");
        }
      } catch (error) {
        console.error("Google login API error:", error);
        showToast("Error processing Google login", "error");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      showToast("Failed to sign in with Google", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    // Animation for press effect
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    router.push("/auth/resetPassword");
  };

  const handleSignUp = (): void => {
    router.push("/auth/register");
  };

  useEffect(() => {
    if (googleResponse?.type === "success") {
      handleGoogleAuthResponse(googleResponse);
    } else if (googleResponse?.type === "error") {
      console.error("Google sign in error:", googleResponse.error);
      showToast("Google sign in failed", "error");
      setLoading(false);
    }
  }, [googleResponse]);

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
        <LanguageToggleGroup containerStyle={{ marginRight: SPACING.M }} />
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

          {/* Login Card (overlapping both sections) */}
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
                    <Translate>Welcome Back!</Translate>
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
                    <Translate>Sign in to join the party</Translate>
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
                      error={errors.email}
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
                    />

                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      isPassword={true}
                      error={errors.password}
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
                    />

                    {/* Remember me & Forgot password */}
                    <View style={styles.optionsRow}>
                      <Pressable
                        style={styles.rememberMeContainer}
                        onPress={toggleRememberMe}
                        android_ripple={{
                          color: "rgba(0,0,0,0.1)",
                          borderless: true,
                          radius: 16,
                        }}
                      >
                        <Animated.View
                          style={[
                            styles.checkbox,
                            {
                              backgroundColor: rememberMe
                                ? getAccentColor()
                                : "transparent",
                              borderColor: isDarkMode
                                ? COLORS.DARK_BORDER
                                : "rgba(255, 0, 153, 0.3)",
                              transform: [{ scale: checkboxScale }],
                            },
                          ]}
                        >
                          {rememberMe && (
                            <FontAwesome
                              name="check"
                              size={10}
                              color={COLORS.WHITE}
                            />
                          )}
                        </Animated.View>
                        <Text
                          style={[
                            styles.rememberMeText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          <Translate>Remember me</Translate>
                        </Text>
                      </Pressable>

                      <TouchableOpacity onPress={handleForgotPassword}>
                        <Text
                          style={[
                            styles.forgotPasswordText,
                            {
                              color: getAccentColor(),
                            },
                          ]}
                        >
                          <Translate>Forgot Password?</Translate>
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.S,
                      }}
                    >
                      <Button
                        title="Sign in with email"
                        onPress={handleLogin}
                        loading={loading}
                        variant={isDarkMode ? "primary" : "secondary"}
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
                      <Translate>Or continue with</Translate>
                    </Text>

                    <View style={styles.socialButtonsContainer}>
                      <Button
                        title="Sign in with Google"
                        variant="outline"
                        icon={
                          <FontAwesome name="google" size={18} color="white" />
                        }
                        loading={googleLoading}
                        onPress={handleGoogleLogin}
                      />
                    </View>

                    {/* Sign Up Text */}
                    <View style={styles.signUpContainer}>
                      <Text
                        style={[
                          styles.signUpText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        <Translate>Don't have an account?</Translate>
                      </Text>
                      <TouchableOpacity onPress={handleSignUp}>
                        <Text
                          style={[
                            styles.signUpButtonText,
                            {
                              color: getAccentColor(),
                            },
                          ]}
                        >
                          <Translate>Sign Up</Translate>
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.XS,
    marginBottom: SPACING.XS,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: BORDER_RADIUS.S,
    borderWidth: 1,
    marginRight: SPACING.S,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberMeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  forgotPasswordText: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
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
  signUpContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.XS,
  },
  signUpText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginRight: SPACING.XS,
  },
  signUpButtonText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XS,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    borderRadius: 18,
    display: "flex",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});

export default LoginScreen;
