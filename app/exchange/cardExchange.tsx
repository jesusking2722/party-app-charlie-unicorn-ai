import { FONTS } from "@/app/theme";
import { Button, Spinner, Input } from "@/components/common";
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
import { useToast } from "@/contexts/ToastContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSelector } from "react-redux";
import { CardTransaction, CurrencyType, ICard, User } from "@/types/data";
import { formatPrice } from "@/utils/currency";
import { updateMyCard } from "@/lib/scripts/auth.scripts";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import {
  fetchStripeBalance,
  transferStripeFunds,
} from "@/lib/scripts/stripe.scripts";
import { sendTopUpMessageToOwner } from "@/lib/scripts/mail.scripts";
import { saveCardTransaction } from "@/lib/scripts/card.transaction.scripts";
import { addNewCardTransactionSliceAsync } from "@/redux/actions/card.transaction.actions";
import { exchangeSticker } from "@/lib/scripts/ticket.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { updateSelectedPartyAsnyc } from "@/redux/actions/party.actions";

const ExchangeHeaderImage = require("@/assets/images/card-exchange.png");
const { width, height } = Dimensions.get("window");

const LIGHT_THEME_ACCENT = "#FF0099";

const CardExchangeScreen: React.FC = () => {
  const { amount, currency, ticketId, applicantId, eventId, success } =
    useLocalSearchParams();

  const [amountValue, setAmountValue] = useState<number>(0);
  const [currencyValue, setCurrencyValue] = useState<CurrencyType>("usd");
  const [feeValue, setFeeValue] = useState<number>(0);
  const [netValue, setNetValue] = useState<number>(0);
  const [applicantIdValue, setApplicantIdValue] = useState<string>("");
  const [eventIdValue, setEventIdValue] = useState<string>("");
  const [ticketIdValue, setTicketIdValue] = useState<string>("");

  // Card input states
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");

  // Error states
  const [cardNumberError, setCardNumberError] = useState<string>("");
  const [expiryDateError, setExpiryDateError] = useState<string>("");
  const [cvcError, setCvcError] = useState<string>("");

  const router = useRouter();

  // Calculate the exchange fee (5%)
  const calculateFeeAmount = (originalAmount: number) => {
    const fee = originalAmount * 0.05;
    return Number(fee.toFixed(2));
  };

  const calculateNetAmount = (originalAmount: number) => {
    const net = originalAmount * 0.95;
    return Number(net.toFixed(2));
  };

  // Handle card number input with formatting
  const handleCardNumberChange = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Format with spaces every 4 digits
    let formatted = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += cleaned[i];
    }

    setCardNumber(formatted);

    // Validate card number
    if (cleaned.length > 0 && cleaned.length < 16) {
      setCardNumberError("Card number must be 16 digits");
    } else {
      setCardNumberError("");
    }
  };

  // Handle expiry date input with formatting
  const handleExpiryDateChange = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Format as MM/YY
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + "/" + cleaned.substring(2);
    }

    setExpiryDate(formatted);

    // Validate expiry date
    if (cleaned.length === 4) {
      const month = parseInt(cleaned.substring(0, 2), 10);

      if (month < 1 || month > 12) {
        setExpiryDateError("Invalid month");
      } else {
        setExpiryDateError("");
      }
    }
  };

  // Handle CVC input
  const handleCVCChange = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    setCvc(cleaned);

    // Validate CVC
    if (cleaned.length > 0 && cleaned.length < 3) {
      setCvcError("CVC must be at least 3 digits");
    } else {
      setCvcError("");
    }
  };

  const extractCardInfo = (): ICard => {
    // Extract last4 from card number
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);

    // Determine card brand based on first digit
    let brand = "unknown";
    const firstDigit = cardNumber.trim()[0];
    if (firstDigit === "4") brand = "visa";
    else if (firstDigit === "5") brand = "mastercard";
    else if (firstDigit === "3") brand = "amex";
    else if (firstDigit === "6") brand = "discover";

    // Extract expiry month and year
    const [exp_month_str, exp_year_str] = expiryDate.split("/");
    const exp_month = parseInt(exp_month_str, 10);
    const exp_year = parseInt(`20${exp_year_str}`, 10); // Convert YY to 20YY

    // Determine funding type (can't be determined from card number alone)
    // Usually requires backend verification, defaulting to "credit"
    const funding = "credit";

    return {
      brand,
      exp_month,
      exp_year,
      funding,
      last4,
    };
  };

  const [cardLoading, setCardLoading] = useState<boolean>(false);
  const [exchangeLoading, setExchangeLoading] = useState<boolean>(false);

  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const creditCardInfoHeight = useRef(new Animated.Value(0)).current;
  const creditCardInfoOpacity = useRef(new Animated.Value(0)).current;

  const { user } = useSelector((state: RootState) => state.auth);
  const { tickets } = useSelector((state: RootState) => state.ticket);
  const dispatch = useAppDispatch();

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
    if (amount && currency && applicantId && eventId && ticketId) {
      const parsedAmount = Number(amount as string);
      setAmountValue(parsedAmount);
      setCurrencyValue(currency as CurrencyType);
      setFeeValue(calculateFeeAmount(parsedAmount));
      setNetValue(calculateNetAmount(parsedAmount));
      setTicketIdValue(ticketId as string);
      setApplicantIdValue(applicantId as string);
      setEventIdValue(eventId as string);
    }
  }, [amount, currency, ticketId, applicantId, eventId]);

  useEffect(() => {
    const udpatePaymentVerifiedStatus = async () => {
      console.log("Success:", success);
      if (success && user) {
        showToast("Payment method verified successfully", "success");
        const updatedUser: User = {
          ...user,
          paymentVerified: true,
        };
        await dispatch(setAuthUserAsync(updatedUser)).unwrap();
      }
    };

    udpatePaymentVerifiedStatus();
  }, [success]);

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

  // Handle card verification
  const handleVerifyCard = async () => {
    try {
      // Validate all fields first
      let hasError = false;

      if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
        setCardNumberError("Please enter a valid 16-digit card number");
        hasError = true;
      }

      if (!expiryDate || expiryDate.length !== 5) {
        setExpiryDateError("Please enter a valid expiry date (MM/YY)");
        hasError = true;
      } else {
        const month = parseInt(expiryDate.split("/")[0], 10);
        if (month < 1 || month > 12) {
          setExpiryDateError("Invalid month (1-12)");
          hasError = true;
        }
      }

      if (!cvc || cvc.length < 3) {
        setCvcError("Please enter a valid CVC");
        hasError = true;
      }

      if (hasError || !user) {
        return;
      }

      setCardLoading(true);

      // Extract card information
      const cardInfo = extractCardInfo();

      // Update user with card info
      const updatingUser: User = {
        ...user,
        card: cardInfo,
      };

      const response = await updateMyCard({ user: updatingUser });

      if (response.ok) {
        const { redirectUrl } = response.data;

        // Show loading indicator during redirect
        showToast("Opening Stripe verification...", "info");

        try {
          // Open the Stripe session URL in a browser
          const result = await WebBrowser.openAuthSessionAsync(redirectUrl);
          if (result.type === "success") {
            showToast("Payment method verified successfully", "success");
          }
        } catch (err) {
          console.error("Browser session error:", err);
          showToast("Failed to open verification page", "error");
        }
      } else {
        showToast("Failed to update card information", "error");
      }
    } catch (error) {
      console.error("Card verification error:", error);
      showToast("An error occurred during verification", "error");
    } finally {
      setCardLoading(false);
    }
  };

  // Handle exchange
  const handleExchange = async () => {
    if (
      !user?.email ||
      !user.card?.stripeId ||
      applicantIdValue === "" ||
      ticketIdValue === ""
    )
      return;

    const ticket = tickets.find((t) => t._id === ticketIdValue);

    if (!ticket) return;

    try {
      setExchangeLoading(true);

      const balanceResponse = await fetchStripeBalance();

      if (!balanceResponse.ok) {
        showToast(balanceResponse.message, "error");
        setExchangeLoading(false);
        return;
      }

      const balance = balanceResponse.data.balance as any;

      const availableBalance = balance.available.find(
        (item: any) => item.currency === currencyValue.toLowerCase()
      );

      if (availableBalance && Number(availableBalance.amount) < netValue) {
        const message = `From Party App/Party Application | Charlie Unicorn AI\n${
          user.email
        } is about to exchange stickers for ${currencyValue.toUpperCase()} ${netValue}.\nHis transaction is pending currently.\nPlease try to top up your stripe balance in USD`;
        const response = await sendTopUpMessageToOwner(message);
        if (response.ok) {
          showToast(
            "We submitted your transaction, please retry in a few minutes",
            "success"
          );
        } else {
          showToast(response.message, "error");
        }
        setExchangeLoading(false);
        return;
      }

      const transferResponse = await transferStripeFunds(
        user.card?.stripeId,
        netValue,
        currencyValue.toLowerCase()
      );

      if (transferResponse.ok) {
        const transfer = transferResponse.data;
        const completedTransaction: CardTransaction = {
          amount: netValue,
          type: "exchange",
          status: "completed",
          currency: currencyValue.toLowerCase(),
          user,
          createdAt: new Date(),
        };

        const completedResponse = await saveCardTransaction(
          completedTransaction
        );

        if (completedResponse.ok) {
          const { transaction } = completedResponse.data;
          await dispatch(addNewCardTransactionSliceAsync(transaction)).unwrap();
          const exchangeResponse = await exchangeSticker(
            applicantIdValue,
            eventIdValue,
            ticket
          );

          if (exchangeResponse.ok) {
            const updatedParty = exchangeResponse.data;
            await dispatch(updateSelectedPartyAsnyc(updatedParty)).unwrap();
            showToast(
              "Exchange successful! You'll receive the funds shortly.",
              "success"
            );
            router.back();
          }
        }
      } else {
        showToast(transferResponse.message, "error");
      }
    } catch (error) {
      console.error("Exchange error:", error);
      showToast("Failed to process exchange", "error");
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
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
              source={ExchangeHeaderImage}
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
                      {user?.paymentVerified
                        ? "Exchange Tickets"
                        : "Verify Payment Method"}
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
                      {user?.paymentVerified
                        ? `Exchange amount: ${formatPrice(
                            amountValue,
                            currencyValue.toUpperCase()
                          )}`
                        : "Add a payment method to receive funds"}
                    </Text>

                    {user?.paymentVerified ? (
                      // Exchange UI for verified users
                      <View style={styles.exchangeContainer}>
                        <View style={styles.exchangeInfoItem}>
                          <FontAwesome5
                            name="money-bill-wave"
                            size={16}
                            color={getAccentColor()}
                            style={styles.exchangeInfoIcon}
                          />
                          <View style={styles.exchangeInfoContent}>
                            <Text
                              style={[
                                styles.exchangeInfoLabel,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Total Amount
                            </Text>
                            <Text
                              style={[
                                styles.exchangeInfoValue,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                },
                              ]}
                            >
                              {formatPrice(
                                amountValue,
                                currencyValue.toUpperCase()
                              )}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.exchangeInfoItem}>
                          <FontAwesome5
                            name="percent"
                            size={14}
                            color={getAccentColor()}
                            style={styles.exchangeInfoIcon}
                          />
                          <View style={styles.exchangeInfoContent}>
                            <Text
                              style={[
                                styles.exchangeInfoLabel,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Exchange Fee (5%)
                            </Text>
                            <Text
                              style={[
                                styles.exchangeInfoValue,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                },
                              ]}
                            >
                              -
                              {formatPrice(
                                feeValue,
                                currencyValue.toUpperCase()
                              )}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.divider,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.1)",
                            },
                          ]}
                        />

                        <View style={styles.exchangeInfoItem}>
                          <FontAwesome5
                            name="hand-holding-usd"
                            size={16}
                            color={getAccentColor()}
                            style={styles.exchangeInfoIcon}
                          />
                          <View style={styles.exchangeInfoContent}>
                            <Text
                              style={[
                                styles.exchangeInfoLabel,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              You'll Receive
                            </Text>
                            <Text
                              style={[
                                styles.netAmountText,
                                {
                                  color: isDarkMode
                                    ? COLORS.ACCENT_PURPLE_LIGHT
                                    : COLORS.PRIMARY,
                                },
                              ]}
                            >
                              {formatPrice(
                                netValue,
                                currencyValue.toUpperCase()
                              )}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.infoBox,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(30, 35, 45, 0.5)"
                                : "rgba(255, 255, 255, 0.5)",
                              borderColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(0, 0, 0, 0.05)",
                            },
                          ]}
                        >
                          <FontAwesome5
                            name="info-circle"
                            size={16}
                            color={getAccentColor()}
                            style={{ marginRight: SPACING.S }}
                          />
                          <Text
                            style={[
                              styles.infoText,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            Funds will be transferred to your verified payment
                            method. Processing may take 1-3 business days or
                            faster.
                          </Text>
                        </View>

                        {/* Exchange Button */}
                        <Animated.View
                          style={{
                            width: "100%",
                            transform: [{ scale: buttonScale }],
                            marginTop: SPACING.M,
                          }}
                        >
                          <Button
                            title="Exchange Now"
                            onPress={handleExchange}
                            loading={exchangeLoading}
                            variant={isDarkMode ? "primary" : "secondary"}
                            small={false}
                            icon={
                              !exchangeLoading && (
                                <FontAwesome5
                                  name="exchange-alt"
                                  size={14}
                                  color="white"
                                  style={{ marginLeft: SPACING.S }}
                                />
                              )
                            }
                            iconPosition="right"
                          />
                        </Animated.View>
                      </View>
                    ) : (
                      // Card Verification UI for non-verified users
                      <>
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
                              marginBottom: SPACING.M,
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
                            Why verify your payment method?
                          </Text>

                          <View style={styles.walletInfoItem}>
                            <FontAwesome5
                              name="exchange-alt"
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
                              Exchange tickets for real money quickly and
                              securely
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
                              Your card details are securely encrypted and
                              protected
                            </Text>
                          </View>

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
                              Verification is quick and only needs to be done
                              once
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
                              We don't charge your card now - this is just for
                              verification
                            </Text>
                          </View>
                        </Animated.View>

                        {/* Card Input Form */}
                        <View style={styles.cardFormContainer}>
                          <Text
                            style={[
                              styles.cardFormTitle,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY,
                              },
                            ]}
                          >
                            Payment Information
                          </Text>

                          <Input
                            label="Card Number"
                            placeholder="4242 4242 4242 4242"
                            keyboardType="number-pad"
                            value={cardNumber}
                            onChangeText={handleCardNumberChange}
                            icon={
                              <FontAwesome5
                                name="credit-card"
                                size={14}
                                color={getAccentColor()}
                              />
                            }
                            maxLength={19}
                            error={cardNumberError}
                          />

                          <View style={styles.cardDetailsRow}>
                            <View style={styles.cardDetailsHalf}>
                              <Input
                                label="Expiry Date"
                                placeholder="MM/YY"
                                keyboardType="number-pad"
                                value={expiryDate}
                                onChangeText={handleExpiryDateChange}
                                icon={
                                  <FontAwesome5
                                    name="calendar"
                                    size={14}
                                    color={getAccentColor()}
                                  />
                                }
                                maxLength={5}
                                error={expiryDateError}
                              />
                            </View>
                            <View style={styles.cardDetailsHalf}>
                              <Input
                                label="CVC"
                                placeholder="123"
                                keyboardType="number-pad"
                                value={cvc}
                                onChangeText={handleCVCChange}
                                icon={
                                  <FontAwesome5
                                    name="lock"
                                    size={14}
                                    color={getAccentColor()}
                                  />
                                }
                                maxLength={4}
                                error={cvcError}
                              />
                            </View>
                          </View>

                          <View
                            style={[
                              styles.securityBox,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(30, 35, 45, 0.5)"
                                  : "rgba(255, 255, 255, 0.5)",
                                borderColor: isDarkMode
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "rgba(0, 0, 0, 0.05)",
                              },
                            ]}
                          >
                            <FontAwesome5
                              name="shield-alt"
                              size={16}
                              color={getAccentColor()}
                              style={{ marginRight: SPACING.S }}
                            />
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
                              Your payment information is securely processed and
                              encrypted. We comply with PCI DSS standards for
                              security.
                            </Text>
                          </View>
                        </View>

                        {/* Verify Button */}
                        <Animated.View
                          style={{
                            width: "100%",
                            transform: [{ scale: buttonScale }],
                            marginTop: SPACING.M,
                          }}
                        >
                          <Button
                            title="Verify Payment Method"
                            onPress={handleVerifyCard}
                            loading={cardLoading}
                            variant={isDarkMode ? "primary" : "secondary"}
                            small={false}
                            icon={
                              !cardLoading && (
                                <FontAwesome5
                                  name="check-circle"
                                  size={14}
                                  color="white"
                                  style={{ marginLeft: SPACING.S }}
                                />
                              )
                            }
                            iconPosition="right"
                          />
                        </Animated.View>
                      </>
                    )}

                    {/* Back Button */}
                    <TouchableOpacity
                      style={styles.backButtonContainer}
                      onPress={handleBackPress}
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
  backButtonContainer: {
    alignSelf: "center",
    marginTop: SPACING.M,
    padding: SPACING.S,
  },
  backButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  exchangeContainer: {
    marginTop: SPACING.S,
  },
  exchangeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  exchangeInfoIcon: {
    marginRight: SPACING.M,
    width: 20,
    textAlign: "center",
  },
  exchangeInfoContent: {
    flex: 1,
  },
  exchangeInfoLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginBottom: 2,
  },
  exchangeInfoValue: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
  },
  netAmountText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.L,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: SPACING.S,
  },
  infoBox: {
    flexDirection: "row",
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    borderWidth: 0.5,
    marginTop: SPACING.M,
    marginBottom: SPACING.S,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    lineHeight: 18,
  },
  // Card form styles
  cardFormContainer: {
    marginBottom: SPACING.M,
  },
  cardFormTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.S,
  },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailsHalf: {
    width: "48%",
  },
  securityBox: {
    flexDirection: "row",
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    borderWidth: 0.5,
    marginTop: SPACING.S,
    marginBottom: SPACING.S,
    alignItems: "flex-start",
  },
  securityText: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    lineHeight: 18,
  },
});

export default CardExchangeScreen;
