import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { useTheme } from "@/contexts/ThemeContext";

const CreditCardImage = require("@/assets/images/credit-card.png");
const BNBImage = require("@/assets/images/bnb.png");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

// Define payment method types
export enum PaymentMethodType {
  CRYPTO = "CRYPTO",
  CARD = "CARD",
}

// Props for the payment modal
interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPaymentMethod: (method: PaymentMethodType) => void;
  amount: string;
  planTitle: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onSelectPaymentMethod,
  amount,
  planTitle,
}) => {
  const { isDarkMode } = useTheme();

  // Animation values
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATIONS.FAST,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATIONS.FAST,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIMATIONS.FAST * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").height,
          duration: ANIMATIONS.FAST * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: ANIMATIONS.FAST * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, slideAnim, scaleAnim]);

  const handleSelectPayment = (method: PaymentMethodType) => {
    onSelectPaymentMethod(method);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <BlurView
                intensity={isDarkMode ? 40 : 30}
                tint={isDarkMode ? "dark" : "light"}
                style={styles.modalBlur}
              >
                <LinearGradient
                  colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
                  style={styles.gradientBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Handle for draggable modal */}
                  <View style={styles.handleContainer}>
                    <View
                      style={[
                        styles.handle,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.3)"
                            : "rgba(0, 0, 0, 0.2)",
                        },
                      ]}
                    />
                  </View>

                  {/* Accent Bar */}
                  <View
                    style={[
                      styles.accentBar,
                      {
                        backgroundColor: getAccentColor(),
                      },
                    ]}
                  />

                  <View style={styles.contentContainer}>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      Choose Payment Method
                    </Text>

                    <Text
                      style={[
                        styles.subtitle,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      {planTitle} Plan • {amount}
                    </Text>

                    <View style={styles.optionsContainer}>
                      {/* Card Payment Option */}
                      <TouchableOpacity
                        style={[
                          styles.paymentOption,
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
                          handleSelectPayment(PaymentMethodType.CARD)
                        }
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.paymentIconContainer,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.05)",
                            },
                          ]}
                        >
                          <Image
                            source={CreditCardImage}
                            style={styles.paymentIcon}
                            resizeMode="contain"
                          />
                        </View>
                        <Text
                          style={[
                            styles.paymentOptionText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          Pay with Card
                        </Text>
                        <FontAwesome5
                          name="chevron-right"
                          size={14}
                          color={
                            isDarkMode
                              ? "rgba(255, 255, 255, 0.5)"
                              : "rgba(0, 0, 0, 0.3)"
                          }
                          style={styles.arrowIcon}
                        />
                      </TouchableOpacity>

                      {/* Crypto Payment Option */}
                      <TouchableOpacity
                        style={[
                          styles.paymentOption,
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
                          handleSelectPayment(PaymentMethodType.CRYPTO)
                        }
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.paymentIconContainer,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.05)",
                            },
                          ]}
                        >
                          <Image
                            source={BNBImage}
                            style={styles.paymentIcon}
                            resizeMode="contain"
                          />
                        </View>
                        <Text
                          style={[
                            styles.paymentOptionText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          Pay with Crypto
                        </Text>
                        <FontAwesome5
                          name="chevron-right"
                          size={14}
                          color={
                            isDarkMode
                              ? "rgba(255, 255, 255, 0.5)"
                              : "rgba(0, 0, 0, 0.3)"
                          }
                          style={styles.arrowIcon}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.secureContainer}>
                      <FontAwesome5
                        name="shield-alt"
                        size={14}
                        color={getAccentColor()}
                        style={styles.secureIcon}
                      />
                      <Text
                        style={[
                          styles.secureText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        All payments are secure and encrypted
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={onClose}
                    >
                      <Text
                        style={[
                          styles.cancelText,
                          {
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.6)"
                              : "rgba(0, 0, 0, 0.5)",
                          },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
    maxHeight: "60%",
    ...SHADOWS.MEDIUM,
  },
  modalBlur: {
    width: "100%",
    height: "100%",
  },
  gradientBackground: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
  },
  handleContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: SPACING.S,
    paddingBottom: SPACING.XS,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  accentBar: {
    height: 3,
    width: "100%",
  },
  contentContainer: {
    padding: SPACING.M,
    paddingBottom: Platform.OS === "ios" ? SPACING.XL : SPACING.L,
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.L,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  optionsContainer: {
    marginBottom: SPACING.M,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    marginBottom: SPACING.S,
    borderWidth: 0.5,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.M,
  },
  paymentIcon: {
    width: 28,
    height: 28,
  },
  paymentOptionText: {
    flex: 1,
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  arrowIcon: {
    marginLeft: SPACING.S,
  },
  secureContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.S,
    marginBottom: SPACING.M,
  },
  secureIcon: {
    marginRight: SPACING.XS,
  },
  secureText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  cancelButton: {
    alignSelf: "center",
    padding: SPACING.S,
  },
  cancelText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
});

export default PaymentModal;
