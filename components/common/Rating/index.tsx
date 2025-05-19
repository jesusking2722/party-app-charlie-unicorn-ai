import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface RatingProps {
  value: number;
  maxValue?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showValue?: boolean;
  totalReviews?: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

const Rating: React.FC<RatingProps> = ({
  value,
  maxValue = 5,
  size = 16,
  color,
  emptyColor,
  showValue = false,
  totalReviews,
  editable = false,
  onChange,
}) => {
  const { isDarkMode } = useTheme();

  // Use theme colors if not provided
  const starColor = color || (isDarkMode ? "#f59e0b" : "#f59e0b");
  const starEmptyColor =
    emptyColor ||
    (isDarkMode ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.2)");

  // Calculate full, half, and empty stars
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;
  const emptyStars = maxValue - fullStars - (hasHalfStar ? 1 : 0);

  // Handle star press for editable ratings
  const handleStarPress = (rating: number) => {
    if (editable && onChange) {
      onChange(rating);
    }
  };

  // Helper function to render a star
  const renderStar = (type: "full" | "half" | "empty", index: number) => {
    const starValue = index + 1;
    const iconName =
      type === "full" ? "star" : type === "half" ? "star-half-alt" : "star";
    const starComponent = (
      <FontAwesome5
        name={iconName}
        size={size}
        solid
        color={type !== "empty" ? starColor : starEmptyColor}
        style={styles.star}
      />
    );

    if (editable) {
      return (
        <TouchableOpacity
          key={`star-${type}-${index}`}
          onPress={() => handleStarPress(starValue)}
          style={styles.starTouchable}
        >
          {starComponent}
        </TouchableOpacity>
      );
    }

    return <View key={`star-${type}-${index}`}>{starComponent}</View>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {/* Full stars */}
        {Array(fullStars)
          .fill(0)
          .map((_, i) => renderStar("full", i))}

        {/* Half star if needed */}
        {hasHalfStar && renderStar("half", fullStars)}

        {/* Empty stars */}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) =>
            renderStar("empty", fullStars + (hasHalfStar ? 1 : 0) + i)
          )}
      </View>

      {/* Show numerical value and total reviews if requested */}
      {showValue && (
        <View style={styles.valueContainer}>
          <Text
            style={[
              styles.valueText,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_PRIMARY
                  : COLORS.LIGHT_TEXT_PRIMARY,
              },
            ]}
          >
            {value.toFixed(1)}
          </Text>
          {totalReviews !== undefined && (
            <Text
              style={[
                styles.reviewsText,
                {
                  color: isDarkMode
                    ? COLORS.DARK_TEXT_SECONDARY
                    : COLORS.LIGHT_TEXT_SECONDARY,
                },
              ]}
            >
              ({totalReviews})
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
  starTouchable: {
    padding: 4, // Increased touch target for better UX
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.XS,
  },
  valueText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginRight: 4,
  },
  reviewsText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
});

export default Rating;
