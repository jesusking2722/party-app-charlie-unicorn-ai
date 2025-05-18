import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
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
import {
  Button,
  CountdownProgress,
  Rating,
  Slider,
  Tabs,
  Textarea,
} from "@/components/common";
import {
  ApplicantGroup,
  EventStepper,
  ProfileBadge,
} from "@/components/molecules";
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import socket from "@/lib/socketInstance";
import { addNewApplicantToSelectedPartyAsync } from "@/redux/actions/party.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import { Applicant, Party, PartyType } from "@/types/data";
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

// Main component
const EventDetailScreen = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "DARK" : "LIGHT";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;

  // Parallax effect for the slider
  const scrollY = useRef(new Animated.Value(0)).current;
  const sliderParallax = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [50, 0, -30],
    extrapolate: "clamp",
  });

  // Main states
  const [activeTab, setActiveTab] = useState(0);
  const [applicationText, setApplicationText] = useState("");
  const [event, setEvent] = useState<Party | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [alreadyApplied, setAlreadyApplied] = useState<boolean>(false);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Event progress states
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

  // Applicant states
  const [pendingApplicants, setPendingApplicants] = useState<Applicant[]>([]);
  const [acceptedApplicants, setAcceptedApplicants] = useState<Applicant[]>([]);
  const [declinedApplicants, setDeclinedApplicants] = useState<Applicant[]>([]);

  // Refs
  const scrollViewRef = useRef<any>(null);
  const applyButtonRef = useRef<any>(null);

  // Redux data
  const { id: eventId } = useLocalSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const { parties } = useSelector((state: RootState) => state.party);
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  // Load event data
  useEffect(() => {
    if (eventId && typeof eventId === "string" && user) {
      const found = parties.find((event) => event._id === eventId);
      if (found) {
        setEvent(found);

        // Check if current user is the creator
        setIsCreator(found.creator?._id === user._id);

        // Check if user already applied
        setAlreadyApplied(
          found.applicants.some((app) => app.applier._id === user._id)
        );

        // Calculate days left
        const dl = formatDaysLeft(found.openingAt);
        setDaysLeft(dl);

        // Update event steps based on status
        let steps = [...eventSteps];
        let currentStep = 1;

        if (found.status === "finished") {
          steps = steps.map((step) => ({ ...step, completed: true }));
          currentStep = 4;
        } else if (found.status === "playing") {
          steps = steps.map((step, index) =>
            index < 3 ? { ...step, completed: true } : step
          );
          currentStep = 3;
        } else if (found.status === "accepted") {
          steps = steps.map((step, index) =>
            index < 2 ? { ...step, completed: true } : step
          );
          currentStep = 2;
        }

        setEventSteps(steps);
        setActiveStep(currentStep);

        // Filter applicants by status
        const pending = found.applicants.filter(
          (app) => app.status === "pending"
        );
        const accepted = found.applicants.filter(
          (app) => app.status === "accepted"
        );
        const declined = found.applicants.filter(
          (app) => app.status === "declined"
        );

        setPendingApplicants(pending);
        setAcceptedApplicants(accepted);
        setDeclinedApplicants(declined);
      }
    }
  }, [eventId, parties]);

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
        // Header fade in
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: ANIMATIONS.MEDIUM,
          useNativeDriver: true,
        }),
        // Header slide down
        Animated.spring(headerTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
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

  // Animation for particle effects
  const particles = Array(8)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.35)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.4 + 0.3)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.4 + 0.2)).current,
      speed: Math.random() * 3000 + 2000,
    }));

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

  // Handle apply button press
  const handleApplyPress = () => {
    // if (applyButtonRef.current) {
    //   scrollViewRef.current?.scrollToPosition(0, height * 0.85, true);
    // }
  };

  const submitNewApplicant = (
    applicant: Applicant,
    event: Party
  ): Promise<Applicant> => {
    return new Promise((resolve) => {
      socket.once("party:created", (newApplicant: Applicant) => {
        resolve(newApplicant);
      });

      socket.emit(
        "creating:applicant",
        applicant,
        event._id,
        event.creator?._id
      );
    });
  };

  // Handle submit application
  const handleSubmitApplication = async () => {
    if (!applicationText.trim() || !user || !event?._id) {
      return;
    }

    const hasAlreadyApplied = event?.applicants.some(
      (applicant) => applicant.applier._id === user._id
    );

    if (hasAlreadyApplied) {
      showToast("You have already applied to this event", "error");
      return;
    }

    setIsSubmitting(true);
    // Add to pending applicants
    const newApplicant: Applicant = {
      applier: user,
      applicant: applicationText,
      appliedAt: new Date(),
      status: "pending",
      stickers: [],
    };

    const sentApplicant = await submitNewApplicant(newApplicant, event);

    await dispatch(
      addNewApplicantToSelectedPartyAsync({
        partyId: event._id,
        newApplicant: sentApplicant,
      })
    ).unwrap();

    setPendingApplicants([...pendingApplicants, sentApplicant]);

    showToast("Applied successfully", "success");
  };

  // New handlers for ApplicantGroup actions
  const handleAcceptApplicant = (applicantId: string) => {
    // Find the applicant
    const applicant = pendingApplicants.find((app) => app._id === applicantId);
    if (!applicant) return;

    // Update state immediately for better UX
    setPendingApplicants(
      pendingApplicants.filter((app) => app._id !== applicantId)
    );
    setAcceptedApplicants([
      ...acceptedApplicants,
      { ...applicant, status: "accepted" },
    ]);

    // Dispatch action to update on server
    // dispatch(acceptApplicant(eventId, applicantId));

    // Show success toast
  };

  const handleDeclineApplicant = (applicantId: string) => {
    // Find the applicant
    const applicant = pendingApplicants.find((app) => app._id === applicantId);
    if (!applicant) return;

    // Update state immediately for better UX
    setPendingApplicants(
      pendingApplicants.filter((app) => app._id !== applicantId)
    );
    setDeclinedApplicants([
      ...declinedApplicants,
      { ...applicant, status: "declined" },
    ]);

    // Dispatch action to update on server
    // dispatch(declineApplicant(eventId, applicantId));

    // Show success toast
  };

  const handleChatWithApplicant = (userId: string) => {
    // Navigate to chat screen
    // router.push({
    //   pathname: "/chat",
    //   params: { userId },
    // });
  };

  const handleTicketExchange = (
    applicantId: string,
    ticketId: string,
    method: "crypto" | "card"
  ) => {
    // Handle ticket exchange logic
    // dispatch(exchangeTicket(eventId, applicantId, ticketId, method));
    // Show success toast and update UI
  };

  // Format days left percentage
  const daysPercentage = Math.min(100, Math.max(0, (daysLeft / 30) * 100));

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

  // Render the appropriate applicant group based on active tab
  const renderActiveApplicantGroup = useCallback(() => {
    switch (activeTab) {
      case 0:
        return (
          <ApplicantGroup
            applicants={pendingApplicants}
            onAccept={handleAcceptApplicant}
            onDecline={handleDeclineApplicant}
            onChat={handleChatWithApplicant}
            // onTicketExchange={handleTicketExchange}
            type="pending"
          />
        );
      case 1:
        return (
          <ApplicantGroup
            applicants={acceptedApplicants}
            onAccept={handleAcceptApplicant}
            onDecline={handleDeclineApplicant}
            onChat={handleChatWithApplicant}
            // onTicketExchange={handleTicketExchange}
            type="accepted"
          />
        );
      case 2:
        return (
          <ApplicantGroup
            applicants={declinedApplicants}
            onAccept={handleAcceptApplicant}
            onDecline={handleDeclineApplicant}
            onChat={handleChatWithApplicant}
            // onTicketExchange={handleTicketExchange}
            type="declined"
          />
        );
      default:
        return null;
    }
  }, [activeTab, pendingApplicants, acceptedApplicants, declinedApplicants]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Parallax Slider Section */}
        <Animated.View
          style={[
            styles.sliderContainer,
            {
              transform: [{ translateY: sliderParallax }],
            },
          ]}
        >
          <Slider images={event?.medias} />

          {/* Event Type Badge */}
          {event?.type && (
            <View style={styles.eventTypeBadgeContainer}>
              <LinearGradient
                colors={
                  isDarkMode
                    ? ["rgba(31, 41, 55, 0.85)", "rgba(31, 41, 55, 0.85)"]
                    : ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.85)"]
                }
                style={styles.eventTypeBadge}
              >
                <FontAwesome5
                  name={getEventTypeIcon(event.type)}
                  size={14}
                  color={getAccentColor()}
                  style={styles.eventTypeIcon}
                />
                <Text
                  style={[
                    styles.eventTypeText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.LIGHT_TEXT_PRIMARY,
                    },
                  ]}
                >
                  {capitalizeFirstLetter(event.type)}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Add floating particles for effect */}
          {renderParticles()}

          {/* Slider Overlay Gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
            style={styles.sliderOverlay}
          />
        </Animated.View>

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
                {/* Title and badge row */}
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

                  {event?.paidOption && (
                    <View style={styles.paidBadge}>
                      <LinearGradient
                        colors={
                          event.paidOption === "paid"
                            ? isDarkMode
                              ? ["#d97706", "#b45309"]
                              : ["#f59e0b", "#d97706"]
                            : isDarkMode
                            ? ["#059669", "#047857"]
                            : ["#10b981", "#059669"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.paidBadgeGradient}
                      >
                        <FontAwesome5
                          name={
                            event.paidOption === "paid"
                              ? "dollar-sign"
                              : "ticket-alt"
                          }
                          size={10}
                          color="#FFFFFF"
                        />
                        <Text style={styles.paidBadgeText}>
                          {event.paidOption === "paid" ? "Paid" : "Free"}
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                </View>

                {/* Quick action buttons */}
                {!alreadyApplied && !isCreator && (
                  <View style={styles.quickActionButtons}>
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
                        <Text style={styles.actionButtonText}>Apply Now</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

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
                        style={styles.creatorAvatarGradient}
                      >
                        <Text style={styles.creatorAvatarText}>
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
                    <View style={styles.creatorLocationRow}>
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

              {/* Event Information Section */}
              <View
                style={[
                  styles.infoSection,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(31, 41, 55, 0.5)"
                      : "rgba(243, 244, 246, 0.5)",
                  },
                ]}
              >
                ,
                <View style={styles.infoItem}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={16}
                    color={getAccentColor()}
                    style={styles.infoIcon}
                  />
                  <Text
                    style={[
                      styles.infoText,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    {event?.address}, {event?.region}, {event?.country}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <FontAwesome5
                    name="calendar-alt"
                    size={16}
                    color={getAccentColor()}
                    style={styles.infoIcon}
                  />
                  <Text
                    style={[
                      styles.infoText,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    {event?.openingAt
                      ? formatDate(event.openingAt)
                      : "Date not set"}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <FontAwesome5
                    name="users"
                    size={16}
                    color={getAccentColor()}
                    style={styles.infoIcon}
                  />
                  <Text
                    style={[
                      styles.infoText,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_SECONDARY
                          : COLORS.LIGHT_TEXT_SECONDARY,
                      },
                    ]}
                  >
                    {acceptedApplicants.length} participants,{" "}
                    {pendingApplicants.length} pending
                  </Text>
                </View>
              </View>

              {/* Event Description */}
              <View style={styles.descriptionContainer}>
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
                  About This Event
                </Text>
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
                        style={styles.creatorProfileAvatar}
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
                          style={styles.creatorProfileAvatarGradient}
                        >
                          <Text style={styles.creatorProfileAvatarText}>
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
                        <View style={styles.creatorProfileLocationWrapper}>
                          <CountryFlag
                            isoCode={
                              event?.creator?.country?.toLowerCase() ?? "us"
                            }
                            size={12}
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

                  {/* Chat with creator button */}
                  {!isCreator && event?.creator?._id && (
                    <View style={styles.chatWithCreatorContainer}>
                      <Button
                        title="Chat with Creator"
                        variant={isDarkMode ? "secondary" : "primary"}
                        icon={
                          <FontAwesome5
                            name="comment"
                            size={14}
                            color="#FFFFFF"
                          />
                        }
                        iconPosition="left"
                        small={true}
                        onPress={() => {
                          if (event.creator?._id) {
                            handleChatWithApplicant(event.creator._id);
                          }
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* Apply Section */}
              {!alreadyApplied && !isCreator && (
                <View style={styles.applyContainer} ref={applyButtonRef}>
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
                    <Button
                      title="Submit Application"
                      variant={isDarkMode ? "primary" : "secondary"}
                      loading={isSubmitting}
                      disabled={isSubmitting || !applicationText.trim()}
                      onPress={handleSubmitApplication}
                    />
                  </Animated.View>
                </View>
              )}

              {/* Applications Section with Tabs */}
              {(isCreator ||
                user?.membership === "premium" ||
                event?.status === "playing" ||
                event?.status === "finished") && (
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
                    badgeCounts={[
                      pendingApplicants.length,
                      acceptedApplicants.length,
                      declinedApplicants.length,
                    ]}
                  />

                  {/* Render the appropriate ApplicantGroup based on the active tab */}
                  <View style={styles.applicantGroupContainer}>
                    {renderActiveApplicantGroup()}
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </Animated.ScrollView>

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

// Helper functions
const formatDate = (date: Date | string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

const getEventTypeIcon = (type: PartyType): string => {
  switch (type) {
    case "birthday":
      return "birthday-cake";
    case "wedding":
      return "ring";
    case "corporate":
      return "briefcase";
    case "movie":
      return "film";
    case "sport":
      return "running";
    default:
      return "calendar-day";
  }
};

const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.XXL,
  },

  sliderContainer: {
    height: height * 0.35,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  sliderOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 2,
  },
  eventTypeBadgeContainer: {
    position: "absolute",
    top: SPACING.L,
    left: SPACING.M,
    zIndex: 10,
  },
  eventTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.L,
    ...SHADOWS.SMALL,
  },
  eventTypeIcon: {
    marginRight: SPACING.XS,
  },
  eventTypeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
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
    width: "100%",
    position: "relative",
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
    marginHorizontal: width * 0.05,
    width: width * 0.9,
    zIndex: 10,
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
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
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  eventTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    flex: 1,
    marginRight: SPACING.S,
  },
  paidBadge: {
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
  },
  paidBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: SPACING.XS,
  },
  paidBadgeText: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginLeft: 4,
  },
  quickActionButtons: {
    marginBottom: SPACING.S,
  },
  actionButton: {
    height: 40,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  actionButtonGradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.M,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginLeft: SPACING.XS,
  },
  creatorCompact: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.S,
    marginTop: SPACING.XS,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  creatorAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  creatorAvatarText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.S,
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
  creatorLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  verifiedIcon: {
    marginLeft: SPACING.XS,
  },
  creatorLocation: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginLeft: 4,
  },
  // Event Information Section
  infoSection: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginBottom: SPACING.M,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  infoIcon: {
    width: 24,
    alignItems: "center",
  },
  infoText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    flex: 1,
    marginLeft: SPACING.S,
  },
  // Description
  descriptionContainer: {
    marginBottom: SPACING.M,
  },
  sectionTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
    marginBottom: SPACING.S,
  },
  description: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    lineHeight: 22,
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
  creatorProfileAvatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  creatorProfileAvatarText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.M,
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
  creatorProfileLocationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  chatWithCreatorContainer: {
    marginTop: SPACING.M,
  },
  // Apply Section
  applyContainer: {
    marginBottom: SPACING.L,
  },
  applyButtonContainer: {
    width: "100%",
    marginTop: SPACING.S,
  },
  // Applications Section
  applicationsContainer: {
    marginBottom: SPACING.L,
  },
  applicantGroupContainer: {
    marginTop: SPACING.S,
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
