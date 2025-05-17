import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Button } from "@/components/common";
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");

// Update interface to match your correct Ticket type with lowercase currency
interface TicketProps {
  _id?: string;
  name: string;
  image: string;
  price: number;
  currency: "usd" | "eur" | "pln";
  onPurchase: (id: string) => void;
}

// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  usd: "$",
  eur: "€",
  pln: "zł",
};

const Ticket: React.FC<TicketProps> = ({
  _id = "",
  name,
  image,
  price,
  currency,
  onPurchase,
}) => {
  const { isDarkMode } = useTheme();

  // STRICTLY Native driver animations (opacity, transform)
  const shimmerPosition = useRef(new Animated.Value(-width * 2)).current;
  const lightningOpacity = useRef(new Animated.Value(0)).current;
  const containerScale = useRef(new Animated.Value(1)).current;
  const whiteFlashOpacity = useRef(new Animated.Value(0)).current;
  const haloNativeOpacity = useRef(new Animated.Value(0.6)).current;

  // STRICTLY JS driver animations (colors, layout properties)
  const priceRotation = useRef(new Animated.Value(0)).current;
  const gradientRotation = useRef(new Animated.Value(0)).current;
  const gradientPosition = useRef(new Animated.Value(0)).current;
  const haloShadowSize = useRef(new Animated.Value(5)).current;
  const haloIntensity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // ===== NATIVE DRIVER ANIMATIONS =====

    // Shimmer effect - native driver for translateX
    Animated.loop(
      Animated.timing(shimmerPosition, {
        toValue: width * 2,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    // Lightning flash effect - native driver for opacity
    const createLightningSequence = () => {
      return Animated.sequence([
        Animated.timing(lightningOpacity, {
          toValue: 0.7,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0.2,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0.5,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(lightningOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]);
    };

    // White flash effect - native driver for opacity
    const createWhiteFlashSequence = () => {
      return Animated.sequence([
        Animated.timing(whiteFlashOpacity, {
          toValue: 0.6,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(whiteFlashOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    };

    // Trigger lightning at random intervals
    const triggerLightning = () => {
      const randomDelay = Math.random() * 5000 + 3000; // Random delay between 3-8 seconds
      setTimeout(() => {
        createLightningSequence().start(() => triggerLightning());
      }, randomDelay);
    };

    // Trigger white flash at random intervals
    const triggerWhiteFlash = () => {
      const randomDelay = Math.random() * 7000 + 5000; // Random delay between 5-12 seconds
      setTimeout(() => {
        createWhiteFlashSequence().start(() => triggerWhiteFlash());
      }, randomDelay);
    };

    triggerLightning();
    triggerWhiteFlash();

    // Halo opacity pulsing - native driver
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloNativeOpacity, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(haloNativeOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // Container breathing/pulsing - native driver for scale
    Animated.loop(
      Animated.sequence([
        Animated.timing(containerScale, {
          toValue: 1.015,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(containerScale, {
          toValue: 0.995,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // ===== JAVASCRIPT DRIVER ANIMATIONS =====

    // Price rotation animation - JS driver for rotation
    Animated.loop(
      Animated.timing(priceRotation, {
        toValue: 360,
        duration: 5000,
        useNativeDriver: false,
      })
    ).start();

    // Gradient rotation animation - JS driver
    Animated.loop(
      Animated.timing(gradientRotation, {
        toValue: 360,
        duration: 8000,
        useNativeDriver: false,
      })
    ).start();

    // Gradient position animation - JS driver
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientPosition, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(gradientPosition, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Halo shadow size animation - JS driver
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloShadowSize, {
          toValue: 15,
          duration: 3000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(haloShadowSize, {
          toValue: 5,
          duration: 3000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Halo intensity animation - JS driver
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloIntensity, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(haloIntensity, {
          toValue: 0.3,
          duration: 2500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Get appropriate currency symbol
  const getCurrencySymbol = () => {
    return currencySymbols[currency] || currency;
  };

  // Interpolate price rotation animation
  const interpolatedPriceRotation = priceRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Interpolate gradient rotation
  const interpolatedGradientRotation = gradientRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Interpolate gradient position
  const gradientX = gradientPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Interpolate halo shadow color
  const haloShadowColor = haloIntensity.interpolate({
    inputRange: [0.3, 1],
    outputRange: [
      isDarkMode ? "rgba(127, 0, 255, 0.3)" : "rgba(255, 0, 153, 0.3)",
      isDarkMode ? "rgba(225, 0, 255, 0.8)" : "rgba(255, 109, 0, 0.8)",
    ],
  });

  return (
    <View style={styles.ticketWrapper}>
      {/* Container with scale animation - NATIVE DRIVER ONLY */}
      <Animated.View
        style={[
          styles.containerScaleWrapper,
          {
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        {/* This is the JS-animated part (glow effects) */}
        <Animated.View
          style={[
            styles.jsAnimatedHalo,
            {
              shadowRadius: haloShadowSize,
              shadowColor: haloShadowColor,
            },
          ]}
        >
          {/* Gradient background with rotation - JS DRIVER */}
          <Animated.View
            style={[
              styles.gradientContainer,
              {
                transform: [{ rotate: interpolatedGradientRotation }],
              },
            ]}
          >
            <LinearGradient
              colors={
                isDarkMode
                  ? [
                      "rgba(127, 0, 255, 0.4)",
                      "rgba(225, 0, 255, 0.5)",
                      "rgba(127, 0, 255, 0.4)",
                    ]
                  : [
                      "rgba(255, 0, 153, 0.4)",
                      "rgba(255, 109, 0, 0.5)",
                      "rgba(255, 0, 153, 0.4)",
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Moving gradient shine - JS DRIVER */}
          <Animated.View style={[styles.gradientShine, { left: gradientX }]}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0)",
                "rgba(255, 255, 255, 0.3)",
                "rgba(255, 255, 255, 0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Native opacity animation for halo - NATIVE DRIVER */}
          <Animated.View
            style={[styles.nativeOpacityHalo, { opacity: haloNativeOpacity }]}
          />

          {/* Main ticket container */}
          <View
            style={[
              styles.ticketContainer,
              {
                backgroundColor: isDarkMode
                  ? "rgba(31, 41, 55, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
              },
            ]}
          >
            {/* Lightning flash effect - NATIVE DRIVER */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.lightningOverlay,
                { opacity: lightningOpacity, zIndex: 21 },
              ]}
            >
              <LinearGradient
                colors={
                  isDarkMode
                    ? ["rgba(225, 0, 255, 0.5)", "rgba(127, 0, 255, 0.5)"]
                    : ["rgba(255, 109, 0, 0.5)", "rgba(255, 0, 153, 0.5)"]
                }
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* White flash effect - NATIVE DRIVER */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.whiteFlashOverlay,
                { opacity: whiteFlashOpacity, zIndex: 22 },
              ]}
            />

            {/* Shimmer effect - NATIVE DRIVER */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.shimmerContainer,
                {
                  transform: [{ translateX: shimmerPosition }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0)",
                  "rgba(255, 255, 255, 0.15)",
                  "rgba(255, 255, 255, 0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, styles.shimmerGradient]}
              />
            </Animated.View>

            {/* Ticket Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: BACKEND_BASE_URL + image }}
                style={styles.ticketImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.4)"]}
                style={styles.imageOverlay}
              />
            </View>

            {/* Ticket Info */}
            <View style={styles.ticketInfo}>
              <View style={styles.titlePriceContainer}>
                <Text
                  style={[
                    styles.ticketTitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {name}
                </Text>

                {/* Animated price - JS DRIVER */}
                <View style={styles.priceOuterContainer}>
                  <Animated.View
                    style={[
                      styles.priceGradientContainer,
                      {
                        transform: [{ rotate: interpolatedPriceRotation }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["#7F00FF", "#E100FF", "#7F00FF"]
                          : ["#FF0099", "#FF6D00", "#FF0099"]
                      }
                      style={styles.priceGradient}
                    />
                  </Animated.View>

                  <View style={styles.priceTextContainer}>
                    <Text style={styles.priceText}>
                      {price} {getCurrencySymbol()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Fixed button implementation */}
              <TouchableOpacity
                style={styles.buttonWrapper}
                activeOpacity={0.9}
                onPress={() => onPurchase(_id)}
              >
                <View pointerEvents="none">
                  <Button
                    title="Purchase"
                    variant={isDarkMode ? "primary" : "secondary"}
                    small={true}
                    onPress={() => {}} // Empty function since we handle click above
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  ticketWrapper: {
    marginBottom: SPACING.M,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  containerScaleWrapper: {
    // Native driver only - for scale animation
  },
  jsAnimatedHalo: {
    borderRadius: BORDER_RADIUS.L + 8,
    overflow: "hidden",
    position: "relative",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    elevation: 15, // Android shadow
  },
  gradientContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L + 8,
    overflow: "hidden",
  },
  gradientShine: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L + 8,
    overflow: "hidden",
  },
  nativeOpacityHalo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L + 8,
    backgroundColor: "transparent",
  },
  ticketContainer: {
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    position: "relative",
  },
  lightningOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L,
  },
  whiteFlashOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  shimmerContainer: {
    zIndex: 10,
    overflow: "hidden",
  },
  shimmerGradient: {
    width: width * 3,
    transform: [{ skewX: "-45deg" }],
  },
  imageContainer: {
    position: "relative",
  },
  ticketImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: BORDER_RADIUS.L,
    borderTopRightRadius: BORDER_RADIUS.L,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  ticketInfo: {
    padding: SPACING.M,
  },
  titlePriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  ticketTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
    flex: 1,
    marginRight: SPACING.S,
  },
  priceOuterContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.SMALL,
  },
  priceGradientContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 30,
    overflow: "hidden",
  },
  priceGradient: {
    width: "100%",
    height: "100%",
  },
  priceTextContainer: {
    backgroundColor: "white",
    width: "80%",
    height: "80%",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.SMALL,
  },
  priceText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.S,
    color: "#000000",
  },
  buttonWrapper: {
    width: "100%",
    marginTop: SPACING.XS,
    zIndex: 30,
  },
});

export default Ticket;
