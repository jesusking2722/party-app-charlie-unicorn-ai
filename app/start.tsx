import { FONTS, THEME } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
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

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotScale1 = useRef(new Animated.Value(0)).current;
  const dotScale2 = useRef(new Animated.Value(0)).current;
  const dotScale3 = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo animation sequence
    Animated.sequence([
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

      // Expanding circle transition out
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
      ]),
    ]).start();

    // Navigate to login after 5 seconds
    const timer = setTimeout(() => {
      router.replace("/main");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Start a loop animation for the dots
  useEffect(() => {
    const loopDotsAnimation = () => {
      // Reset dot scales
      dotScale1.setValue(0.5);
      dotScale2.setValue(0.5);
      dotScale3.setValue(0.5);

      // Animate them in sequence again
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
        setTimeout(loopDotsAnimation, 300);
      });
    };

    // Start the looping animation after a short delay
    const timer = setTimeout(loopDotsAnimation, 1500);
    return () => clearTimeout(timer);
  }, []);

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
