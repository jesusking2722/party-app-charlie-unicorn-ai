import { FONTS, THEME } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import useInit from "@/hooks/useInit";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

// Replace with your actual logo
const LOGO_IMAGE = require("@/assets/images/logo.png");

const Start = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isAuthComplete, setIsAuthComplete] = useState(false);
  const authInitialized = useRef(false);

  // Get the initialization function and loading state
  const {
    fetchAuthUser,
    fetchAllPartiesInfo,
    fetchAllTicketsInfo,
    initLoading,
  } = useInit();

  // Call fetchAuthUser only once when the component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authInitialized.current) {
        authInitialized.current = true;
        try {
          await fetchAuthUser();
          await fetchAllPartiesInfo();
          await fetchAllTicketsInfo();
          setIsAuthComplete(true);
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
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotScale1 = useRef(new Animated.Value(0)).current;
  const dotScale2 = useRef(new Animated.Value(0)).current;
  const dotScale3 = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(1)).current;

  // Navigation effect - monitors both animation completion and initialization status
  useEffect(() => {
    if (isAnimationComplete && isAuthComplete && !initLoading) {
      router.replace("/auth/login");
    }
  }, [isAnimationComplete, isAuthComplete, initLoading, router]);

  useEffect(() => {
    // Start logo animation sequence
    const initialAnimation = Animated.sequence([
      // Start with logo appearing and scaling up
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // Fade in the text
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),

      // Animate loading dots sequentially
      Animated.stagger(200, [
        Animated.spring(dotScale1, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(dotScale2, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(dotScale3, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
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
    }, 2000);

    return () => clearTimeout(minDisplayTimeout);
  }, []);

  // Watch for changes in auth status to potentially start exit animation
  useEffect(() => {
    if (isAuthComplete && !initLoading && !isAnimationComplete) {
      playExitAnimation();
    }
  }, [isAuthComplete, initLoading, isAnimationComplete]);

  // Function to play exit animation
  const playExitAnimation = () => {
    Animated.parallel([
      Animated.timing(circleScale, {
        toValue: 2,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Shrink the logo as we transition out
      Animated.timing(logoScale, {
        toValue: 0.8,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
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
        dotScale1.setValue(0.5);
        dotScale2.setValue(0.5);
        dotScale3.setValue(0.5);

        // Animate dots in sequence
        Animated.stagger(200, [
          Animated.spring(dotScale1, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(dotScale2, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(dotScale3, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Continue animation loop if still loading
          if (initLoading || !isAuthComplete) {
            animationTimer = setTimeout(loopDotsAnimation, 300);
          }
        });
      }
    };

    // Start the animation loop after initial animation has time to complete
    const startTimer = setTimeout(loopDotsAnimation, 1500);

    return () => {
      clearTimeout(startTimer);
      if (animationTimer) clearTimeout(animationTimer);
    };
  }, [initLoading, isAuthComplete, dotScale1, dotScale2, dotScale3]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background gradient */}
      <LinearGradient
        colors={theme.GRADIENT as [string, string]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
      />

      {/* Content container */}
      <View style={styles.contentContainer}>
        {/* Animated logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />

          {/* Pulsing circle behind logo */}
          <Animated.View
            style={[
              styles.pulsingCircle,
              {
                backgroundColor: isDarkMode
                  ? "rgba(79, 70, 229, 0.1)"
                  : "rgba(255, 0, 153, 0.1)",
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
              },
            ]}
          />
        </Animated.View>

        {/* App name */}
        <Animated.Text
          style={[
            styles.appName,
            {
              color: theme.TEXT_COLOR,
              opacity: textOpacity,
            },
          ]}
        >
          PartyFinder
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              color: theme.TEXT_SECONDARY,
              opacity: textOpacity,
            },
          ]}
        >
          Find the perfect party, anywhere
        </Animated.Text>

        {/* Loading indicator dots */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode ? "#4F46E5" : "#FF0099",
                transform: [{ scale: dotScale1 }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode ? "#6366F1" : "#FF4D8D",
                transform: [{ scale: dotScale2 }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isDarkMode ? "#7C3AED" : "#E100FF",
                transform: [{ scale: dotScale3 }],
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
            color: theme.TEXT_SECONDARY,
            opacity: textOpacity,
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
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    zIndex: 2,
  },
  pulsingCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    zIndex: 1,
  },
  appName: {
    fontSize: 32,
    fontFamily: FONTS.BOLD,
    marginBottom: 10,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    marginBottom: 40,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  version: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 20,
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
});

export default Start;
