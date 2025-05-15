import { FONTS, FONT_SIZES, SHADOWS } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

interface SpinnerProps {
  visible: boolean;
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  visible,
  message = "Getting the party started...",
}) => {
  const { isDarkMode } = useTheme();

  // Create animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const discRotate = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const sparkleAnims = Array(12)
    .fill(0)
    .map(() => ({
      scale: useRef(new Animated.Value(0)).current,
      rotate: useRef(new Animated.Value(0)).current,
      translateX: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(0)).current,
      opacity: useRef(new Animated.Value(0)).current,
    }));

  // Sound wave animation values
  const soundWaves = Array(6)
    .fill(0)
    .map(() => useRef(new Animated.Value(0.3)).current);

  // Beat animation values
  const beatAnim = useRef(new Animated.Value(1)).current;

  // Audio equalizer bars
  const equalizerBars = Array(10)
    .fill(0)
    .map(() => useRef(new Animated.Value(0.1 + Math.random() * 0.5)).current);

  // Neon text animation
  const neonIntensity = useRef(new Animated.Value(0.7)).current;

  // Run animations when component mounts or visibility changes
  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Continuous rotating animation for vinyl disc
      Animated.loop(
        Animated.timing(discRotate, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Sparkle animations
      sparkleAnims.forEach((sparkle, index) => {
        // Random delay for each sparkle
        const delay = Math.random() * 2000;
        const duration = 1500 + Math.random() * 1000;

        // Random direction and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 80;
        const translateX = Math.cos(angle) * distance;
        const translateY = Math.sin(angle) * distance;

        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(sparkle.scale, {
                toValue: 0.5 + Math.random() * 0.5,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.opacity, {
                toValue: 0.7 + Math.random() * 0.3,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.translateX, {
                toValue: translateX,
                duration: duration,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.translateY, {
                toValue: translateY,
                duration: duration,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.rotate, {
                toValue: Math.random() > 0.5 ? 1 : -1,
                duration: duration,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(sparkle.opacity, {
                toValue: 0,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.scale, {
                toValue: 0,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
            ]),
            Animated.delay(Math.random() * 1000), // Random delay before restarting
          ])
        ).start();
      });

      // Sound wave animations
      soundWaves.forEach((wave, index) => {
        const startDelay = index * 120;
        Animated.loop(
          Animated.sequence([
            Animated.delay(startDelay),
            Animated.timing(wave, {
              toValue: 1.0,
              duration: 300 + Math.random() * 200,
              easing: Easing.out(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(wave, {
              toValue: 0.3,
              duration: 300 + Math.random() * 200,
              easing: Easing.in(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        ).start();
      });

      // Beat animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(beatAnim, {
            toValue: 1.15,
            duration: 200,
            easing: Easing.out(Easing.elastic(2)),
            useNativeDriver: true,
          }),
          Animated.timing(beatAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.in(Easing.elastic(2)),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Equalizer bar animations
      equalizerBars.forEach((bar, index) => {
        // Create random but rhythmic movement for each bar
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 0.2 + Math.random() * 0.8,
              duration: 230 + (index % 2) * 100,
              easing: Easing.out(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 0.1 + Math.random() * 0.3,
              duration: 200 + (index % 3) * 100,
              easing: Easing.in(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        ).start();
      });

      // Neon text pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(neonIntensity, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(neonIntensity, {
            toValue: 0.7,
            duration: 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Stop animations when not visible
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    // Clean up animations when component unmounts
    return () => {
      fadeAnim.stopAnimation();
      discRotate.stopAnimation();
      bounceAnim.stopAnimation();
      scaleAnim.stopAnimation();
      sparkleAnims.forEach((sparkle) => {
        sparkle.scale.stopAnimation();
        sparkle.rotate.stopAnimation();
        sparkle.translateX.stopAnimation();
        sparkle.translateY.stopAnimation();
        sparkle.opacity.stopAnimation();
      });
      soundWaves.forEach((wave) => wave.stopAnimation());
      beatAnim.stopAnimation();
      equalizerBars.forEach((bar) => bar.stopAnimation());
      neonIntensity.stopAnimation();
    };
  }, [visible]);

  const getGradientColors = () => {
    return isDarkMode
      ? [
          "rgba(225, 0, 255, 0.9)",
          "rgba(127, 0, 255, 0.9)",
          "rgba(255, 0, 153, 0.9)",
        ]
      : [
          "rgba(255, 0, 153, 0.9)",
          "rgba(127, 0, 255, 0.9)",
          "rgba(225, 0, 255, 0.9)",
        ];
  };

  const getDiscColor = () => {
    return isDarkMode
      ? {
          outer: ["rgba(30, 30, 30, 1)", "rgba(20, 20, 20, 1)"],
          inner: ["rgba(50, 50, 50, 1)", "rgba(25, 25, 25, 1)"],
          center: "rgba(70, 70, 70, 1)",
          groove: "rgba(15, 15, 15, 0.6)",
        }
      : {
          outer: ["rgba(30, 30, 30, 1)", "rgba(10, 10, 10, 1)"],
          inner: ["rgba(60, 60, 60, 1)", "rgba(40, 40, 40, 1)"],
          center: "rgba(80, 80, 80, 1)",
          groove: "rgba(10, 10, 10, 0.5)",
        };
  };

  const getSparkleColors = () => {
    const colors = [
      "#FF00CC", // Pink
      "#FF6B00", // Orange
      "#FFFF00", // Yellow
      "#00FF00", // Green
      "#00FFFF", // Cyan
      "#0080FF", // Blue
      "#7F00FF", // Purple
      "#E100FF", // Magenta
      "#FF0099", // Hot pink
    ];

    return colors;
  };

  const getEqualizerColors = () => {
    return isDarkMode
      ? [
          "rgba(255, 0, 153, 1)",
          "rgba(227, 27, 168, 1)",
          "rgba(198, 54, 183, 1)",
          "rgba(170, 81, 198, 1)",
          "rgba(141, 108, 213, 1)",
          "rgba(113, 135, 228, 1)",
          "rgba(84, 162, 243, 1)",
          "rgba(56, 189, 248, 1)",
        ]
      : [
          "rgba(255, 0, 153, 1)",
          "rgba(227, 27, 168, 1)",
          "rgba(198, 54, 183, 1)",
          "rgba(170, 81, 198, 1)",
          "rgba(141, 108, 213, 1)",
          "rgba(113, 135, 228, 1)",
          "rgba(84, 162, 243, 1)",
          "rgba(56, 189, 248, 1)",
        ];
  };

  // Maps rotation value to spin rotation degree
  const discSpin = discRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Maps bounce value to translateY
  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Blurred Background */}
      <BlurView
        intensity={isDarkMode ? 25 : 20}
        tint={isDarkMode ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      >
        {/* Semi-transparent overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDarkMode
                ? "rgba(20, 20, 30, 0.7)"
                : "rgba(248, 244, 255, 0.7)",
            },
          ]}
        />

        {/* Overlay gradient */}
        <LinearGradient
          colors={
            isDarkMode
              ? [
                  "rgba(127, 0, 255, 0.15)",
                  "rgba(225, 0, 255, 0.1)",
                  "rgba(255, 0, 99, 0.15)",
                ]
              : [
                  "rgba(255, 0, 99, 0.1)",
                  "rgba(225, 0, 255, 0.08)",
                  "rgba(127, 0, 255, 0.1)",
                ]
          }
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Audio equalizer display (top) */}
        <View style={styles.equalizerContainer}>
          {equalizerBars.map((bar, index) => (
            <Animated.View
              key={`eq-bar-${index}`}
              style={[
                styles.equalizerBar,
                {
                  height: bar.interpolate({
                    inputRange: [0, 1],
                    outputRange: [5, 40],
                  }),
                  backgroundColor:
                    getEqualizerColors()[index % getEqualizerColors().length],
                  marginHorizontal: 3,
                },
              ]}
            />
          ))}
        </View>

        {/* Main spinner container */}
        <View style={styles.spinnerMainContainer}>
          {/* Vinyl Record */}
          <Animated.View
            style={[
              styles.vinylContainer,
              {
                transform: [{ rotate: discSpin }, { scale: beatAnim }],
              },
            ]}
          >
            {/* Vinyl disc outer */}
            <LinearGradient
              colors={getDiscColor().outer as any}
              style={styles.vinylDisc}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              {/* Vinyl grooves */}
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={`groove-${index}`}
                    style={[
                      styles.vinylGroove,
                      {
                        width: 150 - index * 15,
                        height: 150 - index * 15,
                        borderRadius: (150 - index * 15) / 2,
                        borderColor: getDiscColor().groove,
                      },
                    ]}
                  />
                ))}

              {/* Vinyl disc inner colored part */}
              <LinearGradient
                colors={getGradientColors() as any}
                style={styles.vinylInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Vinyl center hole */}
                <View
                  style={[
                    styles.vinylCenter,
                    {
                      backgroundColor: getDiscColor().center,
                    },
                  ]}
                />
              </LinearGradient>
            </LinearGradient>
          </Animated.View>

          {/* Sound waves radiating from vinyl */}
          <View style={styles.soundWavesContainer}>
            {soundWaves.map((wave, index) => (
              <Animated.View
                key={`wave-${index}`}
                style={[
                  styles.soundWave,
                  {
                    width: wave.interpolate({
                      inputRange: [0, 1],
                      outputRange: [180, 240 + index * 15],
                    }),
                    height: wave.interpolate({
                      inputRange: [0, 1],
                      outputRange: [180, 240 + index * 15],
                    }),
                    borderRadius: wave.interpolate({
                      inputRange: [0, 1],
                      outputRange: [90, 120 + index * 7.5],
                    }),
                    opacity: wave.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.3, 0],
                    }),
                    borderColor: isDarkMode
                      ? `rgba(${255 - index * 20}, ${index * 30}, 255, 0.3)`
                      : `rgba(255, ${index * 30}, ${255 - index * 20}, 0.3)`,
                  },
                ]}
              />
            ))}
          </View>

          {/* Party sparkles shooting out */}
          {sparkleAnims.map((sparkle, index) => (
            <Animated.View
              key={`sparkle-${index}`}
              style={[
                styles.sparkle,
                {
                  backgroundColor:
                    getSparkleColors()[index % getSparkleColors().length],
                  transform: [
                    {
                      scale: sparkle.scale,
                    },
                    {
                      translateX: sparkle.translateX,
                    },
                    {
                      translateY: sparkle.translateY,
                    },
                    {
                      rotate: sparkle.rotate.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ["-45deg", "45deg"],
                      }),
                    },
                  ],
                  opacity: sparkle.opacity,
                },
              ]}
            />
          ))}

          {/* Bouncing party text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                transform: [{ translateY: bounce }, { scale: scaleAnim }],
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.partyText,
                {
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(80, 10, 110, 0.9)",
                  textShadowColor: neonIntensity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      isDarkMode
                        ? "rgba(225, 0, 255, 0.7)"
                        : "rgba(255, 0, 153, 0.7)",
                      isDarkMode
                        ? "rgba(225, 0, 255, 1)"
                        : "rgba(255, 0, 153, 1)",
                    ],
                  }),
                  textShadowRadius: neonIntensity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, 6],
                  }),
                },
              ]}
            >
              {message || "Getting the party started..."}
            </Animated.Text>
          </Animated.View>

          {/* Party icons */}
          <View style={styles.iconsContainer}>
            <Animated.View
              style={[
                styles.icon,
                {
                  transform: [{ scale: beatAnim }, { rotate: "15deg" }],
                },
              ]}
            >
              <FontAwesome5
                name="cocktail"
                size={24}
                color={
                  isDarkMode
                    ? "rgba(255, 230, 0, 0.9)"
                    : "rgba(255, 102, 0, 0.9)"
                }
                style={styles.iconShadow}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.icon,
                {
                  transform: [{ scale: beatAnim }, { rotate: "-15deg" }],
                },
              ]}
            >
              <FontAwesome5
                name="music"
                size={24}
                color={
                  isDarkMode
                    ? "rgba(0, 230, 255, 0.9)"
                    : "rgba(255, 0, 153, 0.9)"
                }
                style={styles.iconShadow}
              />
            </Animated.View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  spinnerMainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  vinylContainer: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.LARGE,
  },
  vinylDisc: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  vinylInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.SMALL,
  },
  vinylCenter: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  vinylGroove: {
    position: "absolute",
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  soundWavesContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  soundWave: {
    position: "absolute",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginTop: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
  },
  partyText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.L,
    textAlign: "center",
    textShadowOffset: { width: 0, height: 0 },
  },
  equalizerContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    width: "100%",
    height: 60,
    top: height * 0.15,
  },
  equalizerBar: {
    width: 6,
    borderRadius: 3,
  },
  sparkle: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    position: "absolute",
    bottom: height * 0.15,
  },
  icon: {
    padding: 10,
    ...SHADOWS.MEDIUM,
  },
  iconShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

export default Spinner;
