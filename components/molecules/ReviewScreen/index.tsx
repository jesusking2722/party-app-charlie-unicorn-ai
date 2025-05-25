import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Rating, Translate } from "@/components/common";
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { Review } from "@/types/data";
import { formatDate } from "@/utils/date";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Type for ReviewsScreen component
interface ReviewsScreenProps {
  visible: boolean;
  onClose: () => void;
  reviews?: Review[];
}

const ReviewsScreen: React.FC<ReviewsScreenProps> = ({
  visible,
  onClose,
  reviews,
}) => {
  const { isDarkMode } = useTheme();

  // Helper function to get text color based on theme
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Helper function to get secondary text color based on theme
  const getSecondaryTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_SECONDARY : COLORS.LIGHT_TEXT_SECONDARY;

  // Helper function to get background color based on theme
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(31, 41, 55, 0.7)" : "rgba(240, 240, 240, 0.9)";

  // Helper function to get accent color based on theme
  const getAccentColor = () => (isDarkMode ? COLORS.SECONDARY : "#FF0099");

  // Helper function to get card background color based on theme
  const getCardBackgroundColor = () =>
    isDarkMode ? "rgba(40, 45, 55, 0.65)" : "rgba(255, 255, 255, 0.65)";

  const getAverateRate = (): number => {
    if (reviews && reviews?.length > 0) {
      return (
        reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
      );
    } else {
      return 0;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header with X button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.closeButton,
            {
              backgroundColor: getBackgroundColor(),
            },
          ]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={22} color={getTextColor()} />
        </TouchableOpacity>
      </View>

      {/* Reviews Header with summary */}
      <View style={styles.reviewsHeaderContainer}>
        <Text style={[styles.reviewsTitle, { color: getTextColor() }]}>
          <Translate>My Reviews</Translate>
        </Text>

        <View style={styles.reviewsSummary}>
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingValue, { color: getTextColor() }]}>
              {getAverateRate().toFixed(1)}
            </Text>
            <Rating value={getAverateRate()} size={16} showValue={false} />
            <Text
              style={[styles.totalReviews, { color: getSecondaryTextColor() }]}
            >
              ({reviews?.length} <Translate>reviews</Translate>)
            </Text>
          </View>
        </View>
      </View>

      {/* Scrollable Reviews List */}
      <ScrollView
        style={styles.reviewsContainer}
        contentContainerStyle={styles.reviewsContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {reviews?.map((review, index) => (
          <View
            key={`review-${index}`}
            style={[
              styles.reviewCard,
              {
                backgroundColor: getCardBackgroundColor(),
                borderLeftColor: getAccentColor(),
              },
            ]}
          >
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerInfo}>
                {review.reviewer.avatar ? (
                  <Image
                    source={{
                      uri: BACKEND_BASE_URL + review.reviewer.avatar,
                    }}
                    style={styles.reviewerAvatar}
                  />
                ) : (
                  <View style={styles.reviewerAvatarPlaceholder}>
                    <LinearGradient
                      colors={
                        isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.reviewerAvatarGradient}
                    >
                      <Text style={styles.reviewerInitials}>
                        {review.reviewer.name
                          ? review.reviewer.name.slice(0, 2).toUpperCase()
                          : ""}
                      </Text>
                    </LinearGradient>
                  </View>
                )}
                <View style={styles.reviewerTextInfo}>
                  <Text
                    style={[styles.reviewerName, { color: getTextColor() }]}
                    numberOfLines={1}
                  >
                    {review.reviewer.name}
                  </Text>
                  <View style={styles.reviewMeta}>
                    <Text
                      style={[
                        styles.partyType,
                        { color: getSecondaryTextColor() },
                      ]}
                      numberOfLines={1}
                    >
                      {review.partyTitle}
                    </Text>
                    <Text
                      style={[
                        styles.reviewDate,
                        { color: getSecondaryTextColor() },
                      ]}
                    >
                      <Translate>{formatDate(review.createdAt)}</Translate>
                    </Text>
                  </View>
                </View>
              </View>
              <Rating value={review.rate} size={14} showValue={false} />
            </View>

            <Text style={[styles.reviewText, { color: getTextColor() }]}>
              <Translate>{review.description}</Translate>
            </Text>

            <View
              style={[
                styles.partyTypeTag,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(55, 65, 81, 0.5)"
                    : "rgba(230, 234, 240, 0.8)",
                },
              ]}
            >
              <Text style={[styles.partyTypeText, { color: getAccentColor() }]}>
                {review.partyType.charAt(0).toUpperCase() +
                  review.partyType.slice(1)}
              </Text>
            </View>
          </View>
        ))}

        {reviews?.length === 0 && (
          <View style={styles.noReviewsContainer}>
            <FontAwesome5
              name="star"
              size={40}
              color={
                isDarkMode
                  ? "rgba(107, 114, 128, 0.5)"
                  : "rgba(209, 213, 219, 0.5)"
              }
            />
            <Text
              style={[styles.noReviewsText, { color: getSecondaryTextColor() }]}
            >
              <Translate>No reviews yet</Translate>
            </Text>
            <Text
              style={[
                styles.noReviewsSubtext,
                { color: getSecondaryTextColor() },
              ]}
            >
              <Translate>
                Reviews will appear here after you complete events with other
                members
              </Translate>
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: SPACING.M,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.SMALL,
  },
  reviewsHeaderContainer: {
    paddingHorizontal: SPACING.M,
    paddingBottom: SPACING.M,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(55, 65, 81, 0.2)",
  },
  reviewsTitle: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONTS.BOLD,
    marginBottom: SPACING.S,
  },
  reviewsSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
    marginRight: SPACING.XS,
  },
  totalReviews: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    marginLeft: SPACING.XS,
  },
  reviewsContainer: {
    flex: 1,
  },
  reviewsContentContainer: {
    padding: SPACING.M,
    paddingBottom: SPACING.XXL,
  },
  reviewCard: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginBottom: SPACING.M,
    borderLeftWidth: 4,
    ...SHADOWS.SMALL,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.S,
  },
  reviewerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.CIRCLE,
  },
  reviewerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.CIRCLE,
    overflow: "hidden",
  },
  reviewerAvatarGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerInitials: {
    color: COLORS.WHITE,
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  reviewerTextInfo: {
    flex: 1,
    marginLeft: SPACING.S,
  },
  reviewerName: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.SEMIBOLD,
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  partyType: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
    flex: 1,
  },
  reviewDate: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  reviewText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    lineHeight: 20,
    marginBottom: SPACING.S,
  },
  partyTypeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS / 2,
    borderRadius: BORDER_RADIUS.M,
  },
  partyTypeText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  noReviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.XXL,
  },
  noReviewsText: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
    marginTop: SPACING.M,
    marginBottom: SPACING.XS,
  },
  noReviewsSubtext: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    paddingHorizontal: SPACING.L,
  },
});

export default ReviewsScreen;
