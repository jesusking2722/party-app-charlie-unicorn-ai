import {
  Currency,
  MembershipRadioGroup,
  PaymentMethodType,
  SubscriptionPlan,
  Translate,
} from "@/components/common";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
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
import {
  Button,
  CardPayment,
  CryptoPayment,
  PaymentModal,
  Spinner,
} from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { updateAuthUser } from "@/lib/scripts/auth.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import { User } from "@/types/data";
import { useSelector } from "react-redux";

const PremiumHeaderImage = require("@/assets/images/premium_onboarding.png");
const { width, height } = Dimensions.get("window");

const LIGHT_THEME_ACCENT = "#FF0099";

const SubscriptionScreen = () => {
  const { isDarkMode } = useTheme();

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

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    subscriptionPlans[3].id
  );
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [formattedAmount, setFormattedAmount] = useState<string>("$54");
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentModalVisible, setPaymentModalVisible] =
    useState<boolean>(false);
  const [paymentFlow, setPaymentFlow] = useState<string | null>(null);
  const [isPlanExpired, setIsPlanExpired] = useState<boolean>(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // Get current plan ID based on user's membership period
  const getCurrentPlanId = (): string | undefined => {
    if (!user || !user.membership || user.membership === "free") {
      return "free";
    }

    switch (user.membershipPeriod) {
      case 1:
        return "monthly";
      case 3:
        return "quarterly";
      case 6:
        return "biannual";
      case 12:
        return "annual";
      default:
        return undefined;
    }
  };

  const currentPlanId = getCurrentPlanId();

  // Calculate premium expiration date and check if plan is expired
  const calculateExpirationDetails = (): {
    expirationDate: string;
    isExpired: boolean;
  } => {
    if (
      !user ||
      !user.premiumStartedAt ||
      !user.membershipPeriod ||
      user.membership !== "premium"
    ) {
      return { expirationDate: "", isExpired: true };
    }

    const startDate = new Date(user.premiumStartedAt);
    const expirationDate = new Date(startDate);

    // Add months based on membership period
    expirationDate.setMonth(expirationDate.getMonth() + user.membershipPeriod);

    // Check if plan is expired
    const now = new Date();
    const isExpired = now >= expirationDate;

    // Format date to string
    const formattedDate = expirationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return { expirationDate: formattedDate, isExpired };
  };

  // Update expiration status when component mounts or user changes
  useEffect(() => {
    const { isExpired } = calculateExpirationDetails();
    setIsPlanExpired(isExpired);
  }, [user]);

  // Calculate time remaining until expiration
  const calculateTimeRemaining = (): string => {
    if (
      !user ||
      !user.premiumStartedAt ||
      !user.membershipPeriod ||
      user.membership !== "premium"
    ) {
      return "";
    }

    const startDate = new Date(user.premiumStartedAt);
    const expirationDate = new Date(startDate);
    expirationDate.setMonth(expirationDate.getMonth() + user.membershipPeriod);

    const now = new Date();
    if (now >= expirationDate) {
      return "Expired";
    }

    const diffTime = Math.abs(expirationDate.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} remaining`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`;
    }
  };

  const timeRemaining = calculateTimeRemaining();
  const { expirationDate, isExpired } = calculateExpirationDetails();

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

  // Handle plan selection
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan.id);
  };

  // Handle currency change
  const handleCurrencyChange = (currency: Currency, formattedPrice: string) => {
    setSelectedCurrency(currency);
    setFormattedAmount(formattedPrice);
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
  const handleFreeSubscription = async () => {
    if (user) {
      setLoading(true);
      try {
        const updatingUser: User = {
          ...user,
          membership: "free",
          membershipPeriod: 0,
          premiumStartedAt: undefined,
        };

        const response = await updateAuthUser(updatingUser);
        if (response.ok) {
          const { user: updatedUser } = response.data;
          await dispatch(setAuthUserAsync(updatedUser)).unwrap();
          showToast("Successfully switched to Free plan", "success");
        }
      } catch (error) {
        showToast("Something went wrong", "error");
        console.error("handle free subscription error: ", error);
      } finally {
        setLoading(false);
      }
    }
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
  const handlePaymentComplete = async (success: boolean) => {
    if (success && user) {
      setLoading(true);
      setPaymentFlow(null);

      try {
        // Map the selectedPlanId to the membershipPeriod
        let membershipPeriod: 0 | 1 | 3 | 6 | 12 = 0;
        switch (selectedPlanId) {
          case "monthly":
            membershipPeriod = 1;
            break;
          case "quarterly":
            membershipPeriod = 3;
            break;
          case "biannual":
            membershipPeriod = 6;
            break;
          case "annual":
            membershipPeriod = 12;
            break;
        }

        const updatingUser: User = {
          ...user,
          membership: "premium",
          membershipPeriod,
          premiumStartedAt: new Date(),
        };

        const response = await updateAuthUser(updatingUser);
        if (response.ok) {
          const { user: updatedUser } = response.data;
          await dispatch(setAuthUserAsync(updatedUser)).unwrap();
          showToast("Subscription updated successfully", "success");
        }
      } catch (error) {
        showToast("Something went wrong", "error");
        console.error(
          "handle premium membership payment complete error: ",
          error
        );
      } finally {
        setLoading(false);
      }
    } else {
      setPaymentFlow(null);
      showToast("Payment failed", "error");
    }
  };

  // Handle back from payment flow
  const handleBackFromPayment = () => {
    setPaymentFlow(null);
  };

  // Get the selected plan
  const selectedPlan = subscriptionPlans.find(
    (plan) => plan.id === selectedPlanId
  );

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

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

  // If in a payment flow, render the appropriate payment component
  if (paymentFlow === "card") {
    return (
      <SafeAreaView style={styles.container}>
        <CardPayment
          type="subscription"
          amount={selectedPlan?.price.toString() || ""}
          formattedAmount={formattedAmount}
          currency={selectedCurrency}
          planTitle={selectedPlan?.title || ""}
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
          type="subscription"
          amount={selectedPlan?.price.toString() || ""}
          formattedAmount={formattedAmount}
          currency={selectedCurrency}
          planTitle={selectedPlan?.title || ""}
          onPaymentComplete={handlePaymentComplete}
          onBack={handleBackFromPayment}
        />
      </SafeAreaView>
    );
  }

  // Check if subscribe button should be disabled
  const isSubscribeDisabled = () => {
    // Disable if current plan is selected
    if (currentPlanId === selectedPlanId) {
      return true;
    }

    // Disable if user has a premium plan that hasn't expired yet
    if (user?.membership === "premium" && !isExpired) {
      return true;
    }

    return false;
  };

  // Get button text based on subscription state
  const getButtonText = () => {
    if (currentPlanId === selectedPlanId) {
      return "Current Plan";
    }

    if (user?.membership === "premium" && !isExpired) {
      return `Wait Until Plan Expires`;
    }

    return selectedPlan?.isFree
      ? "Switch to Free Plan"
      : `Subscribe for ${formattedAmount}`;
  };

  // Main subscription screen
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <Spinner visible={loading} message="Processing..." />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Image Section */}
          <View style={styles.headerImageContainer}>
            <Image
              source={PremiumHeaderImage}
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
                      <Translate>Manage Subscription</Translate>
                    </Text>

                    {user?.membership === "premium" && (
                      <View style={styles.subscriptionStatusContainer}>
                        <View
                          style={[
                            styles.currentStatusBadge,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(0, 200, 150, 0.2)"
                                : "rgba(0, 180, 130, 0.2)",
                              borderColor: isDarkMode
                                ? "rgba(0, 200, 150, 0.5)"
                                : "rgba(0, 180, 130, 0.5)",
                            },
                          ]}
                        >
                          <FontAwesome5
                            name="check-circle"
                            size={12}
                            color={
                              isDarkMode
                                ? "rgb(0, 200, 150)"
                                : "rgb(0, 180, 130)"
                            }
                            style={styles.statusIcon}
                          />
                          <Text
                            style={[
                              styles.currentStatusText,
                              {
                                color: isDarkMode
                                  ? "rgb(0, 200, 150)"
                                  : "rgb(0, 180, 130)",
                              },
                            ]}
                          >
                            <Translate>Active Premium Subscription</Translate>
                          </Text>
                        </View>

                        <View style={styles.subscriptionDetailRow}>
                          <Text
                            style={[
                              styles.expirationText,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            <Translate>Expires on:</Translate>{" "}
                            <Translate>{expirationDate}</Translate>
                          </Text>

                          {!isExpired && (
                            <Text
                              style={[
                                styles.timeRemainingText,
                                {
                                  color: isDarkMode
                                    ? "rgba(0, 200, 150, 0.8)"
                                    : "rgb(0, 180, 130)",
                                },
                              ]}
                            >
                              <Translate>{timeRemaining}</Translate>
                            </Text>
                          )}
                        </View>

                        {!isExpired && (
                          <Text
                            style={[
                              styles.planChangeWarning,
                              {
                                color: isDarkMode
                                  ? "rgba(255, 165, 0, 0.8)"
                                  : "rgba(255, 100, 0, 0.9)",
                              },
                            ]}
                          >
                            <Translate>
                              You can change your plan once the current plan
                              expires.
                            </Translate>
                          </Text>
                        )}
                      </View>
                    )}

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
                      {user?.membership === "premium" ? (
                        isExpired ? (
                          <Translate>
                            Your subscription has expired. Choose a new plan
                            below.
                          </Translate>
                        ) : (
                          <Translate>
                            You can renew or change your plan after the current
                            period ends.
                          </Translate>
                        )
                      ) : (
                        <Translate>
                          Upgrade to premium to access all features
                        </Translate>
                      )}
                    </Text>

                    {/* Premium Features */}
                    <View
                      style={[
                        styles.featuresContainer,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(40, 45, 55, 0.5)"
                            : "rgba(255, 255, 255, 0.5)",
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      ]}
                    >
                      <View style={styles.featureItem}>
                        <View
                          style={[
                            styles.featureIconContainer,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 0, 153, 0.2)"
                                : "rgba(255, 0, 153, 0.1)",
                            },
                          ]}
                        >
                          <FontAwesome
                            name="check-circle"
                            size={18}
                            color={getAccentColor()}
                          />
                        </View>
                        <Text
                          style={[
                            styles.featureText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          <Translate>
                            Unlimited access to all features
                          </Translate>
                        </Text>
                      </View>

                      <View style={styles.featureItem}>
                        <View
                          style={[
                            styles.featureIconContainer,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 0, 153, 0.2)"
                                : "rgba(255, 0, 153, 0.1)",
                            },
                          ]}
                        >
                          <FontAwesome
                            name="check-circle"
                            size={18}
                            color={getAccentColor()}
                          />
                        </View>
                        <Text
                          style={[
                            styles.featureText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          <Translate>
                            Create events without KYC verification
                          </Translate>
                        </Text>
                      </View>

                      <View style={styles.featureItem}>
                        <View
                          style={[
                            styles.featureIconContainer,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 0, 153, 0.2)"
                                : "rgba(255, 0, 153, 0.1)",
                            },
                          ]}
                        >
                          <FontAwesome
                            name="check-circle"
                            size={18}
                            color={getAccentColor()}
                          />
                        </View>
                        <Text
                          style={[
                            styles.featureText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          <Translate>Priority customer support</Translate>
                        </Text>
                      </View>
                    </View>

                    {/* Subscription Plan Selection */}
                    <View style={styles.subscriptionContainer}>
                      <Text
                        style={[
                          styles.subscriptionTitle,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        <Translate>Select a plan</Translate>
                      </Text>

                      <MembershipRadioGroup
                        plans={subscriptionPlans}
                        selectedPlanId={selectedPlanId}
                        currentPlanId={currentPlanId ?? ""}
                        onPlanSelect={handlePlanSelect}
                        onCurrencyChange={handleCurrencyChange}
                      />
                    </View>

                    {/* Subscribe Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.M,
                      }}
                    >
                      <Button
                        title={getButtonText()}
                        onPress={handleSubscribe}
                        loading={loading}
                        variant={isDarkMode ? "primary" : "secondary"}
                        small={false}
                        icon={
                          !loading && !isSubscribeDisabled() ? (
                            <FontAwesome5
                              name="arrow-right"
                              size={14}
                              color="white"
                              style={{ marginLeft: SPACING.S }}
                            />
                          ) : undefined
                        }
                        iconPosition="right"
                        disabled={isSubscribeDisabled()}
                      />
                    </Animated.View>

                    {/* Terms Text */}
                    <Text
                      style={[
                        styles.termsText,
                        {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.4)"
                            : "rgba(0, 0, 0, 0.4)",
                        },
                      ]}
                    >
                      <Translate>
                        By subscribing, you agree to our Terms of Service and
                        Privacy Policy. Subscriptions automatically renew unless
                        auto-renew is turned off at least 24 hours before the
                        end of the current period.
                      </Translate>
                    </Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Payment Method Selection Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        amount={formattedAmount}
        currency={selectedCurrency}
        planTitle={selectedPlan?.title || ""}
      />
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
  subscriptionStatusContainer: {
    marginBottom: SPACING.M,
  },
  currentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.M,
    alignSelf: "flex-start",
    borderWidth: 1,
    marginBottom: SPACING.XS,
  },
  statusIcon: {
    marginRight: SPACING.XS,
  },
  currentStatusText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  subscriptionDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  expirationText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  timeRemainingText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  planChangeWarning: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
  },
  featuresContainer: {
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    borderWidth: 0.5,
    marginBottom: SPACING.M,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  featureIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.S,
  },
  featureText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    flex: 1,
  },
  subscriptionContainer: {
    marginBottom: SPACING.M,
  },
  subscriptionTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.S,
  },
  termsText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
    marginTop: SPACING.M,
    lineHeight: 16,
  },
});

export default SubscriptionScreen;
