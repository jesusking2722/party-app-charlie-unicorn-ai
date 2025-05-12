import { FONTS } from "@/app/theme";
import { Button, Input } from "@/components/common";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
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
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";

const PaymentHeaderImage = require("@/assets/images/card-payment.png");
const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Mock function to check if Google Pay is available
const checkIsGooglePayAvailable = async () => {
  try {
    // Simulate checking device capability
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return true for demo purposes - in a real app, this would check device capabilities
    return Platform.OS === "android";
  } catch (error) {
    console.error("Error checking Google Pay availability:", error);
    return false;
  }
};

// Mock function to check if Apple Pay is available
const checkIsApplePayAvailable = async () => {
  try {
    // Simulate checking device capability
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return true for demo purposes if on iOS - in a real app, you would check capabilities
    return Platform.OS === "ios";
  } catch (error) {
    console.error("Error checking Apple Pay availability:", error);
    return false;
  }
};

// Props for the custom card payment component
interface CustomCardPaymentProps {
  amount: string;
  planTitle: string;
  onPaymentComplete: (success: boolean) => void;
  onBack: () => void;
}

const CustomCardPayment: React.FC<CustomCardPaymentProps> = ({
  amount,
  planTitle,
  onPaymentComplete,
  onBack,
}) => {
  const { isDarkMode } = useTheme();

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Payment method states
  const [isGooglePayLoading, setIsGooglePayLoading] = useState(true);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  const [isApplePayLoading, setIsApplePayLoading] = useState(true);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [showDigitalWalletInfo, setShowDigitalWalletInfo] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const infoHeight = useRef(new Animated.Value(0)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;

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

  // Check if payment methods are available
  useEffect(() => {
    const checkPaymentMethodsAvailability = async () => {
      try {
        setIsGooglePayLoading(true);
        setIsApplePayLoading(true);

        const [googlePayAvailable, applePayAvailable] = await Promise.all([
          checkIsGooglePayAvailable(),
          checkIsApplePayAvailable(),
        ]);

        setIsGooglePayAvailable(googlePayAvailable);
        setIsApplePayAvailable(applePayAvailable);
      } catch (error) {
        console.error("Failed to check payment methods availability:", error);
        setIsGooglePayAvailable(false);
        setIsApplePayAvailable(false);
      } finally {
        setIsGooglePayLoading(false);
        setIsApplePayLoading(false);
      }
    };

    checkPaymentMethodsAvailability();
  }, []);

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

  // Animate digital wallet info section
  useEffect(() => {
    if (showDigitalWalletInfo) {
      Animated.parallel([
        Animated.timing(infoHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(infoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(infoHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(infoOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [showDigitalWalletInfo]);

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

  // Toggle digital wallet info section
  const toggleDigitalWalletInfo = () => {
    setShowDigitalWalletInfo(!showDigitalWalletInfo);
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.slice(0, 19); // Limit to 16 digits + spaces
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Format as MM/YY
    if (cleaned.length > 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    } else {
      return cleaned;
    }
  };

  // Handle card number change
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);

    // Clear error when user types
    if (formErrors.cardNumber) {
      setFormErrors((prev) => ({ ...prev, cardNumber: "" }));
    }
  };

  // Handle expiry date change
  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);

    // Clear error when user types
    if (formErrors.expiryDate) {
      setFormErrors((prev) => ({ ...prev, expiryDate: "" }));
    }
  };

  // Handle CVV change
  const handleCvvChange = (text: string) => {
    // Only allow digits and max 4 digits
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    setCvv(cleaned);

    // Clear error when user types
    if (formErrors.cvv) {
      setFormErrors((prev) => ({ ...prev, cvv: "" }));
    }
  };

  // Handle cardholder name change
  const handleCardholderNameChange = (text: string) => {
    setCardholderName(text);

    // Clear error when user types
    if (formErrors.cardholderName) {
      setFormErrors((prev) => ({ ...prev, cardholderName: "" }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    };

    // Check card number (should be 16 digits)
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
      isValid = false;
    }

    // Check expiry date format (should be MM/YY)
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      isValid = false;
    }

    // Check CVV (should be 3 or 4 digits)
    if (!cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = "Please enter a valid CVV code";
      isValid = false;
    }

    // Check cardholder name
    if (cardholderName.trim().length < 3) {
      newErrors.cardholderName = "Please enter the cardholder name";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle payment submission
  const handlePayment = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call to process payment
    setTimeout(() => {
      setLoading(false);

      // For demo purposes, we'll automatically succeed
      // In a real app, you would:
      // 1. Send card details securely to your backend
      // 2. Your backend would use Stripe API to create a payment
      // 3. Handle the response accordingly

      onPaymentComplete(true);
    }, 2000);
  };

  // Handle Google Pay payment
  const handleGooglePay = () => {
    setLoading(true);

    // Simulate Google Pay payment process
    setTimeout(() => {
      setLoading(false);
      onPaymentComplete(true);
    }, 2000);
  };

  // Handle Apple Pay payment
  const handleApplePay = () => {
    setLoading(true);

    // Simulate Apple Pay payment process
    setTimeout(() => {
      setLoading(false);
      onPaymentComplete(true);
    }, 2000);
  };

  // Check if at least one digital wallet is available
  const hasDigitalWallet =
    (!isGooglePayLoading && isGooglePayAvailable) ||
    (!isApplePayLoading && isApplePayAvailable);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
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
              source={PaymentHeaderImage}
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
                      Payment Details
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
                      {planTitle} Plan • {amount}
                    </Text>

                    {/* Digital Wallet Options Section */}
                    {hasDigitalWallet && (
                      <>
                        <View style={styles.digitalWalletHeader}>
                          <Text
                            style={[
                              styles.digitalWalletTitle,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY,
                              },
                            ]}
                          >
                            Express Checkout
                          </Text>
                          <TouchableOpacity
                            style={styles.infoButton}
                            onPress={toggleDigitalWalletInfo}
                          >
                            <FontAwesome
                              name={
                                showDigitalWalletInfo
                                  ? "chevron-up"
                                  : "chevron-down"
                              }
                              size={14}
                              color={
                                isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY
                              }
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Digital Wallet Information (collapsible) */}
                        <Animated.View
                          style={[
                            styles.walletInfoContainer,
                            {
                              maxHeight: infoHeight.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 500], // Max height when expanded
                              }),
                              opacity: infoOpacity,
                              backgroundColor: isDarkMode
                                ? "rgba(30, 35, 45, 0.5)"
                                : "rgba(255, 255, 255, 0.5)",
                              borderColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(0, 0, 0, 0.05)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.walletInfoTitle,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY,
                              },
                            ]}
                          >
                            Why use digital wallets?
                          </Text>

                          <View style={styles.walletInfoItem}>
                            <FontAwesome5
                              name="bolt"
                              size={12}
                              color={getAccentColor()}
                              style={styles.walletInfoIcon}
                            />
                            <Text
                              style={[
                                styles.walletInfoText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Faster checkout without manual card entry
                            </Text>
                          </View>

                          <View style={styles.walletInfoItem}>
                            <FontAwesome5
                              name="shield-alt"
                              size={12}
                              color={getAccentColor()}
                              style={styles.walletInfoIcon}
                            />
                            <Text
                              style={[
                                styles.walletInfoText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Enhanced security with tokenization technology
                            </Text>
                          </View>

                          <View style={styles.walletInfoItem}>
                            <FontAwesome5
                              name="fingerprint"
                              size={12}
                              color={getAccentColor()}
                              style={styles.walletInfoIcon}
                            />
                            <Text
                              style={[
                                styles.walletInfoText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Secure authentication with biometrics
                            </Text>
                          </View>

                          <View style={styles.walletInfoItem}>
                            <FontAwesome5
                              name="lock"
                              size={12}
                              color={getAccentColor()}
                              style={styles.walletInfoIcon}
                            />
                            <Text
                              style={[
                                styles.walletInfoText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Your card details are never shared with merchants
                            </Text>
                          </View>
                        </Animated.View>

                        {/* Google Pay Button */}
                        {!isGooglePayLoading && isGooglePayAvailable && (
                          <View
                            style={[
                              styles.digitalWalletButton,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(40, 45, 55, 0.65)"
                                  : "rgba(255, 255, 255, 0.65)",
                                borderColor: isDarkMode
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.05)",
                              },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.googlePayButton}
                              onPress={handleGooglePay}
                              disabled={loading}
                            >
                              <View style={styles.googlePayContent}>
                                <FontAwesome5
                                  name="google"
                                  size={16}
                                  color="white"
                                  style={{ marginRight: SPACING.S }}
                                />
                                <Text style={styles.googlePayText}>
                                  Pay with Google Pay
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* Apple Pay Button */}
                        {!isApplePayLoading && isApplePayAvailable && (
                          <View
                            style={[
                              styles.digitalWalletButton,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(40, 45, 55, 0.65)"
                                  : "rgba(255, 255, 255, 0.65)",
                                borderColor: isDarkMode
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.05)",
                                marginTop: isGooglePayAvailable ? SPACING.S : 0,
                              },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.applePayButton}
                              onPress={handleApplePay}
                              disabled={loading}
                            >
                              <View style={styles.applePayContent}>
                                <FontAwesome5
                                  name="apple"
                                  size={18}
                                  color="white"
                                  style={{ marginRight: SPACING.S }}
                                />
                                <Text style={styles.applePayText}>
                                  Pay with Apple Pay
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* OR Divider */}
                        <View style={styles.orDivider}>
                          <View
                            style={[
                              styles.dividerLine,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "rgba(0, 0, 0, 0.1)",
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.orText,
                              {
                                color: isDarkMode
                                  ? "rgba(255, 255, 255, 0.6)"
                                  : "rgba(0, 0, 0, 0.5)",
                              },
                            ]}
                          >
                            OR
                          </Text>
                          <View
                            style={[
                              styles.dividerLine,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "rgba(0, 0, 0, 0.1)",
                              },
                            ]}
                          />
                        </View>
                      </>
                    )}

                    {/* Credit Card Form */}
                    <View style={styles.formContainer}>
                      <Text
                        style={[
                          styles.formSectionTitle,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        Pay with Card
                      </Text>

                      {/* Card number input */}
                      <Input
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        keyboardType="number-pad"
                        value={cardNumber}
                        onChangeText={handleCardNumberChange}
                        error={formErrors.cardNumber}
                        autoCapitalize="none"
                        icon={
                          <FontAwesome
                            name="credit-card"
                            size={16}
                            color={
                              isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY
                            }
                          />
                        }
                      />

                      {/* Expiry date and CVV (on the same row) */}
                      <View style={styles.rowContainer}>
                        <View style={styles.halfWidth}>
                          <Input
                            label="Expiry Date"
                            placeholder="MM/YY"
                            keyboardType="number-pad"
                            value={expiryDate}
                            onChangeText={handleExpiryDateChange}
                            error={formErrors.expiryDate}
                            autoCapitalize="none"
                            icon={
                              <FontAwesome
                                name="calendar"
                                size={16}
                                color={
                                  isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY
                                }
                              />
                            }
                          />
                        </View>

                        <View style={styles.halfWidth}>
                          <Input
                            label="CVV"
                            placeholder="123"
                            keyboardType="number-pad"
                            value={cvv}
                            onChangeText={handleCvvChange}
                            error={formErrors.cvv}
                            isPassword={true}
                            autoCapitalize="none"
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
                        </View>
                      </View>

                      {/* Cardholder name */}
                      <Input
                        label="Cardholder Name"
                        placeholder="John Doe"
                        value={cardholderName}
                        onChangeText={handleCardholderNameChange}
                        error={formErrors.cardholderName}
                        autoCapitalize="words"
                        icon={
                          <FontAwesome
                            name="user"
                            size={16}
                            color={
                              isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY
                            }
                          />
                        }
                      />

                      {/* Security Notes */}
                      <View
                        style={[
                          styles.securityContainer,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(40, 45, 55, 0.65)"
                              : "rgba(255, 255, 255, 0.65)",
                            borderColor: isDarkMode
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.05)",
                          },
                        ]}
                      >
                        <View style={styles.securityHeader}>
                          <View
                            style={[
                              styles.featureIconContainer,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(255, 0, 153, 0.2)"
                                  : "rgba(255, 0, 153, 0.1)",
                              },
                            ]}
                          >
                            <FontAwesome
                              name="shield"
                              size={14}
                              color={getAccentColor()}
                            />
                          </View>
                          <Text
                            style={[
                              styles.securityHeaderText,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY,
                              },
                            ]}
                          >
                            Secure Payment
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.securityText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          Your payment information is encrypted and securely
                          processed.
                        </Text>
                      </View>
                    </View>

                    {/* Pay Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.M,
                      }}
                    >
                      <Button
                        title={`Pay ${amount}`}
                        onPress={handlePayment}
                        loading={loading}
                        variant={isDarkMode ? "primary" : "secondary"}
                        small={false}
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

                    {/* Back Button */}
                    <TouchableOpacity
                      style={styles.backButtonContainer}
                      onPress={onBack}
                    >
                      <Text
                        style={[
                          styles.backButtonText,
                          {
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.6)"
                              : "rgba(0, 0, 0, 0.5)",
                          },
                        ]}
                      >
                        Go back
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  featureIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.S,
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
  digitalWalletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  digitalWalletTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  infoButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  walletInfoContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginBottom: SPACING.S,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  walletInfoTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.S,
  },
  walletInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.XS,
  },
  walletInfoIcon: {
    marginRight: SPACING.XS,
    marginTop: 2,
  },
  walletInfoText: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    lineHeight: 16,
  },
  digitalWalletButton: {
    borderRadius: BORDER_RADIUS.L,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  googlePayButton: {
    height: 50,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  googlePayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googlePayText: {
    color: "white",
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  applePayButton: {
    height: 50,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  applePayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  applePayText: {
    color: "white",
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.M,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    paddingHorizontal: SPACING.S,
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  formSectionTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.S,
  },
  formContainer: {
    width: "100%",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  securityContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginTop: SPACING.M,
    borderWidth: 0.5,
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  securityHeaderText: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
    marginLeft: SPACING.XS,
  },
  securityText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    lineHeight: 18,
  },
  backButtonContainer: {
    alignSelf: "center",
    marginTop: SPACING.M,
    padding: SPACING.S,
  },
  backButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
});

export default CustomCardPayment;
