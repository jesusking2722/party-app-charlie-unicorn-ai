import { FONTS } from "@/app/theme";
import { Button, Spinner, Input } from "@/components/common";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
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
import { CurrencyType } from "@/types/data";
import fetchUsdRates, { formatPrice } from "@/utils/currency";
import useWeb3 from "@/hooks/useWeb3";
import { OWNER_WALLET_ADDRESS } from "@/constant";
import { sendTopUpMessageToOwner } from "@/lib/scripts/mail.scripts";
import { payUserSell } from "@/lib/scripts/web3.scripts";
import { TransactionResponse } from "@/types/api";
import { saveCryptoTransaction } from "@/lib/scripts/crypto.transaction.scripts";
import { exchangeSticker } from "@/lib/scripts/ticket.scripts";
import { updateSelectedPartyAsnyc } from "@/redux/actions/party.actions";

const ExchangeHeaderImage = require("@/assets/images/crypto-payment.png");
const { width, height } = Dimensions.get("window");

const LIGHT_THEME_ACCENT = "#FF0099";

const CryptoExchangeScreen: React.FC = () => {
  const { amount, currency, ticketId, applicantId, eventId } =
    useLocalSearchParams();

  const [amountValue, setAmountValue] = useState<number>(0);
  const [currencyValue, setCurrencyValue] = useState<CurrencyType>("usd");
  const [feeValue, setFeeValue] = useState<number>(0);
  const [netValue, setNetValue] = useState<number>(0);
  const [bnbEquivalent, setBnbEquivalent] = useState<number>(0);
  const [feeBnbEquivalent, setFeeBnbEquivalent] = useState<number>(0);
  const [ticketIdValue, setTicketIdValue] = useState<string>("");
  const [applicantIdValue, setApplicantIdValue] = useState<string>("");
  const [eventIdValue, setEventIdValue] = useState<string>("");

  // Wallet address input state
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletAddressError, setWalletAddressError] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  // Exchange status
  const [exchangeStatus, setExchangeStatus] = useState<
    "initial" | "processing" | "completed" | "failed"
  >("initial");

  const router = useRouter();

  const { fetchBnbPrice, getBalanceForSpecialAddress } = useWeb3();

  // Calculate the exchange fee (5%)
  const calculateFeeAmount = (originalAmount: number) => {
    const fee = originalAmount * 0.05;
    return Number(fee.toFixed(2));
  };

  const calculateNetAmount = (originalAmount: number) => {
    const net = originalAmount * 0.95;
    return Number(net.toFixed(2));
  };

  // Mock function to get BNB equivalent
  const getBnbEquivalent = (usdAmount: number, bnbPrice: number) => {
    // Mock conversion rate: 1 BNB = $300 USD
    const bnbAmount = usdAmount / bnbPrice;
    return Number(bnbAmount.toFixed(6));
  };

  const [exchangeLoading, setExchangeLoading] = useState<boolean>(false);

  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const cryptoInfoHeight = useRef(new Animated.Value(0)).current;
  const cryptoInfoOpacity = useRef(new Animated.Value(0)).current;

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
    const initialize = async () => {
      if (amount && currency && ticketId && applicantId && eventId) {
        let parsedAmount = Number(amount as string);
        let fee = calculateFeeAmount(parsedAmount);
        setAmountValue(parsedAmount);
        setCurrencyValue(currency as CurrencyType);
        setFeeValue(calculateFeeAmount(parsedAmount));
        setNetValue(calculateNetAmount(parsedAmount));
        setTicketIdValue(ticketId as string);
        setApplicantIdValue(applicantId as string);
        setEventIdValue(eventId as string);
        const bnbPrice = await fetchBnbPrice();
        const usdRates = await fetchUsdRates();

        // Convert amount to USD if needed
        if (currency === "eur") {
          parsedAmount /= usdRates.eur;
          fee /= usdRates.eur;
        } else if (currency === "pln") {
          parsedAmount /= usdRates.pln;
          fee /= usdRates.pln;
        }

        // Calculate BNB equivalent
        if (bnbPrice) {
          setBnbEquivalent(getBnbEquivalent(parsedAmount, bnbPrice));
          setFeeBnbEquivalent(getBnbEquivalent(fee, bnbPrice));
        }
      }
    };

    initialize();
  }, [amount, currency, ticketId, applicantId, eventId]);

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

  // Animate crypto info section
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cryptoInfoHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(cryptoInfoOpacity, {
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

  // Handle wallet address input validation
  const handleWalletAddressChange = (text: string) => {
    setWalletAddress(text);

    // Basic BNB address validation (starts with 0x and has 42 chars total)
    if (text && (text.length !== 42 || !text.startsWith("0x"))) {
      setWalletAddressError("Please enter a valid BNB wallet address (0x...)");
    } else {
      setWalletAddressError("");
    }
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

  // Handle exchange
  const handleExchange = async () => {
    // Validate wallet address
    if (
      !walletAddress ||
      walletAddress.length !== 42 ||
      !walletAddress.startsWith("0x")
    ) {
      setWalletAddressError("Please enter a valid BNB wallet address (0x...)");
      return;
    }

    const ticket = tickets.find((t) => t._id === ticketIdValue);

    if (!ticket || eventIdValue === "" || applicantIdValue === "" || !user)
      return;

    const ownerBalance = await getBalanceForSpecialAddress(
      OWNER_WALLET_ADDRESS
    );

    if (ownerBalance === null || ownerBalance < bnbEquivalent) {
      const message = `From Party App/Party Application | Charlie Unicorn AI\n${user.email} is about to exchange stickers for ${bnbEquivalent} BNB.\nPlease try to top up your BNB balance`;
      const response = await sendTopUpMessageToOwner(message);

      if (response.ok) {
        showToast(
          "Insufficient funds in the owner's wallet. Please wait a little.",
          "error"
        );
      } else {
        showToast(response.message, "error");
      }
      return;
    }

    try {
      setExchangeLoading(true);
      setExchangeStatus("processing");
      const response = await payUserSell(
        bnbEquivalent,
        walletAddress,
        feeBnbEquivalent
      );
      if (response.ok) {
        const { hash } = response.data;
        const transaction: TransactionResponse = {
          user,
          hash,
          type: "exchange",
          totalAmount: bnbEquivalent.toString(),
          address: walletAddress,
          createdAt: new Date(),
          status: "completed",
          success: true,
        };
        const txResponse = await saveCryptoTransaction(transaction);
        if (txResponse.ok && txResponse.data.transaction.hash) {
          setTransactionId(txResponse.data.transaction.hash);
          const exchangeResponse = await exchangeSticker(
            applicantIdValue,
            eventIdValue,
            ticket
          );
          if (exchangeResponse.ok) {
            const updatedParty = exchangeResponse.data;
            await dispatch(updateSelectedPartyAsnyc(updatedParty)).unwrap();
            showToast(
              `Exchange successful! ${bnbEquivalent} BNB will be sent to your wallet.`,
              "success"
            );
            setExchangeStatus("completed");
          }
        }
      } else {
        showToast("Transaction failed, please retry later", "error");
      }
    } catch (error) {
      console.error("Exchange error:", error);
      setExchangeStatus("failed");
      showToast("Failed to process exchange", "error");
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleTryAgain = () => {
    setExchangeStatus("initial");
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
                      Crypto Exchange
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
                      Exchange amount:{" "}
                      {formatPrice(amountValue, currencyValue.toUpperCase())} ≈{" "}
                      {bnbEquivalent} BNB
                    </Text>

                    {exchangeStatus === "initial" ? (
                      // Exchange details and form
                      <>
                        {/* Exchange breakdown */}
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
                              name="coins"
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
                                {bnbEquivalent} BNB
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Crypto information section */}
                        <Animated.View
                          style={[
                            styles.cryptoInfoContainer,
                            {
                              maxHeight: cryptoInfoHeight.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 500], // Max height when expanded
                              }),
                              opacity: cryptoInfoOpacity,
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
                              styles.cryptoInfoTitle,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY,
                              },
                            ]}
                          >
                            BNB Network Information
                          </Text>

                          <View style={styles.cryptoInfoItem}>
                            <FontAwesome
                              name="info-circle"
                              size={12}
                              color={getAccentColor()}
                              style={styles.cryptoInfoIcon}
                            />
                            <Text
                              style={[
                                styles.cryptoInfoText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Make sure to provide a BNB address on the BNB
                              Smart Chain network (BSC)
                            </Text>
                          </View>

                          <View style={styles.cryptoInfoItem}>
                            <FontAwesome
                              name="exclamation-triangle"
                              size={12}
                              color={getAccentColor()}
                              style={styles.cryptoInfoIcon}
                            />
                            <Text
                              style={[
                                styles.cryptoInfoText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Sending to the wrong network may result in
                              permanent loss of funds
                            </Text>
                          </View>

                          <View style={styles.cryptoInfoItem}>
                            <FontAwesome
                              name="clock-o"
                              size={12}
                              color={getAccentColor()}
                              style={styles.cryptoInfoIcon}
                            />
                            <Text
                              style={[
                                styles.cryptoInfoText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Transfers typically complete within 5-20 minutes
                            </Text>
                          </View>
                        </Animated.View>

                        {/* Wallet address input */}
                        <View style={styles.walletInputContainer}>
                          <Text
                            style={[
                              styles.walletInputLabel,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY,
                              },
                            ]}
                          >
                            Your BNB Wallet Address
                          </Text>

                          <Input
                            placeholder="0x..."
                            value={walletAddress}
                            onChangeText={handleWalletAddressChange}
                            icon={
                              <FontAwesome5
                                name="wallet"
                                size={14}
                                color={getAccentColor()}
                              />
                            }
                            error={walletAddressError}
                          />

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
                              Double-check your wallet address. Crypto
                              transactions are irreversible.
                            </Text>
                          </View>
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
                      </>
                    ) : (
                      // Exchange Status UI
                      <View
                        style={[
                          styles.statusContainer,
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
                        <View
                          style={[
                            styles.statusIndicator,
                            exchangeStatus === "processing" &&
                              styles.statusProcessing,
                            exchangeStatus === "completed" &&
                              styles.statusCompleted,
                            exchangeStatus === "failed" && styles.statusFailed,
                          ]}
                        >
                          {exchangeStatus === "processing" && (
                            <FontAwesome5
                              name="spinner"
                              size={24}
                              color={getAccentColor()}
                            />
                          )}
                          {exchangeStatus === "completed" && (
                            <FontAwesome5
                              name="check"
                              size={24}
                              color={isDarkMode ? "#4CAF50" : "#00C853"}
                            />
                          )}
                          {exchangeStatus === "failed" && (
                            <FontAwesome5
                              name="times"
                              size={24}
                              color={isDarkMode ? "#F44336" : "#D32F2F"}
                            />
                          )}
                        </View>

                        <Text
                          style={[
                            styles.statusTitle,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          {exchangeStatus === "processing" &&
                            "Processing Exchange..."}
                          {exchangeStatus === "completed" &&
                            "Exchange Successful!"}
                          {exchangeStatus === "failed" && "Exchange Failed"}
                        </Text>

                        <Text
                          style={[
                            styles.statusDescription,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          {exchangeStatus === "processing" &&
                            "Please wait while we process your exchange."}
                          {exchangeStatus === "completed" &&
                            `${bnbEquivalent} BNB will be sent to your wallet address within a few minutes.`}
                          {exchangeStatus === "failed" &&
                            "There was an error processing your exchange. Please try again."}
                        </Text>

                        {exchangeStatus === "completed" && (
                          <View style={styles.walletAddressContainer}>
                            <Text
                              style={[
                                styles.walletAddressLabel,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              Recipient address:
                            </Text>
                            <Text
                              style={[
                                styles.walletAddressValue,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                },
                              ]}
                            >
                              {walletAddress.substring(0, 8)}...
                              {walletAddress.substring(
                                walletAddress.length - 8
                              )}
                            </Text>
                            <Text
                              style={[
                                styles.walletAddressLabel,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                  marginTop: SPACING.S,
                                },
                              ]}
                            >
                              Transaction ID:
                            </Text>
                            <Text
                              style={[
                                styles.walletAddressValue,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                  textDecorationLine: "underline",
                                },
                              ]}
                              onPress={() => {
                                if (transactionId) {
                                  Linking.openURL(
                                    `https://bscscan.com/tx/${transactionId}`
                                  );
                                }
                              }}
                            >
                              {transactionId === ""
                                ? "Loading..."
                                : transactionId}
                            </Text>
                          </View>
                        )}

                        {/* Action Buttons */}
                        <Animated.View
                          style={{
                            width: "100%",
                            transform: [{ scale: buttonScale }],
                            marginTop: SPACING.M,
                          }}
                        >
                          {exchangeStatus === "completed" && (
                            <Button
                              title="Done"
                              onPress={() => router.back()}
                              variant={isDarkMode ? "primary" : "secondary"}
                              small={false}
                              icon={
                                <FontAwesome5
                                  name="check-circle"
                                  size={14}
                                  color="white"
                                  style={{ marginRight: SPACING.S }}
                                />
                              }
                              iconPosition="left"
                            />
                          )}

                          {exchangeStatus === "failed" && (
                            <Button
                              title="Try Again"
                              onPress={handleTryAgain}
                              variant={isDarkMode ? "primary" : "secondary"}
                              small={false}
                              icon={
                                <FontAwesome5
                                  name="redo"
                                  size={14}
                                  color="white"
                                  style={{ marginRight: SPACING.S }}
                                />
                              }
                              iconPosition="left"
                            />
                          )}
                        </Animated.View>
                      </View>
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
  // Exchange info styles
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
  // Crypto info styles
  cryptoInfoContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginVertical: SPACING.S,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  cryptoInfoTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.S,
  },
  cryptoInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.XS,
  },
  cryptoInfoIcon: {
    marginRight: SPACING.XS,
    marginTop: 2,
  },
  cryptoInfoText: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    lineHeight: 16,
  },
  // Wallet input styles
  walletInputContainer: {
    marginTop: SPACING.M,
  },
  walletInputLabel: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.S,
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
  // Status styles
  statusContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginVertical: SPACING.M,
    borderWidth: 0.5,
    alignItems: "center",
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  statusProcessing: {
    backgroundColor: "rgba(0, 150, 255, 0.15)",
  },
  statusCompleted: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  statusFailed: {
    backgroundColor: "rgba(244, 67, 54, 0.15)",
  },
  statusTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
    marginBottom: SPACING.S,
  },
  statusDescription: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
    marginBottom: SPACING.M,
  },
  walletAddressContainer: {
    width: "100%",
    padding: SPACING.M,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: BORDER_RADIUS.M,
    marginBottom: SPACING.M,
    alignItems: "center",
  },
  walletAddressLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.XS,
  },
  walletAddressValue: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  // Back button styles
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

export default CryptoExchangeScreen;
