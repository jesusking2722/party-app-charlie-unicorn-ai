import { FONTS } from "@/app/theme";
import { Button, Input } from "@/components/common";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock function to check if Google Pay is available
const checkIsGooglePayAvailable = async () => {
  try {
    // Simulate checking device capability
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return true for demo purposes - in a real app, this would check device capabilities
    return Platform.OS === "android";
  } catch (error) {
    console.error("Error checking Google Pay availability:", error);
    return false;
  }
};

// Props for the custom card payment component
interface CustomCardPaymentProps {
  amount: string;
  planTitle: string;
  onPaymentComplete: (success: boolean) => void;
  onBack: () => void;
}

const CustomCardPayment: React.FC<CustomCardPaymentProps> = ({
  amount,
  planTitle,
  onPaymentComplete,
  onBack,
}) => {
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Google Pay state
  const [isGooglePayLoading, setIsGooglePayLoading] = useState(true);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  // Check if Google Pay is available
  useEffect(() => {
    const checkGooglePayAvailability = async () => {
      try {
        setIsGooglePayLoading(true);
        const available = await checkIsGooglePayAvailable();
        setIsGooglePayAvailable(available);
      } catch (error) {
        console.error("Failed to check Google Pay availability:", error);
        setIsGooglePayAvailable(false);
      } finally {
        setIsGooglePayLoading(false);
      }
    };

    checkGooglePayAvailability();
  }, []);

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.slice(0, 19); // Limit to 16 digits + spaces
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Format as MM/YY
    if (cleaned.length > 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    } else {
      return cleaned;
    }
  };

  // Handle card number change
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);

    // Clear error when user types
    if (formErrors.cardNumber) {
      setFormErrors((prev) => ({ ...prev, cardNumber: "" }));
    }
  };

  // Handle expiry date change
  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);

    // Clear error when user types
    if (formErrors.expiryDate) {
      setFormErrors((prev) => ({ ...prev, expiryDate: "" }));
    }
  };

  // Handle CVV change
  const handleCvvChange = (text: string) => {
    // Only allow digits and max 4 digits
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    setCvv(cleaned);

    // Clear error when user types
    if (formErrors.cvv) {
      setFormErrors((prev) => ({ ...prev, cvv: "" }));
    }
  };

  // Handle cardholder name change
  const handleCardholderNameChange = (text: string) => {
    setCardholderName(text);

    // Clear error when user types
    if (formErrors.cardholderName) {
      setFormErrors((prev) => ({ ...prev, cardholderName: "" }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    };

    // Check card number (should be 16 digits)
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
      isValid = false;
    }

    // Check expiry date format (should be MM/YY)
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      isValid = false;
    }

    // Check CVV (should be 3 or 4 digits)
    if (!cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = "Please enter a valid CVV code";
      isValid = false;
    }

    // Check cardholder name
    if (cardholderName.trim().length < 3) {
      newErrors.cardholderName = "Please enter the cardholder name";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle payment submission
  const handlePayment = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call to process payment
    setTimeout(() => {
      setLoading(false);

      // For demo purposes, we'll automatically succeed
      // In a real app, you would:
      // 1. Send card details securely to your backend
      // 2. Your backend would use Stripe API to create a payment
      // 3. Handle the response accordingly

      onPaymentComplete(true);
    }, 2000);
  };

  // Handle Google Pay payment
  const handleGooglePay = () => {
    setLoading(true);

    // Simulate Google Pay payment process
    setTimeout(() => {
      setLoading(false);
      onPaymentComplete(true);
    }, 2000);
  };

  // Google Pay icon component
  const googlePayIcon = <FontAwesome5 name="google" size={18} color="white" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <FontAwesome5 name="arrow-left" size={16} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Card Payment</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.planName}>{planTitle} Plan</Text>
          <Text style={styles.amountText}>{amount}</Text>
        </View>

        {/* Google Pay Button and Introduction (if available) */}
        {!isGooglePayLoading && isGooglePayAvailable && (
          <View style={styles.googlePayContainer}>
            <Button
              title="Pay with Google Pay"
              onPress={handleGooglePay}
              icon={googlePayIcon}
              iconPosition="left"
              loading={loading}
              style={styles.googlePayButton}
              variant="dark"
            />

            {/* Google Pay Introduction */}
            <View style={styles.googlePayInfoContainer}>
              <Text style={styles.googlePayInfoTitle}>Why use Google Pay?</Text>
              <View style={styles.googlePayInfoItem}>
                <FontAwesome5
                  name="bolt"
                  size={14}
                  color="#FF0099"
                  style={styles.infoIcon}
                />
                <Text style={styles.googlePayInfoText}>
                  Fast checkout without typing card details
                </Text>
              </View>
              <View style={styles.googlePayInfoItem}>
                <FontAwesome5
                  name="shield-alt"
                  size={14}
                  color="#FF0099"
                  style={styles.infoIcon}
                />
                <Text style={styles.googlePayInfoText}>
                  Enhanced security with tokenization technology
                </Text>
              </View>
              <View style={styles.googlePayInfoItem}>
                <FontAwesome5
                  name="lock"
                  size={14}
                  color="#FF0099"
                  style={styles.infoIcon}
                />
                <Text style={styles.googlePayInfoText}>
                  Your card details are never shared with merchants
                </Text>
              </View>
            </View>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>
        )}

        <View style={styles.formContainer}>
          {/* Card number input */}
          <Input
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            error={formErrors.cardNumber}
            autoCapitalize="none"
          />

          {/* Expiry date and CVV (on the same row) */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                keyboardType="number-pad"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
                error={formErrors.expiryDate}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.halfWidth}>
              <Input
                label="CVV"
                placeholder="123"
                keyboardType="number-pad"
                value={cvv}
                onChangeText={handleCvvChange}
                error={formErrors.cvv}
                isPassword={true}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Cardholder name */}
          <Input
            label="Cardholder Name"
            placeholder="John Doe"
            value={cardholderName}
            onChangeText={handleCardholderNameChange}
            error={formErrors.cardholderName}
            autoCapitalize="words"
          />

          {/* Pay button */}
          <Button
            title={`Pay ${amount}`}
            onPress={handlePayment}
            loading={loading}
            variant="primary"
            style={styles.payButton}
          />

          <View style={styles.secureContainer}>
            <FontAwesome5
              name="lock"
              size={14}
              color="rgba(255, 255, 255, 0.5)"
            />
            <Text style={styles.secureText}>Secure payment processing</Text>
          </View>

          {/* Card Payment Security Tips */}
          <View style={styles.securityTipsContainer}>
            <Text style={styles.securityTipsTitle}>
              Card Payment Security Tips
            </Text>
            <View style={styles.securityTipItem}>
              <FontAwesome5
                name="shield-alt"
                size={14}
                color="#FF0099"
                style={styles.tipIcon}
              />
              <Text style={styles.securityTipText}>
                Keep your card details private and never share them via email or
                phone calls you didn't initiate
              </Text>
            </View>
            <View style={styles.securityTipItem}>
              <FontAwesome5
                name="eye-slash"
                size={14}
                color="#FF0099"
                style={styles.tipIcon}
              />
              <Text style={styles.securityTipText}>
                Cover the keypad when entering your PIN at ATMs or payment
                terminals
              </Text>
            </View>
            <View style={styles.securityTipItem}>
              <FontAwesome5
                name="bell"
                size={14}
                color="#FF0099"
                style={styles.tipIcon}
              />
              <Text style={styles.securityTipText}>
                Enable transaction alerts to monitor your account for
                unauthorized charges
              </Text>
            </View>
            <View style={styles.securityTipItem}>
              <FontAwesome5
                name="wifi"
                size={14}
                color="#FF0099"
                style={styles.tipIcon}
              />
              <Text style={styles.securityTipText}>
                Avoid making payments over public Wi-Fi networks when possible
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
    color: "white",
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
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 4,
  },
  amountText: {
    fontSize: 24,
    fontFamily: FONTS.BOLD,
    color: "white",
  },
  googlePayContainer: {
    width: "100%",
    marginBottom: 20,
  },
  googlePayButton: {
    marginBottom: 16,
  },
  googlePayInfoContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  googlePayInfoTitle: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 12,
  },
  googlePayInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  googlePayInfoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  orText: {
    color: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
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
  payButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  secureContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  secureText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: "rgba(255, 255, 255, 0.5)",
  },
  securityTipsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  securityTipsTitle: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 12,
  },
  securityTipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  securityTipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
});

export default CustomCardPayment;
