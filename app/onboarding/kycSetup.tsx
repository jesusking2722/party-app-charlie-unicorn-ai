import { AnimationType, VerificationAnimation } from "@/animations";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Video } from "expo-av";
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

const KYCHeaderImage = require("@/assets/images/verify.png");
const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Define verification status types
enum VerificationStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

const KYCVerificationScreen = () => {
  const { isDarkMode } = useTheme();

  // State for verification status
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(VerificationStatus.NOT_STARTED);

  // State for modal visibility on Android
  const [modalVisible, setModalVisible] = useState(false);

  // State for loading
  const [loading, setLoading] = useState(false);

  // Redirect countdown timer (when verification is completed)
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  // Video reference
  const videoRef = useRef<Video>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
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

  // Mock third-party KYC service URL
  const KYC_SESSION_URL =
    "https://verify.didit.me/session/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDYyMjY0NDcsImV4cCI6MTc0NjgzMTI0Nywic2Vzc2lvbl9pZCI6Ijk2M2ViZWRiLTYxMmUtNGYyMS1iMWY1LWFkN2RjODU4M2RhMCJ9.L1xR8FFxNSmjPE2k3uAk9G0dejYIRA_fH4OhYGhN-dY?step=start";

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

  // Mock function to check verification status from your backend
  const checkVerificationStatus = async () => {
    try {
      // In a real app, this would be an API call to your backend
      // which would then check with the KYC provider

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo, we'll just return COMPLETED after a delay
      if (verificationStatus === VerificationStatus.PENDING) {
        setVerificationStatus(VerificationStatus.COMPLETED);

        // Start the redirect countdown when verification completes
        setRedirectCountdown(180); // 3 minutes in seconds
      }

      return true;
    } catch (error) {
      console.error("Error checking verification status:", error);
      Alert.alert(
        "Verification Error",
        "Unable to check verification status. Please try again later."
      );
      return false;
    }
  };

  // Polling effect for verification status
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (verificationStatus === VerificationStatus.PENDING) {
      // Poll every 5 seconds
      intervalId = setInterval(checkVerificationStatus, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [verificationStatus]);

  // Countdown effect after verification completes
  useEffect(() => {
    let countdownId: ReturnType<typeof setInterval>;

    if (redirectCountdown > 0) {
      countdownId = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            // Navigate to next step when countdown reaches 0
            navigateToNextStep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownId) clearInterval(countdownId);
    };
  }, [redirectCountdown]);

  // Start verification process
  const startVerification = async () => {
    setLoading(true);

    try {
      if (Platform.OS === "android") {
        // Show modal on Android with instructions
        setModalVisible(true);
      } else {
        // Open web browser on iOS
        await openBrowser();
      }
    } catch (error) {
      console.error("Error starting verification:", error);
      Alert.alert(
        "Verification Error",
        "Unable to start verification process. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open browser for verification
  const openBrowser = async () => {
    try {
      // Use Expo's WebBrowser for a better UX
      const result = await WebBrowser.openBrowserAsync(KYC_SESSION_URL);

      if (result.type === "dismiss") {
        // User came back to the app, update status to pending
        setVerificationStatus(VerificationStatus.PENDING);
      }
    } catch (error) {
      console.error("Error opening browser:", error);
      Alert.alert(
        "Browser Error",
        "Unable to open verification page. Please try again."
      );
    }
  };

  // Open external browser (from Android modal)
  const openExternalBrowser = async () => {
    try {
      // Close modal
      setModalVisible(false);

      // Open URL in external browser
      const supported = await Linking.canOpenURL(KYC_SESSION_URL);

      if (supported) {
        await Linking.openURL(KYC_SESSION_URL);
        // Set status to pending after opening browser
        setVerificationStatus(VerificationStatus.PENDING);
      } else {
        throw new Error("URL cannot be opened");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert(
        "Browser Error",
        "Unable to open verification page. Please try again."
      );
    }
  };

  // Navigate to next step (step 4)
  const navigateToNextStep = () => {
    router.push("/onboarding/membershipSetup");
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

            {/* <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                style={styles.video}
                source={require("@/assets/videos/kyc-intro.mp4")}
                useNativeControls={false}
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
                isMuted={false}
              />
            </View> */}

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
              We're waiting for your verification to complete
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
        return (
          <>
            <View style={styles.animationContainer}>
              <VerificationAnimation
                type={AnimationType.SUCCESS}
                loop={false}
                speed={0.8}
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
              Verification Successful
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
              Your identity has been successfully verified
            </Text>

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
                title="Continue Now"
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

      case VerificationStatus.FAILED:
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
              Verification Failed
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
              We couldn't verify your identity. Please try again.
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
                title="Try Again"
                onPress={startVerification}
                variant={isDarkMode ? "primary" : "secondary"}
                small={true}
                icon={
                  <FontAwesome5
                    name="redo"
                    size={14}
                    color="white"
                    style={{ marginLeft: SPACING.S }}
                  />
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
      <StatusBar style={isDarkMode ? "light" : "dark"} />

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
              source={KYCHeaderImage}
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
                <View>
                  <View
                    style={[
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
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  videoContainer: {
    width: "100%",
    height: 160,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    marginBottom: SPACING.M,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  video: {
    width: "100%",
    height: "100%",
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
});

export default KYCVerificationScreen;
