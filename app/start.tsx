import { BORDER_RADIUS, FONTS } from "@/app/theme";
import { Translate } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import useInit from "@/hooks/useInit";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";

// Replace with your actual logo
const LOGO_IMAGE = require("@/assets/images/logo.png");

const { width, height } = Dimensions.get("window");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

const Start = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isAuthComplete, setIsAuthComplete] = useState(false);
  const authInitialized = useRef(false);

  // Get the initialization function and loading state
  const {
    fetchAuthUser,
    fetchAllPartiesInfo,
    fetchAllTicketsInfo,
    fetchAllMessagesInfo,
    checkRedirectPath,
    initLoading,
  } = useInit();

  // Call fetchAuthUser only once when the component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authInitialized.current) {
        authInitialized.current = true;
        try {
          const user = (await fetchAuthUser()) as any;
          await fetchAllPartiesInfo();
          await fetchAllMessagesInfo();
          await fetchAllTicketsInfo();
          await new Promise((resolve) => setTimeout(resolve, 5000));
          setIsAuthComplete(true);
          if (user && user._id) {
            checkRedirectPath(user);
          } else {
            router.push("/home");
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          setIsAuthComplete(true);
        }
      }
    };

    initializeAuth();
  }, [fetchAuthUser]);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const dotScale1 = useRef(new Animated.Value(0)).current;
  const dotScale2 = useRef(new Animated.Value(0)).current;
  const dotScale3 = useRef(new Animated.Value(0)).current;
  const dotTranslateY1 = useRef(new Animated.Value(0)).current;
  const dotTranslateY2 = useRef(new Animated.Value(0)).current;
  const dotTranslateY3 = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(1)).current;
  const gradientOpacity = useRef(new Animated.Value(0)).current;
  const versionOpacity = useRef(new Animated.Value(0)).current;

  // Animated particles
  const particles = Array(8)
    .fill(0)
    .map(() => ({
      translateX: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(0)).current,
      size: useRef(new Animated.Value(Math.random() * 6 + 2)).current,
      opacity: useRef(new Animated.Value(0)).current,
    }));

  // Animate particles
  useEffect(() => {
    particles.forEach((particle, index) => {
      // Generate random values for animations
      const initialX = Math.random() * width - width / 2; // Centered around the middle
      const initialY = Math.random() * height * 0.6 + height * 0.2 - height / 2; // Centered
      const moveDistance = Math.random() * 100 + 50;
      const delay = index * 100 + Math.random() * 500;
      const duration = 2000 + Math.random() * 3000;

      // Set initial positions using transform properties
      particle.translateX.setValue(initialX);
      particle.translateY.setValue(initialY);

      // Fade in particles
      Animated.timing(particle.opacity, {
        toValue: Math.random() * 0.4 + 0.1,
        duration: 1500,
        delay,
        useNativeDriver: true,
      }).start();

      // Moving animation - use translate instead of position
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.translateY, {
            toValue: initialY - moveDistance, // Move up
            duration,
            easing: Easing.bezier(0.45, 0, 0.55, 1),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: initialY, // Move back to original position
            duration,
            easing: Easing.bezier(0.45, 0, 0.55, 1),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Size pulsing
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.size, {
            toValue: Math.random() * 4 + 4,
            duration: duration * 0.7,
            easing: Easing.bezier(0.45, 0, 0.55, 1),
            useNativeDriver: true,
          }),
          Animated.timing(particle.size, {
            toValue: Math.random() * 6 + 2,
            duration: duration * 0.7,
            easing: Easing.bezier(0.45, 0, 0.55, 1),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  useEffect(() => {
    // Start logo animation sequence with more advanced animations
    const initialAnimation = Animated.sequence([
      // Fade in gradient background
      Animated.timing(gradientOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),

      // Start with logo appearing, scaling up, and subtle rotation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          // Subtle initial rotation effect
          Animated.timing(logoRotate, {
            toValue: -0.05, // Slight counter-clockwise
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(logoRotate, {
            toValue: 0, // Back to center
            duration: 600,
            easing: Easing.elastic(1.5),
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Grow the circle behind logo
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),

      // Fade in and animate the text with slight motion
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        // Slightly delayed animation for tagline
        Animated.sequence([
          Animated.delay(150),
          Animated.parallel([
            Animated.timing(taglineTranslateY, {
              toValue: 0,
              duration: 600,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Version text fade in
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(versionOpacity, {
            toValue: 0.7,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Animate loading dots with bouncy effect
      Animated.stagger(150, [
        Animated.parallel([
          Animated.spring(dotScale1, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(dotTranslateY1, {
            toValue: -5,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(dotScale2, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(dotTranslateY2, {
            toValue: -5,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(dotScale3, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(dotTranslateY3, {
            toValue: -5,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Brief pause for loading effect
      Animated.delay(300),
    ]);

    // Start the initial animation
    initialAnimation.start();

    // Set a minimum animation display time
    const minDisplayTimeout = setTimeout(() => {
      // If init is already completed, play exit animation
      if (isAuthComplete && !initLoading) {
        playExitAnimation();
      }
    }, 2500);

    return () => clearTimeout(minDisplayTimeout);
  }, []);

  // Watch for changes in auth status to potentially start exit animation
  useEffect(() => {
    if (isAuthComplete && !initLoading && !isAnimationComplete) {
      playExitAnimation();
    }
  }, [isAuthComplete, initLoading, isAnimationComplete]);

  // Function to play exit animation with enhanced transitions
  const playExitAnimation = () => {
    Animated.parallel([
      // Scale up and fade out background circle
      Animated.timing(circleScale, {
        toValue: 3,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),

      // Fade out particles
      ...particles.map((particle) =>
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ),

      // Shrink and fade logo
      Animated.timing(logoScale, {
        toValue: 0.6,
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),

      // Fade out and slide text
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: -20,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(taglineTranslateY, {
        toValue: -20,
        duration: 500,
        useNativeDriver: true,
      }),

      // Fade out dots with staggered timing
      Animated.stagger(100, [
        Animated.timing(dotScale1, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale2, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale3, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Fade out version text
      Animated.timing(versionOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),

      // Fade out gradient background at the end
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(gradientOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsAnimationComplete(true);
    });
  };

  // Loop animation for dots while waiting for init
  useEffect(() => {
    let animationTimer: any = null;

    const loopDotsAnimation = () => {
      // Only animate dots while initialization is still loading
      if (initLoading || !isAuthComplete) {
        // Reset dot scales
        dotScale1.setValue(1);
        dotScale2.setValue(1);
        dotScale3.setValue(1);

        // Reset dot positions
        dotTranslateY1.setValue(0);
        dotTranslateY2.setValue(0);
        dotTranslateY3.setValue(0);

        // Animate dots in sequence with bouncy effect
        Animated.stagger(150, [
          Animated.parallel([
            Animated.sequence([
              Animated.spring(dotTranslateY1, {
                toValue: -8,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(dotTranslateY1, {
                toValue: 0,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.sequence([
              Animated.spring(dotTranslateY2, {
                toValue: -8,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(dotTranslateY2, {
                toValue: 0,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.parallel([
            Animated.sequence([
              Animated.spring(dotTranslateY3, {
                toValue: -8,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(dotTranslateY3, {
                toValue: 0,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start(() => {
          // Continue animation loop if still loading
          if (initLoading || !isAuthComplete) {
            animationTimer = setTimeout(loopDotsAnimation, 300);
          }
        });
      }
    };

    // Start the animation loop after initial animation has time to complete
    const startTimer = setTimeout(loopDotsAnimation, 1800);

    return () => {
      clearTimeout(startTimer);
      if (animationTimer) clearTimeout(animationTimer);
    };
  }, [initLoading, isAuthComplete, dotScale1, dotScale2, dotScale3]);

  // For logo rotation animation
  const logoRotateInterpolation = logoRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-30deg", "0deg", "30deg"],
  });

  // Define gradient colors based on theme
  const gradientColors = isDarkMode
    ? ["#1A1A2E", "#16213E", "#0F3460"] // Dark mode gradient
    : ["#EDEBFE", "#FED7E2", "#FECDD3"]; // Light mode gradient

  return (
    <View style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Main Background Gradient */}
      <Animated.View
        style={[styles.gradientContainer, { opacity: gradientOpacity }]}
      >
        <LinearGradient
          colors={gradientColors as any}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Background Overlay Gradient - adds depth */}
      <LinearGradient
        colors={
          isDarkMode
            ? [
                "rgba(26, 26, 46, 0)",
                "rgba(22, 33, 62, 0.3)",
                "rgba(15, 52, 96, 0.7)",
              ]
            : [
                "rgba(237, 235, 254, 0)",
                "rgba(254, 215, 226, 0.3)",
                "rgba(254, 205, 211, 0.7)",
              ]
        }
        style={styles.overlayGradient}
        locations={[0, 0.5, 0.9]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Animated Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={`particle-${index}`}
          style={[
            styles.particle,
            {
              opacity: particle.opacity,
              transform: [
                { translateX: particle.translateX },
                { translateY: particle.translateY },
                { scale: particle.size },
              ],
              backgroundColor: isDarkMode
                ? `rgba(${70 + Math.floor(Math.random() * 80)}, ${
                    80 + Math.floor(Math.random() * 100)
                  }, ${150 + Math.floor(Math.random() * 105)}, 0.7)`
                : `rgba(${220 + Math.floor(Math.random() * 35)}, ${
                    100 + Math.floor(Math.random() * 120)
                  }, ${150 + Math.floor(Math.random() * 70)}, 0.7)`,
            },
          ]}
        />
      ))}

      {/* Content container */}
      <View style={styles.contentContainer}>
        {/* Animated logo with glass effect backdrop */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScale },
                { rotate: logoRotateInterpolation },
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Pulsing circle behind logo */}
          <Animated.View
            style={[
              styles.pulsingCircle,
              {
                backgroundColor: isDarkMode
                  ? "rgba(79, 70, 229, 0.15)"
                  : "rgba(255, 0, 153, 0.12)",
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
              },
            ]}
          />

          {/* Glass effect behind logo */}
          <BlurView
            intensity={isDarkMode ? 40 : 30}
            tint={isDarkMode ? "dark" : "light"}
            style={styles.logoBlur}
          >
            <LinearGradient
              colors={
                isDarkMode
                  ? ["rgba(79, 70, 229, 0.2)", "rgba(124, 58, 237, 0.2)"]
                  : ["rgba(255, 0, 153, 0.15)", "rgba(225, 0, 255, 0.15)"]
              }
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </BlurView>

          {/* Actual logo */}
          <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />

          {/* Logo highlight effect */}
          <View
            style={[
              styles.logoHighlight,
              {
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(255, 255, 255, 0.35)",
              },
            ]}
          />
        </Animated.View>

        {/* App name */}
        <Animated.Text
          style={[
            styles.appName,
            {
              color: isDarkMode ? "#FFFFFF" : "#333333",
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
              textShadowColor: isDarkMode
                ? "rgba(79, 70, 229, 0.7)"
                : "rgba(255, 0, 153, 0.3)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            },
          ]}
        >
          <Translate>Happy Event Finder</Translate>
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(51, 51, 51, 0.8)",
              opacity: textOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          <Translate>Find the perfect event, anywhere</Translate>
        </Animated.Text>

        {/* Loading indicator dots with enhanced animation */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode ? "#4F46E5" : "#FF0099",
                transform: [
                  { scale: dotScale1 },
                  { translateY: dotTranslateY1 },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode ? "#6366F1" : "#FF4D8D",
                transform: [
                  { scale: dotScale2 },
                  { translateY: dotTranslateY2 },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode ? "#7C3AED" : "#E100FF",
                transform: [
                  { scale: dotScale3 },
                  { translateY: dotTranslateY3 },
                ],
              },
            ]}
          />
        </View>
      </View>

      {/* App version at the bottom */}
      <Animated.Text
        style={[
          styles.version,
          {
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(51, 51, 51, 0.5)",
            opacity: versionOpacity,
          },
        ]}
      >
        Version 1.0.0
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    left: "50%", // Center horizontally
    top: "50%", // Center vertically
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
    marginBottom: 30,
    borderRadius: BORDER_RADIUS.CIRCLE,
    overflow: "hidden",
  },
  logoBlur: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderRadius: BORDER_RADIUS.CIRCLE,
    overflow: "hidden",
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.CIRCLE,
  },
  logo: {
    width: 120,
    height: 120,
    zIndex: 3,
  },
  logoHighlight: {
    position: "absolute",
    top: "15%",
    left: "15%",
    width: "35%",
    height: "35%",
    borderRadius: BORDER_RADIUS.CIRCLE,
    zIndex: 4,
    opacity: 0.5,
    transform: [{ rotate: "45deg" }],
  },
  pulsingCircle: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    zIndex: 1,
  },
  appName: {
    fontSize: 36,
    fontFamily: FONTS.BOLD,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 40,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: "row",
    marginTop: 40,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  version: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 20,
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    letterSpacing: 0.5,
  },
});

export default Start;
