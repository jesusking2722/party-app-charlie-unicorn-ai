import { FONTS } from "@/app/theme";
import { Button } from "@/components/common";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

const CongratulationsScreen = () => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);
  const flowersRef = useRef<any>(null);

  // Run animation sequence on component mount
  useEffect(() => {
    // Start both confetti and flower animations
    if (confettiRef.current) {
      confettiRef.current.play();
    }
    if (flowersRef.current) {
      flowersRef.current.play();
    }

    // Create a beautiful staggered animation sequence
    Animated.sequence([
      // First animate the check icon
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // Then animate the title
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Then animate subtitle
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Then animate message
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Finally animate button
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle navigation to the home screen
  const handleJoinNow = () => {
    router.push("/main");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#7F00FF", "#E100FF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        {/* Confetti animation */}
        <LottieView
          ref={confettiRef}
          source={require("@/assets/animations/confetti.json")}
          style={styles.confettiAnimation}
          loop={false}
          autoPlay={false}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["#FF9500", "#FF0099"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.iconGradient}
            >
              <FontAwesome5 name="check-circle" size={40} color="white" solid />
            </LinearGradient>
          </Animated.View>

          {/* Title with staggered animation */}
          <Animated.Text
            style={[
              styles.congratsTitle,
              {
                opacity: titleAnim,
                transform: [
                  {
                    translateY: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            Congratulations!
          </Animated.Text>

          {/* Subtitle with staggered animation */}
          <Animated.Text
            style={[
              styles.congratsSubtitle,
              {
                opacity: subtitleAnim,
                transform: [
                  {
                    translateY: subtitleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            You've successfully completed the onboarding
          </Animated.Text>

          {/* Message with staggered animation */}
          <Animated.Text
            style={[
              styles.congratsMessage,
              {
                opacity: messageAnim,
                transform: [
                  {
                    translateY: messageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            You're all set to explore our platform and discover all the amazing
            features we have to offer
          </Animated.Text>

          {/* Join Now Button with animation */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  {
                    scale: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Button
              title="Join now"
              variant="primary"
              onPress={handleJoinNow}
            />
          </Animated.View>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  confettiAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: "none",
  },
  flowersAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    pointerEvents: "none",
  },
  contentContainer: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  iconContainer: {
    marginBottom: 32,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#FF0099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  congratsTitle: {
    fontSize: 42,
    fontFamily: FONTS.BOLD,
    color: "white",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  congratsSubtitle: {
    fontSize: 18,
    fontFamily: FONTS.SEMIBOLD,
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  congratsMessage: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "85%",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  joinButton: {
    borderRadius: 16,
    height: 60,
    width: "100%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  joinButtonGradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: FONTS.SEMIBOLD,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: -width * 0.2,
    right: -width * 0.2,
    zIndex: 1,
  },
  decorativeCircle2: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    bottom: -width * 0.1,
    left: -width * 0.1,
    zIndex: 1,
  },
  decorativeCircle3: {
    position: "absolute",
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: "rgba(255, 0, 153, 0.08)",
    top: height * 0.15,
    left: width * 0.1,
    zIndex: 1,
  },
});

export default CongratulationsScreen;
