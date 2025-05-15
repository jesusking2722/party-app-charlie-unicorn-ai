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
  TextInput,
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
import { Button, ThemeToggle } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import useInit from "@/hooks/useInit";
import { emailVerify, resendEmailVerify } from "@/lib/scripts/auth.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSelector } from "react-redux";

const PartyImage = require("@/assets/images/login_bg.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Number of verification code digits
const VERIFICATION_CODE_LENGTH = 5;

const EmailVerificationScreen = () => {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();

  // State for verification code inputs
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(VERIFICATION_CODE_LENGTH).fill("")
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const { checkRedirectPath } = useInit();

  // Refs for input fields - create individual refs instead of an array
  const inputRef1 = useRef<TextInput>(null);
  const inputRef2 = useRef<TextInput>(null);
  const inputRef3 = useRef<TextInput>(null);
  const inputRef4 = useRef<TextInput>(null);
  const inputRef5 = useRef<TextInput>(null);

  // Helper function to get ref by index
  const getRefByIndex = (index: number): any => {
    switch (index) {
      case 0:
        return inputRef1;
      case 1:
        return inputRef2;
      case 2:
        return inputRef3;
      case 3:
        return inputRef4;
      case 4:
        return inputRef5;
      default:
        return inputRef1;
    }
  };

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const codeInputsAnimations = Array(VERIFICATION_CODE_LENGTH)
    .fill(0)
    .map(() => useRef(new Animated.Value(0)).current);

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

  // Format time from seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: any = null;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      showToast(
        "Verification code expired. Please request a new one.",
        "warning"
      );
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft]);

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

      // Staggered code input animations
      codeInputsAnimations.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(
            animationDelay + 100 + index * ANIMATIONS.STAGGER_INTERVAL
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

  // Handle verification code input change
  const handleCodeChange = (text: string, index: number) => {
    // Allow only one character per input
    if (text.length > 1) {
      text = text.charAt(text.length - 1);
    }

    // Update the code array
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    // Auto-focus to next input if text is entered
    if (text.length === 1 && index < VERIFICATION_CODE_LENGTH - 1) {
      getRefByIndex(index + 1).current?.focus();
    }
  };

  // Handle key press for backspace functionality
  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      index > 0 &&
      !verificationCode[index]
    ) {
      // If current input is empty and backspace is pressed, move to previous input
      getRefByIndex(index - 1).current?.focus();
    }
  };

  // Handle verification submission
  const handleVerify = async () => {
    const code = verificationCode.join("");

    if (code.length !== VERIFICATION_CODE_LENGTH) {
      showToast("Please enter the complete verification code", "warning");
      return;
    }
    console.log(user);
    if (!user?.email) return;
    try {
      setIsLoading(true);

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

      const response = await emailVerify(code, user.email);
      if (response.ok) {
        const { user } = response.data;
        checkRedirectPath(user);
        await dispatch(setAuthUserAsync(user)).unwrap();
        showToast("Mail verified successfully", "success");
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
      console.error("handle verify error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!user?.email) return;
    // Don't allow resend if timer is still active
    if (timerActive && timeLeft > 0) return;

    // Reset verification code fields
    setVerificationCode(Array(VERIFICATION_CODE_LENGTH).fill(""));

    // Reset and start timer
    setTimeLeft(180);
    setTimerActive(true);

    // Animate code inputs
    codeInputsAnimations.forEach((anim, index) => {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.delay(index * 50),
        Animated.spring(anim, {
          toValue: 1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    });

    try {
      setIsLoading(true);
      const response = await resendEmailVerify(user.email);
      if (response.ok) {
        // Focus on first input
        inputRef1.current?.focus();
        showToast("Verification code is sent to your mailbox", "success");
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
      console.error("handle resend code error: ", error);
    } finally {
      setIsLoading(false);
    }
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

          {/* Verification Card (overlapping both sections) */}
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
                    Email Verification
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
                    We sent a verification code to{" "}
                    <Text style={{ fontFamily: FONTS.SEMIBOLD }}>
                      {user?.email}
                    </Text>
                  </Text>

                  {/* Verification Form */}
                  <View style={styles.formContainer}>
                    {/* Verification Code Input */}
                    <Text
                      style={[
                        styles.codeLabel,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      Enter Verification Code
                    </Text>

                    <View style={styles.codeInputContainer}>
                      {Array(VERIFICATION_CODE_LENGTH)
                        .fill(0)
                        .map((_, index) => (
                          <Animated.View
                            key={`code-input-${index}`}
                            style={{
                              transform: [
                                { scale: codeInputsAnimations[index] },
                              ],
                              opacity: codeInputsAnimations[index],
                            }}
                          >
                            <TextInput
                              ref={getRefByIndex(index)}
                              style={[
                                styles.codeInput,
                                {
                                  backgroundColor: isDarkMode
                                    ? COLORS.DARK_INPUT
                                    : COLORS.LIGHT_INPUT,
                                  borderColor: isDarkMode
                                    ? COLORS.DARK_BORDER
                                    : COLORS.LIGHT_BORDER,
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                },
                                verificationCode[index]
                                  ? { borderColor: getAccentColor() }
                                  : {},
                              ]}
                              keyboardType="numeric"
                              maxLength={1}
                              onChangeText={(text) =>
                                handleCodeChange(text, index)
                              }
                              value={verificationCode[index]}
                              onKeyPress={(e) => handleKeyPress(e, index)}
                              selectionColor={getAccentColor()}
                            />
                          </Animated.View>
                        ))}
                    </View>

                    {/* Timer */}
                    <View style={styles.timerContainer}>
                      <Text
                        style={[
                          styles.timerText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        Code expires in{" "}
                        <Text
                          style={{
                            color: getAccentColor(),
                            fontFamily: FONTS.SEMIBOLD,
                          }}
                        >
                          {formatTime(timeLeft)}
                        </Text>
                      </Text>
                    </View>

                    {/* Verify Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.M,
                      }}
                    >
                      <Button
                        title="Verify Email"
                        onPress={handleVerify}
                        loading={isLoading}
                        variant={isDarkMode ? "primary" : "secondary"}
                      />
                    </Animated.View>

                    {/* Resend Code */}
                    <View style={styles.resendContainer}>
                      <Text
                        style={[
                          styles.resendText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        Didn't receive the code?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={handleResendCode}
                        disabled={timerActive && timeLeft > 0}
                      >
                        <Text
                          style={[
                            styles.resendButtonText,
                            {
                              color:
                                timerActive && timeLeft > 0
                                  ? isDarkMode
                                    ? "rgba(225, 0, 255, 0.5)"
                                    : "rgba(255, 0, 153, 0.5)"
                                  : getAccentColor(),
                            },
                          ]}
                        >
                          Resend Code
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Back to login */}
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => router.back()}
                    >
                      <FontAwesome
                        name="arrow-left"
                        size={14}
                        color={
                          isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY
                        }
                      />
                      <Text
                        style={[
                          styles.backButtonText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        Back to Login
                      </Text>
                    </TouchableOpacity>
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
    alignItems: "center",
  },
  codeLabel: {
    alignSelf: "flex-start",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.S,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: SPACING.M,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 1,
    textAlign: "center",
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
  },
  timerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  timerText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.M,
  },
  resendText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
  },
  resendButtonText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.S,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.L,
  },
  backButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginLeft: SPACING.XS,
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

export default EmailVerificationScreen;
