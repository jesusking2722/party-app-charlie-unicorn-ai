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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
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
  THEME,
} from "@/app/theme";
import { Button, Input } from "@/components/common";

const PartyImage = require("@/assets/images/login_bg.png");
const LogoImage = require("@/assets/images/logo.png");

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? THEME.DARK : THEME.LIGHT;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const checkboxScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const socialBtnAnimations = [0, 1, 2].map(
    () => useRef(new Animated.Value(0)).current
  );

  // Particle animations for the background
  const particles = Array(10)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.5)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.5 + 0.5)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.5 + 0.3)).current,
      speed: Math.random() * 3000 + 2000, // Random speed between 2-5 seconds
    }));

  // Run animations when component mounts
  useEffect(() => {
    const animationDelay = Platform.OS === "ios" ? 300 : 500;

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
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        // Card scale animation
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Logo animation with bounce
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Staggered form elements
      Animated.sequence([
        Animated.delay(animationDelay),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
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
            animationDelay + 200 + index * ANIMATIONS.STAGGER_INTERVAL
          ),
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Start particle animations
      animateParticles();
    }, 150);
  }, []);

  // Continuous animation for floating particles
  const animateParticles = () => {
    particles.forEach((particle, index) => {
      // Animate vertical position
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.4) + height * 0.05,
            duration: particle.speed,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.4) + height * 0.05,
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
            toValue: Math.random() * 0.4 + 0.6,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: Math.random() * 0.4 + 0.6,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate opacity
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.3 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.3 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const handleLogin = (): void => {
    if (!email || !password) return;

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
      console.log("Login with:", email, password);
      setLoading(false);
      router.push("/onboarding");
    }, 1500);
  };

  const handleGoogleLogin = (): void => {
    console.log("Login with Google");
  };

  const handleAppleLogin = (): void => {
    console.log("Login with Apple");
  };

  const handleFacebookLogin = (): void => {
    console.log("Login with Facebook");
  };

  const handleForgotPassword = (): void => {
    console.log("Navigate to forgot password");

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
  };

  const handleSignUp = (): void => {
    router.push("/auth/register");
  };

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
            backgroundColor: isDark
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

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

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
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.1)"]}
          style={styles.imageOverlay}
        />

        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }, { translateY: translateY }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
          <Text style={styles.partyTitle}>PARTY APP</Text>
          <Text style={styles.partySubtitle}>Connect with the fun</Text>
        </Animated.View>
      </View>

      {/* Bottom Half with Animated Background */}
      <View style={styles.bottomHalf}>
        <LinearGradient
          colors={isDark ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
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
            intensity={isDark ? 40 : 30}
            tint={isDark ? "dark" : "light"}
            style={styles.cardBlur}
          >
            <LinearGradient
              colors={isDark ? GRADIENTS.DARK_CARD : GRADIENTS.LIGHT_CARD}
              style={styles.cardGradient}
            >
              {/* Accent Bar */}
              <View style={styles.cardAccentBar} />

              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.welcomeText,
                    {
                      color: isDark
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Welcome Back!
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    {
                      color: isDark
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  Sign in to join the party
                </Text>

                {/* Form Inputs - Using your Input component */}
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
                        size={18}
                        color={
                          isDark
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY
                        }
                      />
                    }
                    variant="frosted" // Using the variant from your component
                    isDark={isDark}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />

                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    isPassword={true}
                    variant="frosted" // Using the variant from your component
                    isDark={isDark}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />

                  {/* Remember me & Forgot password */}
                  <View style={styles.optionsRow}>
                    <Pressable
                      style={styles.rememberMeContainer}
                      onPress={toggleRememberMe}
                      android_ripple={{
                        color: "rgba(0,0,0,0.1)",
                        borderless: true,
                        radius: 20,
                      }}
                    >
                      <Animated.View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: rememberMe
                              ? isDark
                                ? COLORS.ACCENT_PURPLE_LIGHT
                                : COLORS.PRIMARY
                              : "transparent",
                            borderColor: isDark
                              ? COLORS.DARK_BORDER
                              : COLORS.LIGHT_BORDER,
                            transform: [{ scale: checkboxScale }],
                          },
                        ]}
                      >
                        {rememberMe && (
                          <FontAwesome
                            name="check"
                            size={12}
                            color={COLORS.WHITE}
                          />
                        )}
                      </Animated.View>
                      <Text
                        style={[
                          styles.rememberMeText,
                          {
                            color: isDark
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        Remember me
                      </Text>
                    </Pressable>

                    <TouchableOpacity onPress={handleForgotPassword}>
                      <Text
                        style={[
                          styles.forgotPasswordText,
                          {
                            color: isDark
                              ? COLORS.ACCENT_PURPLE_LIGHT
                              : COLORS.PRIMARY,
                          },
                        ]}
                      >
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <Animated.View
                    style={{
                      width: "100%",
                      transform: [{ scale: buttonScale }],
                      marginTop: SPACING.M,
                    }}
                  >
                    <Button
                      title="GET STARTED"
                      onPress={handleLogin}
                      loading={loading}
                      pill={true}
                      elevated={true}
                      variant="primary" // Using primary variant from your Button component
                      gradientColors={isDark ? undefined : GRADIENTS.PRIMARY}
                    />
                  </Animated.View>

                  {/* Social login section */}
                  <Text
                    style={[
                      styles.orText,
                      {
                        color: isDark
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    Or continue with
                  </Text>

                  <View style={styles.socialButtonsContainer}>
                    <Animated.View
                      style={{
                        transform: [{ scale: socialBtnAnimations[0] }],
                        opacity: socialBtnAnimations[0],
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {
                            backgroundColor: isDark
                              ? "rgba(55, 65, 81, 0.7)"
                              : "rgba(255, 255, 255, 0.9)",
                            borderColor: isDark
                              ? COLORS.DARK_BORDER
                              : COLORS.LIGHT_BORDER,
                          },
                        ]}
                        onPress={handleGoogleLogin}
                      >
                        <FontAwesome name="google" size={20} color="#DB4437" />
                      </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                      style={{
                        transform: [{ scale: socialBtnAnimations[1] }],
                        opacity: socialBtnAnimations[1],
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {
                            backgroundColor: isDark
                              ? "rgba(55, 65, 81, 0.7)"
                              : "rgba(255, 255, 255, 0.9)",
                            borderColor: isDark
                              ? COLORS.DARK_BORDER
                              : COLORS.LIGHT_BORDER,
                          },
                        ]}
                        onPress={handleFacebookLogin}
                      >
                        <FontAwesome
                          name="facebook-f"
                          size={20}
                          color="#4267B2"
                        />
                      </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                      style={{
                        transform: [{ scale: socialBtnAnimations[2] }],
                        opacity: socialBtnAnimations[2],
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          {
                            backgroundColor: isDark
                              ? "rgba(55, 65, 81, 0.7)"
                              : "rgba(255, 255, 255, 0.9)",
                            borderColor: isDark
                              ? COLORS.DARK_BORDER
                              : COLORS.LIGHT_BORDER,
                          },
                        ]}
                        onPress={handleAppleLogin}
                      >
                        <FontAwesome
                          name="apple"
                          size={22}
                          color={isDark ? COLORS.WHITE : COLORS.BLACK}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Sign Up Text */}
        <Animated.View
          style={[
            styles.signUpContainer,
            {
              transform: [{ translateY: translateY }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text
            style={[
              styles.signUpText,
              {
                color: isDark
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
              },
            ]}
          >
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text
              style={[
                styles.signUpButtonText,
                { color: isDark ? COLORS.ACCENT_PURPLE_LIGHT : COLORS.PRIMARY },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Mode switch (optional) */}
        <TouchableOpacity
          style={[
            styles.modeSwitch,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            },
          ]}
          onPress={() => {
            /* Toggle theme logic would go here */
          }}
        >
          <FontAwesome
            name={isDark ? "sun-o" : "moon-o"}
            size={16}
            color={isDark ? COLORS.WHITE : COLORS.BLACK}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  partyImageContainer: {
    height: height * 0.5,
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
    width: 10,
    height: 10,
    borderRadius: 5,
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
    top: height * 0.12,
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  partyTitle: {
    marginTop: SPACING.M,
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.HUGE,
    color: COLORS.WHITE,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  partySubtitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.M,
    color: COLORS.WHITE,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  bottomHalf: {
    height: height * 0.6,
    width: "100%",
    position: "relative",
  },
  bottomGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    position: "absolute",
    top: -height * 0.15,
    left: width * 0.05,
    width: width * 0.9,
    zIndex: 10,
    height: "auto",
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
    ...SHADOWS.PREMIUM,
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
    height: 12,
    width: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
  },
  cardContent: {
    padding: SPACING.L,
  },
  welcomeText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    marginBottom: SPACING.XS,
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.M,
    marginBottom: SPACING.L,
  },
  formContainer: {
    width: "100%",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.XS,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.S,
    borderWidth: 1,
    marginRight: SPACING.S,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberMeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  forgotPasswordText: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  orText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
    marginVertical: SPACING.L,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SPACING.M,
    borderWidth: 1,
    ...SHADOWS.SMALL,
  },
  signUpContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? SPACING.XL : SPACING.L,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginRight: SPACING.XS,
  },
  signUpButtonText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.S,
  },
  modeSwitch: {
    position: "absolute",
    top: SPACING.L,
    right: SPACING.L,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
