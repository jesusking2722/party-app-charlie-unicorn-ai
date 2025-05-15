import { AnimationType, VerificationAnimation } from "@/animations";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
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
import { Button, ThemeToggle } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import {
  fetchAuthUserById,
  startAuthUserKyc,
} from "@/lib/scripts/auth.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSelector } from "react-redux";

const KYCHeaderImage = require("@/assets/images/verify.png");
const CelebrateImage = require("@/assets/images/congratulations.png");
const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Define verification status types
enum VerificationStatus {
  NOT_STARTED = "Not Started",
  PENDING = "In Progress",
  COMPLETED = "Completed",
  DECLINED = "Declined",
  EXPIRED = "Expired",
  APPROVED = "Approved",
  ABANDONED = "Abandoned",
}

const KYCVerificationScreen = () => {
  const { isDarkMode } = useTheme();

  // State for verification status
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(VerificationStatus.NOT_STARTED);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [isPollingActive, setIsPollingActive] = useState(false);

  const pollingIntervalRef = useRef<any>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

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

      // Checkmark animation
      if (
        verificationStatus === VerificationStatus.COMPLETED ||
        verificationStatus === VerificationStatus.APPROVED
      ) {
        Animated.sequence([
          Animated.delay(animationDelay / 2),
          Animated.spring(checkmarkScale, {
            toValue: 1,
            tension: 80,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Start particle animations
      animateParticles();
    }, 100);

    // Cleanup animation on unmount
    return () => {
      stopKycPolling();
    };
  }, [verificationStatus]);

  // Set KYC status when component mounts
  useEffect(() => {
    // Check if user already has KYC status
    if (user?.kyc?.status) {
      updateVerificationStatus(user.kyc.status);
    }
  }, [user]);

  // Start polling for KYC result when verification is pending
  useEffect(() => {
    if (
      (verificationStatus === VerificationStatus.PENDING || isPollingActive) &&
      !pollingIntervalRef.current
    ) {
      startKycPolling();
    }

    // Countdown effect after verification completes
    if (
      (verificationStatus === VerificationStatus.COMPLETED ||
        verificationStatus === VerificationStatus.APPROVED) &&
      redirectCountdown > 0
    ) {
      const countdownId = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownId);
      };
    }

    // Cleanup polling interval on unmount
    return () => {
      stopKycPolling();
    };
  }, [verificationStatus, isPollingActive, redirectCountdown]);

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

  // Helper function to update verification status based on API response
  const updateVerificationStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        setVerificationStatus(VerificationStatus.PENDING);
        setIsPollingActive(true);
        break;
      case "completed":
        setVerificationStatus(VerificationStatus.COMPLETED);
        setRedirectCountdown(180); // 3 minutes in seconds
        stopKycPolling();
        break;
      case "approved":
        setVerificationStatus(VerificationStatus.APPROVED);
        setRedirectCountdown(180); // 3 minutes in seconds
        stopKycPolling();
        break;
      case "declined":
        setVerificationStatus(VerificationStatus.DECLINED);
        stopKycPolling();
        break;
      case "expired":
        setVerificationStatus(VerificationStatus.EXPIRED);
        stopKycPolling();
        break;
      case "abandoned":
        setVerificationStatus(VerificationStatus.ABANDONED);
        stopKycPolling();
        break;
      default:
        setVerificationStatus(VerificationStatus.NOT_STARTED);
        stopKycPolling();
    }
  };

  // Start polling for KYC result
  const startKycPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsPollingActive(true);

    fetchKycResult();

    pollingIntervalRef.current = setInterval(() => {
      if (
        verificationStatus === VerificationStatus.PENDING ||
        isPollingActive
      ) {
        fetchKycResult();
      } else {
        stopKycPolling();
      }
    }, 10000);
  };

  // Stop polling for KYC result
  const stopKycPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPollingActive(false);
  };

  // Fetch KYC result from backend
  const fetchKycResult = async () => {
    if (!user?._id) return;

    try {
      const response = await fetchAuthUserById(user._id);
      if (response.ok) {
        const { user: updatedUser } = response.data;
        await dispatch(setAuthUserAsync(updatedUser)).unwrap();

        // Update verification status based on KYC status
        if (updatedUser.kyc?.status) {
          console.log("KYC status updated:", updatedUser.kyc.status);
          updateVerificationStatus(updatedUser.kyc.status);
        } else {
          // If there's no status yet, keep polling until we get a status
          console.log("No KYC status yet, continuing to poll...");
        }
      } else {
        console.error("Failed to fetch KYC result:", response.message);
        // Don't stop polling on fetch errors, try again later
      }
    } catch (error) {
      console.error("Error fetching KYC result:", error);
      // Don't stop polling on fetch errors, try again later
    }
  };

  // Start verification process
  const startVerification = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // If we already have a KYC URL, use it directly
      if (user.kyc?.url) {
        if (Platform.OS === "android") {
          setModalVisible(true);
        } else {
          // For iOS, open browser and immediately set to pending
          setVerificationStatus(VerificationStatus.PENDING);
          startKycPolling(); // Start polling immediately
          await openBrowser();
        }
        setLoading(false);
        return;
      }

      // If no KYC URL yet, get one from the backend
      const response = await startAuthUserKyc(user);
      if (response.ok) {
        const { user: updatedUser } = response.data;
        await dispatch(setAuthUserAsync(updatedUser)).unwrap();

        if (Platform.OS === "android") {
          setModalVisible(true);
        } else {
          // For iOS, set to pending immediately
          setVerificationStatus(VerificationStatus.PENDING);
          startKycPolling(); // Start polling immediately
          await openBrowser();
        }
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
      console.error("Error starting verification:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open browser for verification
  const openBrowser = async () => {
    if (!user?.kyc?.url) return;

    try {
      const result = await WebBrowser.openBrowserAsync(user.kyc.url);
    } catch (error) {
      console.error("Error opening browser:", error);
      Alert.alert(
        "Browser Error",
        "Unable to open verification page. Please try again."
      );

      // Reset to NOT_STARTED if there was an error
      setVerificationStatus(VerificationStatus.NOT_STARTED);
      stopKycPolling();
    }
  };

  // Open external browser (from Android modal)
  const openExternalBrowser = async () => {
    if (!user?.kyc?.url) return;

    try {
      // Close modal first
      setModalVisible(false);

      // Set status to pending BEFORE opening the URL
      setVerificationStatus(VerificationStatus.PENDING);

      // Start polling immediately
      startKycPolling();

      // Open URL in external browser
      const supported = await Linking.canOpenURL(user.kyc.url);
      if (supported) {
        await Linking.openURL(user.kyc.url);
      } else {
        throw new Error("URL cannot be opened");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert(
        "Browser Error",
        "Unable to open verification page. Please try again."
      );

      // Reset to NOT_STARTED if there was an error
      setVerificationStatus(VerificationStatus.NOT_STARTED);
      stopKycPolling();
    }
  };

  // Navigate to next step (step 4)
  const navigateToNextStep = () => {
    router.push("/onboarding/membershipSetup");
  };

  const handleContinueVerifySession = async () => {
    if (user?.kyc?.url) {
      if (Platform.OS === "android") {
        setModalVisible(true);
      } else {
        setVerificationStatus(VerificationStatus.PENDING);
        startKycPolling();
        await openBrowser();
      }
      setLoading(false);
      return;
    }
  };

  // Skip verification for now
  const skipVerification = () => {
    Alert.alert(
      "Skip Verification",
      "You can complete verification later, but some features may be limited.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Skip",
          onPress: navigateToNextStep,
        },
      ]
    );
  };

  // Format time for countdown display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Render particles for background effect
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

  // Get header image based on verification status
  const getHeaderImage = () => {
    if (
      verificationStatus === VerificationStatus.COMPLETED ||
      verificationStatus === VerificationStatus.APPROVED
    ) {
      return CelebrateImage;
    }
    return KYCHeaderImage;
  };

  // Content for each verification state
  const renderVerificationContent = () => {
    switch (verificationStatus) {
      case VerificationStatus.NOT_STARTED:
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
              Identity Verification
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
              We need to verify your identity to comply with regulations
            </Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="id-card"
                    size={16}
                    color={
                      isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Have your ID card or passport ready
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome
                    name="video-camera"
                    size={16}
                    color={
                      isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Find a well-lit area for video verification
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="clock"
                    size={16}
                    color={
                      isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  The process takes about 2-3 minutes
                </Text>
              </View>
            </View>

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
                  Verification Process
                </Text>
                <Text
                  style={[
                    styles.progressStep,
                    {
                      color: getAccentColor(),
                    },
                  ]}
                >
                  Step 3 of 4
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
                      width: "75%", // 3 of 4 steps
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </View>
              </View>
            </View>

            {/* Buttons */}
            <Animated.View
              style={{
                width: "100%",
                transform: [{ scale: buttonScale }],
                marginTop: SPACING.M,
              }}
            >
              <Button
                title={loading ? "Loading..." : "Start Verification"}
                onPress={startVerification}
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

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipVerification}
            >
              <Text
                style={[
                  styles.skipButtonText,
                  {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.5)",
                  },
                ]}
              >
                Skip for now
              </Text>
            </TouchableOpacity>
          </>
        );

      case VerificationStatus.PENDING:
        return (
          <>
            <View style={styles.animationContainer}>
              <VerificationAnimation
                type={AnimationType.PENDING}
                loop={true}
                speed={1}
                style={styles.animation}
              />
            </View>

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
              Verification in Progress
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
              We're checking your identity. This may take a few minutes.
            </Text>

            <View style={styles.pendingContainer}>
              <ActivityIndicator
                color={getAccentColor()}
                size="large"
                style={styles.pendingIndicator}
              />
              <Text
                style={[
                  styles.pendingText,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  },
                ]}
              >
                Please wait while we process your verification...
              </Text>
              <Text
                style={[
                  styles.pendingText,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  },
                ]}
              >
                Didn't you get verification session?
              </Text>
              <View style={{ width: "100%", marginTop: 10 }}>
                <Button
                  variant={isDarkMode ? "primary" : "secondary"}
                  title="Continue to verify"
                  small={true}
                  onPress={handleContinueVerifySession}
                />
              </View>
            </View>

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
                  Verification Process
                </Text>
                <Text
                  style={[
                    styles.progressStep,
                    {
                      color: getAccentColor(),
                    },
                  ]}
                >
                  Step 3 of 4
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
                      width: "75%", // 3 of 4 steps
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </View>
              </View>
            </View>
          </>
        );

      case VerificationStatus.COMPLETED:
      case VerificationStatus.APPROVED:
        return (
          <>
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
                colors={isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkIconGradient}
              >
                <FontAwesome name="trophy" size={24} color="white" />
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
              Your identity has been successfully verified
            </Text>

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
              You're now ready to access all features of our platform. Thank you
              for your patience.
            </Text>

            {redirectCountdown > 0 && (
              <View style={styles.successContainer}>
                <Text
                  style={[
                    styles.successText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  You'll be redirected in {formatTime(redirectCountdown)}
                </Text>
              </View>
            )}

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
                  Verification Process
                </Text>
                <Text
                  style={[
                    styles.progressStep,
                    {
                      color: getAccentColor(),
                    },
                  ]}
                >
                  Step 3 of 4
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
                      width: "75%", // 3 of 4 steps
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
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
                title="Continue"
                onPress={navigateToNextStep}
                variant={isDarkMode ? "primary" : "secondary"}
                small={true}
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
          </>
        );

      case VerificationStatus.DECLINED:
        return (
          <>
            <View style={styles.animationContainer}>
              <VerificationAnimation
                type={AnimationType.FAILED}
                loop={false}
                speed={1}
                style={styles.animation}
              />
            </View>

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
              Verification Declined
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
              Unfortunately, your verification was declined
            </Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 100, 100, 0.2)"
                        : "rgba(255, 100, 100, 0.1)",
                    },
                  ]}
                >
                  <FontAwesome5
                    name="exclamation-triangle"
                    size={16}
                    color={COLORS.ERROR}
                  />
                </View>
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  There was a problem with your verification documents
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 100, 100, 0.2)"
                        : "rgba(255, 100, 100, 0.1)",
                    },
                  ]}
                >
                  <FontAwesome5
                    name="envelope"
                    size={16}
                    color={COLORS.ERROR}
                  />
                </View>
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Contact support team for more detailed information
                </Text>
              </View>

              <View style={{ width: "100%", marginTop: 10 }}>
                <Button
                  title="Contact us"
                  variant={isDarkMode ? "primary" : "secondary"}
                  small={true}
                  onPress={() => {}}
                />
              </View>
            </View>

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
                  Verification Process
                </Text>
                <Text
                  style={[
                    styles.progressStep,
                    {
                      color: getAccentColor(),
                    },
                  ]}
                >
                  Step 3 of 4
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
                      width: "75%", // 3 of 4 steps
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipVerification}
            >
              <Text
                style={[
                  styles.skipButtonText,
                  {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.5)",
                  },
                ]}
              >
                Skip for now
              </Text>
            </TouchableOpacity>
          </>
        );

      case VerificationStatus.EXPIRED:
      case VerificationStatus.ABANDONED:
        return (
          <>
            <View style={styles.animationContainer}>
              <VerificationAnimation
                type={AnimationType.FAILED}
                loop={false}
                speed={1}
                style={styles.animation}
              />
            </View>

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
              Verification{" "}
              {verificationStatus === VerificationStatus.EXPIRED
                ? "Expired"
                : "Abandoned"}
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
              Your verification session has{" "}
              {verificationStatus === VerificationStatus.EXPIRED
                ? "expired"
                : "been abandoned"}
            </Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="clock"
                    size={16}
                    color={
                      isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  {verificationStatus === VerificationStatus.EXPIRED
                    ? "Your verification session has timed out"
                    : "Your verification was not completed"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="redo"
                    size={16}
                    color={
                      isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Please start the verification process again
                </Text>
              </View>
            </View>

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
                  Verification Process
                </Text>
                <Text
                  style={[
                    styles.progressStep,
                    {
                      color: getAccentColor(),
                    },
                  ]}
                >
                  Step 3 of 4
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
                      width: "75%", // 3 of 4 steps
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </View>
              </View>
            </View>

            {/* Retry Button */}
            <Animated.View
              style={{
                width: "100%",
                transform: [{ scale: buttonScale }],
                marginTop: SPACING.M,
              }}
            >
              <Button
                title="Restart Verification"
                onPress={startVerification}
                loading={loading}
                variant={isDarkMode ? "primary" : "secondary"}
                small={true}
                icon={
                  !loading && (
                    <FontAwesome5
                      name="redo"
                      size={14}
                      color="white"
                      style={{ marginLeft: SPACING.S }}
                    />
                  )
                }
                iconPosition="right"
              />
            </Animated.View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipVerification}
            >
              <Text
                style={[
                  styles.skipButtonText,
                  {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.5)",
                  },
                ]}
              >
                Skip for now
              </Text>
            </TouchableOpacity>
          </>
        );

      default:
        return null;
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
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Image Section */}
          <View style={styles.headerImageContainer}>
            <Image
              source={getHeaderImage()}
              style={styles.headerImage}
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

            {/* Content Card */}
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
                    {renderVerificationContent()}
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android Modal for browser redirection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: modalVisible ? 0 : 100 }],
              },
            ]}
          >
            <BlurView
              intensity={isDarkMode ? 40 : 30}
              tint={isDarkMode ? "dark" : "light"}
              style={styles.modalBlur}
            >
              <LinearGradient
                colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
                style={styles.modalGradient}
              >
                {/* Handle for draggable modal */}
                <View style={styles.modalHandle}>
                  <View
                    style={[
                      styles.modalHandleBar,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.3)"
                          : "rgba(0, 0, 0, 0.2)",
                      },
                    ]}
                  />
                </View>

                {/* Modal Accent Bar */}
                <View
                  style={[
                    styles.modalAccentBar,
                    {
                      backgroundColor: getAccentColor(),
                    },
                  ]}
                />

                <View style={styles.modalContent}>
                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    Complete Verification
                  </Text>
                  <Text
                    style={[
                      styles.modalDescription,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    You'll be redirected to our verification partner to complete
                    your identity verification.
                  </Text>

                  <Button
                    title="Continue to Verification"
                    onPress={openExternalBrowser}
                    variant={isDarkMode ? "primary" : "secondary"}
                    small={true}
                  />

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={[
                        styles.modalCancelText,
                        {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.6)"
                            : "rgba(0, 0, 0, 0.5)",
                        },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </View>
      </Modal>
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
  headerImageContainer: {
    height: height * 0.4,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  headerImage: {
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
    minHeight: height * 0.75,
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
    textAlign: "center",
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
    textAlign: "center",
  },
  infoContainer: {
    width: "100%",
    marginBottom: SPACING.M,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: SPACING.S,
  },
  infoText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    flex: 1,
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
  skipButton: {
    alignSelf: "center",
    marginTop: SPACING.M,
    padding: SPACING.S,
  },
  skipButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    zIndex: 100,
  },
  animationContainer: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  animation: {
    width: 150,
    height: 150,
  },
  pendingContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.L,
  },
  pendingIndicator: {
    marginBottom: SPACING.S,
  },
  pendingText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
  },
  successContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.L,
  },
  successText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Align to bottom for mobile style modal
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: width,
    maxHeight: height * 0.4, // Limit height to 40% of screen
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  modalBlur: {
    width: "100%",
    height: "100%",
  },
  modalGradient: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
  },
  modalHandle: {
    alignItems: "center",
    paddingTop: SPACING.S,
  },
  modalHandleBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  modalAccentBar: {
    height: 6,
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
  },
  modalContent: {
    padding: SPACING.M,
    paddingBottom: Platform.OS === "ios" ? SPACING.L : SPACING.M, // Extra padding for iOS
  },
  modalTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.L,
    marginBottom: SPACING.XS,
  },
  modalDescription: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  modalCancelButton: {
    alignSelf: "center",
    marginTop: SPACING.M,
    padding: SPACING.S,
  },
  modalCancelText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  // Congratulations styles
  checkIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: SPACING.M,
    alignSelf: "center",
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
});

export default KYCVerificationScreen;
