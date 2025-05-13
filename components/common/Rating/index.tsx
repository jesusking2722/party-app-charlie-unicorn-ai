import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";

interface RatingProps {
  value: number;
  maxValue?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showValue?: boolean;
  totalReviews?: number;
}

const Rating: React.FC<RatingProps> = ({
  value,
  maxValue = 5,
  size = 16,
  color = "#f59e0b",
  emptyColor = "rgba(245, 158, 11, 0.2)",
  showValue = false,
  totalReviews,
}) => {
  // Calculate full, half, and empty stars
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;
  const emptyStars = maxValue - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {/* Full stars */}
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <FontAwesome5
              key={`star-full-${i}`}
              name="star"
              size={size}
              solid
              color={color}
              style={styles.star}
            />
          ))}

        {/* Half star if needed */}
        {hasHalfStar && (
          <FontAwesome5
            name="star-half-alt"
            size={size}
            solid
            color={color}
            style={styles.star}
          />
        )}

        {/* Empty stars */}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <FontAwesome5
              key={`star-empty-${i}`}
              name="star"
              size={size}
              solid
              color={emptyColor}
              style={styles.star}
            />
          ))}
      </View>

      {/* Show numerical value and total reviews if requested */}
      {showValue && (
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value.toFixed(1)}</Text>
          {totalReviews !== undefined && (
            <Text style={styles.reviewsText}>({totalReviews})</Text>
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
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.XS,
  },
  valueText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.LIGHT_TEXT_PRIMARY,
    marginRight: 4,
  },
  reviewsText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: COLORS.LIGHT_TEXT_SECONDARY,
  },
});

export default Rating;
