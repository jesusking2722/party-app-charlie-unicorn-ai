import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
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
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
  THEME,
} from "@/app/theme";
import {
  Button,
  CountryPicker,
  Dropdown,
  RegionPicker,
  Slider,
  StatusBadge,
} from "@/components/common";
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/redux/store";
import { Party, PartyType } from "@/types/data";
import { CountryType, RegionType } from "@/types/place";
import { formatTimeAgo } from "@/utils/date";
import { useSelector } from "react-redux";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

// Event type options - Updated to match the PartyType from types
const eventTypeOptions = [
  { label: "All Types", value: "all" },
  { label: "Birthday", value: "birthday" },
  { label: "Common", value: "common" },
  { label: "Wedding", value: "wedding" },
  { label: "Corporate", value: "corporate" },
  { label: "Movie", value: "movie" },
  { label: "Sports", value: "sport" },
];

// Filter options
const myEventOptions = [
  { label: "All Events", value: "all" },
  { label: "My Events", value: "my" },
];

// Payment options
const paymentOptions = [
  { label: "All Events", value: "all" },
  { label: "Free Entry", value: "free" },
  { label: "Paid Entry", value: "paid" },
];

const EventListScreen = () => {
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const filterHeight = useRef(new Animated.Value(0)).current;
  const filterOpacity = useRef(new Animated.Value(0)).current;

  // Animated background particles
  const particles = Array(8)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.35)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.4 + 0.3)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.4 + 0.2)).current,
      speed: Math.random() * 3000 + 2000,
    }));

  // Filter state
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [country, setCountry] = useState<CountryType | null>(null);
  const [region, setRegion] = useState<RegionType | null>(null);
  const [eventType, setEventType] = useState<any>({
    label: "All Types",
    value: "all",
  });
  const [myEvents, setMyEvents] = useState<any>({
    label: "All Events",
    value: "all",
  });
  const [paymentType, setPaymentType] = useState<any>({
    label: "All Events",
    value: "all",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [cardAnims, setCardAnims] = useState<any>([]);

  // Filtered and paginated events
  const [totalEvents, setTotalEvents] = useState<Party[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Party[]>([]);
  const [paginatedEvents, setPaginatedEvents] = useState<Party[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);
  const { parties } = useSelector((state: RootState) => state.party);

  // Effect for initial animation
  useEffect(() => {
    // Main UI animation
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

  // Animate cards when they appear
  const animateCards = () => {
    // Animate each card with a staggered delay
    paginatedEvents.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(index * 100), // Stagger the animations
        Animated.parallel([
          Animated.spring(cardAnims[index].scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnims[index].opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(cardAnims[index].translateY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  };

  // Reset card animations when events change
  useEffect(() => {
    // Reset animation values
    paginatedEvents.forEach((_, index) => {
      cardAnims[index].scale.setValue(0.95);
      cardAnims[index].opacity.setValue(0);
      cardAnims[index].translateY.setValue(20);
    });

    // Start animations after a short delay
    setTimeout(animateCards, 100);
  }, [paginatedEvents]);

  // Effect for filter animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(filterHeight, {
        toValue: isFilterExpanded ? 450 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(filterOpacity, {
        toValue: isFilterExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFilterExpanded]);

  // Effect for filter and pagination
  useEffect(() => {
    applyFilters();
  }, [country, region, eventType, myEvents, paymentType]);

  useEffect(() => {
    setTotalEvents(parties);
    const newCardAnims = parties.map(() => ({
      scale: new Animated.Value(0.95),
      translateY: new Animated.Value(20),
      opacity: new Animated.Value(0),
    }));
    setCardAnims(newCardAnims);
  }, [parties]);

  useEffect(() => {
    setFilteredEvents(totalEvents);
  }, [totalEvents]);

  // Effect for pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedEvents(filteredEvents.slice(startIndex, endIndex));
  }, [filteredEvents, currentPage]);

  // Apply filters function
  const applyFilters = () => {
    let filtered = [...totalEvents];

    if (country?.name) {
      filtered = filtered.filter((event) => event.country === country.name);
    }

    if (region?.name) {
      filtered = filtered.filter((event) => event.region === region.name);
    }

    // Apply filters
    if (eventType?.value !== "all") {
      filtered = filtered.filter((event) => event.type === eventType.value);
    }

    if (myEvents?.value !== "all") {
      filtered = filtered.filter((event) => event.creator?._id === user?._id);
    }

    if (paymentType?.value !== "all") {
      filtered = filtered.filter(
        (event) => event.paidOption === paymentType.value
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  };

  // Toggle filter expanded state
  const toggleFilter = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // Reset filters
  const resetFilters = () => {
    setCountry(null);
    setRegion(null);
    setEventType({ label: "All Types", value: "all" });
    setMyEvents({ label: "All Events", value: "all" });
    setPaymentType({ label: "All Events", value: "all" });
    setTotalEvents(parties);
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Function to map event type to display name
  const getEventTypeLabel = (type: string) => {
    const option = eventTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
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

  // Render event item with animations
  const renderEventItem = ({ item, index }: { item: Party; index: number }) => (
    <Animated.View
      style={{
        opacity: cardAnims[index].opacity,
        transform: [
          { scale: cardAnims[index].scale },
          { translateY: cardAnims[index].translateY },
        ],
      }}
    >
      <Link
        href={{
          pathname: "/events/details/[id]",
          params: { id: item._id as string },
        }}
        style={styles.eventCard}
      >
        <LinearGradient
          colors={getCardGradient(item.type as PartyType) as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Card accent */}
          <View
            style={[
              styles.cardAccent,
              {
                backgroundColor: getEventGradientColors(
                  item.type as PartyType
                )[0],
              },
            ]}
          />

          {/* Event header */}
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
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>

              <View style={styles.badgeRow}>
                <StatusBadge
                  type="date"
                  label={formatTimeAgo(item.createdAt)}
                />
                <StatusBadge type="status" status={item.status} />
              </View>
            </View>
          </View>

          {/* Event description */}
          <Text
            style={[
              styles.eventDescription,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_SECONDARY
                  : COLORS.LIGHT_TEXT_SECONDARY,
              },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>

          {/* Event footer */}
          <View style={styles.eventFooter}>
            <View style={styles.badgeContainer}>
              <StatusBadge type="payment" payment={item.paidOption as any} />
              <StatusBadge
                type="eventType"
                eventType={item.type}
                label={getEventTypeLabel(item.type)}
              />
            </View>

            <View style={styles.attendeesContainer}>
              <View style={styles.avatarGroup}>
                {item.applicants.slice(0, 3).map((applicant, i) => (
                  <View
                    key={`avatar-${applicant.applier._id || i}`}
                    style={[
                      styles.avatarCircle,
                      {
                        right: i * 10,
                        zIndex: 3 - i,
                      },
                    ]}
                  >
                    {applicant.applier && applicant.applier.avatar ? (
                      <Image
                        source={{
                          uri: BACKEND_BASE_URL + applicant.applier.avatar,
                        }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          {
                            backgroundColor: getEventGradientColors(
                              item.type as PartyType
                            )[0],
                          },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
              <Text
                style={[
                  styles.attendeesText,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  },
                ]}
              >
                {item.applicants.length} attendees
              </Text>
            </View>
          </View>

          {/* Glowing effect for active events */}
          {item.status === "opening" && (
            <View style={styles.glowContainer}>
              <View
                style={[
                  styles.glowEffect,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(79, 70, 229, 0.15)"
                      : "rgba(255, 0, 153, 0.08)",
                  },
                ]}
              />
            </View>
          )}
        </LinearGradient>
      </Link>
    </Animated.View>
  );

  // Updated getCardGradient function to match all party types
  const getCardGradient = (eventType: PartyType) => {
    if (isDarkMode) {
      switch (eventType) {
        case "corporate":
          return ["rgba(4, 120, 87, 0.4)", "rgba(4, 120, 87, 0.2)"]; // More transparent green
        case "birthday":
          return ["rgba(190, 24, 93, 0.4)", "rgba(109, 40, 217, 0.2)"]; // More transparent pink/purple
        case "wedding":
          return ["rgba(67, 56, 202, 0.4)", "rgba(55, 48, 163, 0.2)"]; // More transparent blue
        case "sport":
          return ["rgba(220, 38, 38, 0.4)", "rgba(185, 28, 28, 0.2)"]; // More transparent red
        case "movie":
          return ["rgba(79, 70, 229, 0.4)", "rgba(67, 56, 202, 0.2)"]; // More transparent indigo
        case "common":
          return ["rgba(245, 158, 11, 0.4)", "rgba(217, 119, 6, 0.2)"]; // More transparent amber
        default:
          return ["rgba(31, 41, 55, 0.6)", "rgba(17, 24, 39, 0.4)"]; // More transparent gray
      }
    } else {
      // Keep the vibrant light mode gradients unchanged
      switch (eventType) {
        case "corporate":
          return ["rgba(255, 255, 255, 0.95)", "rgba(16, 185, 129, 0.15)"];
        case "birthday":
          return ["rgba(255, 255, 255, 0.95)", "rgba(147, 51, 234, 0.2)"];
        case "wedding":
          return ["rgba(255, 255, 255, 0.95)", "rgba(99, 102, 241, 0.25)"];
        case "sport":
          return ["rgba(255, 255, 255, 0.95)", "rgba(239, 68, 68, 0.25)"];
        case "movie":
          return ["rgba(255, 255, 255, 0.95)", "rgba(79, 70, 229, 0.25)"];
        case "common":
          return ["rgba(255, 255, 255, 0.95)", "rgba(245, 158, 11, 0.15)"];
        default:
          return ["rgba(255, 255, 255, 0.95)", "rgba(245, 158, 11, 0.15)"];
      }
    }
  };

  // Updated getEventGradientColors function to match all party types
  const getEventGradientColors = (eventType: PartyType) => {
    switch (eventType) {
      case "movie":
        return isDarkMode
          ? THEME.DARK.MOVIE_GRADIENT
          : THEME.LIGHT.MOVIE_GRADIENT;
      case "corporate":
        return isDarkMode
          ? THEME.DARK.CORPORATE_GRADIENT
          : THEME.LIGHT.CORPORATE_GRADIENT;
      case "birthday":
        return isDarkMode
          ? THEME.DARK.BIRTHDAY_GRADIENT
          : THEME.LIGHT.BIRTHDAY_GRADIENT;
      case "wedding":
        return isDarkMode
          ? THEME.DARK.WEDDING_GRADIENT
          : THEME.LIGHT.WEDDING_GRADIENT;
      case "sport":
        return isDarkMode
          ? THEME.DARK.SPORT_GRADIENT
          : THEME.LIGHT.SPORT_GRADIENT;
      case "common":
        return isDarkMode
          ? THEME.DARK.DEFAULT_GRADIENT
          : THEME.LIGHT.DEFAULT_GRADIENT;
      default:
        return isDarkMode
          ? THEME.DARK.DEFAULT_GRADIENT
          : THEME.LIGHT.DEFAULT_GRADIENT;
    }
  };

  // Render pagination with animated transitions
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            {
              backgroundColor: isDarkMode
                ? "rgba(55, 65, 81, 0.7)"
                : "rgba(0, 0, 0, 0.1)",
            },
            currentPage === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <FontAwesome5
            name="chevron-left"
            size={14}
            color={
              currentPage === 1
                ? isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)"
                : isDarkMode
                ? COLORS.DARK_TEXT_PRIMARY
                : COLORS.LIGHT_TEXT_PRIMARY
            }
          />
        </TouchableOpacity>

        <View style={styles.pageNumbersContainer}>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
            let pageNumber;

            // Calculate which page numbers to show
            if (totalPages <= 5) {
              pageNumber = index + 1;
            } else if (currentPage <= 3) {
              pageNumber = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + index;
            } else {
              pageNumber = currentPage - 2 + index;
            }

            if (pageNumber <= totalPages) {
              return (
                <TouchableOpacity
                  key={`page-${pageNumber}`}
                  style={[
                    styles.pageNumberButton,
                    pageNumber === currentPage && {
                      // Add gradient for selected page
                      overflow: "hidden",
                    },
                  ]}
                  onPress={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber === currentPage ? (
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["#4F46E5", "#7C3AED"]
                          : ["#7F00FF", "#E100FF"]
                      }
                      style={styles.activePageGradient}
                    >
                      <Text style={[styles.activePageNumberText]}>
                        {pageNumber}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text
                      style={[
                        styles.pageNumberText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      {pageNumber}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }
            return null;
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            {
              backgroundColor: isDarkMode
                ? "rgba(55, 65, 81, 0.7)"
                : "rgba(0, 0, 0, 0.1)",
            },
            currentPage === totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <FontAwesome5
            name="chevron-right"
            size={14}
            color={
              currentPage === totalPages
                ? isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)"
                : isDarkMode
                ? COLORS.DARK_TEXT_PRIMARY
                : COLORS.LIGHT_TEXT_PRIMARY
            }
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Empty list component with animation
  const renderEmptyList = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: cardScale }, { translateY }],
        },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={
            isDarkMode
              ? ["rgba(79, 70, 229, 0.8)", "rgba(67, 56, 202, 0.8)"]
              : ["rgba(127, 0, 255, 0.8)", "rgba(225, 0, 255, 0.8)"]
          }
          style={styles.emptyIconGradient}
        >
          <FontAwesome5 name="calendar-times" size={50} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <Text
        style={[
          styles.emptyTitle,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_PRIMARY
              : COLORS.LIGHT_TEXT_PRIMARY,
          },
        ]}
      >
        No Events Found
      </Text>
      <Text
        style={[
          styles.emptyText,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_SECONDARY
              : COLORS.LIGHT_TEXT_SECONDARY,
          },
        ]}
      >
        Try adjusting your filters or create a new event
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Slider/Image Area (35% of screen) */}
        <View style={styles.sliderContainer}>
          {/* Custom background or slider can go here */}
          <LinearGradient
            colors={
              isDarkMode
                ? ["#4A00E0", "#8E2DE2"] // Deep purple gradient for dark mode
                : ["#FF6CAB", "#7366FF"] // Pink to blue gradient for light mode
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sliderBackground}
          />

          {renderParticles()}

          {/* Header text overlay */}
          <View style={styles.sliderContent}>
            <Slider />
          </View>
        </View>

        {/* Bottom Content Section */}
        <View style={styles.bottomHalf}>
          <LinearGradient
            colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
            style={styles.bottomGradient}
          />

          {/* Main Card Container */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                transform: [{ translateY }, { scale: cardScale }],
                opacity: fadeAnim,
              },
            ]}
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
                {/* Filter Toggle Button */}
                <View style={styles.filterToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterToggleButton,
                      {
                        backgroundColor: isDarkMode
                          ? isFilterExpanded
                            ? "rgba(127, 0, 255, 0.3)"
                            : "rgba(55, 65, 81, 0.7)"
                          : isFilterExpanded
                          ? "rgba(255, 0, 153, 0.2)"
                          : "rgba(0, 0, 0, 0.05)",
                        borderColor: isDarkMode
                          ? COLORS.DARK_BORDER
                          : COLORS.LIGHT_BORDER,
                      },
                    ]}
                    onPress={toggleFilter}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5
                      name={isFilterExpanded ? "times" : "sliders-h"}
                      size={16}
                      color={
                        isFilterExpanded
                          ? getAccentColor()
                          : isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY
                      }
                    />
                    <Text
                      style={[
                        styles.filterToggleText,
                        {
                          color: isFilterExpanded
                            ? getAccentColor()
                            : isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      {isFilterExpanded ? "Hide Filters" : "Show Filters"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Filter container with animations */}
                <Animated.View
                  style={[
                    styles.filterContainer,
                    {
                      height: filterHeight,
                      opacity: filterOpacity,
                      backgroundColor: isDarkMode
                        ? "rgba(31, 41, 55, 0.8)"
                        : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDarkMode
                        ? "rgba(75, 85, 99, 0.3)"
                        : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                >
                  <CountryPicker
                    label="Country"
                    placeholder="Select country"
                    value={country as any}
                    onSelect={(selectedCountry) => {
                      setCountry(selectedCountry);
                      setRegion(null);
                    }}
                  />

                  <RegionPicker
                    label="Region"
                    placeholder="Select region"
                    value={region}
                    onSelect={setRegion}
                    countryCode={country?.code}
                  />

                  {/* Fix for Event Type dropdown - Wrap in a View with high zIndex */}
                  <View style={{ zIndex: 9999, elevation: 9999 }}>
                    <Dropdown
                      label="Event Type"
                      placeholder="Select event type"
                      options={eventTypeOptions}
                      value={eventType}
                      zIndex={9999}
                      onSelect={setEventType}
                    />
                  </View>

                  {/* Ensure these have lower zIndex than Event Type dropdown */}
                  <View
                    style={[styles.filterRow, { zIndex: 50, elevation: 50 }]}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Dropdown
                        label="Event Scope"
                        placeholder="All events"
                        options={myEventOptions}
                        value={myEvents}
                        zIndex={60}
                        onSelect={setMyEvents}
                      />
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 8,
                        zIndex: 9999,
                        elevation: 9999,
                      }}
                    >
                      <Dropdown
                        label="Entry Type"
                        placeholder="All events"
                        options={paymentOptions}
                        value={paymentType}
                        zIndex={50}
                        onSelect={setPaymentType}
                      />
                    </View>
                  </View>

                  <View style={styles.filterButtons}>
                    <TouchableOpacity
                      style={[
                        styles.resetFilterButton,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(55, 65, 81, 0.7)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      ]}
                      onPress={resetFilters}
                    >
                      <Text
                        style={[
                          styles.resetFilterText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        Reset
                      </Text>
                    </TouchableOpacity>
                    <Button
                      title="Apply Filters"
                      onPress={() => {
                        applyFilters();
                        setIsFilterExpanded(false);
                      }}
                      variant={isDarkMode ? "primary" : "secondary"}
                      style={{
                        flex: 1,
                        marginLeft: 12,
                      }}
                      small
                    />
                  </View>
                </Animated.View>

                {/* Results info with badge */}
                <View style={styles.resultsInfo}>
                  <View style={styles.resultCountContainer}>
                    <LinearGradient
                      colors={
                        isDarkMode
                          ? ["rgba(79, 70, 229, 0.2)", "rgba(67, 56, 202, 0.2)"]
                          : ["rgba(127, 0, 255, 0.1)", "rgba(225, 0, 255, 0.1)"]
                      }
                      style={styles.resultCountBadge}
                    >
                      <Text
                        style={[
                          styles.resultCount,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        {filteredEvents.length}{" "}
                        {filteredEvents.length === 1 ? "event" : "events"} found
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Add Event Button */}
                  <Animated.View
                    style={[
                      styles.addEventButtonContainer,
                      { transform: [{ scale: buttonScale }] },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.addEventButton}
                      onPress={() => router.push("/events/create")}
                    >
                      <LinearGradient
                        colors={
                          isDarkMode
                            ? ["#4F46E5", "#7C3AED"]
                            : ["#FF0099", "#FF6D00"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addEventGradient}
                      >
                        <FontAwesome5 name="plus" size={14} color="#FFFFFF" />
                        <Text style={styles.addEventText}>Create Event</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {/* Event List */}
                {paginatedEvents.length > 0 ? (
                  <View style={styles.eventsListContainer}>
                    {paginatedEvents.map((item, index) => (
                      <View key={`event-${item._id}`}>
                        {renderEventItem({ item, index })}
                      </View>
                    ))}
                  </View>
                ) : (
                  renderEmptyList()
                )}

                {/* Pagination */}
                {renderPagination()}
              </View>
            </LinearGradient>
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
  sliderContainer: {
    height: height * 0.35, // 35% of screen height
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  sliderBackground: {
    width: "100%",
    height: "100%",
  },
  sliderContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sliderTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XXL,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  sliderSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginTop: SPACING.XS,
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
    // minHeight: ,
    width: "100%",
    position: "relative",
    flex: 1,
    paddingBottom: SPACING.XL,
    borderRadius: BORDER_RADIUS.XXL,
  },
  bottomGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.XXL,
  },
  cardContainer: {
    position: "relative",
    top: -height * 0.06,
    marginHorizontal: width * 0.05,
    width: width * 0.9,
    zIndex: 10,
    flex: 1,
    borderRadius: BORDER_RADIUS.XXL,
    ...SHADOWS.MEDIUM,
  },
  cardBlur: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.XXL,
  },
  cardAccentBar: {
    height: 6,
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
  },
  cardContent: {
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.XXL,
  },
  filterToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SPACING.XS,
  },
  filterToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterToggleText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginLeft: 8,
  },
  filterContainer: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    marginBottom: SPACING.M,
    borderWidth: 1,
    overflow: "visible", // Important! Allow dropdown contents to overflow container
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButtons: {
    flexDirection: "row",
    marginTop: SPACING.M,
    alignItems: "center",
    zIndex: 10, // Lower zIndex than dropdowns
  },
  resetFilterButton: {
    height: 40,
    paddingHorizontal: SPACING.M,
    borderRadius: BORDER_RADIUS.M,
    justifyContent: "center",
    alignItems: "center",
  },
  resetFilterText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  resultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
    zIndex: 10, // Lower zIndex than filter container
  },
  resultCountContainer: {
    overflow: "hidden",
    borderRadius: BORDER_RADIUS.M,
  },
  resultCountBadge: {
    paddingHorizontal: SPACING.M,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.M,
  },
  resultCount: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  addEventButtonContainer: {
    justifyContent: "center",
  },
  addEventButton: {
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  addEventGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addEventText: {
    color: "#FFFFFF",
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
    marginLeft: 8,
  },
  eventsListContainer: {
    marginBottom: SPACING.M,
  },
  eventCard: {
    marginBottom: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    zIndex: 1, // Lower zIndex than filter
  },
  cardGradient: {
    width: "100%",
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    position: "relative",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BORDER_RADIUS.L,
    borderBottomLeftRadius: BORDER_RADIUS.L,
  },
  // Glowing effect for active events
  glowContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    borderRadius: BORDER_RADIUS.L,
    zIndex: -1,
  },
  glowEffect: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -40,
    right: -40,
    opacity: 0.6,
  },
  eventHeader: {
    padding: SPACING.M,
    paddingBottom: SPACING.XS,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.BOLD,
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.S,
  },
  eventDescription: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
    lineHeight: 20,
    paddingHorizontal: SPACING.M,
    marginBottom: SPACING.M,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.M,
    paddingBottom: SPACING.M,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarGroup: {
    flexDirection: "row",
    marginRight: SPACING.S,
    width: 45, // Fixed width for 3 avatars with overlap
    height: 20,
    position: "relative",
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    borderWidth: 1,
    borderColor: "white",
  },
  attendeesText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.M,
    marginBottom: SPACING.M,
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  pageNumbersContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.S,
  },
  pageNumberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  activePageGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  pageNumberText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  activePageNumberText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XS,
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.XL,
    marginTop: SPACING.M,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: SPACING.M,
    ...SHADOWS.MEDIUM,
  },
  emptyIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
    marginTop: SPACING.M,
    marginBottom: SPACING.S,
  },
  emptyText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    marginBottom: SPACING.L,
  },
  createEventButton: {
    minWidth: 150,
  },
  createEventButtonGradient: {
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  fabContainer: {
    position: "absolute",
    bottom: SPACING.M,
    right: SPACING.M,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    top: -width * 0.3,
    right: -width * 0.25,
    zIndex: -1,
  },
  decorativeCircle2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    bottom: -width * 0.2,
    left: -width * 0.2,
    zIndex: -1,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});

export default EventListScreen;
