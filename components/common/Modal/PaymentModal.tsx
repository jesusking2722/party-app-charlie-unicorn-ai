import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
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

const CreditCardImage = require("@/assets/images/credit-card.png");
const BNBImage = require("@/assets/images/bnb.png");

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
  // Animation values
  const slideAnim = React.useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, slideAnim]);

  const handleSelectPayment = (method: PaymentMethodType) => {
    onSelectPaymentMethod(method);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <LinearGradient
                colors={["#5A0088", "#7F00FF"]}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.header}>
                  <Text style={styles.title}>Payment Method</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <FontAwesome5
                      name="times"
                      size={18}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.summaryContainer}>
                  <Text style={styles.planName}>{planTitle} Plan</Text>
                  <Text style={styles.amountText}>{amount}</Text>
                </View>

                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() =>
                      handleSelectPayment(PaymentMethodType.CRYPTO)
                    }
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.1)",
                        "rgba(255, 255, 255, 0.15)",
                      ]}
                      style={styles.paymentOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.paymentIconContainer}>
                        <Image
                          source={BNBImage}
                          alt="Crypto Payment"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </View>
                      <Text style={styles.paymentOptionText}>
                        Pay with Crypto
                      </Text>
                      <FontAwesome5
                        name="chevron-right"
                        size={14}
                        color="rgba(255, 255, 255, 0.5)"
                      />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => handleSelectPayment(PaymentMethodType.CARD)}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255, 255, 255, 0.1)",
                        "rgba(255, 255, 255, 0.15)",
                      ]}
                      style={styles.paymentOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.paymentIconContainer}>
                        <Image
                          source={CreditCardImage}
                          alt="Credit Card"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </View>
                      <Text style={styles.paymentOptionText}>
                        Pay with Card
                      </Text>
                      <FontAwesome5
                        name="chevron-right"
                        size={14}
                        color="rgba(255, 255, 255, 0.5)"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.secureContainer}>
                  <FontAwesome5
                    name="lock"
                    size={14}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                  <Text style={styles.secureText}>
                    All payments are secure and encrypted
                  </Text>
                </View>
              </LinearGradient>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    maxHeight: "80%",
  },
  gradientBackground: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20, // Extra padding for iOS devices with notch
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "white",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  planName: {
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
    color: "white",
    marginBottom: 4,
  },
  amountText: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "white",
  },
  optionsContainer: {
    marginBottom: 24,
  },
  paymentOption: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  paymentOptionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "white",
  },
  secureContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secureText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.5)",
  },
});

export default PaymentModal;
