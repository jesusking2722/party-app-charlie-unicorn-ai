import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  EVENT_PREVIEW,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Slider, StatusBadge, Tabs, Textarea } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";

import { CountdownProgress, Rating } from "@/components/common";
import { EventStepper, ProfileBadge } from "@/components/molecules";
import { BACKEND_BASE_URL } from "@/constant";
import { RootState } from "@/redux/store";
import { Party, PartyType } from "@/types/data";
import { useLocalSearchParams } from "expo-router";
import CountryFlag from "react-native-country-flag";
import { useSelector } from "react-redux";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Format days left
const formatDaysLeft = (date: Date | string) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDaysAgo = (date: Date | string) => {
  const now = new Date();
  const diffTime = Math.abs(new Date(date).getTime() - now.getTime());
  if (diffTime <= 0) {
    return 0;
  }
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Main component
const EventDetailScreen = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "DARK" : "LIGHT";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState(0);
  const [applicationText, setApplicationText] = useState("");
  const [event, setEvent] = useState<Party | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [eventSteps, setEventSteps] = useState<any[]>([
    {
      icon: "calendar-check",
      label: "Opening",
      completed: true,
    },
    {
      icon: "users",
      label: "Accepted",
      completed: false,
    },
    {
      icon: "calendar-alt",
      label: "Playing",
      completed: false,
    },
    {
      icon: "glass-cheers",
      label: "Finished",
      completed: false,
    },
  ]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [alreadyApplied, setAlreadyApplied] = useState<boolean>(false);

  const scrollViewRef = useRef<any>(null);

  const { id: eventId } = useLocalSearchParams();

  const { user } = useSelector((state: RootState) => state.auth);
  const { parties } = useSelector((state: RootState) => state.party);

  useEffect(() => {
    if (eventId && typeof eventId === "string" && user) {
      const found = parties.find((event) => event._id === eventId);
      if (found) {
        setEvent(found);

        setAlreadyApplied(
          found.applicants.some((app) => app.applier._id === user._id)
        );

        const dl = formatDaysLeft(found.openingAt);
        setDaysLeft(dl);

        let steps = eventSteps;

        if (found.status === "playing") {
          steps = steps.map((step, index) =>
            index < 3 ? { ...step, completed: true } : step
          );
          setActiveStep(3);
          return;
        }

        if (
          found.applicants.some(
            (app) => app.applier._id === user._id && app.status === "accepted"
          )
        ) {
          steps = steps.map((step, index) =>
            index < 2 ? { ...step, completed: true } : step
          );
          setActiveStep(2);
        }
      }
    }
  }, [eventId]);

  // Handle apply button press
  const handleApplyPress = () => {
    scrollViewRef.current?.scrollTo({
      y: height * 0.8,
      animated: true,
    });
  };

  // Format days left
  const daysPercentage = Math.min(100, Math.max(0, (daysLeft / 30) * 100));

  // Animation for particle effects
  const particles = Array(6)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.35)).current,
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
        // Button animation
        Animated.sequence([
          Animated.delay(animationDelay),
          Animated.spring(buttonScale, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
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

  // Render floating particles
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

  // Helper function to get accent color
  const getAccentColor = () => (isDarkMode ? COLORS.SECONDARY : "#FF0099");

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Slider Section (Top 40%) */}
        <View style={styles.sliderContainer}>
          <Slider images={event?.medias} />

          {/* Add floating particles for effect */}
          {renderParticles()}
        </View>

        {/* Bottom Content Section */}
        <View style={styles.bottomHalf}>
          <LinearGradient
            colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
            style={styles.bottomGradient}
          />

          {/* Main Content Card */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                transform: [{ translateY }, { scale: cardScale }],
                opacity: fadeAnim,
                backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG,
              },
            ]}
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
              {/* Event Header with Title and Action Buttons */}
              <View style={styles.eventHeader}>
                <View style={styles.titleContainer}>
                  <Text
                    style={[
                      styles.eventTitle,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    {event?.title}
                  </Text>

                  {!alreadyApplied && event?.creator?._id !== user?._id && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleApplyPress}
                      >
                        <LinearGradient
                          colors={
                            isDarkMode
                              ? (EVENT_PREVIEW[theme].APPLY_BUTTON_BG as any)
                              : EVENT_PREVIEW[theme].APPLY_BUTTON_BG
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.actionButtonGradient}
                        >
                          <FontAwesome5
                            name="check-circle"
                            size={14}
                            color="#FFFFFF"
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Compact Creator Profile */}
                <TouchableOpacity style={styles.creatorCompact}>
                  {event?.creator?.avatar ? (
                    <Image
                      source={{
                        uri: BACKEND_BASE_URL + event?.creator?.avatar,
                      }}
                      style={styles.creatorAvatar}
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
                          styles.creatorAvatar,
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
                            ? event.creator.name.slice(0, 2).toUpperCase()
                            : ""}
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                  <View style={styles.creatorInfo}>
                    <View style={styles.creatorNameRow}>
                      <Text
                        style={[
                          styles.creatorName,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        {event?.creator?.name}
                      </Text>
                      {event?.creator?.kycVerified && (
                        <FontAwesome5
                          name="check-circle"
                          size={14}
                          color={
                            isDarkMode
                              ? EVENT_PREVIEW.DARK.VERIFIED_BADGE[0]
                              : EVENT_PREVIEW.LIGHT.VERIFIED_BADGE[0]
                          }
                          solid
                          style={styles.verifiedIcon}
                        />
                      )}
                    </View>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      <CountryFlag
                        isoCode={event?.creator?.country?.toLowerCase() ?? "us"}
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
                        {event?.creator?.region}, {event?.creator?.country}{" "}
                      </Text>
                    </View>
                  </View>

                  <FontAwesome5
                    name="chevron-right"
                    size={12}
                    color={
                      isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Event Description */}
              <View style={styles.descriptionContainer}>
                <Text
                  style={[
                    styles.description,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  {event?.description}
                </Text>
              </View>

              {/* Badge Row */}
              <View style={styles.badgeRow}>
                <StatusBadge type="payment" payment={event?.paidOption} />
                <StatusBadge
                  type="eventType"
                  eventType={event?.type as PartyType}
                  label={event?.type.toUpperCase()}
                />
                <StatusBadge
                  type="date"
                  label={`${formatDaysAgo(
                    event?.createdAt ?? new Date()
                  )}d ago`}
                />
              </View>

              {/* Countdown Progress Bar (only if days left > 0) */}
              {daysLeft > 0 ? (
                <View style={styles.countdownContainer}>
                  <View style={styles.countdownHeader}>
                    <Text
                      style={[
                        styles.countdownTitle,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      Time Remaining
                    </Text>
                    <Text
                      style={[
                        styles.countdownDays,
                        {
                          color: getAccentColor(),
                        },
                      ]}
                    >
                      {daysLeft} days left
                    </Text>
                  </View>

                  {/* Use the CountdownProgress component */}
                  <CountdownProgress
                    percentage={100 - daysPercentage}
                    animated={true}
                    height={8}
                  />
                </View>
              ) : (
                <View style={styles.countdownContainer}>
                  <View style={styles.countdownHeader}>
                    <Text
                      style={[
                        styles.countdownTitle,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      Time is over
                    </Text>
                  </View>

                  {/* Use the CountdownProgress component */}
                  <CountdownProgress
                    percentage={100}
                    animated={true}
                    height={8}
                  />
                </View>
              )}

              {/* Event Status Stepper */}
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Event Status
                </Text>
                <EventStepper steps={eventSteps} activeStep={activeStep} />
              </View>

              {/* Creator Profile (Expanded) */}
              <View style={styles.creatorProfileContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Creator Profile
                </Text>

                <View
                  style={[
                    styles.creatorProfileCard,
                    {
                      backgroundColor: isDarkMode
                        ? EVENT_PREVIEW.DARK.PROFILE_CARD_BG
                        : EVENT_PREVIEW.LIGHT.PROFILE_CARD_BG,
                      borderColor: isDarkMode
                        ? EVENT_PREVIEW.DARK.PROFILE_CARD_BORDER
                        : EVENT_PREVIEW.LIGHT.PROFILE_CARD_BORDER,
                    },
                  ]}
                >
                  <View style={styles.creatorProfileHeader}>
                    {event?.creator?.avatar ? (
                      <Image
                        source={{
                          uri: BACKEND_BASE_URL + event?.creator?.avatar,
                        }}
                        style={styles.creatorAvatar}
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
                            styles.creatorAvatar,
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
                              ? event.creator.name.slice(0, 2).toUpperCase()
                              : ""}
                          </Text>
                        </LinearGradient>
                      </View>
                    )}
                    <View style={styles.creatorProfileInfo}>
                      <View style={styles.creatorProfileNameRow}>
                        <Text
                          style={[
                            styles.creatorProfileName,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          {event?.creator?.name}
                        </Text>
                      </View>

                      <View style={styles.creatorBadgeRow}>
                        {event?.creator?.kycVerified && (
                          <ProfileBadge type="verified" />
                        )}
                        {event?.creator?.membership === "premium" && (
                          <ProfileBadge type="premium" />
                        )}
                      </View>

                      <View style={styles.creatorRatingRow}>
                        <Rating
                          value={event?.creator?.rate ?? 0}
                          size={16}
                          color={
                            isDarkMode
                              ? EVENT_PREVIEW.DARK.RATING_STAR_FILLED
                              : EVENT_PREVIEW.LIGHT.RATING_STAR_FILLED
                          }
                          emptyColor={
                            isDarkMode
                              ? EVENT_PREVIEW.DARK.RATING_STAR_EMPTY
                              : EVENT_PREVIEW.LIGHT.RATING_STAR_EMPTY
                          }
                        />
                        <Text
                          style={[
                            styles.ratingCount,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          ({event?.creator?.rate})
                        </Text>
                      </View>

                      <View style={styles.creatorLocationRow}>
                        <FontAwesome5
                          name="map-marker-alt"
                          size={14}
                          color={
                            isDarkMode
                              ? COLORS.DARK_TEXT_SECONDARY
                              : COLORS.LIGHT_TEXT_SECONDARY
                          }
                          style={styles.locationIcon}
                        />
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <CountryFlag
                            isoCode={event?.creator?.country ?? "us"}
                            size={10}
                          />
                          <Text
                            style={[
                              styles.creatorProfileLocation,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            {event?.creator?.region}, {event?.creator?.country}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Apply Section */}
              {!alreadyApplied && event?.creator?._id !== user?._id && (
                <View style={styles.applyContainer} id="apply-section">
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    Apply for Event
                  </Text>

                  <Textarea
                    label="Application Message"
                    placeholder="Introduce yourself and tell us why you want to attend this event..."
                    value={applicationText}
                    onChangeText={setApplicationText}
                    minHeight={120}
                    maxLength={500}
                    showCharCount
                  />

                  <Animated.View
                    style={[
                      styles.applyButtonContainer,
                      { transform: [{ scale: buttonScale }] },
                    ]}
                  >
                    <TouchableOpacity style={styles.applyButton}>
                      <LinearGradient
                        colors={
                          isDarkMode
                            ? (EVENT_PREVIEW.DARK.APPLY_BUTTON_BG as any)
                            : EVENT_PREVIEW.LIGHT.APPLY_BUTTON_BG
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.applyButtonGradient}
                      >
                        <Text style={styles.applyButtonText}>
                          Submit Application
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}

              {/* Applications Section with Tabs */}

              <View style={styles.applicationsContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  Applications
                </Text>

                {/* Use the Tabs component */}
                <Tabs
                  tabs={["Pending", "Accepted", "Declined"]}
                  activeIndex={activeTab}
                  onTabPress={setActiveTab}
                  badgeCounts={[5, 3, 2]} // Example badge counts
                />

                {/* This is just a placeholder. You'll implement application groups later */}
                <View
                  style={[
                    styles.applicationsPlaceholder,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(31, 41, 55, 0.3)"
                        : "rgba(229, 231, 235, 0.3)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.placeholderText,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    Application list will be implemented later
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Decorative elements */}
      <View
        style={[
          styles.decorativeCircle1,
          {
            backgroundColor: isDarkMode
              ? "rgba(79, 70, 229, 0.1)"
              : "rgba(255, 0, 153, 0.08)",
          },
        ]}
      />
      <View
        style={[
          styles.decorativeCircle2,
          {
            backgroundColor: isDarkMode
              ? "rgba(124, 58, 237, 0.08)"
              : "rgba(255, 255, 255, 0.06)",
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // Header/Slider Section
  sliderContainer: {
    height: height * 0.4,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  videoIndicator: {
    position: "absolute",
    top: SPACING.M,
    right: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    zIndex: 10,
  },
  videoIndicatorGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.XS,
  },
  videoIndicatorText: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginLeft: SPACING.XS,
  },
  paginationContainer: {
    position: "absolute",
    bottom: SPACING.M,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  headerGradient: {
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  // Bottom half section
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
  // Main Card
  cardContainer: {
    position: "relative",
    top: -height * 0.1,
    marginHorizontal: width * 0.05,
    width: width * 0.9,
    zIndex: 10,
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  cardGradient: {
    width: "100%",
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
  },
  cardAccentBar: {
    height: 6,
    width: "100%",
  },
  cardContent: {
    padding: SPACING.M,
  },
  // Event Header
  eventHeader: {
    marginBottom: SPACING.M,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.S,
  },
  eventTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    flex: 1,
    marginRight: SPACING.S,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    marginLeft: SPACING.XS,
    ...SHADOWS.SMALL,
  },
  actionButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  creatorCompact: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.S,
    marginTop: SPACING.XS,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: SPACING.S,
  },
  creatorNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  creatorName: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
  },
  verifiedIcon: {
    marginLeft: SPACING.XS,
  },
  creatorLocation: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginTop: 2,
  },
  // Description
  descriptionContainer: {
    marginBottom: SPACING.M,
  },
  description: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    lineHeight: 22,
  },
  // Badge Row
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.M,
  },
  // Countdown
  countdownContainer: {
    marginBottom: SPACING.M,
  },
  countdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  countdownTitle: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  countdownDays: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.S,
  },
  // Status Section
  statusContainer: {
    marginBottom: SPACING.L,
  },
  sectionTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
    marginBottom: SPACING.S,
  },
  // Video Gallery
  videoGalleryContainer: {
    marginBottom: SPACING.L,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  viewAllButton: {
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.S,
  },
  viewAllText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  videoScrollContent: {
    paddingRight: SPACING.M,
  },
  videoThumbnailContainer: {
    width: width * 0.4,
    height: width * 0.25,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    marginRight: SPACING.S,
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoThumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  videoDuration: {
    position: "absolute",
    bottom: SPACING.XS,
    right: SPACING.XS,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.S,
  },
  videoDurationText: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  // Creator Profile (Expanded)
  creatorProfileContainer: {
    marginBottom: SPACING.L,
  },
  creatorProfileCard: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    borderWidth: 1,
  },
  creatorProfileHeader: {
    flexDirection: "row",
  },
  creatorProfileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  creatorProfileInfo: {
    flex: 1,
    marginLeft: SPACING.M,
  },
  creatorProfileNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  creatorProfileName: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.M,
  },
  creatorBadgeRow: {
    flexDirection: "row",
    marginTop: SPACING.XS,
  },
  creatorRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.S,
  },
  creatorLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.XS,
  },
  creatorProfileLocation: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
  },
  locationIcon: {
    marginRight: SPACING.XS,
  },
  ratingCount: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginLeft: SPACING.XS,
  },
  // Apply Section
  applyContainer: {
    marginBottom: SPACING.L,
  },
  applyButtonContainer: {
    width: "100%",
    marginTop: SPACING.S,
  },
  applyButton: {
    width: "100%",
    height: 50,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  applyButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
  },
  // Applications Section
  applicationsContainer: {
    marginBottom: SPACING.L,
  },
  applicationsPlaceholder: {
    height: 100,
    borderRadius: BORDER_RADIUS.M,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    top: -width * 0.3,
    right: -width * 0.25,
    zIndex: 0,
  },
  decorativeCircle2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    bottom: -width * 0.2,
    left: -width * 0.2,
    zIndex: 0,
  },
});

export default EventDetailScreen;
