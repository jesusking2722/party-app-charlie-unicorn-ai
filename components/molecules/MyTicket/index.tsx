import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Translate } from "@/components/common";
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { Ticket } from "@/types/data";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Currency type
type CurrencyType = "usd" | "eur" | "pln";

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  usd: "$",
  eur: "€",
  pln: "zł",
} as const;

// Type for TicketsScreen component
interface TicketsScreenProps {
  visible: boolean;
  onClose: () => void;
  tickets?: Ticket[];
}

const TicketsScreen: React.FC<TicketsScreenProps> = ({
  visible,
  onClose,
  tickets,
}) => {
  const { isDarkMode } = useTheme();

  // Helper function to get text color based on theme
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Helper function to get secondary text color based on theme
  const getSecondaryTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_SECONDARY : COLORS.LIGHT_TEXT_SECONDARY;

  // Helper function to get background color based on theme
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(31, 41, 55, 0.7)" : "rgba(240, 240, 240, 0.9)";

  // Helper function to get accent color based on theme
  const getAccentColor = () => (isDarkMode ? COLORS.SECONDARY : "#FF0099");

  // Helper function to get card background color based on theme
  const getCardBackgroundColor = () =>
    isDarkMode ? "rgba(40, 45, 55, 0.65)" : "rgba(255, 255, 255, 0.65)";

  // Function to format currency
  const formatCurrency = (price: number, currency: CurrencyType): string => {
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${price.toFixed(2)}`;
  };

  // Calculate total value of tickets
  const getTotalValue = (): string => {
    if (!tickets || tickets.length === 0) return "$0.00";

    // Group by currency and sum
    const totals = tickets.reduce((acc, ticket) => {
      const currency = ticket.currency;
      acc[currency] = (acc[currency] || 0) + ticket.price;
      return acc;
    }, {} as Record<CurrencyType, number>);

    // Format all currency totals
    const formattedTotals = Object.entries(totals).map(([currency, total]) =>
      formatCurrency(total, currency as CurrencyType)
    );

    return formattedTotals.join(" + ");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header with X button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.closeButton,
            {
              backgroundColor: getBackgroundColor(),
            },
          ]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={22} color={getTextColor()} />
        </TouchableOpacity>
      </View>

      {/* Tickets Header with summary */}
      <View style={styles.ticketsHeaderContainer}>
        <Text style={[styles.ticketsTitle, { color: getTextColor() }]}>
          <Translate>My Tickets</Translate>
        </Text>

        <View style={styles.ticketsSummary}>
          <View style={styles.summaryContainer}>
            <Text style={[styles.totalTickets, { color: getTextColor() }]}>
              {tickets?.length || 0} <Translate>tickets</Translate>
            </Text>
          </View>
        </View>
      </View>

      {/* Scrollable Tickets List */}
      <ScrollView
        style={styles.ticketsContainer}
        contentContainerStyle={styles.ticketsContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {tickets?.map((ticket, index) => (
          <View
            key={`ticket-${ticket._id || index}`}
            style={[
              styles.ticketCard,
              {
                backgroundColor: getCardBackgroundColor(),
                borderLeftColor: getAccentColor(),
              },
            ]}
          >
            {/* Ticket Image */}
            <View style={styles.ticketImageContainer}>
              <Image
                source={{
                  uri: ticket.image.startsWith("http")
                    ? ticket.image
                    : BACKEND_BASE_URL + ticket.image,
                }}
                style={styles.ticketImage}
                resizeMode="cover"
              />
              {/* Image overlay for better text readability */}
              <View style={styles.imageOverlay} />
            </View>

            {/* Ticket Info */}
            <View style={styles.ticketInfo}>
              <View style={styles.ticketDetails}>
                <Text
                  style={[styles.ticketName, { color: getTextColor() }]}
                  numberOfLines={2}
                >
                  {ticket.name}
                </Text>
                <Text style={[styles.ticketPrice, { color: getAccentColor() }]}>
                  {formatCurrency(ticket.price, ticket.currency)}
                </Text>
              </View>
            </View>

            {/* Ticket Icon */}
            <View
              style={[
                styles.ticketIconContainer,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(55, 65, 81, 0.5)"
                    : "rgba(230, 234, 240, 0.8)",
                },
              ]}
            >
              <FontAwesome5
                name="ticket-alt"
                size={16}
                color={getAccentColor()}
              />
            </View>
          </View>
        ))}

        {tickets?.length === 0 && (
          <View style={styles.noTicketsContainer}>
            <FontAwesome5
              name="ticket-alt"
              size={40}
              color={
                isDarkMode
                  ? "rgba(107, 114, 128, 0.5)"
                  : "rgba(209, 213, 219, 0.5)"
              }
            />
            <Text
              style={[styles.noTicketsText, { color: getSecondaryTextColor() }]}
            >
              <Translate>No tickets yet</Translate>
            </Text>
            <Text
              style={[
                styles.noTicketsSubtext,
                { color: getSecondaryTextColor() },
              ]}
            >
              <Translate>Your purchased tickets will appear here</Translate>
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: SPACING.M,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.SMALL,
  },
  ticketsHeaderContainer: {
    paddingHorizontal: SPACING.M,
    paddingBottom: SPACING.M,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(55, 65, 81, 0.2)",
  },
  ticketsTitle: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONTS.BOLD,
    marginBottom: SPACING.S,
  },
  ticketsSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  totalTickets: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
  },
  totalValue: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
  },
  ticketsContainer: {
    flex: 1,
  },
  ticketsContentContainer: {
    padding: SPACING.M,
    paddingBottom: SPACING.XXL,
  },
  ticketCard: {
    borderRadius: BORDER_RADIUS.L,
    marginBottom: SPACING.M,
    borderLeftWidth: 4,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  ticketImageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  ticketImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  ticketInfo: {
    padding: SPACING.M,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ticketDetails: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ticketName: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
    flex: 1,
    marginRight: SPACING.S,
  },
  ticketPrice: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
  },
  ticketIconContainer: {
    position: "absolute",
    top: SPACING.S,
    right: SPACING.S,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.M,
    justifyContent: "center",
    alignItems: "center",
  },
  noTicketsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.XXL,
  },
  noTicketsText: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
    marginTop: SPACING.M,
    marginBottom: SPACING.XS,
  },
  noTicketsSubtext: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    paddingHorizontal: SPACING.L,
  },
});

export default TicketsScreen;
