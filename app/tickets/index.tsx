import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import {
  CardPayment,
  CryptoPayment,
  PaymentMethodType,
  PaymentModal,
  Spinner,
  Tabs,
  Translate,
} from "@/components/common";
import { Ticket, TicketModal } from "@/components/molecules";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { updateAuthUser } from "@/lib/scripts/auth.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import type { CurrencyType, Ticket as TicketType, User } from "@/types/data";
import { formatPrice } from "@/utils/currency";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useSelector } from "react-redux";

const TicketBannerImage = require("@/assets/images/ticket-banner.png");

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

// Currency symbols mapping for lowercase currency codes
const currencySymbols: Record<CurrencyType, string> = {
  usd: "$",
  eur: "€",
  pln: "zł",
};

const TicketScreen: React.FC = () => {
  const { isDarkMode } = useTheme();

  const { ticketCurrency, ticketPrice } = useLocalSearchParams();

  // State for currency selection
  const [activeCurrencyIndex, setActiveCurrencyIndex] = useState<number>(0);
  const currencies: CurrencyType[] = ["usd", "eur", "pln"];
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("usd");
  const [formattedAmount, setFormattedAmount] = useState<string>("$5");
  const [paramTicket, setParamTicket] = useState<TicketType | null>(null);
  const [alreadyOwned, setAlreadyOwned] = useState<boolean>(false);
  const [ticketModalVisible, setTicketModalVisible] = useState<boolean>(false);
  const [ownedTickets, setOwnedTickets] = useState<TicketType[]>([]);

  // State for displayed tickets
  const [displayedTickets, setDisplayedTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // State for payment modal
  const [paymentModalVisible, setPaymentModalVisible] =
    useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [paymentFlow, setPaymentFlow] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { tickets } = useSelector((state: RootState) => state.ticket);
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  useEffect(() => {
    setDisplayedTickets(tickets);
  }, [tickets]);

  // Update selected currency when tab changes
  useEffect(() => {
    setSelectedCurrency(currencies[activeCurrencyIndex]);
  }, [activeCurrencyIndex]);

  useEffect(() => {
    if (ticketCurrency && ticketPrice) {
      if (user?.stickers) {
        const ownedTicket = user.stickers.find(
          (sticker) =>
            sticker.currency === ticketCurrency.toString().toLowerCase() &&
            sticker.price === Number(ticketPrice)
        );
        if (ownedTicket) {
          setAlreadyOwned(true);
          setTicketModalVisible(true);
          return;
        }
      }
      const ticket = tickets.find(
        (t) =>
          t.currency === ticketCurrency.toString().toLowerCase() &&
          t.price === Number(ticketPrice)
      );
      if (ticket) {
        setParamTicket(ticket);
        setSelectedTicket(ticket);
        setSelectedCurrency(ticketCurrency.toString() as any);
        const formattedPrice = formatPrice(Number(ticketPrice), ticketCurrency);
        setFormattedAmount(formattedPrice);
        setActiveCurrencyIndex(
          currencies.indexOf(ticketCurrency as CurrencyType)
        );
        setTicketModalVisible(true);
      }
    }
  }, [ticketCurrency, ticketPrice]);

  useEffect(() => {
    if (user?.stickers && tickets.length > 0) {
      tickets.forEach((ticket) => {
        const isOwned = user.stickers?.some(
          (sticker) => sticker._id === ticket._id
        );
        if (isOwned) {
          setOwnedTickets((prev) => [...prev, ticket]);
        }
      });
    } else {
      setOwnedTickets([]);
    }
  }, [user, tickets]);

  // Handle ticket purchase
  const handlePurchase = (ticketId: string) => {
    const ticket = displayedTickets.find((t) => t._id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setPaymentModalVisible(true);
      const formattedPrice = formatPrice(
        ticket.price,
        ticket.currency.toUpperCase()
      );
      setFormattedAmount(formattedPrice);
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
  const handlePaymentComplete = async (success: boolean) => {
    try {
      setLoading(true);
      if (success) {
        setPaymentFlow(null);
        setTicketModalVisible(false);

        console.log(selectedTicket);

        if (!user || !selectedTicket) return;

        const updatingUser: User = {
          ...user,
          stickers: [...(user.stickers || []), selectedTicket as any],
        };

        console.log("updating user: ", updatingUser);

        const response = await updateAuthUser(updatingUser);
        if (response.ok) {
          const { user: updatedUser } = response.data;
          console.log("updated user: ", updatedUser);
          await dispatch(setAuthUserAsync(updatedUser)).unwrap();
          showToast("Ticket purchased successfully!", "success");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setAlreadyOwned(true);
      setParamTicket(null);
      setTicketModalVisible(false);
      setSelectedTicket(null);
      setLoading(false);
    }
  };

  // Handle back from payment flow
  const handleBackFromPayment = () => {
    setPaymentFlow(null);
  };

  // Get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  if (paymentFlow === "card") {
    return (
      <SafeAreaView style={styles.container}>
        <CardPayment
          type="ticket"
          amount={selectedTicket?.price.toString() ?? ""}
          formattedAmount={formattedAmount}
          currency={
            selectedTicket
              ? (selectedTicket?.currency.toUpperCase() as any)
              : "USD"
          }
          planTitle={selectedTicket?.name || ""}
          onPaymentComplete={handlePaymentComplete}
          onBack={handleBackFromPayment}
        />
      </SafeAreaView>
    );
  }

  if (paymentFlow === "crypto") {
    return (
      <SafeAreaView style={styles.container}>
        <CryptoPayment
          type="ticket"
          amount={selectedTicket?.price.toString() ?? ""}
          formattedAmount={formattedAmount}
          currency={
            selectedTicket
              ? (selectedTicket?.currency.toUpperCase() as any)
              : "USD"
          }
          planTitle={selectedTicket?.name || ""}
          onPaymentComplete={handlePaymentComplete}
          onBack={handleBackFromPayment}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <Spinner visible={loading} message="Processing..." />
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

          {/* Overlay gradient for better text readability */}
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0)"]}
            style={styles.imageOverlay}
          />

          {/* Header Content */}
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              <Translate>Event Tickets</Translate>
            </Text>
            <Text style={styles.headerSubtitle}>
              <Translate>Secure your spot at the hottest events</Translate>
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
          <View
            style={[
              styles.cardContainer,
              {
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
                  <Translate>Available Tickets</Translate>
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
                  <Translate>
                    Choose your ticket type and secure your entry
                  </Translate>
                </Text>

                {/* Currency Tabs */}
                <View style={styles.tabsContainer}>
                  <Tabs
                    tabs={currencies.map((curr) => curr.toUpperCase())}
                    activeIndex={activeCurrencyIndex}
                    onTabPress={setActiveCurrencyIndex}
                  />
                </View>

                {/* Tickets List */}
                <View style={styles.ticketsContainer}>
                  {displayedTickets &&
                    displayedTickets
                      .filter(
                        (dt) => dt.currency === currencies[activeCurrencyIndex]
                      )
                      .map((ticket, index) => (
                        <Ticket
                          key={index}
                          _id={ticket._id}
                          isOwned={ownedTickets.some(
                            (ownedTicket) => ownedTicket._id === ticket._id
                          )}
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
                    <Translate>
                      Tickets are non-refundable and will be available in your
                      ticket wallet after purchase. Please make sure to read our
                      terms and conditions before buying.
                    </Translate>
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      {selectedTicket && (
        <PaymentModal
          visible={paymentModalVisible}
          currency={
            selectedCurrency ? (selectedCurrency.toUpperCase() as any) : "USD"
          }
          onClose={() => setPaymentModalVisible(false)}
          onSelectPaymentMethod={handleSelectPaymentMethod}
          amount={`${selectedTicket.price} ${
            currencySymbols[selectedTicket.currency]
          }`}
          planTitle={selectedTicket.name}
        />
      )}

      <TicketModal
        visible={ticketModalVisible}
        onClose={() => {
          setTicketModalVisible(false);
          setParamTicket(null);
          setAlreadyOwned(false);
        }}
        alreadyOwned={alreadyOwned}
        selectedTicket={paramTicket}
        onPurchase={handlePurchase}
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
