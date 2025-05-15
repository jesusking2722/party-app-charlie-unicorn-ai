import { FONTS } from "@/app/theme";
import { Button } from "@/components/common";
import { FontAwesome5 } from "@expo/vector-icons";
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
import { Currency } from "../MembershipRadioGroup";

// Import Stripe dependencies
import { useToast } from "@/contexts/ToastContext";
import {
  createStripePaymentIntent,
  fetchStripePaymentIntentClientSecret,
} from "@/lib/scripts/stripe.scripts";
import { RootState } from "@/redux/store";
import { extractNumericPrice } from "@/utils/price";
import {
  confirmPlatformPayPayment,
  PlatformPay,
  usePlatformPay,
  useStripe,
} from "@stripe/stripe-react-native";
import { useSelector } from "react-redux";

const PaymentHeaderImage = require("@/assets/images/card-payment.png");
const { width, height } = Dimensions.get("window");

const LIGHT_THEME_ACCENT = "#FF0099";

interface CardPaymentProps {
  amount: string;
  formattedAmount: string;
  currency: Currency;
  planTitle: string;
  onPaymentComplete: (success: boolean) => void;
  onBack: () => void;
}

const CardPayment: React.FC<CardPaymentProps> = ({
  formattedAmount,
  currency,
  planTitle,
  onPaymentComplete,
  onBack,
}) => {
  const [cardLoading, setCardLoading] = useState<boolean>(false);

  const { isDarkMode } = useTheme();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { isPlatformPaySupported } = usePlatformPay();

  // Payment method states
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [googlePayLoading, setGooglePayLoading] = useState<boolean>(false);
  const [applePayLoading, setApplePayLoading] = useState<boolean>(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const infoHeight = useRef(new Animated.Value(0)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const creditCardInfoHeight = useRef(new Animated.Value(0)).current;
  const creditCardInfoOpacity = useRef(new Animated.Value(0)).current;

  const { user } = useSelector((state: RootState) => state.auth);
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

  useEffect(() => {
    (async function () {
      setIsApplePayAvailable(await isPlatformPaySupported());
      setIsGooglePayAvailable(
        !(await isPlatformPaySupported({ googlePay: { testEnv: true } }))
      );
    })();
  }, [isPlatformPaySupported]);

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
  }, []);

  // Animate credit card info section
  useEffect(() => {
    Animated.parallel([
      Animated.timing(creditCardInfoHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(creditCardInfoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
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

    // Clean up animations when component unmounts
    return () => {
      particles.forEach((particle) => {
        particle.x.stopAnimation();
        particle.y.stopAnimation();
        particle.scale.stopAnimation();
        particle.opacity.stopAnimation();
      });
    };
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Helper function to get currency text
  const getCurrencyText = (currency: Currency): string => {
    switch (currency) {
      case "USD":
        return "US Dollars";
      case "EUR":
        return "Euros";
      case "PLN":
        return "Polish Złoty";
      default:
        return "US Dollars";
    }
  };

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

  const initializePaymentSheet = async () => {
    const amount = extractNumericPrice(formattedAmount);
    if (amount === 0 || !currency || !user) return;

    const response = await createStripePaymentIntent(
      amount,
      currency.toLowerCase()
    );

    const { customer, paymentIntent, ephemeralKey } = response.data;

    await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: user.name as string,
        email: user.email as string,
        address: {
          state: user.region,
          country: user.country,
          line1: user.address,
        },
      },
    });
  };

  // Handle credit card payment
  const handlePayment = async () => {
    try {
      setCardLoading(true);
      await initializePaymentSheet();

      const { error } = await presentPaymentSheet();

      if (error) {
        showToast(error.message, "error");
        onPaymentComplete(false);
      } else {
        showToast("Subscription is successful", "success");
        onPaymentComplete(true);
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setCardLoading(false);
    }
  };

  // Handle Google Pay payment
  const handleGooglePay = async () => {
    const amount = extractNumericPrice(formattedAmount);
    if (amount === 0 || !currency || !user) return;

    try {
      setGooglePayLoading(true);

      const response = await fetchStripePaymentIntentClientSecret(
        amount,
        currency.toLowerCase()
      );

      if (!response.ok) {
        setGooglePayLoading(false);
        return;
      }

      const { clientSecret } = response.data;

      const { error } = await confirmPlatformPayPayment(clientSecret, {
        googlePay: {
          testEnv: true,
          merchantName: "Charlie Unicorn AI",
          merchantCountryCode: "PL",
          currencyCode: currency,
          billingAddressConfig: {
            format: PlatformPay.BillingAddressFormat.Full,
            isPhoneNumberRequired: true,
            isRequired: true,
          },
        },
      });

      if (error) {
        showToast(error.message, "error");
        setGooglePayLoading(false);
        return;
      }

      onPaymentComplete(true);
    } catch (error) {
      console.error("Google Pay error:", error);
    } finally {
      setGooglePayLoading(false);
    }
  };

  // Handle Apple Pay payment
  const handleApplePay = async () => {
    const amount = extractNumericPrice(formattedAmount);
    if (amount === 0 || !currency || !user) return;

    try {
      setApplePayLoading(true);

      const response = await fetchStripePaymentIntentClientSecret(
        amount,
        currency.toLowerCase()
      );

      if (!response.ok) {
        setApplePayLoading(false);
        return;
      }

      const { clientSecret } = response.data;

      const { error } = await confirmPlatformPayPayment(clientSecret, {
        applePay: {
          cartItems: [
            {
              label: planTitle,
              amount: amount.toString(),
              paymentType: PlatformPay.PaymentType.Immediate,
            },
          ],
          merchantCountryCode: "PL",
          currencyCode: currency,
          requiredShippingAddressFields: [
            PlatformPay.ContactField.PostalAddress,
          ],
          requiredBillingContactFields: [PlatformPay.ContactField.PhoneNumber],
        },
      });

      if (error) {
        showToast(error.message, "error");
        setApplePayLoading(false);
        return;
      }

      onPaymentComplete(true);
    } catch (error) {
      console.error("Apple Pay error:", error);
    } finally {
    }
  };

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
                      {planTitle} Plan • {formattedAmount} (
                      {getCurrencyText(currency)})
                    </Text>

                    {/* Digital Wallet Options Section */}
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
                      {isGooglePayAvailable && (
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
                          <Button
                            title="Google pay"
                            variant={isDarkMode ? "secondary" : "primary"}
                            onPress={handleGooglePay}
                            disabled={cardLoading}
                            loading={googlePayLoading}
                            icon={
                              <FontAwesome5
                                name="google"
                                size={14}
                                color="white"
                              />
                            }
                          />
                        </View>
                      )}

                      {/* Apple Pay Button */}
                      {isApplePayAvailable && (
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
                          <Button
                            title="Apple pay"
                            variant={isDarkMode ? "secondary" : "primary"}
                            onPress={handleApplePay}
                            disabled={cardLoading}
                            loading={applePayLoading}
                            icon={
                              <FontAwesome5
                                name="apple"
                                size={14}
                                color="white"
                              />
                            }
                          />
                        </View>
                      )}

                      {/* Payment Sheet Button */}
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
                            marginTop: SPACING.S,
                          },
                        ]}
                      ></View>

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

                    {/* Credit Card Section Header */}
                    <View style={styles.digitalWalletHeader}>
                      <Text
                        style={[
                          styles.digitalWalletTitle,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                            marginTop: SPACING.S,
                          },
                        ]}
                      >
                        Credit Card Payment
                      </Text>
                    </View>

                    {/* Credit Card Information (collapsible) */}
                    <Animated.View
                      style={[
                        styles.walletInfoContainer,
                        {
                          maxHeight: creditCardInfoHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 500], // Max height when expanded
                          }),
                          opacity: creditCardInfoOpacity,
                          backgroundColor: isDarkMode
                            ? "rgba(30, 35, 45, 0.5)"
                            : "rgba(255, 255, 255, 0.5)",
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                          marginBottom: SPACING.S,
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
                        Why use credit card payment?
                      </Text>

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
                          Industry-standard SSL encryption protects your data
                        </Text>
                      </View>

                      <View style={styles.walletInfoItem}>
                        <FontAwesome5
                          name="credit-card"
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
                          Most cards offer fraud protection and purchase
                          insurance
                        </Text>
                      </View>

                      <View style={styles.walletInfoItem}>
                        <FontAwesome5
                          name="globe"
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
                          Accepted worldwide with comprehensive payment options
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
                          PCI-DSS compliant processing ensures your data is
                          secure
                        </Text>
                      </View>
                    </Animated.View>

                    {/* Pay Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.M,
                      }}
                    >
                      <Button
                        title="Pay with Credit Card"
                        onPress={handlePayment}
                        loading={cardLoading}
                        variant={isDarkMode ? "primary" : "secondary"}
                        small={false}
                        icon={
                          !cardLoading && (
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
  paymentSheetButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentSheetContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentSheetText: {
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

export default CardPayment;
