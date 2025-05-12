import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SPACING,
} from "@/app/theme";

// Types for our subscription plan
export interface SubscriptionPlan {
  id: string;
  title: string;
  price: number;
  priceLabel: string;
  duration: string;
  isPopular?: boolean;
  isFree?: boolean;
  discount?: string;
  features?: string[];
  limitations?: string[];
}

// Props for our subscription radio group
interface MembershipRadioGroupProps {
  plans: SubscriptionPlan[];
  selectedPlanId: string;
  onPlanSelect: (plan: SubscriptionPlan) => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const MembershipRadioGroup: React.FC<MembershipRadioGroupProps> = ({
  plans,
  selectedPlanId,
  onPlanSelect,
  containerStyle,
  titleStyle,
}) => {
  const { isDarkMode } = useTheme();

  const LIGHT_THEME_ACCENT = "#FF0099";

  // Animation references for each plan
  const animationRefs = useRef<{
    [key: string]: {
      scale: Animated.Value;
      opacity: Animated.Value;
      checkOpacity: Animated.Value;
      borderWidth: Animated.Value;
      colorInterpolation: Animated.Value;
    };
  }>({});

  // Initialize animation values for each plan
  useEffect(() => {
    plans.forEach((plan) => {
      const isSelected = selectedPlanId === plan.id;

      if (!animationRefs.current[plan.id]) {
        animationRefs.current[plan.id] = {
          scale: new Animated.Value(isSelected ? 1 : 0),
          opacity: new Animated.Value(isSelected ? 1 : 0),
          checkOpacity: new Animated.Value(isSelected ? 1 : 0),
          borderWidth: new Animated.Value(isSelected ? 2 : 1),
          colorInterpolation: new Animated.Value(isSelected ? 1 : 0),
        };
      }
    });
  }, [plans]);

  // Animate when selected plan changes
  useEffect(() => {
    plans.forEach((plan) => {
      const isSelected = selectedPlanId === plan.id;
      const animations = animationRefs.current[plan.id];

      if (animations) {
        Animated.parallel([
          Animated.timing(animations.scale, {
            toValue: isSelected ? 1 : 0,
            duration: ANIMATIONS.FAST,
            useNativeDriver: false,
          }),
          Animated.timing(animations.opacity, {
            toValue: isSelected ? 1 : 0,
            duration: ANIMATIONS.FAST,
            useNativeDriver: false,
          }),
          Animated.timing(animations.checkOpacity, {
            toValue: isSelected ? 1 : 0,
            duration: ANIMATIONS.FAST,
            useNativeDriver: false,
          }),
          Animated.timing(animations.borderWidth, {
            toValue: isSelected ? 2 : 1,
            duration: ANIMATIONS.FAST,
            useNativeDriver: false,
          }),
          Animated.timing(animations.colorInterpolation, {
            toValue: isSelected ? 1 : 0,
            duration: ANIMATIONS.FAST,
            useNativeDriver: false,
          }),
        ]).start();
      }
    });
  }, [selectedPlanId, plans]);

  // Theme-based styles
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  const getPlanBackgroundColor = (
    isSelected: boolean,
    isFree: boolean = false
  ) =>
    isDarkMode
      ? isSelected
        ? "rgba(40, 45, 55, 0.65)"
        : isFree
        ? "rgba(25, 30, 40, 0.4)"
        : "rgba(30, 35, 45, 0.5)"
      : isSelected
      ? "rgba(255, 255, 255, 0.65)"
      : isFree
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(255, 255, 255, 0.5)";

  const getPlanBorderColor = (isSelected: boolean) =>
    isDarkMode
      ? isSelected
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(255, 255, 255, 0.1)"
      : isSelected
      ? "rgba(255, 0, 153, 0.3)"
      : "rgba(0, 0, 0, 0.05)";

  const getTitleColor = (isSelected: boolean, isFree: boolean = false) =>
    isDarkMode
      ? isSelected
        ? COLORS.DARK_TEXT_PRIMARY
        : isFree
        ? "rgba(255, 255, 255, 0.6)"
        : "rgba(255, 255, 255, 0.8)"
      : isSelected
      ? COLORS.LIGHT_TEXT_PRIMARY
      : isFree
      ? "rgba(0, 0, 0, 0.5)"
      : "rgba(0, 0, 0, 0.8)";

  const getPriceColor = (isSelected: boolean, isFree: boolean = false) =>
    isDarkMode
      ? isSelected
        ? COLORS.DARK_TEXT_PRIMARY
        : isFree
        ? "rgba(255, 255, 255, 0.4)"
        : "rgba(255, 255, 255, 0.7)"
      : isSelected
      ? COLORS.LIGHT_TEXT_PRIMARY
      : isFree
      ? "rgba(0, 0, 0, 0.4)"
      : "rgba(0, 0, 0, 0.7)";

  // Calculate savings between monthly price and actual price
  const calculateSavings = (
    monthlyPrice: number,
    actualPrice: number,
    months: number
  ) => {
    const totalMonthlyPrice = monthlyPrice * months;
    const savings = totalMonthlyPrice - actualPrice;
    const savingsPercentage = Math.round((savings / totalMonthlyPrice) * 100);
    return savingsPercentage;
  };

  // Get the monthly price (used for comparison)
  const getMonthlyPrice = () => {
    const monthlyPlan = plans.find(
      (plan) =>
        plan.duration.includes("month") && !plan.duration.includes("months")
    );
    return monthlyPlan ? monthlyPlan.price : 0;
  };

  const monthlyPrice = getMonthlyPrice();

  return (
    <View style={[styles.container, containerStyle]}>
      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        const animations = animationRefs.current[plan.id];

        // Calculate months for savings
        const months = plan.duration.includes("year")
          ? 12
          : parseInt(plan.duration.split(" ")[0]) || 0;

        // Only show savings for plans other than monthly or free
        const showSavings =
          !plan.isFree && plan.duration !== "1 month" && monthlyPrice > 0;
        const savingsPercentage = showSavings
          ? calculateSavings(monthlyPrice, plan.price, months)
          : 0;

        // Get background color interpolation for radio button
        const radioBorderColor = animations?.colorInterpolation.interpolate({
          inputRange: [0, 1],
          outputRange: [
            isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",
            getAccentColor(),
          ],
        });

        const radioInnerColor = animations?.colorInterpolation.interpolate({
          inputRange: [0, 1],
          outputRange: ["rgba(0, 0, 0, 0)", getAccentColor()],
        });

        return (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planContainer,
              {
                backgroundColor: getPlanBackgroundColor(
                  isSelected,
                  plan.isFree
                ),
                borderColor: getPlanBorderColor(isSelected),
                borderWidth: isSelected ? 1 : 0.5,
              },
              plan.isPopular && styles.popularPlanContainer,
            ]}
            onPress={() => onPlanSelect(plan)}
            activeOpacity={0.7}
          >
            {/* Left Accent Bar when selected */}
            {isSelected && (
              <Animated.View
                style={[
                  styles.selectedAccent,
                  {
                    backgroundColor: getAccentColor(),
                    opacity: animations?.opacity || 1,
                  },
                ]}
              />
            )}

            {/* Radio Button */}
            <View style={styles.radioButtonContainer}>
              <Animated.View
                style={[
                  styles.radioButton,
                  {
                    borderColor: radioBorderColor,
                    borderWidth: animations?.borderWidth || 1,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.radioButtonInner,
                    {
                      backgroundColor: radioInnerColor,
                      transform: [{ scale: animations?.scale || 0 }],
                      opacity: animations?.checkOpacity || 0,
                    },
                  ]}
                />
              </Animated.View>
            </View>

            {/* Plan Information */}
            <View style={styles.planInfo}>
              <Text
                style={[
                  styles.planTitle,
                  {
                    color: getTitleColor(isSelected, plan.isFree),
                    fontFamily: isSelected ? FONTS.SEMIBOLD : FONTS.MEDIUM,
                  },
                  titleStyle,
                ]}
              >
                {plan.title}
              </Text>

              <View style={styles.priceContainer}>
                <Text
                  style={[
                    styles.planPrice,
                    {
                      color: getPriceColor(isSelected, plan.isFree),
                    },
                  ]}
                >
                  {plan.priceLabel}
                </Text>

                {showSavings && (
                  <View
                    style={[
                      styles.savingsContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(255, 0, 153, 0.2)"
                          : "rgba(255, 0, 153, 0.1)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.savingsText,
                        {
                          color: isDarkMode
                            ? "rgba(255, 255, 255, 0.9)"
                            : getAccentColor(),
                        },
                      ]}
                    >
                      Save {savingsPercentage}%
                    </Text>
                  </View>
                )}
              </View>

              {/* Free Plan Limitations */}
              {plan.isFree &&
                plan.limitations &&
                plan.limitations.length > 0 && (
                  <View style={styles.limitationsContainer}>
                    {plan.limitations.map((limitation, index) => (
                      <View key={index} style={styles.limitationItem}>
                        <FontAwesome5
                          name="minus"
                          size={8}
                          color={
                            isDarkMode
                              ? "rgba(255, 255, 255, 0.4)"
                              : "rgba(0, 0, 0, 0.4)"
                          }
                          style={styles.limitationIcon}
                        />
                        <Text
                          style={[
                            styles.limitationText,
                            {
                              color: isDarkMode
                                ? "rgba(255, 255, 255, 0.5)"
                                : "rgba(0, 0, 0, 0.5)",
                            },
                          ]}
                        >
                          {limitation}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Premium Plan Features */}
              {!plan.isFree && plan.features && plan.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <FontAwesome5
                        name="check"
                        size={8}
                        color={getAccentColor()}
                        style={styles.featureIcon}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          {
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.7)"
                              : "rgba(0, 0, 0, 0.7)",
                          },
                        ]}
                      >
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Popular Badge */}
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <LinearGradient
                  colors={
                    isDarkMode ? GRADIENTS.PRIMARY : ["#FF9500", "#FF0099"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.popularGradient}
                >
                  <FontAwesome5
                    name="crown"
                    size={10}
                    color="white"
                    style={styles.badgeIcon}
                  />
                  <Text style={styles.popularText}>Popular</Text>
                </LinearGradient>
              </View>
            )}

            {/* Free Badge */}
            {plan.isFree && (
              <View style={styles.freeBadge}>
                <View
                  style={[
                    styles.freeGradient,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.freeTextBadge,
                      {
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : "rgba(0, 0, 0, 0.7)",
                      },
                    ]}
                  >
                    Basic
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  planContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.M,
    marginBottom: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    position: "relative",
    overflow: "hidden",
  },
  selectedAccent: {
    position: "absolute",
    left: 0,
    width: 3,
    height: "100%",
    borderTopRightRadius: BORDER_RADIUS.S,
    borderBottomRightRadius: BORDER_RADIUS.S,
  },
  popularPlanContainer: {
    borderColor: "rgba(255, 0, 153, 0.3)",
  },
  radioButtonContainer: {
    marginRight: SPACING.M,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.XS,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  planPrice: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  savingsContainer: {
    marginLeft: SPACING.S,
    paddingHorizontal: SPACING.S,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.M,
  },
  savingsText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  popularGradient: {
    paddingHorizontal: SPACING.S,
    paddingVertical: 4,
    borderBottomLeftRadius: BORDER_RADIUS.M,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeIcon: {
    marginRight: 4,
  },
  popularText: {
    color: "white",
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  freeBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  freeGradient: {
    paddingHorizontal: SPACING.S,
    paddingVertical: 4,
    borderBottomLeftRadius: BORDER_RADIUS.M,
  },
  freeTextBadge: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  limitationsContainer: {
    marginTop: SPACING.S,
  },
  limitationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  limitationIcon: {
    marginRight: SPACING.XS,
  },
  limitationText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  featuresContainer: {
    marginTop: SPACING.S,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  featureIcon: {
    marginRight: SPACING.XS,
  },
  featureText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
});

export default MembershipRadioGroup;
