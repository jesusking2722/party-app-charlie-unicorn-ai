import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
} from "@/app/theme";
import {
  Button,
  CountryPicker,
  Dropdown,
  DropdownOption,
  Map,
  RegionPicker,
  Slider,
} from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { Geo, Party } from "@/types/data";
import { CountryType, RegionType } from "@/types/place";

const { width, height } = Dimensions.get("window");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

// Sample party data for demo purposes
const sampleParties: Party[] = [
  {
    _id: "1",
    name: "Summer Music Festival",
    type: "music",
    geo: { lat: 48.8566, lng: 2.3522 }, // Paris
    attendees: 1250,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  {
    _id: "2",
    name: "Corporate Networking Event",
    type: "corporate",
    geo: { lat: 48.8606, lng: 2.3376 }, // Near Paris
    attendees: 350,
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  },
  {
    _id: "3",
    name: "Emily's Birthday Bash",
    type: "birthday",
    geo: { lat: 48.8495, lng: 2.3589 }, // Near Paris
    attendees: 85,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
  {
    _id: "4",
    name: "Williams-Johnson Wedding",
    type: "wedding",
    geo: { lat: 48.8738, lng: 2.3749 }, // Near Paris
    attendees: 175,
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  {
    _id: "5",
    name: "Champions Sports Tournament",
    type: "sport",
    geo: { lat: 48.8417, lng: 2.3197 }, // Near Paris
    attendees: 520,
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
  },
];

const HomeScreen = () => {
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  // State for filters
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [country, setCountry] = useState<CountryType | null>(null);
  const [region, setRegion] = useState<RegionType | null>(null);
  const [partyType, setPartyType] = useState<DropdownOption | null>(null);
  const [zoom, setZoom] = useState<number>(2);
  const [parties, setParties] = useState<Party[]>(sampleParties);
  const [filteredParties, setFilteredParties] =
    useState<Party[]>(sampleParties);

  // Your GEO location
  const myLocation = {
    lat: 48.8566, // Paris latitude
    lng: 2.3522, // Paris longitude
  };

  // Map center state
  const [mapCenter, setMapCenter] = useState<Geo | null>(myLocation);

  // Particle animations for the background
  const particles = Array(6)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.35)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.4 + 0.3)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.4 + 0.2)).current,
      speed: Math.random() * 3000 + 2000,
    }));

  // Party type options for dropdown
  const partyTypeOptions = [
    { label: "All Events", value: "all" },
    { label: "Music Festivals", value: "music" },
    { label: "Nightclub Events", value: "nightclub" },
    { label: "Private Parties", value: "private" },
    { label: "Beach Parties", value: "beach" },
    { label: "Corporate Events", value: "corporate" },
    { label: "Birthday Parties", value: "birthday" },
    { label: "Weddings", value: "wedding" },
    { label: "Sports Events", value: "sport" },
  ];

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

  // Filter parties based on selections
  useEffect(() => {
    let filtered = [...sampleParties];

    // Filter by party type
    if (partyType && partyType.value !== "all") {
      filtered = filtered.filter((party) => party.type === partyType.value);
    }

    // Filter by country (in a real app, you'd have country info in party data)
    if (country) {
      // Just simulating country filtering here
      // In a real app, filter based on actual country code
    }

    // Update the filtered parties
    setFilteredParties(filtered);
  }, [partyType, country, region]);

  // Update map center when country changes
  useEffect(() => {
    if (country) {
      // In a real app, you'd get the coordinates for the selected country
      // For this example, we'll just use Paris for France
      if (country.code === "FR") {
        setMapCenter({
          lat: 48.8566,
          lng: 2.3522,
        });
        setZoom(7);
      } else if (country.code === "US") {
        setMapCenter({
          lat: 37.0902,
          lng: -95.7129,
        });
        setZoom(4);
      } else {
        // Default for other countries
        setMapCenter(null);
      }
    } else {
      // If no country is selected, center on user location
      setMapCenter(myLocation);
      setZoom(12);
    }
  }, [country]);

  // Simple toggle filter visibility without animation
  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Reset all filters with animation feedback
  const handleReset = () => {
    setCountry(null);
    setRegion(null);
    setPartyType(null);
    setFilteredParties(sampleParties);
    setMapCenter(myLocation);
    setZoom(12);
  };

  // Handle party marker click
  const handlePartyClick = (party: Party) => {
    console.log("Party clicked:", party);
    // Center the map on the clicked party
    setMapCenter(party.geo);
    setZoom(14); // Zoom in closer
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Helper function to get gradient colors for event cards based on type
  const getEventGradient = (type: string) => {
    const theme = isDarkMode ? "DARK" : "LIGHT";

    switch (type) {
      case "music":
        return isDarkMode ? ["#4338CA", "#3730A3"] : ["#6366f1", "#2563eb"];
      case "corporate":
        return isDarkMode ? ["#065F46", "#064E3B"] : ["#10b981", "#0d9488"];
      case "birthday":
        return isDarkMode ? ["#9D174D", "#6D28D9"] : ["#ec4899", "#9333ea"];
      case "wedding":
        return isDarkMode ? ["#4338CA", "#3730A3"] : ["#6366f1", "#2563eb"];
      case "sport":
        return isDarkMode ? ["#991B1B", "#9F1239"] : ["#ef4444", "#e11d48"];
      default:
        return isDarkMode ? ["#B45309", "#C2410C"] : ["#f59e0b", "#ea580c"];
    }
  };

  // Render particles for background effect
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
        {/* Slider Section (Top 35%) */}
        <View style={styles.sliderContainer}>
          <Slider />

          {/* Add floating particles for fun effect */}
          {renderParticles()}

          {/* Overlay gradient for readability */}
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0)"]}
            style={styles.imageOverlay}
          />
        </View>

        {/* Bottom Content Section */}
        <View style={styles.bottomHalf}>
          <LinearGradient
            colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
            style={styles.bottomGradient}
          />

          {/* Content Card */}
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
                      styles.welcomeText,
                      {
                        color: isDarkMode
                          ? COLORS.DARK_TEXT_PRIMARY
                          : COLORS.LIGHT_TEXT_PRIMARY,
                      },
                    ]}
                  >
                    Discover Events
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
                    Find and join amazing events around you
                  </Text>

                  {/* Filter Toggle Button */}
                  <View style={styles.filterToggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.filterToggleButton,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(31, 41, 55, 0.7)"
                            : "rgba(255, 255, 255, 0.7)",
                          borderColor: isDarkMode
                            ? COLORS.DARK_BORDER
                            : COLORS.LIGHT_BORDER,
                        },
                      ]}
                      onPress={toggleFilters}
                      activeOpacity={0.8}
                    >
                      <FontAwesome5
                        name={isFilterVisible ? "times" : "sliders-h"}
                        size={16}
                        color={
                          isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY
                        }
                      />
                      <Text
                        style={[
                          styles.filterToggleText,
                          {
                            color: isDarkMode
                              ? COLORS.DARK_TEXT_PRIMARY
                              : COLORS.LIGHT_TEXT_PRIMARY,
                          },
                        ]}
                      >
                        {isFilterVisible ? "Hide Filters" : "Show Filters"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Filter section */}
                  {isFilterVisible && (
                    <View
                      style={[
                        styles.filterContainer,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(40, 45, 55, 0.5)"
                            : "rgba(255, 255, 255, 0.5)",
                          borderColor: isDarkMode
                            ? COLORS.DARK_BORDER
                            : COLORS.LIGHT_BORDER,
                        },
                      ]}
                    >
                      <View style={styles.filterHeader}>
                        <Text
                          style={[
                            styles.filterTitle,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          Filter Events
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.resetButton,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 0, 153, 0.2)"
                                : "rgba(255, 0, 153, 0.1)",
                              borderColor: isDarkMode
                                ? "rgba(255, 0, 153, 0.4)"
                                : "rgba(255, 0, 153, 0.3)",
                            },
                          ]}
                          onPress={handleReset}
                          activeOpacity={0.7}
                        >
                          <FontAwesome5
                            name="sync-alt"
                            size={12}
                            color={getAccentColor()}
                            style={styles.resetIcon}
                          />
                          <Text
                            style={[
                              styles.resetText,
                              { color: getAccentColor() },
                            ]}
                          >
                            Reset All
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.filtersWrapper}>
                        <View style={styles.filterItem}>
                          <CountryPicker
                            label="Country"
                            placeholder="Select Country"
                            onSelect={(selectedCountry) => {
                              setCountry(selectedCountry);
                              setRegion(null);
                            }}
                          />
                        </View>

                        <View style={styles.filterItem}>
                          <RegionPicker
                            label="Region"
                            placeholder="Select Region"
                            value={region}
                            onSelect={(selectedRegion) => {
                              setRegion(selectedRegion);
                            }}
                            countryCode={country?.code}
                          />
                        </View>

                        <View style={styles.filterItem}>
                          <Dropdown
                            label="Party Type"
                            placeholder="Select Party Type"
                            value={partyType}
                            onSelect={setPartyType}
                            options={partyTypeOptions}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Map Section with Event Count */}
                  <View style={styles.mapSectionContainer}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleContainer}>
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
                          Global Events
                        </Text>
                        <View
                          style={[
                            styles.countBadge,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 0, 153, 0.2)"
                                : "rgba(255, 0, 153, 0.1)",
                              borderColor: isDarkMode
                                ? "rgba(255, 0, 153, 0.4)"
                                : "rgba(255, 0, 153, 0.3)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.countText,
                              { color: getAccentColor() },
                            ]}
                          >
                            {filteredParties.length}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.viewAllButton,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(31, 41, 55, 0.7)"
                              : "rgba(255, 255, 255, 0.7)",
                            borderColor: isDarkMode
                              ? COLORS.DARK_BORDER
                              : COLORS.LIGHT_BORDER,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.viewAllText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          View All
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Map Component */}
                    <View style={styles.mapContainer}>
                      <Map
                        parties={filteredParties}
                        center={mapCenter}
                        zoom={zoom}
                        myGeo={myLocation}
                        setZoom={setZoom}
                        onClick={handlePartyClick}
                        selectedCountry={country}
                        selectedRegion={region}
                        isDarkMode={isDarkMode}
                      />
                    </View>
                  </View>

                  {/* Upcoming Events Section */}
                  <View style={styles.eventsSectionContainer}>
                    <View style={styles.sectionHeader}>
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
                        Upcoming Events
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.viewAllButton,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(31, 41, 55, 0.7)"
                              : "rgba(255, 255, 255, 0.7)",
                            borderColor: isDarkMode
                              ? COLORS.DARK_BORDER
                              : COLORS.LIGHT_BORDER,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.viewAllText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          View All
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Event Cards (preview) */}
                    {filteredParties.slice(0, 3).map((party) => (
                      <TouchableOpacity
                        key={party._id}
                        style={[
                          styles.eventCard,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(31, 41, 55, 0.7)"
                              : "rgba(255, 255, 255, 0.7)",
                            borderColor: isDarkMode
                              ? COLORS.DARK_BORDER
                              : COLORS.LIGHT_BORDER,
                          },
                        ]}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={getEventGradient(party.type) as any}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.eventCardAccent}
                        />

                        <View style={styles.eventCardContent}>
                          <View style={styles.eventCardHeader}>
                            <Text
                              style={[
                                styles.eventCardTitle,
                                {
                                  color: isDarkMode
                                    ? COLORS.DARK_TEXT_PRIMARY
                                    : COLORS.LIGHT_TEXT_PRIMARY,
                                },
                              ]}
                            >
                              {party.name}
                            </Text>
                            <View
                              style={[
                                styles.eventCardBadge,
                                {
                                  backgroundColor: isDarkMode
                                    ? "rgba(31, 41, 55, 0.7)"
                                    : "rgba(255, 255, 255, 0.7)",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.eventCardBadgeText,
                                  {
                                    color: isDarkMode
                                      ? COLORS.DARK_TEXT_PRIMARY
                                      : COLORS.LIGHT_TEXT_PRIMARY,
                                  },
                                ]}
                              >
                                {party.type.charAt(0).toUpperCase() +
                                  party.type.slice(1)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.eventCardDetails}>
                            <View style={styles.eventCardDetail}>
                              <FontAwesome5
                                name="calendar-alt"
                                size={14}
                                color={
                                  isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY
                                }
                              />
                              <Text
                                style={[
                                  styles.eventCardDetailText,
                                  {
                                    color: isDarkMode
                                      ? COLORS.DARK_TEXT_SECONDARY
                                      : COLORS.LIGHT_TEXT_SECONDARY,
                                  },
                                ]}
                              >
                                {party.date?.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Text>
                            </View>

                            <View style={styles.eventCardDetail}>
                              <FontAwesome5
                                name="users"
                                size={14}
                                color={
                                  isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY
                                }
                              />
                              <Text
                                style={[
                                  styles.eventCardDetailText,
                                  {
                                    color: isDarkMode
                                      ? COLORS.DARK_TEXT_SECONDARY
                                      : COLORS.LIGHT_TEXT_SECONDARY,
                                  },
                                ]}
                              >
                                {party.attendees} attendees
                              </Text>
                            </View>

                            <View style={styles.eventCardDetail}>
                              <FontAwesome5
                                name="map-marker-alt"
                                size={14}
                                color={
                                  isDarkMode
                                    ? COLORS.DARK_TEXT_SECONDARY
                                    : COLORS.LIGHT_TEXT_SECONDARY
                                }
                              />
                              <Text
                                style={[
                                  styles.eventCardDetailText,
                                  {
                                    color: isDarkMode
                                      ? COLORS.DARK_TEXT_SECONDARY
                                      : COLORS.LIGHT_TEXT_SECONDARY,
                                  },
                                ]}
                              >
                                Paris, France
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}

                    {/* View More Button */}
                    <Animated.View
                      style={{
                        width: "100%",
                        transform: [{ scale: buttonScale }],
                        marginTop: SPACING.M,
                      }}
                    >
                      <Button
                        title="View More Events"
                        variant={isDarkMode ? "primary" : "secondary"}
                        icon={
                          <FontAwesome5
                            name="arrow-right"
                            size={14}
                            color="white"
                            style={{ marginLeft: SPACING.S }}
                          />
                        }
                        iconPosition="right"
                        onPress={() => {}}
                        small={true}
                      />
                    </Animated.View>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </View>
      </ScrollView>
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
    padding: SPACING.M,
  },
  welcomeText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    zIndex: 100,
  },
  filterToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SPACING.M,
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
    borderWidth: 1,
    marginBottom: SPACING.M,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  filterTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  resetIcon: {
    marginRight: 6,
  },
  resetText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  filtersWrapper: {
    gap: 10,
  },
  filterItem: {
    marginBottom: SPACING.S,
  },
  mapSectionContainer: {
    marginBottom: SPACING.L,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.SEMIBOLD,
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
    borderWidth: 1,
  },
  countText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XS,
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  mapContainer: {
    height: 440,
    width: "100%",
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  eventsSectionContainer: {
    marginBottom: SPACING.M,
  },
  eventCard: {
    borderRadius: BORDER_RADIUS.L,
    marginBottom: SPACING.M,
    overflow: "hidden",
    borderWidth: 1,
  },
  eventCardAccent: {
    height: 6,
    width: "100%",
  },
  eventCardContent: {
    padding: SPACING.M,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.S,
  },
  eventCardTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
    flex: 1,
    marginRight: 8,
  },
  eventCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventCardBadgeText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  eventCardDetails: {
    gap: 8,
  },
  eventCardDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventCardDetailText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    marginLeft: 8,
  },
});

export default HomeScreen;
