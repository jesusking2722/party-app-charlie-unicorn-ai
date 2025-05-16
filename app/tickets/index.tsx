import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { PaymentMethodType, PaymentModal, Tabs } from "@/components/common";
import { Ticket } from "@/components/molecules";
import { useTheme } from "@/contexts/ThemeContext";
import type { CurrencyType, Ticket as TicketType } from "@/types/data";
import { router } from "expo-router";

const TicketBannerImage = require("@/assets/images/ticket-banner.png");

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

// Sample ticket data matching your Ticket type
const sampleTickets: TicketType[] = [
  {
    _id: "1",
    name: "VIP Concert Experience",
    price: 120,
    currency: "usd",
    image: "https://example.com/images/vip-concert.jpg", // Use URL strings now
  },
  {
    _id: "2",
    name: "Standard Festival Entry",
    price: 75,
    currency: "usd",
    image: "https://example.com/images/standard-entry.jpg",
  },
  {
    _id: "3",
    name: "After Party Pass",
    price: 45,
    currency: "usd",
    image: "https://example.com/images/after-party.jpg",
  },
  {
    _id: "4",
    name: "Full Weekend Experience",
    price: 210,
    currency: "usd",
    image: "https://example.com/images/weekend.jpg",
  },
];

// Currency symbols mapping for lowercase currency codes
const currencySymbols: Record<CurrencyType, string> = {
  usd: "$",
  eur: "€",
  pln: "zł",
};

const TicketScreen: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  // State for currency selection
  const [activeCurrencyIndex, setActiveCurrencyIndex] = useState<number>(0);
  const currencies: CurrencyType[] = ["usd", "eur", "pln"]; // Lowercase now
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("usd");

  // State for displayed tickets
  const [displayedTickets, setDisplayedTickets] =
    useState<TicketType[]>(sampleTickets);

  // State for payment modal
  const [paymentModalVisible, setPaymentModalVisible] =
    useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [paymentFlow, setPaymentFlow] = useState<string | null>(null);

  // Animated background particles
  const particles = Array(6)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.35)).current,
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

  // Update selected currency when tab changes
  useEffect(() => {
    setSelectedCurrency(currencies[activeCurrencyIndex]);

    // Update ticket prices based on selected currency
    updateTicketCurrency(currencies[activeCurrencyIndex]);
  }, [activeCurrencyIndex]);

  // Update ticket currency based on selection
  const updateTicketCurrency = (currency: CurrencyType) => {
    // Create a new array with updated currency for each ticket
    const updatedTickets = sampleTickets.map((ticket) => ({
      ...ticket,
      currency: currency,
      // Convert prices based on exchange rates when currency changes
      price: convertPrice(ticket.price, "usd", currency),
    }));

    setDisplayedTickets(updatedTickets);
  };

  // Simple currency conversion function
  const convertPrice = (
    price: number,
    fromCurrency: CurrencyType,
    toCurrency: CurrencyType
  ): number => {
    const rates = {
      usd: 1,
      eur: 0.92, // Example exchange rate USD to EUR
      pln: 3.95, // Example exchange rate USD to PLN
    };

    // If the currency is the same, no conversion needed
    if (fromCurrency === toCurrency) return price;

    // Convert to USD first (if not already in USD)
    const usdAmount =
      fromCurrency === "usd" ? price : price / rates[fromCurrency];

    // Convert from USD to target currency
    const convertedAmount = usdAmount * rates[toCurrency];

    // Round to 2 decimal places
    return Math.round(convertedAmount);
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

  // Handle ticket purchase
  const handlePurchase = (ticketId: string) => {
    console.log(ticketId);
    const ticket = displayedTickets.find((t) => t._id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setPaymentModalVisible(true);
    }
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = (method: PaymentMethodType) => {
    setPaymentModalVisible(false);
    if (method === PaymentMethodType.CRYPTO) {
      setPaymentFlow("crypto");
    } else if (method === PaymentMethodType.CARD) {
      setPaymentFlow("card");
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (success: boolean) => {
    if (success) {
      // Reset payment flow
      setPaymentFlow(null);

      // Navigate to next screen
      console.log("Payment successful, navigating to home screen");
      router.push("/onboarding/congratulationsSetup");
    } else {
      // Handle payment failure
      setPaymentFlow(null);
      console.log("Payment failed");
    }
  };

  // Handle back from payment flow
  const handleBackFromPayment = () => {
    setPaymentFlow(null);
  };

  // Get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  //   if (paymentFlow === "card") {
  //     return (
  //       <SafeAreaView style={styles.container}>
  //         <CardPayment
  //           amount={selectedTicket}
  //           planTitle={selectedTicket?.name || ""}
  //           onPaymentComplete={handlePaymentComplete}
  //           onBack={handleBackFromPayment}
  //         />
  //       </SafeAreaView>
  //     );
  //   }

  //   if (paymentFlow === "crypto") {
  //     return (
  //       <SafeAreaView style={styles.container}>
  //         <CryptoPayment
  //           amount={selectedTicket?.price.toString() || ""}
  //           planTitle={selectedTicket?.name || ""}
  //           onPaymentComplete={handlePaymentComplete}
  //           onBack={handleBackFromPayment}
  //         />
  //       </SafeAreaView>
  //     );
  //   }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Background Image Section (Top 40%) */}
        <View style={styles.headerImageContainer}>
          <Image
            source={TicketBannerImage}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          />

          {/* Add floating particles for dynamic effect */}
          {renderParticles()}

          {/* Overlay gradient for better text readability */}
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0)"]}
            style={styles.imageOverlay}
          />

          {/* Header Content */}
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Event Tickets</Text>
            <Text style={styles.headerSubtitle}>
              Secure your spot at the hottest events
            </Text>
          </View>
        </View>

        {/* Bottom Content Section */}
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
                transform: [{ translateY }, { scale: cardScale }],
                opacity: fadeAnim,
                backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG,
              },
            ]}
          >
            <BlurView
              intensity={isDarkMode ? 40 : 30}
              tint={isDarkMode ? "dark" : "light"}
              style={styles.cardBlur}
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
                    styles.screenTitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Available Tickets
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
                  Choose your ticket type and secure your entry
                </Text>

                {/* Currency Tabs */}
                <View style={styles.tabsContainer}>
                  <Tabs
                    tabs={currencies.map((curr) => curr.toUpperCase())} // Display uppercase for UI but use lowercase internally
                    activeIndex={activeCurrencyIndex}
                    onTabPress={setActiveCurrencyIndex}
                  />
                </View>

                {/* Tickets List */}
                <View style={styles.ticketsContainer}>
                  {displayedTickets.map((ticket) => (
                    <Ticket
                      key={ticket._id}
                      _id={ticket._id}
                      name={ticket.name}
                      price={ticket.price}
                      currency={ticket.currency}
                      image={ticket.image}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </View>

                {/* Note about tickets */}
                <View style={styles.noteContainer}>
                  <FontAwesome5
                    name="info-circle"
                    size={16}
                    color={getAccentColor()}
                    style={styles.noteIcon}
                  />
                  <Text
                    style={[
                      styles.noteText,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    Tickets are non-refundable and will be available in your
                    ticket wallet after purchase. Please make sure to read our
                    terms and conditions before buying.
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      {selectedTicket && (
        <PaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          onSelectPaymentMethod={handleSelectPaymentMethod}
          amount={`${selectedTicket.price} ${
            currencySymbols[selectedTicket.currency]
          }`}
          planTitle={selectedTicket.name}
        />
      )}

      {/* Decorative elements */}
      <View
        style={[
          styles.decorativeCircle1,
          {
            backgroundColor: isDarkMode
              ? "rgba(79, 70, 229, 0.1)"
              : "rgba(255, 0, 153, 0.08)",
          },
        ]}
      />
      <View
        style={[
          styles.decorativeCircle2,
          {
            backgroundColor: isDarkMode
              ? "rgba(124, 58, 237, 0.08)"
              : "rgba(255, 255, 255, 0.06)",
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerImageContainer: {
    height: height * 0.33, // 40% of screen height
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  headerBackground: {
    width: "100%",
    height: "100%",
  },
  headerContent: {
    position: "absolute",
    bottom: SPACING.XL,
    left: SPACING.L,
    right: SPACING.L,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.M,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: SPACING.XS,
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
    top: -height * 0.02,
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
  cardAccentBar: {
    height: 6,
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
  },
  cardContent: {
    padding: SPACING.M,
  },
  screenTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  tabsContainer: {
    marginBottom: SPACING.M,
  },
  ticketsContainer: {
    marginBottom: SPACING.M,
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.M,
    marginBottom: SPACING.M,
  },
  noteIcon: {
    marginTop: 2,
    marginRight: SPACING.S,
  },
  noteText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    flex: 1,
    lineHeight: 18,
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    top: -width * 0.3,
    right: -width * 0.25,
    zIndex: 0,
  },
  decorativeCircle2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    bottom: -width * 0.2,
    left: -width * 0.2,
    zIndex: 0,
  },
});

export default TicketScreen;
