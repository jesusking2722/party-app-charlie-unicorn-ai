import {
  MembershipRadioGroup,
  PaymentMethodType,
  SubscriptionPlan,
} from "@/components/common";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CardPayment, CryptoPayment, PaymentModal } from "@/components/common";
import { router } from "expo-router";

const PremiumSubscriptionScreen = () => {
  // Subscription plans data
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "free",
      title: "Free",
      price: 0,
      priceLabel: "Free for now",
      duration: "Lifetime",
      isFree: true,
      features: ["Basic features", "Limited access"],
      limitations: ["Limited features", "Standard support"],
    },
    {
      id: "monthly",
      title: "1 Month",
      price: 12,
      priceLabel: "$12 / month",
      duration: "1 month",
      features: ["All premium features", "Cancel anytime"],
    },
    {
      id: "quarterly",
      title: "3 Months",
      price: 30,
      priceLabel: "$30 (only $10/month)",
      duration: "3 months",
      features: ["All premium features", "Priority support"],
    },
    {
      id: "biannual",
      title: "6 Months",
      price: 54,
      priceLabel: "$54 (only $9/month)",
      duration: "6 months",
      isPopular: true,
      features: [
        "All premium features",
        "Priority support",
        "Exclusive content",
      ],
    },
    {
      id: "annual",
      title: "12 Months",
      price: 95,
      priceLabel: "$95 (only $7.92/month)",
      duration: "1 year",
      features: [
        "All premium features",
        "Priority support",
        "Exclusive content",
        "Yearly bonus",
      ],
    },
  ];

  // State for selected plan (default to biannual which is index 3 now with the free option added)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    subscriptionPlans[3].id
  );

  // State for loading
  const [loading, setLoading] = useState<boolean>(false);

  // State for payment modal visibility
  const [paymentModalVisible, setPaymentModalVisible] =
    useState<boolean>(false);

  // State for current payment flow
  const [paymentFlow, setPaymentFlow] = useState<string | null>(null);

  // Handle plan selection
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
  };

  // Handle subscription submission
  const handleSubscribe = () => {
    const selectedPlan = subscriptionPlans.find(
      (plan) => plan.id === selectedPlanId
    );

    // If free plan is selected, proceed to next step without payment
    if (selectedPlan?.isFree) {
      handleFreeSubscription();
    } else {
      // Show payment modal for paid plans
      setPaymentModalVisible(true);
    }
  };

  // Handle free subscription
  const handleFreeSubscription = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push("/onboarding/congratulationsSetup");
    }, 1000);
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = (method: PaymentMethodType) => {
    setPaymentModalVisible(false);

    // Set the payment flow based on the selected method
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
      // navigation.navigate("HomeScreen");
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

  // Handle skipping subscription
  const handleSkip = () => {
    console.log("Subscription skipped, navigating to home screen");
    // navigation.navigate("HomeScreen");
  };

  // Handle back button
  const handleBack = () => {
    console.log("Navigate back to step 3");
    // navigation.goBack();
  };

  // Get the selected plan
  const selectedPlan = subscriptionPlans.find(
    (plan) => plan.id === selectedPlanId
  );

  // If in a payment flow, render the appropriate payment component
  if (paymentFlow === "card") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#7F00FF", "#E100FF"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <CardPayment
            amount={selectedPlan?.priceLabel.split(" ")[0] || ""}
            planTitle={selectedPlan?.title || ""}
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBackFromPayment}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (paymentFlow === "crypto") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#7F00FF", "#E100FF"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <CryptoPayment
            amount={selectedPlan?.priceLabel.split(" ")[0] || ""}
            planTitle={selectedPlan?.title || ""}
            onPaymentComplete={handlePaymentComplete}
            onBack={handleBackFromPayment}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Main subscription screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#7F00FF", "#E100FF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Go back"
            >
              <FontAwesome5 name="arrow-left" size={16} color="white" />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.premiumBadge}>
                <LinearGradient
                  colors={["#FF9500", "#FF0099"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.premiumGradient}
                >
                  <FontAwesome5
                    name="crown"
                    size={14}
                    color="white"
                    style={styles.crownIcon}
                  />
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </LinearGradient>
              </View>

              <Text style={styles.title}>Upgrade to Premium</Text>
              <Text style={styles.subtitle}>
                Unlock all features and enhance your experience
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color="#FF0099"
                    solid
                  />
                </View>
                <Text style={styles.featureText}>
                  Unlimited access to all features
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color="#FF0099"
                    solid
                  />
                </View>
                <Text style={styles.featureText}>
                  Create events without KYC verification
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color="#FF0099"
                    solid
                  />
                </View>
                <Text style={styles.featureText}>
                  Review the competing applications
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color="#FF0099"
                    solid
                  />
                </View>
                <Text style={styles.featureText}>
                  Priority customer support
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <FontAwesome5
                    name="check-circle"
                    size={20}
                    color="#FF0099"
                    solid
                  />
                </View>
                <Text style={styles.featureText}>
                  Exclusive premium content
                </Text>
              </View>
            </View>

            <View style={styles.subscriptionContainer}>
              <Text style={styles.subscriptionTitle}>Choose your plan</Text>

              <MembershipRadioGroup
                plans={subscriptionPlans}
                selectedPlanId={selectedPlanId}
                onPlanSelect={handlePlanSelect}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#FF0099", "#7F00FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeButtonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.subscribeButtonText}>Processing</Text>
                      <View style={styles.loadingDots}>
                        <Text style={styles.loadingDot}>.</Text>
                        <Text style={styles.loadingDot}>.</Text>
                        <Text style={styles.loadingDot}>.</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.subscribeButtonText}>
                        {selectedPlan?.isFree
                          ? "Continue with Free Plan"
                          : `Subscribe for ${
                              selectedPlan?.priceLabel.split(" ")[0]
                            }`}
                      </Text>
                      <FontAwesome5
                        name="arrow-right"
                        size={14}
                        color="white"
                        style={styles.buttonIcon}
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By subscribing, you agree to our Terms of Service and Privacy
                Policy. Subscriptions automatically renew unless auto-renew is
                turned off at least 24 hours before the end of the current
                period.
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressLine}>
                <View style={styles.progressFilled} />
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>Step 4 of 4</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Payment Method Selection Modal */}
        <PaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          onSelectPaymentMethod={handleSelectPaymentMethod}
          amount={selectedPlan?.priceLabel.split(" ")[0] || ""}
          planTitle={selectedPlan?.title || ""}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    marginTop: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  premiumBadge: {
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 20,
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  crownIcon: {
    marginRight: 6,
  },
  premiumText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
  },
  featuresContainer: {
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 0, 153, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    flex: 1,
  },
  subscriptionContainer: {
    marginBottom: 30,
  },
  subscriptionTitle: {
    fontSize: 18,
    color: "white",
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  subscribeButton: {
    borderRadius: 12,
    height: 56,
    overflow: "hidden",
    marginBottom: 16,
  },
  subscribeButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    marginLeft: 4,
  },
  loadingDot: {
    color: "white",
    fontSize: 18,
    marginLeft: 2,
    fontFamily: "Montserrat-Bold",
  },
  skipButton: {
    alignItems: "center",
    padding: 12,
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
  termsContainer: {
    marginBottom: 30,
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLine: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFilled: {
    width: "100%", // 4 of 4 steps
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  progressTextContainer: {
    alignItems: "center",
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
  },
});

export default PremiumSubscriptionScreen;
