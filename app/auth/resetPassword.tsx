import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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
import {
  Button,
  Input,
  LanguageToggleGroup,
  ThemeToggle,
  Translate,
} from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import {
  resetPassword,
  resetPasswordRequest,
  verifyResetCode,
} from "@/lib/scripts/auth.scripts";
// import { resetPasswordRequest, verifyResetCode, resetPassword } from "@/lib/scripts/auth.scripts";

const PartyImage = require("@/assets/images/login_bg.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Number of verification code digits
const VERIFICATION_CODE_LENGTH = 5;

// Enum for screens
enum ResetPasswordSteps {
  EMAIL_ENTRY,
  CODE_VERIFICATION,
  NEW_PASSWORD,
}

const ResetPasswordScreen = () => {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const params = useLocalSearchParams();

  // State for multi-step form
  const [currentStep, setCurrentStep] = useState<ResetPasswordSteps>(
    ResetPasswordSteps.EMAIL_ENTRY
  );

  // Email step state
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  // Verification code step state
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(VERIFICATION_CODE_LENGTH).fill("")
  );

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // New password step state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Check if there's an email passed from params
  useEffect(() => {
    if (params.email) {
      setEmail(params.email as string);
    }
  }, [params]);

  // Format time from seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Timer effect
  useEffect(() => {
    if (currentStep === ResetPasswordSteps.CODE_VERIFICATION) {
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
    }
  }, [timeLeft, timerActive]);

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

      // Staggered code input animations if we're on code verification step
      if (currentStep === ResetPasswordSteps.CODE_VERIFICATION) {
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
      }

      // Start particle animations
      animateParticles();
    }, 100);
  }, []);

  // Re-animate code inputs when moving to verification step
  useEffect(() => {
    if (currentStep === ResetPasswordSteps.CODE_VERIFICATION) {
      codeInputsAnimations.forEach((anim, index) => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(index * ANIMATIONS.STAGGER_INTERVAL),
          Animated.spring(anim, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [currentStep]);

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

  // Validate email
  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }

    setEmailError("");
    return true;
  };

  // Validate password
  const validatePassword = (): boolean => {
    let isValid = true;

    if (!newPassword) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  // Handle code change
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

  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!validateEmail()) return;

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

      // Call API to send verification code
      const response = await resetPasswordRequest(email);

      if (response.ok) {
        // Move to verification step
        setCurrentStep(ResetPasswordSteps.CODE_VERIFICATION);

        // Reset verification code
        setVerificationCode(Array(VERIFICATION_CODE_LENGTH).fill(""));

        // Start timer
        setTimeLeft(180);
        setTimerActive(true);

        // Focus first input after a short delay
        setTimeout(() => {
          inputRef1.current?.focus();
        }, 500);

        showToast("Verification code sent to your email", "success");
      } else {
        showToast(
          response.message || "Failed to send verification code",
          "error"
        );
      }
    } catch (error) {
      console.error("Email submit error:", error);
      showToast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code verification
  const handleVerifyCode = async () => {
    const code = verificationCode.join("");

    if (code.length !== VERIFICATION_CODE_LENGTH) {
      showToast("Please enter the complete verification code", "warning");
      return;
    }

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

      // Call API to verify code
      const response = await verifyResetCode(email, code);

      if (response.ok) {
        setCurrentStep(ResetPasswordSteps.NEW_PASSWORD);
        showToast("Code verified successfully", "success");
      } else {
        showToast(response.message || "Invalid verification code", "error");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      showToast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    // Don't allow resend if timer is still active
    if (timerActive && timeLeft > 0) return;

    try {
      setIsLoading(true);

      // Reset verification code fields
      setVerificationCode(Array(VERIFICATION_CODE_LENGTH).fill(""));

      // Reset and start timer
      setTimeLeft(180);
      setTimerActive(true);

      // Call API to resend code
      const response = await resetPasswordRequest(email);

      if (response.ok) {
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

        // Focus on first input
        inputRef1.current?.focus();

        showToast("Verification code has been resent", "success");
      } else {
        showToast(response.message || "Failed to resend code", "error");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      showToast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!validatePassword()) return;

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

      // Call API to reset password
      const response = await resetPassword(email, newPassword);

      if (response.ok) {
        showToast("Password reset successfully", "success");

        // Navigate back to login
        setTimeout(() => {
          router.replace("/auth/login");
        }, 1500);
      } else {
        showToast(response.message || "Failed to reset password", "error");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      showToast("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case ResetPasswordSteps.EMAIL_ENTRY:
        return (
          <>
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
              <Translate>Reset Password</Translate>
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
              <Translate>
                Enter your email address to receive a verification code
              </Translate>
            </Text>

            {/* Email Form */}
            <View style={styles.formContainer}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
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

              {/* Important Note */}
              <View
                style={[
                  styles.noteContainer,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)",
                    borderColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.3)"
                      : "rgba(59, 130, 246, 0.2)",
                  },
                ]}
              >
                <FontAwesome
                  name="info-circle"
                  size={16}
                  color="#3B82F6"
                  style={styles.noteIcon}
                />
                <Text
                  style={[
                    styles.noteText,
                    {
                      color: isDarkMode
                        ? "rgba(219, 234, 254, 0.9)"
                        : "#3B82F6",
                    },
                  ]}
                >
                  <Translate>
                    This email must be the same one you used to create your
                    account. A verification code will be sent to this email.
                  </Translate>
                </Text>
              </View>

              {/* Submit Button */}
              <Animated.View
                style={{
                  width: "100%",
                  transform: [{ scale: buttonScale }],
                  marginTop: SPACING.M,
                }}
              >
                <Button
                  title="Send Code"
                  onPress={handleEmailSubmit}
                  loading={isLoading}
                  variant={isDarkMode ? "primary" : "secondary"}
                />
              </Animated.View>

              {/* Back to login */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/auth/login")}
              >
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
                  <Translate>Back to Login</Translate>
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case ResetPasswordSteps.CODE_VERIFICATION:
        return (
          <>
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
              <Translate>Verify Your Email</Translate>
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
              <Translate>We sent a verification code to</Translate>{" "}
              <Text style={{ fontFamily: FONTS.SEMIBOLD }}>{email}</Text>
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
                <Translate>Enter Verification Code</Translate>
              </Text>

              <View style={styles.codeInputContainer}>
                {Array(VERIFICATION_CODE_LENGTH)
                  .fill(0)
                  .map((_, index) => (
                    <Animated.View
                      key={`code-input-${index}`}
                      style={{
                        transform: [{ scale: codeInputsAnimations[index] }],
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
                        onChangeText={(text) => handleCodeChange(text, index)}
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
                  <Translate>Code expires in</Translate>{" "}
                  <Text
                    style={{
                      color: getAccentColor(),
                      fontFamily: FONTS.SEMIBOLD,
                    }}
                  >
                    <Translate>{formatTime(timeLeft)}</Translate>
                  </Text>
                </Text>
              </View>

              {/* Important Note */}
              <View
                style={[
                  styles.noteContainer,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)",
                    borderColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.3)"
                      : "rgba(59, 130, 246, 0.2)",
                    marginBottom: SPACING.M,
                  },
                ]}
              >
                <FontAwesome
                  name="info-circle"
                  size={16}
                  color="#3B82F6"
                  style={styles.noteIcon}
                />
                <Text
                  style={[
                    styles.noteText,
                    {
                      color: isDarkMode
                        ? "rgba(219, 234, 254, 0.9)"
                        : "#3B82F6",
                    },
                  ]}
                >
                  <Translate>
                    Check your email inbox and spam folder for the verification
                    code. Enter it here to continue with your password reset.
                  </Translate>
                </Text>
              </View>

              {/* Verify Button */}
              <Animated.View
                style={{
                  width: "100%",
                  transform: [{ scale: buttonScale }],
                }}
              >
                <Button
                  title="Verify Code"
                  onPress={handleVerifyCode}
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
                  <Translate>Didn't receive the code?</Translate>{" "}
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
                    <Translate>Resend Code</Translate>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Back to email step */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(ResetPasswordSteps.EMAIL_ENTRY)}
              >
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
                  <Translate>Back to Email</Translate>
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case ResetPasswordSteps.NEW_PASSWORD:
        return (
          <>
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
              <Translate>Create New Password</Translate>
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
              <Translate>
                Your identity has been verified. Set your new password below.
              </Translate>
            </Text>

            {/* New Password Form */}
            <View style={styles.formContainer}>
              <Input
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (passwordError) setPasswordError("");
                }}
                isPassword
                error={passwordError}
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

              <Input
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                isPassword
                error={confirmPasswordError}
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

              {/* Password Requirements */}
              <View
                style={[
                  styles.noteContainer,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)",
                    borderColor: isDarkMode
                      ? "rgba(59, 130, 246, 0.3)"
                      : "rgba(59, 130, 246, 0.2)",
                    marginTop: SPACING.S,
                    marginBottom: SPACING.M,
                  },
                ]}
              >
                <FontAwesome
                  name="info-circle"
                  size={16}
                  color="#3B82F6"
                  style={styles.noteIcon}
                />
                <Text
                  style={[
                    styles.noteText,
                    {
                      color: isDarkMode
                        ? "rgba(219, 234, 254, 0.9)"
                        : "#3B82F6",
                    },
                  ]}
                >
                  <Translate>
                    Your password must be at least 6 characters long and should
                    be different from your previous password for security
                    reasons.
                  </Translate>
                </Text>
              </View>

              {/* Reset Button */}
              <Animated.View
                style={{
                  width: "100%",
                  transform: [{ scale: buttonScale }],
                }}
              >
                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  variant={isDarkMode ? "primary" : "secondary"}
                />
              </Animated.View>

              {/* Back to verification step */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  setCurrentStep(ResetPasswordSteps.CODE_VERIFICATION)
                }
              >
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
                  <Translate>Back to Verification</Translate>
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

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

          {/* Reset Password Card (overlapping both sections) */}
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

                {/* Step Indicator */}
                <View style={styles.stepIndicatorContainer}>
                  {[0, 1, 2].map((step) => (
                    <View
                      key={`step-${step}`}
                      style={[
                        styles.stepDot,
                        {
                          backgroundColor:
                            step <= currentStep
                              ? getAccentColor()
                              : isDarkMode
                              ? "rgba(255, 255, 255, 0.2)"
                              : "rgba(0, 0, 0, 0.1)",
                        },
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.cardContent}>{renderStepContent()}</View>
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
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SPACING.M,
    paddingBottom: SPACING.XS,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
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
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  noteContainer: {
    flexDirection: "row",
    padding: SPACING.S,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 1,
    marginBottom: SPACING.M,
  },
  noteIcon: {
    marginRight: SPACING.XS,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    lineHeight: 18,
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
    display: "flex",
    flexDirection: "row",
    gap: 4,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});

export default ResetPasswordScreen;
