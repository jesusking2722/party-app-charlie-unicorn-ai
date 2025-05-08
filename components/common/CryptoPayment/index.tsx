import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MetaMaskImage = require("@/assets/images/logos/metamask.png");
const TrustImage = require("@/assets/images/logos/trust.png");
const BinanceImage = require("@/assets/images/logos/binance.png");
const CoinbaseImage = require("@/assets/images/logos/coinbase.png");

// Mock function to connect wallet
const connectWallet = async (): Promise<any> => {
  try {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return mock wallet data - in a real app, this would use a wallet SDK
    return {
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      isConnected: true,
      chainId: "56", // BNB Smart Chain
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw new Error("Failed to connect wallet. Please try again.");
  }
};

// Mock function to initiate payment
const initiatePayment = async (
  walletAddress: string,
  amount: string
): Promise<any> => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock transaction data
    return {
      paymentId: `PAY-${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`,
      amount: "0.021",
      amountUSD: amount.replace("$", ""),
      currency: "BNB",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    };
  } catch (error) {
    console.error("Error initiating payment:", error);
    throw new Error("Failed to initiate payment. Please try again.");
  }
};

// Check payment status from backend
const checkPaymentStatus = async (paymentId: string): Promise<any> => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, return a random status
    const status = Math.random() < 0.3 ? "confirmed" : "pending"; // 30% chance of being confirmed

    return {
      status,
      txHash:
        status === "confirmed"
          ? "0x" + Math.random().toString(36).substring(2, 34)
          : null,
      confirmations:
        status === "confirmed" ? Math.floor(Math.random() * 6) + 1 : 0,
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw new Error("Failed to check payment status. Please try again.");
  }
};

// Format address for display (show first and last few characters)
const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 8)}...${address.substring(
    address.length - 6
  )}`;
};

// Props for the BNB payment component
interface CryptoPaymentProps {
  amount: string;
  planTitle: string;
  onPaymentComplete: (success: boolean) => void;
  onBack: () => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({
  amount,
  planTitle,
  onPaymentComplete,
  onBack,
}) => {
  // Component states
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("initial"); // initial, processing, confirming, completed, failed
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState(900); // 15 minutes in seconds
  const [statusCheckInterval, setStatusCheckInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      const wallet = await connectWallet();
      setWalletConnected(true);
      setWalletAddress(wallet.address);
    } catch (error: any) {
      Alert.alert(
        "Connection Error",
        error.message || "Failed to connect wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  // Make payment
  const handlePay = async () => {
    if (!walletConnected || !walletAddress) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus("processing");

      // Initiate payment
      const details = await initiatePayment(walletAddress, amount);
      setPaymentDetails(details);

      // Start checking payment status
      startPaymentStatusCheck(details.paymentId);

      // Calculate remaining time if expiration is provided
      if (details.expiresAt) {
        const expiresAt = new Date(details.expiresAt).getTime();
        const now = Date.now();
        const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setRemainingTime(timeRemaining);
      }

      // After initiating, move to confirming state
      setPaymentStatus("confirming");
    } catch (error: any) {
      Alert.alert(
        "Payment Error",
        error.message || "Failed to process payment"
      );
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  // Start checking for payment status
  const startPaymentStatusCheck = (paymentId: string) => {
    // Clear any existing interval
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }

    // Check every 10 seconds
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(paymentId);

        if (status.status === "confirmed" || status.status === "completed") {
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPaymentStatus("completed");
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    }, 10000) as unknown as NodeJS.Timeout; // Cast to NodeJS.Timeout

    setStatusCheckInterval(interval);
  };

  // Countdown timer
  useEffect(() => {
    if (paymentStatus !== "confirming") return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // When payment is completed, notify parent component
  useEffect(() => {
    if (paymentStatus === "completed") {
      // Wait a moment for the user to see the success message
      setTimeout(() => {
        onPaymentComplete(true);
      }, 2000);
    }
  }, [paymentStatus, onPaymentComplete]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <FontAwesome5 name="arrow-left" size={16} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Crypto Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.planName}>{planTitle} Plan</Text>
        <Text style={styles.amountText}>{amount}</Text>
        {paymentDetails && (
          <Text style={styles.cryptoEquivalent}>
            ≈ {paymentDetails.amount} BNB
          </Text>
        )}
      </View>

      {/* Payment Status */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            paymentStatus === "initial" && styles.statusInitial,
            paymentStatus === "processing" && styles.statusProcessing,
            paymentStatus === "confirming" && styles.statusConfirming,
            paymentStatus === "completed" && styles.statusCompleted,
            paymentStatus === "failed" && styles.statusFailed,
          ]}
        >
          {(paymentStatus === "initial" || paymentStatus === "confirming") && (
            <FontAwesome5 name="wallet" size={24} color="white" />
          )}
          {paymentStatus === "processing" && (
            <ActivityIndicator size="large" color="white" />
          )}
          {paymentStatus === "completed" && (
            <FontAwesome5 name="check" size={24} color="white" />
          )}
          {paymentStatus === "failed" && (
            <FontAwesome5 name="times" size={24} color="white" />
          )}
        </View>

        <Text style={styles.statusTitle}>
          {paymentStatus === "initial" &&
            (!walletConnected ? "Connect Wallet" : "Confirm Payment")}
          {paymentStatus === "processing" && "Processing Payment"}
          {paymentStatus === "confirming" && "Confirming Payment"}
          {paymentStatus === "completed" && "Payment Complete"}
          {paymentStatus === "failed" && "Payment Failed"}
        </Text>

        <Text style={styles.statusDescription}>
          {paymentStatus === "initial" &&
            "Connect your wallet to make a payment using BNB"}
          {paymentStatus === "processing" &&
            "Your payment is being processed. Please wait..."}
          {paymentStatus === "confirming" &&
            `Please confirm the payment in your wallet. This request will expire in ${formatTime(
              remainingTime
            )}.`}
          {paymentStatus === "completed" &&
            "Your payment has been successfully processed!"}
          {paymentStatus === "failed" &&
            "The payment process has failed. Please try again."}
        </Text>
      </View>

      {/* Wallet Connection */}
      {paymentStatus === "initial" && (
        <View style={styles.walletContainer}>
          {!walletConnected ? (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectWallet}
              disabled={loading}
            >
              <LinearGradient
                colors={["#FF0099", "#7F00FF"]} // Purple/pink gradient matching Card Payment
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <FontAwesome5
                      name="wallet"
                      size={18}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.connectButtonText}>Connect Wallet</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.walletInfoContainer}>
                <Text style={styles.walletLabel}>Connected Wallet</Text>
                <View style={styles.walletAddressContainer}>
                  <FontAwesome5
                    name="check-circle"
                    size={16}
                    color="#FFFFFF"
                    style={styles.walletIcon}
                  />
                  <Text style={styles.walletAddress}>
                    {formatAddress(walletAddress)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.payButton}
                onPress={handlePay}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#FF0099", "#7F00FF"]} // Purple/pink gradient matching Card Payment
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.payButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <FontAwesome5
                        name="coins"
                        size={18}
                        color="white"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.payButtonText}>Pay with BNB</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Payment in progress */}
      {paymentStatus === "confirming" && (
        <View style={styles.confirmingContainer}>
          <Text style={styles.confirmingText}>
            Please confirm the transaction in your wallet app
          </Text>
          <ActivityIndicator
            color="#F3BA2F"
            size="large"
            style={styles.confirmingLoader}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Continue button (only shown when completed) */}
      {paymentStatus === "completed" && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => onPaymentComplete(true)}
        >
          <LinearGradient
            colors={["#FF0099", "#7F00FF"]} // Purple/pink gradient matching Card Payment
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Retry button (only shown when failed) */}
      {paymentStatus === "failed" && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setPaymentStatus("initial")}
        >
          <LinearGradient
            colors={["#FF0099", "#7F00FF"]} // Purple/pink gradient matching Card Payment
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.retryButtonGradient}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.secureContainer}>
        <FontAwesome5 name="lock" size={14} color="rgba(255, 255, 255, 0.5)" />
        <Text style={styles.secureText}>
          Transactions are secure and irreversible
        </Text>
      </View>

      {/* Supported Wallets */}
      <View style={styles.walletsContainer}>
        <Text style={styles.walletsTitle}>Most popular wallets</Text>
        <View style={styles.walletsList}>
          <View style={styles.walletItem}>
            <Image
              source={MetaMaskImage}
              alt="Metamask"
              style={{ width: 20, height: 20, objectFit: "cover" }}
            />
            <Text style={styles.walletName}>Trust Wallet</Text>
          </View>
          <View style={styles.walletItem}>
            <Image
              source={TrustImage}
              alt="Trust"
              style={{ width: 20, height: 20, objectFit: "cover" }}
            />
            <Text style={styles.walletName}>MetaMask</Text>
          </View>
          <View style={styles.walletItem}>
            <Image
              source={BinanceImage}
              alt="Binance"
              style={{ width: 20, height: 20, objectFit: "cover" }}
            />
            <Text style={styles.walletName}>Binance Wallet</Text>
          </View>
          <View style={styles.walletItem}>
            <Image
              source={CoinbaseImage}
              alt="Coinbase"
              style={{ width: 20, height: 20, objectFit: "cover" }}
            />
            <Text style={styles.walletName}>Coinbase Wallet</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: "Montserrat-Bold",
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
    fontFamily: "Montserrat-Medium",
    color: "white",
    marginBottom: 4,
  },
  amountText: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: "white",
  },
  cryptoEquivalent: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusInitial: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Match card payment style
  },
  statusProcessing: {
    backgroundColor: "rgba(0, 150, 255, 0.2)", // Blue
  },
  statusConfirming: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Match card payment style
  },
  statusCompleted: {
    backgroundColor: "rgba(50, 205, 50, 0.2)", // Green
  },
  statusFailed: {
    backgroundColor: "rgba(255, 0, 0, 0.2)", // Red
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "white",
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  walletContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  walletInfoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  walletAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    marginRight: 8,
  },
  walletAddress: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "white",
  },
  connectButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  connectButtonGradient: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  connectButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  payButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  payButtonGradient: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  buttonIcon: {
    marginRight: 8,
  },
  confirmingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  confirmingText: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  confirmingLoader: {
    marginBottom: 16,
  },
  continueButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  continueButtonGradient: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  retryButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  retryButtonGradient: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
  secureContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  secureText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.5)",
  },
  walletsContainer: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
  },
  walletsTitle: {
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
    color: "white",
    marginBottom: 12,
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
    marginBottom: 10,
  },
  walletName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    marginLeft: 8,
  },
});

export default CryptoPayment;
