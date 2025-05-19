import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { FontAwesome5 } from "@expo/vector-icons";

// Import your theme and components
import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
  THEME,
} from "@/app/theme";
import { Button, Rating } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import { Party } from "@/types/data";
import { router, useLocalSearchParams } from "expo-router";
import { BACKEND_BASE_URL } from "@/constant";
import CountryFlag from "react-native-country-flag";
import socket from "@/lib/socketInstance";
import { updateSelectedPartyAsnyc } from "@/redux/actions/party.actions";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Sample user profile image
const userProfileImage = require("@/assets/images/review-exchange.png");

const ReviewExchangeScreen = () => {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();

  const {
    eventId,
    applicantId,
    reviewType: paramReviewType,
  } = useLocalSearchParams();

  // State for animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  const [rating, setRating] = useState(4.5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  const [reviewType, setReviewType] = useState<"applier" | "owner">("applier");
  const [event, setEvent] = useState<Party | null>(null);
  const [myApplicantId, setMyApplicantId] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { parties } = useSelector((state: RootState) => state.party);
  const dispatch = useAppDispatch();

  // Particle animations for the background (same as your ProfileSetupScreen)
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

  useEffect(() => {
    if (eventId && paramReviewType && applicantId) {
      const foundEvent = parties.find((party) => party._id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setReviewType(paramReviewType === "applier" ? "applier" : "owner");
        setMyApplicantId(applicantId as string);
      }
    }
  }, [eventId, applicantId, paramReviewType]);

  // Continuous animation for floating particles (same as your ProfileSetupScreen)
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

  // Render particles (same as your ProfileSetupScreen)
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

  // Helper function to get accent color based on theme
  const getAccentColor = () => (isDarkMode ? COLORS.SECONDARY : "#FF0099"); // Light theme accent

  const submitReview = async (
    userId: string,
    event: Party,
    review: string,
    rate: number,
    applicantId: string
  ): Promise<Party> => {
    return new Promise((resolve) => {
      socket.once("responsed:party-finish-approved", (updatedEvent: Party) => {
        resolve(updatedEvent);
      });
      socket.emit(
        "response:party-finish-approve",
        userId,
        event.creator?._id,
        review,
        rate,
        event,
        applicantId
      );
    });
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (reviewText.trim().length === 0) {
      showToast("Please write a review before submitting", "error");
      return;
    }

    if (!event || !user?._id || !myApplicantId) return;

    const finishApproved = event.finishApproved.some(
      (approved) => approved._id === myApplicantId
    );
    if (finishApproved) {
      showToast("You have already approved", "error");
      return;
    }

    setLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 200,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();

    const updatedEvent = await submitReview(
      user._id,
      event,
      reviewText,
      rating,
      myApplicantId
    );

    if (updatedEvent) {
      setEvent(updatedEvent);
      await dispatch(updateSelectedPartyAsnyc(updatedEvent)).unwrap();
      showToast("Review submitted successfully", "success");
      setReviewText("");
      setRating(4.5);
      setLoading(false);
      router.back();
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Profile Image Section (Top Half) */}
          <View style={styles.profileImageContainer}>
            <Image
              source={userProfileImage}
              style={styles.profileImage}
              resizeMode="cover"
            />

            {/* Add floating particles for fun effect */}
            {renderParticles()}

            {/* Overlay gradient for readability */}
            <LinearGradient
              colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]}
              style={styles.imageOverlay}
            />
          </View>

          {/* Bottom Half with Animated Background */}
          <View style={styles.bottomHalf}>
            <LinearGradient
              colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
              style={styles.bottomGradient}
            />

            {/* Review Card */}
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
                        styles.titleText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      Review Exchange
                    </Text>

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
                      Share your experience with{" "}
                      {reviewType === "applier"
                        ? event?.creator?.name
                        : "your members"}
                    </Text>

                    {reviewType === "applier" && (
                      <View style={styles.profileInfoContainer}>
                        <View style={styles.profileImageSmallContainer}>
                          {event?.creator?.avatar ? (
                            <Image
                              source={{
                                uri: BACKEND_BASE_URL + event?.creator?.avatar,
                              }}
                              style={styles.profileImageSmall}
                              resizeMode="cover"
                            />
                          ) : (
                            <View>
                              <LinearGradient
                                colors={
                                  isDarkMode
                                    ? GRADIENTS.PRIMARY
                                    : ["#FF0099", "#FF6D00"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                  styles.profileImageSmall,
                                  {
                                    width: 50,
                                    height: 50,
                                    borderRadius: BORDER_RADIUS.CIRCLE,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  },
                                ]}
                              >
                                <Text
                                  style={{
                                    color: COLORS.WHITE,
                                    fontFamily: FONTS.SEMIBOLD,
                                    fontSize: FONT_SIZES.M,
                                  }}
                                >
                                  {event?.creator?.name
                                    ? event?.creator?.name
                                        .slice(0, 2)
                                        .toUpperCase()
                                    : ""}
                                </Text>
                              </LinearGradient>
                            </View>
                          )}

                          <Image
                            // source={}
                            style={styles.profileImageSmall}
                            resizeMode="cover"
                          />
                        </View>

                        <View style={styles.profileDetails}>
                          <Text
                            style={[
                              styles.profileName,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY,
                              },
                            ]}
                          >
                            {event?.creator?.name}
                          </Text>
                          <View style={styles.creatorLocationRow}>
                            <CountryFlag
                              isoCode={
                                event?.creator?.country?.toLowerCase() ?? "us"
                              }
                              size={10}
                            />
                            <Text
                              style={[
                                styles.creatorLocation,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY,
                                },
                              ]}
                            >
                              {event?.creator?.region},{" "}
                              {event?.creator?.country}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.eventTypeContainer}>
                          <LinearGradient
                            colors={
                              isDarkMode
                                ? (THEME.DARK.BIRTHDAY_GRADIENT as any)
                                : THEME.LIGHT.BIRTHDAY_GRADIENT
                            }
                            style={styles.eventTypeBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            <Text style={styles.eventTypeText}>
                              {event?.type.toUpperCase()}
                            </Text>
                          </LinearGradient>
                        </View>
                      </View>
                    )}

                    {/* Rating section */}
                    <View style={styles.ratingSection}>
                      <Text
                        style={[
                          styles.ratingLabel,
                          {
                            color: getAccentColor(),
                          },
                        ]}
                      >
                        YOUR RATING
                      </Text>

                      <View style={styles.ratingStarsContainer}>
                        <Rating
                          value={rating}
                          onChange={setRating}
                          editable={true}
                          maxValue={5}
                          size={36}
                          showValue={true}
                        />
                      </View>
                    </View>

                    {/* Review text area */}
                    <View style={styles.reviewTextContainer}>
                      <Text
                        style={[
                          styles.reviewLabel,
                          {
                            color: getAccentColor(),
                          },
                        ]}
                      >
                        YOUR REVIEW
                      </Text>

                      <View
                        style={[
                          styles.textAreaContainer,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(31, 41, 55, 0.7)"
                              : "rgba(255, 255, 255, 0.8)",
                            borderColor: isDarkMode
                              ? "rgba(75, 85, 99, 0.3)"
                              : "rgba(0, 0, 0, 0.05)",
                          },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.textArea,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                          placeholder="Share details of your experience..."
                          placeholderTextColor={
                            isDarkMode
                              ? "rgba(255, 255, 255, 0.4)"
                              : "rgba(0, 0, 0, 0.3)"
                          }
                          multiline={true}
                          numberOfLines={5}
                          textAlignVertical="top"
                          value={reviewText}
                          onChangeText={setReviewText}
                        />
                      </View>
                    </View>

                    {/* Tips for review */}
                    <View style={styles.tipsContainer}>
                      <Text
                        style={[
                          styles.tipsTitle,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY,
                          },
                        ]}
                      >
                        Tips for a helpful review:
                      </Text>

                      <View style={styles.tipsList}>
                        <View style={styles.tipItem}>
                          <FontAwesome5
                            name="check-circle"
                            size={12}
                            color={getAccentColor()}
                            style={styles.tipIcon}
                          />
                          <Text
                            style={[
                              styles.tipText,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            Share specific details about the service
                          </Text>
                        </View>

                        <View style={styles.tipItem}>
                          <FontAwesome5
                            name="check-circle"
                            size={12}
                            color={getAccentColor()}
                            style={styles.tipIcon}
                          />
                          <Text
                            style={[
                              styles.tipText,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            Mention if expectations were met
                          </Text>
                        </View>

                        <View style={styles.tipItem}>
                          <FontAwesome5
                            name="check-circle"
                            size={12}
                            color={getAccentColor()}
                            style={styles.tipIcon}
                          />
                          <Text
                            style={[
                              styles.tipText,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            Be honest, helpful and constructive
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Submit Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.M,
                      }}
                    >
                      <Button
                        title={loading ? "Submitting..." : "Submit Review"}
                        onPress={handleSubmitReview}
                        loading={loading}
                        variant={isDarkMode ? "primary" : "secondary"}
                        small={false}
                        icon={
                          !loading && (
                            <FontAwesome5
                              name="paper-plane"
                              size={14}
                              color="white"
                              style={{ marginLeft: SPACING.S }}
                            />
                          )
                        }
                        iconPosition="right"
                      />
                    </Animated.View>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  creatorLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  creatorLocation: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginLeft: 4,
  },
  profileImageContainer: {
    height: height * 0.35,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  profileImage: {
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
    padding: SPACING.L,
  },
  titleText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  profileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.M,
    paddingVertical: SPACING.M,
    paddingHorizontal: SPACING.M,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: BORDER_RADIUS.L,
  },
  profileImageSmallContainer: {
    position: "relative",
    width: 50,
    height: 50,
    marginRight: SPACING.M,
  },
  profileImageSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  verifiedBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  verifiedBadgeGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
    marginBottom: SPACING.XS,
  },
  profileLocation: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  eventTypeContainer: {
    marginLeft: SPACING.XS,
  },
  eventTypeBadge: {
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.M,
  },
  eventTypeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    color: COLORS.WHITE,
  },
  ratingSection: {
    marginTop: SPACING.M,
    marginBottom: SPACING.M,
  },
  ratingLabel: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.S,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingStarsContainer: {
    alignItems: "center",
    marginVertical: SPACING.S,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    padding: SPACING.XS,
  },
  star: {
    marginRight: 2,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.S,
  },
  valueText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginRight: 4,
  },
  reviewsText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  reviewTextContainer: {
    marginBottom: SPACING.M,
  },
  reviewLabel: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.S,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.S,
    minHeight: 120,
  },
  textArea: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    height: 120,
    textAlignVertical: "top",
  },
  tipsContainer: {
    marginBottom: SPACING.M,
    padding: SPACING.M,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: BORDER_RADIUS.L,
  },
  tipsTitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginBottom: SPACING.S,
  },
  tipsList: {
    marginTop: SPACING.XS,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  tipIcon: {
    marginRight: SPACING.S,
  },
  tipText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    zIndex: 100,
  },
});

export default ReviewExchangeScreen;
