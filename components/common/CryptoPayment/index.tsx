import { FONTS } from "@/app/theme";
import { Button, Currency, Translate } from "@/components/common";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import useWeb3 from "@/hooks/useWeb3";
import { saveCryptoTransaction } from "@/lib/scripts/crypto.transaction.scripts";
import { RootState } from "@/redux/store";
import { TransactionResponse } from "@/types/api";
import { User } from "@/types/data";
import fetchUsdRates from "@/utils/currency";
import { extractNumericPrice } from "@/utils/price";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import { useSelector } from "react-redux";

const PaymentHeaderImage = require("@/assets/images/crypto-payment.png");
const { width, height } = Dimensions.get("window");

// Wallet logos
const MetaMaskImage = require("@/assets/images/logos/metamask.png");
const TrustImage = require("@/assets/images/logos/trust.png");
const BinanceImage = require("@/assets/images/logos/binance.png");
const CoinbaseImage = require("@/assets/images/logos/coinbase.png");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Format address for display (show first and last few characters)
const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 8)}...${address.substring(
    address.length - 6
  )}`;
};

// Props for the crypto payment component
interface CryptoPaymentProps {
  type: "ticket" | "subscription";
  amount: string;
  planTitle: string;
  formattedAmount: string;
  currency: Currency;
  onPaymentComplete: (success: boolean) => void;
  onBack: () => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({
  type,
  planTitle,
  formattedAmount,
  currency,
  onPaymentComplete,
  onBack,
}) => {
  const { isDarkMode } = useTheme();

  // Component states
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("initial");
  const [showWalletInfo, setShowWalletInfo] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [chainId, setChainId] = useState<number | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const infoHeight = useRef(new Animated.Value(0)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;

  const { open, isConnected, address, provider } = useWalletConnectModal();

  const { getBalance, fetchBnbPrice, depositSticker, depositSubscription } =
    useWeb3();

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

  // Animate wallet info section
  useEffect(() => {
    if (showWalletInfo) {
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
  }, [showWalletInfo]);

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

  const getBnbEquivalent = (usdAmount: number, bnbPrice: number) => {
    // Mock conversion rate: 1 BNB = $300 USD
    const bnbAmount = usdAmount / bnbPrice;
    return Number(bnbAmount.toFixed(6));
  };

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

  const handleBuyTicket = async (
    amount: string,
    address: string,
    buyer: User
  ) => {
    try {
      const txResponse = await depositSticker(
        Number(amount).toString(),
        address
      );
      if (txResponse?.success) {
        const transaction: TransactionResponse = {
          ...txResponse,
          user: buyer,
        };
        await saveCryptoTransaction(transaction);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const handleBuySubscription = async (amount: string, buyer: User) => {
    try {
      const txResponse = await depositSubscription(amount);
      if (txResponse?.success) {
        const transaction: TransactionResponse = {
          ...txResponse,
          user: buyer,
        };
        await saveCryptoTransaction(transaction);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // Make payment with smart contract integration
  const handlePay = async () => {
    if (!walletConnected || !walletAddress) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    if (chainId !== 56) {
      showToast("Please change your network into BNB in your wallet", "error");
      return;
    }

    if (totalAmount === 0) {
      showToast("Payment amount not calculated yet", "error");
      return;
    }

    if (balance <= totalAmount) {
      showToast("Insufficient balance for this transaction", "error");
      return;
    }

    if (!type || !user) return;

    try {
      setLoading(true);
      setPaymentStatus("processing");

      let result = false;

      if (type === "subscription") {
        result = await handleBuySubscription(totalAmount.toString(), user);
      } else if (type === "ticket") {
        result = await handleBuyTicket(
          totalAmount.toString(),
          address as string,
          user
        );
      }

      if (result) {
        setPaymentStatus("completed");
      } else {
        setPaymentStatus("failed");
        showToast("Failed to process payment. Please try again.", "error");
      }
    } catch (error: any) {
      console.error("Smart contract payment error:", error);
      showToast("Failed to process payment. Please try again.", "error");
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  // When payment is completed, notify parent component
  useEffect(() => {
    if (paymentStatus === "completed") {
      // Wait a moment for the user to see the success message
      setTimeout(() => {
        onPaymentComplete(true);
      }, 3000);
    }
  }, [paymentStatus, onPaymentComplete]);

  useEffect(() => {
    const initializeAfterConnected = async () => {
      if (isConnected && address && provider) {
        try {
          // Add small delay to let network settle
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const currentChainId = await provider.request({
            method: "eth_chainId",
          });

          setChainId(currentChainId as number);
          setWalletConnected(true);
          setWalletAddress(address);

          // Handle balance fetch separately to avoid blocking
          getBalance(address, currentChainId as number)
            .then(setBalance)
            .catch((error) => {
              console.log("Balance fetch failed, using 0");
              setBalance(0);
            });
        } catch (error: any) {
          if (error.code === "NETWORK_ERROR") {
            console.log("Network is changing, will retry...");
            // Network is changing, retry after delay
            setTimeout(() => initializeAfterConnected(), 2000);
          }
        }
      }
    };

    initializeAfterConnected();
  }, [isConnected, address, provider]);

  useEffect(() => {
    const calculateTotalBnb = async () => {
      if (formattedAmount && currency) {
        let amount = extractNumericPrice(formattedAmount);

        const bnbPrice = await fetchBnbPrice();
        const usdRates = await fetchUsdRates();

        // Convert amount to USD if needed
        if (currency.toLowerCase() === "eur") {
          amount /= usdRates.eur;
        } else if (currency.toLowerCase() === "pln") {
          amount /= usdRates.pln;
        }

        setTotalAmount(getBnbEquivalent(amount, bnbPrice));
      }
    };

    calculateTotalBnb();
  }, [formattedAmount, currency]);

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
                      <Translate>Crypto Payment</Translate>
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
                      <Translate>{planTitle}</Translate> • {formattedAmount} (
                      {getCurrencyText(currency)}) • {totalAmount.toFixed(6)}{" "}
                      BNB
                    </Text>

                    {/* Wallet Info Section */}
                    <View style={styles.walletInfoHeader}>
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
                        <Translate>Crypto Wallet</Translate>
                      </Text>
                    </View>

                    {/* Wallet Info (collapsible) */}
                    <Animated.View
                      style={[
                        styles.walletInfoContainer,
                        {
                          maxHeight: infoHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 500],
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
                          styles.walletInfoSubtitle,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        <Translate>Why use cryptocurrency?</Translate>
                      </Text>

                      <View style={styles.walletInfoItem}>
                        <FontAwesome
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
                          <Translate>
                            Enhanced security with blockchain technology
                          </Translate>
                        </Text>
                      </View>

                      <View style={styles.walletInfoItem}>
                        <FontAwesome
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
                          <Translate>
                            Faster settlement compared to traditional banking
                          </Translate>
                        </Text>
                      </View>

                      <View style={styles.walletInfoItem}>
                        <FontAwesome
                          name="shield"
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
                          <Translate>
                            Complete control over your funds at all times
                          </Translate>
                        </Text>
                      </View>

                      {/* Popular Wallets */}
                      <Text
                        style={[
                          styles.walletListTitle,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                            marginTop: SPACING.S,
                          },
                        ]}
                      >
                        <Translate>Popular wallets</Translate>
                      </Text>
                      <View style={styles.walletsList}>
                        <View style={styles.walletItem}>
                          <Image
                            source={MetaMaskImage}
                            style={styles.walletLogo}
                          />
                          <Text
                            style={[
                              styles.walletName,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            MetaMask
                          </Text>
                        </View>
                        <View style={styles.walletItem}>
                          <Image
                            source={TrustImage}
                            style={styles.walletLogo}
                          />
                          <Text
                            style={[
                              styles.walletName,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            Trust Wallet
                          </Text>
                        </View>
                        <View style={[styles.walletItem, { marginTop: 10 }]}>
                          <Image
                            source={BinanceImage}
                            style={styles.walletLogo}
                          />
                          <Text
                            style={[
                              styles.walletName,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            Binance Wallet
                          </Text>
                        </View>
                        <View style={styles.walletItem}>
                          <Image
                            source={CoinbaseImage}
                            style={styles.walletLogo}
                          />
                          <Text
                            style={[
                              styles.walletName,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            Coinbase Wallet
                          </Text>
                        </View>
                      </View>
                    </Animated.View>

                    {/* Payment Status Section */}
                    {paymentStatus !== "initial" && (
                      <View
                        style={[
                          styles.statusContainer,
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
                        <View
                          style={[
                            styles.statusIndicator,
                            paymentStatus === "processing" &&
                              styles.statusProcessing,
                            paymentStatus === "completed" &&
                              styles.statusCompleted,
                            paymentStatus === "failed" && styles.statusFailed,
                          ]}
                        >
                          {paymentStatus === "processing" && (
                            <ActivityIndicator
                              color={getAccentColor()}
                              size="small"
                            />
                          )}
                          {paymentStatus === "completed" && (
                            <FontAwesome
                              name="check"
                              size={16}
                              color={isDarkMode ? "#4CAF50" : "#00C853"}
                            />
                          )}
                          {paymentStatus === "failed" && (
                            <FontAwesome
                              name="times"
                              size={16}
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
                          {paymentStatus === "processing" &&
                            "Processing Payment"}
                          {paymentStatus === "completed" && "Payment Complete"}
                          {paymentStatus === "failed" && "Payment Failed"}
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
                          {paymentStatus === "processing" &&
                            "Processing smart contract transaction..."}
                          {paymentStatus === "completed" &&
                            "Your payment has been successfully processed!"}
                          {paymentStatus === "failed" &&
                            "Transaction failed. Please try again."}
                        </Text>
                      </View>
                    )}

                    {/* Wallet Connection & Payment */}
                    {paymentStatus === "initial" && (
                      <>
                        {!walletConnected ? (
                          <View
                            style={[
                              styles.connectWalletContainer,
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
                            <FontAwesome5
                              name="wallet"
                              size={24}
                              color={getAccentColor()}
                              style={styles.walletIcon}
                            />
                            <Text
                              style={[
                                styles.connectWalletText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                },
                              ]}
                            >
                              <Translate>
                                Connect your wallet to pay with BNB
                              </Translate>
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.walletConnectedContainer,
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
                            <View style={styles.walletHeaderRow}>
                              <View style={styles.walletAddressRow}>
                                <FontAwesome5
                                  name="check-circle"
                                  size={16}
                                  color={getAccentColor()}
                                  style={{ marginRight: SPACING.XS }}
                                />
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
                                  <Translate>Connected Wallet:</Translate>
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={[
                                  styles.disconnectButton,
                                  {
                                    backgroundColor: isDarkMode
                                      ? "rgba(244, 67, 54, 0.15)"
                                      : "rgba(244, 67, 54, 0.1)",
                                    borderColor: isDarkMode
                                      ? "#F44336"
                                      : "#D32F2F",
                                  },
                                ]}
                                onPress={() => {
                                  if (provider) {
                                    provider.disconnect();
                                    setWalletConnected(false);
                                    setWalletAddress("");
                                    setBalance(0);
                                    setChainId(null);
                                  }
                                }}
                              >
                                <FontAwesome5
                                  name="sign-out-alt"
                                  size={12}
                                  color={isDarkMode ? "#F44336" : "#D32F2F"}
                                  style={{ marginRight: SPACING.XS }}
                                />
                                <Text
                                  style={[
                                    styles.disconnectButtonText,
                                    {
                                      color: isDarkMode ? "#F44336" : "#D32F2F",
                                    },
                                  ]}
                                >
                                  <Translate>Disconnect</Translate>
                                </Text>
                              </TouchableOpacity>
                            </View>
                            <Text
                              style={[
                                styles.walletAddressText,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                },
                              ]}
                            >
                              {formatAddress(walletAddress)}
                            </Text>

                            {/* Wallet Balance */}
                            <View style={styles.walletBalanceRow}>
                              <FontAwesome5
                                name="coins"
                                size={14}
                                color={getAccentColor()}
                                style={{ marginRight: SPACING.XS }}
                              />
                              <Text
                                style={[
                                  styles.walletBalanceLabel,
                                  {
                                    color: isDarkMode
                                      ? COLORS.DARK_TEXT_SECONDARY
                                      : COLORS.LIGHT_TEXT_SECONDARY,
                                  },
                                ]}
                              >
                                <Translate>Balance:</Translate>
                              </Text>
                              <Text
                                style={[
                                  styles.walletBalanceAmount,
                                  {
                                    color:
                                      balance >= totalAmount
                                        ? isDarkMode
                                          ? "#4CAF50"
                                          : "#00C853"
                                        : isDarkMode
                                        ? "#F44336"
                                        : "#D32F2F",
                                  },
                                ]}
                              >
                                {balance.toFixed(6)} BNB
                              </Text>
                            </View>

                            {/* Wrong Network Warning */}
                            {chainId !== null && chainId !== 56 && (
                              <View style={styles.wrongNetworkContainer}>
                                <FontAwesome
                                  name="exclamation-triangle"
                                  size={12}
                                  color={isDarkMode ? "#FF9800" : "#F57C00"}
                                  style={{ marginRight: SPACING.XS }}
                                />
                                <Text
                                  style={[
                                    styles.wrongNetworkText,
                                    {
                                      color: isDarkMode ? "#FF9800" : "#F57C00",
                                    },
                                  ]}
                                >
                                  <Translate>
                                    Please switch to BNB Smart Chain (BSC)
                                    network in your wallet
                                  </Translate>
                                </Text>
                              </View>
                            )}

                            {/* Insufficient Balance Warning */}
                            {balance < totalAmount && totalAmount > 0 && (
                              <View style={styles.insufficientBalanceContainer}>
                                <FontAwesome
                                  name="exclamation-triangle"
                                  size={12}
                                  color={isDarkMode ? "#F44336" : "#D32F2F"}
                                  style={{ marginRight: SPACING.XS }}
                                />
                                <Text
                                  style={[
                                    styles.insufficientBalanceText,
                                    {
                                      color: isDarkMode ? "#F44336" : "#D32F2F",
                                    },
                                  ]}
                                >
                                  <Translate>
                                    Insufficient balance for this transaction
                                  </Translate>
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </>
                    )}

                    {/* Action Buttons */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.M,
                      }}
                    >
                      {paymentStatus === "initial" && !walletConnected && (
                        <Button
                          title="Connect Wallet"
                          onPress={() => open()}
                          loading={loading}
                          variant={isDarkMode ? "primary" : "secondary"}
                          small={false}
                          icon={
                            <FontAwesome5
                              name="wallet"
                              size={14}
                              color="white"
                              style={{ marginRight: SPACING.S }}
                            />
                          }
                          iconPosition="left"
                        />
                      )}

                      {paymentStatus === "initial" && walletConnected && (
                        <Button
                          title={`Pay ${totalAmount.toFixed(6)} BNB`}
                          onPress={handlePay}
                          loading={loading}
                          variant={isDarkMode ? "primary" : "secondary"}
                          small={false}
                          disabled={
                            balance < totalAmount ||
                            totalAmount === 0 ||
                            chainId !== 56
                          }
                          icon={
                            <FontAwesome5
                              name="coins"
                              size={14}
                              color="white"
                              style={{ marginRight: SPACING.S }}
                            />
                          }
                          iconPosition="left"
                        />
                      )}

                      {paymentStatus === "completed" && (
                        <Button
                          title="Continue"
                          onPress={() => onPaymentComplete(true)}
                          variant={isDarkMode ? "primary" : "secondary"}
                          small={false}
                          icon={
                            <FontAwesome5
                              name="arrow-right"
                              size={14}
                              color="white"
                              style={{ marginLeft: SPACING.S }}
                            />
                          }
                          iconPosition="right"
                        />
                      )}

                      {paymentStatus === "failed" && (
                        <Button
                          title="Try Again"
                          onPress={() => setPaymentStatus("initial")}
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

                    {/* Security Note */}
                    <View style={styles.securityContainer}>
                      <FontAwesome5
                        name="shield-alt"
                        size={14}
                        color={getAccentColor()}
                        style={styles.securityIcon}
                      />
                      <Text
                        style={[
                          styles.securityText,
                          {
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.6)"
                              : "rgba(0, 0, 0, 0.5)",
                          },
                        ]}
                      >
                        <Translate>
                          Transactions are secure and irreversible
                        </Translate>
                      </Text>
                    </View>

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
                        <Translate>Go back</Translate>
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
  walletInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  walletInfoTitle: {
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
  walletInfoSubtitle: {
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
  walletListTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.XS,
  },
  walletsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  walletItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: SPACING.XS,
  },
  walletLogo: {
    width: 20,
    height: 20,
    marginRight: SPACING.XS,
  },
  walletName: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  connectWalletContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginTop: SPACING.S,
    marginBottom: SPACING.S,
    borderWidth: 0.5,
    alignItems: "center",
  },
  walletIcon: {
    marginBottom: SPACING.S,
  },
  connectWalletText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
  },
  walletConnectedContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginTop: SPACING.S,
    marginBottom: SPACING.S,
    borderWidth: 0.5,
  },
  walletHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.XS,
  },
  walletAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.S,
    borderWidth: 1,
    marginLeft: SPACING.S,
  },
  disconnectButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  walletAddressLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  walletAddressText: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  walletBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.XS,
  },
  walletBalanceLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginRight: SPACING.XS,
  },
  walletBalanceAmount: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.XS,
  },
  wrongNetworkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.XS,
    padding: SPACING.XS,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderRadius: BORDER_RADIUS.S,
  },
  wrongNetworkText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    flex: 1,
  },
  insufficientBalanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.XS,
    padding: SPACING.S,
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderRadius: BORDER_RADIUS.M,
  },
  insufficientBalanceText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    flex: 1,
  },
  statusContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginTop: SPACING.S,
    marginBottom: SPACING.S,
    borderWidth: 0.5,
    alignItems: "center",
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.S,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.XS,
  },
  statusDescription: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
  },
  securityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.M,
  },
  securityIcon: {
    marginRight: SPACING.XS,
  },
  securityText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
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

export default CryptoPayment;
