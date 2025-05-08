import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

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

        return (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planContainer,
              isSelected && styles.selectedPlanContainer,
              plan.isFree && styles.freePlanContainer,
              plan.isPopular && styles.popularPlanContainer,
            ]}
            onPress={() => onPlanSelect(plan)}
            activeOpacity={0.7}
          >
            {/* Selected Plan Indicator */}
            {isSelected && (
              <LinearGradient
                colors={["#FF0099", "#7F00FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.selectedGradient}
              />
            )}

            {/* Radio Button */}
            <View style={styles.radioButtonContainer}>
              <View
                style={[
                  styles.radioButton,
                  isSelected && styles.radioButtonSelected,
                  plan.isFree && styles.freeRadioButton,
                ]}
              >
                {isSelected && <View style={styles.radioButtonInner} />}
              </View>
            </View>

            {/* Plan Information */}
            <View style={styles.planInfo}>
              <Text
                style={[
                  styles.planTitle,
                  isSelected && styles.selectedText,
                  plan.isFree && styles.freeText,
                  titleStyle,
                ]}
              >
                {plan.title}
              </Text>

              <View style={styles.priceContainer}>
                <Text
                  style={[
                    styles.planPrice,
                    isSelected && styles.selectedText,
                    plan.isFree && styles.freeText,
                  ]}
                >
                  {plan.priceLabel}
                </Text>

                {showSavings && (
                  <View style={styles.savingsContainer}>
                    <Text style={styles.savingsText}>
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
                          color="rgba(255, 255, 255, 0.5)"
                          style={styles.limitationIcon}
                        />
                        <Text style={styles.limitationText}>{limitation}</Text>
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
                        color="#FF0099"
                        style={styles.featureIcon}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Popular Badge */}
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <LinearGradient
                  colors={["#FF9500", "#FF0099"]}
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
                <View style={styles.freeGradient}>
                  <Text style={styles.freeTextBadge}>Basic</Text>
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
    padding: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedPlanContainer: {
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  freePlanContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  popularPlanContainer: {
    borderColor: "rgba(255, 0, 153, 0.3)",
  },
  selectedGradient: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 4,
    height: "100%",
  },
  radioButtonContainer: {
    marginRight: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#FF0099",
  },
  freeRadioButton: {
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF0099",
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Medium",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  planPrice: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  selectedText: {
    color: "white",
  },
  freeText: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  savingsContainer: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(255, 0, 153, 0.2)",
    borderRadius: 10,
  },
  savingsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  popularGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeIcon: {
    marginRight: 4,
  },
  popularText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
  },
  freeBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  freeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  freeTextBadge: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
  },
  limitationsContainer: {
    marginTop: 8,
  },
  limitationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  limitationIcon: {
    marginRight: 6,
  },
  limitationText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  featureIcon: {
    marginRight: 6,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
  },
});

export default MembershipRadioGroup;
