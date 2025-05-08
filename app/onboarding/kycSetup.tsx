import { AnimationType, VerificationAnimation } from "@/animations";
import { FontAwesome5 } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define verification status types
enum VerificationStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

const KYCVerificationScreen = () => {
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

  // Mock third-party KYC service URL
  const KYC_SESSION_URL =
    "https://verify.didit.me/session/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDYyMjY0NDcsImV4cCI6MTc0NjgzMTI0Nywic2Vzc2lvbl9pZCI6Ijk2M2ViZWRiLTYxMmUtNGYyMS1iMWY1LWFkN2RjODU4M2RhMCJ9.L1xR8FFxNSmjPE2k3uAk9G0dejYIRA_fH4OhYGhN-dY?step=start";

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

  // Go back to previous step
  const handleBack = () => {
    router.back();
  };

  // Format time for countdown display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Render content based on verification status
  const renderContent = () => {
    switch (verificationStatus) {
      case VerificationStatus.NOT_STARTED:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.verificationTitle}>Identity Verification</Text>
            <Text style={styles.verificationDescription}>
              We need to verify your identity to comply with regulations and
              keep your account secure.
            </Text>

            {/* Intro video */}
            <View style={styles.videoContainer}>
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
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <FontAwesome5
                  name="id-card"
                  size={24}
                  color="white"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Have your ID card or passport ready
                </Text>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5
                  name="video"
                  size={24}
                  color="white"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Find a well-lit area for video verification
                </Text>
              </View>

              <View style={styles.infoItem}>
                <FontAwesome5
                  name="clock"
                  size={24}
                  color="white"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  The process takes about 2-3 minutes
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={startVerification}
              disabled={loading}
            >
              <LinearGradient
                colors={["#FF0099", "#7F00FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.startButtonText}>
                      Start Verification
                    </Text>
                    <FontAwesome5
                      name="arrow-right"
                      size={14}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipVerification}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        );

      case VerificationStatus.PENDING:
        return (
          <View style={styles.contentContainer}>
            <VerificationAnimation
              type={AnimationType.PENDING}
              style={styles.lottieAnimation}
              loop={true}
              speed={1}
            />

            <Text style={styles.verificationTitle}>
              Verification in Progress
            </Text>
            <Text style={styles.verificationDescription}>
              We're waiting for your verification to complete. This may take a
              few moments.
            </Text>

            <View style={styles.pendingContainer}>
              <Text style={styles.pendingText}>
                Please wait while we process your verification...
              </Text>
            </View>
          </View>
        );

      case VerificationStatus.COMPLETED:
        return (
          <View style={styles.contentContainer}>
            <VerificationAnimation
              type={AnimationType.SUCCESS}
              style={styles.lottieAnimation}
              loop={false}
              speed={0.8}
            />

            <Text style={styles.verificationTitle}>
              Verification Successful
            </Text>
            <Text style={styles.verificationDescription}>
              Congratulations! Your identity has been successfully verified.
            </Text>

            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                You'll be redirected to the next step in{" "}
                {formatTime(redirectCountdown)}
              </Text>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={navigateToNextStep}
              >
                <LinearGradient
                  colors={["#FF0099", "#7F00FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.continueButtonText}>Continue Now</Text>
                    <FontAwesome5
                      name="arrow-right"
                      size={14}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case VerificationStatus.FAILED:
        return (
          <View style={styles.contentContainer}>
            <VerificationAnimation
              type={AnimationType.FAILED}
              style={styles.lottieAnimation}
              loop={false}
              speed={1}
            />

            <Text style={styles.verificationTitle}>Verification Failed</Text>
            <Text style={styles.verificationDescription}>
              We couldn't verify your identity. Please try again or skip for
              now.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={startVerification}
            >
              <LinearGradient
                colors={["#FF0099", "#7F00FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.retryButtonGradient}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                  <FontAwesome5
                    name="redo"
                    size={14}
                    color="white"
                    style={styles.buttonIcon}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={skipVerification}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#7F00FF", "#E100FF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityLabel="Go back"
        >
          <FontAwesome5 name="arrow-left" size={16} color="white" />
        </TouchableOpacity>

        {renderContent()}

        <View style={styles.progressContainer}>
          <View style={styles.progressLine}>
            <View style={styles.progressFilled} />
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>Step 3 of 4</Text>
          </View>
        </View>

        {/* Android Modal for browser redirection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={["#7F00FF", "#E100FF"]}
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modalTitle}>Complete Verification</Text>
                <Text style={styles.modalDescription}>
                  You'll be redirected to our verification partner to complete
                  your identity verification.
                </Text>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={openExternalBrowser}
                  >
                    <LinearGradient
                      colors={["#FF0099", "#7F00FF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={styles.modalButtonText}>
                        Continue to Verification
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  videoContainer: {
    width: "100%",
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  lottieAnimation: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  verificationTitle: {
    fontSize: 28,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    marginBottom: 12,
  },
  verificationDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
    marginBottom: 30,
    lineHeight: 24,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    lineHeight: 40,
    marginRight: 16,
  },
  infoText: {
    fontSize: 16,
    color: "white",
    fontFamily: "Montserrat-Regular",
    flex: 1,
  },
  startButton: {
    width: "100%",
    borderRadius: 12,
    height: 56,
    overflow: "hidden",
    marginBottom: 16,
  },
  startButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
  pendingContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  pendingText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginTop: 16,
  },
  successContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  successText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  continueButton: {
    width: "100%",
    borderRadius: 12,
    height: 56,
    overflow: "hidden",
  },
  continueButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  retryButton: {
    width: "100%",
    borderRadius: 12,
    height: 56,
    overflow: "hidden",
    marginBottom: 16,
  },
  retryButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLine: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFilled: {
    width: "75%", // 3 of 4 steps
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  progressTextContainer: {
    alignItems: "center",
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalGradient: {
    padding: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtonContainer: {
    alignItems: "center",
  },
  modalButton: {
    width: "100%",
    borderRadius: 12,
    height: 50,
    overflow: "hidden",
    marginBottom: 12,
  },
  modalButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  modalCancelButton: {
    padding: 12,
  },
  modalCancelText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
});

export default KYCVerificationScreen;
