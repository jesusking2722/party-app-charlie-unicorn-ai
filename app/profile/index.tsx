import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Import your components, types, and constants
import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { BACKEND_BASE_URL } from "@/constant";
import { Review, User } from "@/types/data";
import { useTheme } from "@/contexts/ThemeContext";
import Rating from "@/components/common/Rating";
import { Button, Translate } from "@/components/common";
import { formatDate } from "@/utils/date";
import { fetchUserById } from "@/lib/scripts/user.scripts";
import { ProfileBadge } from "@/components/molecules";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import CountryFlag from "react-native-country-flag";
import { updateAuthUser } from "@/lib/scripts/auth.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { useToast } from "@/contexts/ToastContext";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const ProfileScreen = () => {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const { isDarkMode } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const { user: me } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  useEffect(() => {
    console.log(userId);
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetchUserById(userId as string);

      if (response.ok) {
        const { user } = response.data;
        setUser(user);
      }
    } catch (err) {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  const handleContact = async () => {
    if (!user || !me) return;

    if (me.contacts.some((c) => c._id === userId)) {
      router.push({
        pathname: "/chat",
        params: { contactId: userId },
      });
      return;
    }

    try {
      setContactLoading(true);

      const updatingUser: User = {
        ...me,
        contacts: [...user.contacts, user],
      };

      const response = await updateAuthUser(updatingUser);

      if (response.ok) {
        const { user: updatedUser } = response.data;
        await dispatch(setAuthUserAsync(updatedUser)).unwrap();
        router.push({
          pathname: "/chat",
          params: { contactId: userId },
        });
        return;
      }
    } catch (error) {
      console.error("handle chat with applicant error: ", error);
      showToast("Something went wrong", "error");
    } finally {
      setContactLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleViewAllReviews = () => {
    setShowAllReviews(true);
  };

  // Helper function to get text color based on theme
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Helper function to get secondary text color based on theme
  const getSecondaryTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_SECONDARY : COLORS.LIGHT_TEXT_SECONDARY;

  // Helper function to get background color based on theme
  const getBackgroundColor = () =>
    isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG;

  // Helper function to get card background color based on theme
  const getCardBackgroundColor = () =>
    isDarkMode ? "rgba(40, 45, 55, 0.8)" : "rgba(255, 255, 255, 0.8)";

  // Calculate average rating
  const calculateAvgRating = (reviews: Review[] | null) => {
    if (!reviews || reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length
    );
  };

  // Render verification badges
  const renderVerificationBadges = (user: User) => {
    return (
      <View style={styles.badgesContainer}>
        {user.emailVerified && (
          <View
            style={[
              styles.badge,
              { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
            ]}
          >
            <FontAwesome
              name="envelope"
              size={12}
              color="#10B981"
              style={styles.badgeIcon}
            />
            <Text style={[styles.badgeText, { color: getTextColor() }]}>
              <Translate>Email</Translate>
            </Text>
          </View>
        )}
        {user.phoneVerified && (
          <View
            style={[
              styles.badge,
              { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
            ]}
          >
            <FontAwesome
              name="phone"
              size={12}
              color="#10B981"
              style={styles.badgeIcon}
            />
            <Text style={[styles.badgeText, { color: getTextColor() }]}>
              <Translate>Phone</Translate>
            </Text>
          </View>
        )}
        {user.paymentVerified && (
          <View
            style={[
              styles.badge,
              { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
            ]}
          >
            <FontAwesome
              name="credit-card"
              size={12}
              color="#10B981"
              style={styles.badgeIcon}
            />
            <Text style={[styles.badgeText, { color: getTextColor() }]}>
              <Translate>Payment</Translate>
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render a single review card
  const renderReviewCard = (review: Review, index: number) => {
    return (
      <View
        key={`review-${index}`}
        style={[
          styles.reviewCard,
          {
            backgroundColor: getCardBackgroundColor(),
            borderLeftColor: isDarkMode ? COLORS.SECONDARY : "#FF0099",
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
                  style={[styles.partyType, { color: getSecondaryTextColor() }]}
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
                  <Translate>{formatDate(review.createdAt)}</Translate>о
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
          <Text
            style={[
              styles.partyTypeText,
              { color: isDarkMode ? COLORS.SECONDARY : "#FF0099" },
            ]}
          >
            <Translate>
              {review.partyType.charAt(0).toUpperCase() +
                review.partyType.slice(1)}
            </Translate>
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? COLORS.SECONDARY : "#FF0099"}
        />
        <Text style={[styles.loadingText, { color: getTextColor() }]}>
          <Translate>Loading profile...</Translate>
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={[
          styles.errorContainer,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <FontAwesome5
          name="exclamation-circle"
          size={60}
          color={COLORS.ERROR}
        />
        <Text style={[styles.errorText, { color: getTextColor() }]}>
          <Translate>{error || "User not found"}</Translate>
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>
            <Translate>Retry</Translate>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>
            <Translate>Go Back</Translate>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const avgRating = calculateAvgRating(user.reviews);
  const reviewsToShow = showAllReviews
    ? user.reviews
    : user.reviews?.slice(0, 2);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButtonCircle,
            {
              backgroundColor: isDarkMode
                ? "rgba(31, 41, 55, 0.7)"
                : "rgba(240, 240, 240, 0.9)",
            },
          ]}
          onPress={handleBackPress}
        >
          <Feather name="arrow-left" size={22} color={getTextColor()} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner and Avatar Section */}
        <View style={styles.bannerContainer}>
          {user.banner ? (
            <Image
              source={{ uri: BACKEND_BASE_URL + user.banner }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={
                isDarkMode ? ["#1F2937", "#111827"] : ["#F9FAFB", "#E5E7EB"]
              }
              style={styles.bannerImage}
            />
          )}

          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
            style={styles.bannerGradient}
          />

          <View style={styles.profileInfoContainer}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image
                  source={{ uri: BACKEND_BASE_URL + user.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <LinearGradient
                  colors={
                    isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                  }
                  style={styles.avatarImage}
                >
                  <Text style={styles.avatarText}>
                    {user.name ? user.name.slice(0, 2).toUpperCase() : ""}
                  </Text>
                </LinearGradient>
              )}
              {/* {user.status === "online" && (
                <View style={styles.statusIndicator} />
              )} */}
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>{user.name}</Text>
              <Text style={styles.titleText}>{user.title}</Text>

              <View style={styles.locationContainer}>
                <Feather
                  name="map-pin"
                  size={14}
                  color="#E5E7EB"
                  style={styles.locationIcon}
                />
                <CountryFlag
                  isoCode={user.country?.toLowerCase() ?? "us"}
                  size={10}
                />
                <Text style={[styles.locationText, { marginLeft: 5 }]}>
                  {[user.region, user.country].filter(Boolean).join(", ")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: getCardBackgroundColor() },
              ]}
            >
              <Text style={[styles.statValue, { color: getTextColor() }]}>
                {user.totalCompleted || 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: getSecondaryTextColor() }]}
              >
                <Translate>Completed</Translate>
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: getCardBackgroundColor() },
              ]}
            >
              <Text style={[styles.statValue, { color: getTextColor() }]}>
                {avgRating.toFixed(1)}
              </Text>
              <Text
                style={[styles.statLabel, { color: getSecondaryTextColor() }]}
              >
                <Translate>Rating</Translate>
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: getCardBackgroundColor() },
              ]}
            >
              <Text
                style={[
                  {
                    color: isDarkMode ? "white" : "black",
                    fontSize: FONT_SIZES.M,
                    fontWeight: "bold",
                    marginBottom: 10,
                  },
                ]}
              >
                <Translate>
                  {formatDate(user?.createdAt ?? new Date())}
                </Translate>
              </Text>
              <Text
                style={[styles.statLabel, { color: getSecondaryTextColor() }]}
              >
                <Translate>Member Since</Translate>
              </Text>
            </View>
          </View>

          {/* Membership Badge */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            {user.kycVerified && <ProfileBadge type="verified" />}

            {/* Membership Badge */}
            {user.membership === "premium" && <ProfileBadge type="premium" />}
          </View>

          {/* Verification Badges */}
          {renderVerificationBadges(user)}

          {/* About Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: getTextColor() }]}>
              <Translate>About</Translate>
            </Text>
            <Text
              style={[styles.aboutText, { color: getSecondaryTextColor() }]}
            >
              {user.about}
            </Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderWithCount}>
              <Text style={[styles.sectionTitle, { color: getTextColor() }]}>
                <Translate>Reviews</Translate>
              </Text>
              <View style={styles.reviewsCount}>
                <Text style={[styles.reviewsCountText, { color: "white" }]}>
                  {user.reviews?.length || 0}
                </Text>
              </View>
            </View>

            {user.reviews && user.reviews.length > 0 ? (
              <>
                <View style={styles.ratingSummary}>
                  <Text style={[styles.ratingValue, { color: getTextColor() }]}>
                    {avgRating.toFixed(1)}
                  </Text>
                  <Rating value={avgRating} size={20} showValue={false} />
                </View>

                {/* Review Cards */}
                {reviewsToShow?.map((review, index) =>
                  renderReviewCard(review, index)
                )}

                {/* View More Button */}
                {!showAllReviews && user.reviews && user.reviews.length > 2 && (
                  <TouchableOpacity
                    style={[
                      styles.viewMoreButton,
                      {
                        borderColor: isDarkMode
                          ? "rgba(75, 85, 99, 0.5)"
                          : "rgba(209, 213, 219, 0.5)",
                      },
                    ]}
                    onPress={handleViewAllReviews}
                  >
                    <Text
                      style={[styles.viewMoreText, { color: getTextColor() }]}
                    >
                      <Translate>View All Reviews</Translate> (
                      {user.reviews.length})
                    </Text>
                    <Feather
                      name="chevron-down"
                      size={16}
                      color={getTextColor()}
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : (
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
                  style={[
                    styles.noReviewsText,
                    { color: getSecondaryTextColor() },
                  ]}
                >
                  <Translate>No reviews yet</Translate>
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Contact Button */}
      {me?.membership === "premium" && me._id !== user._id && (
        <View style={styles.contactButtonContainer}>
          <Button
            title={contactLoading ? "Connecting..." : "Contact"}
            variant={isDarkMode ? "primary" : "secondary"}
            onPress={handleContact}
            loading={contactLoading}
            icon={
              !contactLoading && (
                <Feather
                  name="message-circle"
                  size={18}
                  color="white"
                  style={{ marginRight: SPACING.XS }}
                />
              )
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.M,
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.MEDIUM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.L,
  },
  errorText: {
    marginTop: SPACING.M,
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.MEDIUM,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SPACING.L,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.L,
    paddingVertical: SPACING.M,
    borderRadius: BORDER_RADIUS.M,
  },
  retryButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.SEMIBOLD,
  },
  backButton: {
    marginTop: SPACING.M,
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.S,
  },
  backButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.M,
    height: 60,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.SMALL,
  },
  headerRight: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.S,
    ...SHADOWS.SMALL,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: SPACING.XXL + 50, // Extra padding for contact button
  },
  bannerContainer: {
    height: SCREEN_HEIGHT * 0.3,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  profileInfoContainer: {
    position: "absolute",
    bottom: SPACING.M,
    left: SPACING.M,
    right: SPACING.M,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.CIRCLE,
    borderWidth: 3,
    borderColor: COLORS.WHITE,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
  },
  //   statusIndicator: {
  //     position: "absolute",
  //     right: 5,
  //     bottom: 5,
  //     width: 15,
  //     height: 15,
  //     borderRadius: BORDER_RADIUS.CIRCLE,
  //     backgroundColor: "#10B981", // Green color for online status
  //     borderWidth: 2,
  //     borderColor: COLORS.WHITE,
  //   },
  nameContainer: {
    flex: 1,
    marginLeft: SPACING.M,
  },
  nameText: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONTS.BOLD,
    color: COLORS.WHITE,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titleText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.WHITE,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.XS,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
    color: COLORS.WHITE,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainContent: {
    paddingHorizontal: SPACING.M,
    paddingTop: SPACING.M,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.M,
  },
  statCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.M,
    padding: SPACING.M,
    alignItems: "center",
    ...SHADOWS.SMALL,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  membershipContainer: {
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.L,
    ...SHADOWS.SMALL,
  },
  membershipIcon: {
    marginRight: SPACING.XS,
  },
  membershipText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    color: COLORS.WHITE,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.M,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS / 2,
    borderRadius: BORDER_RADIUS.M,
    marginRight: SPACING.XS,
    marginBottom: SPACING.XS,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  sectionContainer: {
    marginBottom: SPACING.L,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.BOLD,
  },
  sectionHeaderWithCount: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  reviewsCount: {
    backgroundColor: "#FF0099",
    borderRadius: BORDER_RADIUS.CIRCLE,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.XS,
  },
  reviewsCountText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.BOLD,
    color: COLORS.WHITE,
  },
  aboutText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    lineHeight: 22,
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  ratingValue: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONTS.BOLD,
    marginRight: SPACING.S,
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
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.M,
    borderTopWidth: 1,
  },
  viewMoreText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
    marginRight: SPACING.XS,
  },
  noReviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.L,
  },
  noReviewsText: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
    marginTop: SPACING.M,
  },
  contactButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.M,
    backgroundColor: "transparent",
  },
});

export default ProfileScreen;
