// PaymentModal.tsx
import { FONTS } from "@/app/theme";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Currency } from "../MembershipRadioGroup";
import Translate from "../Translate";

// Get screen dimensions
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BNBImage = require("@/assets/images/bnb.png");

// Payment method enum
export enum PaymentMethodType {
  CARD = "card",
  CRYPTO = "crypto",
}

// Props for our payment modal
interface PaymentModalProps {
  visible: boolean;
  amount: string;
  currency: Currency;
  planTitle: string;
  onClose: () => void;
  onSelectPaymentMethod: (method: PaymentMethodType) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  amount,
  currency,
  planTitle,
  onClose,
  onSelectPaymentMethod,
}) => {
  const { isDarkMode } = useTheme();

  // Helper function to get text for currency
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

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: isDarkMode
                    ? COLORS.DARK_BG
                    : COLORS.LIGHT_BG,
                  height: SCREEN_HEIGHT * 0.4, // Set modal height to 30% of screen height
                },
              ]}
            >
              <BlurView
                intensity={isDarkMode ? 40 : 30}
                tint={isDarkMode ? "dark" : "light"}
                style={styles.blurView}
              >
                {/* Handle for dragging - common in bottom sheets */}
                <View style={styles.dragHandle} />

                <View style={styles.modalContent}>
                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    <Translate>Select Payment Method</Translate>
                  </Text>
                  <Text
                    style={[
                      styles.modalSubtitle,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    <Translate>{planTitle}</Translate> • {amount} (
                    {getCurrencyText(currency)})
                  </Text>

                  <View style={styles.methodsContainer}>
                    {/* Card Payment Option */}
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(40, 45, 55, 0.65)"
                            : "rgba(255, 255, 255, 0.65)",
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      ]}
                      onPress={() =>
                        onSelectPaymentMethod(PaymentMethodType.CARD)
                      }
                    >
                      <View
                        style={[
                          styles.methodIconContainer,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(0, 122, 255, 0.2)"
                              : "rgba(0, 122, 255, 0.1)",
                          },
                        ]}
                      >
                        <FontAwesome
                          name="credit-card"
                          size={20}
                          color={isDarkMode ? "#0A84FF" : "#007AFF"}
                        />
                      </View>
                      <View style={styles.methodTextContainer}>
                        <Text
                          style={[
                            styles.methodTitle,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          <Translate>Credit/Debit Card</Translate>
                        </Text>
                        <Text
                          style={[
                            styles.methodDescription,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          <Translate>
                            Pay with Visa, Mastercard, Google pay or Apple pay
                          </Translate>
                        </Text>
                      </View>
                      <FontAwesome
                        name="chevron-right"
                        size={14}
                        color={
                          isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY
                        }
                      />
                    </TouchableOpacity>

                    {/* Crypto Payment Option */}
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(40, 45, 55, 0.65)"
                            : "rgba(255, 255, 255, 0.65)",
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      ]}
                      onPress={() =>
                        onSelectPaymentMethod(PaymentMethodType.CRYPTO)
                      }
                    >
                      <View
                        style={[
                          styles.methodIconContainer,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(255, 149, 0, 0.2)"
                              : "rgba(255, 149, 0, 0.1)",
                          },
                        ]}
                      >
                        <Image
                          source={BNBImage}
                          alt="BNB"
                          style={{ width: 25, height: 25, objectFit: "cover" }}
                        />
                      </View>
                      <View style={styles.methodTextContainer}>
                        <Text
                          style={[
                            styles.methodTitle,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          <Translate>Cryptocurrency</Translate>
                        </Text>
                        <Text
                          style={[
                            styles.methodDescription,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          <Translate>Pay with BNB</Translate>
                        </Text>
                      </View>
                      <FontAwesome
                        name="chevron-right"
                        size={14}
                        color={
                          isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                  >
                    <Text
                      style={[
                        styles.closeText,
                        {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.6)"
                            : "rgba(0, 0, 0, 0.5)",
                        },
                      ]}
                    >
                      <Translate>Cancel</Translate>
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XL,
    borderTopRightRadius: BORDER_RADIUS.XL,
    overflow: "hidden",
  },
  blurView: {
    width: "100%",
    height: "100%",
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: "rgba(150, 150, 150, 0.3)",
    borderRadius: 3,
    marginTop: 10,
    alignSelf: "center",
  },
  modalContent: {
    padding: SPACING.M,
    height: "100%",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.L,
    marginBottom: SPACING.XS,
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
    textAlign: "center",
  },
  methodsContainer: {
    width: "100%",
  },
  methodButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    marginBottom: SPACING.S,
    borderWidth: 0.5,
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.M,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
    marginBottom: 2,
  },
  methodDescription: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  closeButton: {
    padding: SPACING.S,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
});

export default PaymentModal;
