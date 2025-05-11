import { FONTS, THEME } from "@/app/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import components
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
  // Get the appropriate theme based on isDarkMode
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fabScaleAnim = useRef(new Animated.Value(0)).current;
  const fabRotateAnim = useRef(new Animated.Value(0)).current;
  const fabPulseAnim = useRef(new Animated.Value(1)).current;

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

  // Animation on component mount
  useEffect(() => {
    // Animate main content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    // Animate FAB with delay and attention-grabbing effect
    setTimeout(() => {
      Animated.sequence([
        // Pop in
        Animated.spring(fabScaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 5,
          tension: 200,
        }),
        // Settle to normal size
        Animated.spring(fabScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
          tension: 100,
        }),
      ]).start();

      // Add rotation animation
      Animated.timing(fabRotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();

      // Start continuous pulse animation
      startPulseAnimation();
    }, 1000);
  }, []);

  // Continuous pulse animation for FAB
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(fabPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
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

    // Add a little bounce animation for feedback
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.elastic(1.5)),
      }),
    ]).start();
  };

  // Handle party marker click
  const handlePartyClick = (party: Party) => {
    console.log("Party clicked:", party);
    // You could show details, navigate to a detail screen, etc.

    // Center the map on the clicked party
    setMapCenter(party.geo);
    setZoom(14); // Zoom in closer
  };

  // Create rotation interpolation
  const fabRotate = fabRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Helper function to get gradient colors for event cards based on type
  const getEventGradient = (type: string) => {
    switch (type) {
      case "music":
        return theme.MUSIC_GRADIENT;
      case "corporate":
        return theme.CORPORATE_GRADIENT;
      case "birthday":
        return theme.BIRTHDAY_GRADIENT;
      case "wedding":
        return theme.WEDDING_GRADIENT;
      case "sport":
        return theme.SPORT_GRADIENT;
      default:
        return theme.DEFAULT_GRADIENT;
    }
  };

  return (
    <View style={styles.container}>
      {/* Set StatusBar properties BEFORE the LinearGradient */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={theme.GRADIENT as [string, string]}
        style={styles.gradient}
        start={isDarkMode ? { x: 0, y: 0 } : { x: 0, y: 0 }}
        end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Animated container for better entrance */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* Image Slider Component */}
              <Slider />

              {/* Filter Toggle Button */}
              <View style={styles.filterToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterToggleButton,
                    {
                      backgroundColor: isDarkMode
                        ? "rgba(31, 41, 55, 0.7)"
                        : "rgba(0, 0, 0, 0.2)",
                      borderColor: isDarkMode
                        ? "rgba(75, 85, 99, 0.3)"
                        : "rgba(255, 255, 255, 0.15)",
                    },
                  ]}
                  onPress={toggleFilters}
                  activeOpacity={0.8}
                >
                  <FontAwesome5
                    name={isFilterVisible ? "times" : "sliders-h"}
                    size={16}
                    color={theme.TEXT_COLOR}
                  />
                  <Text
                    style={[
                      styles.filterToggleText,
                      { color: theme.TEXT_COLOR },
                    ]}
                  >
                    {isFilterVisible ? "Hide Filters" : "Show Filters"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Filter section - no animation */}
              {isFilterVisible && (
                <View
                  style={[
                    styles.filterContainerWrapper,
                    styles.filterContainer,
                    {
                      backgroundColor: theme.FILTER_BG,
                      borderColor: theme.BORDER_COLOR,
                    },
                  ]}
                >
                  <View style={styles.filterHeader}>
                    <Text
                      style={[styles.filterTitle, { color: theme.TEXT_COLOR }]}
                    >
                      Filter Events
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.resetButton,
                        {
                          backgroundColor: theme.ACCENT_BG,
                          borderColor: theme.ACCENT_COLOR,
                        },
                      ]}
                      onPress={handleReset}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5
                        name="sync-alt"
                        size={12}
                        color={theme.TEXT_COLOR}
                        style={styles.resetIcon}
                      />
                      <Text
                        style={[styles.resetText, { color: theme.TEXT_COLOR }]}
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
                        value={country}
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

              {/* Party Count and Map Section */}
              <View style={styles.mapSectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Text
                      style={[styles.sectionTitle, { color: theme.TEXT_COLOR }]}
                    >
                      Global Events
                    </Text>
                    <View
                      style={[
                        styles.countBadge,
                        {
                          backgroundColor: theme.ACCENT_BG,
                          borderColor: theme.ACCENT_COLOR,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.countText, { color: theme.TEXT_COLOR }]}
                      >
                        {filteredParties.length}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.viewAllButton,
                      {
                        backgroundColor: theme.BUTTON_BG,
                        borderColor: theme.BORDER_COLOR,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.viewAllText, { color: theme.TEXT_COLOR }]}
                    >
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Advanced Map Component */}
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

              {/* Event List Section */}
              <View style={styles.eventsSectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.TEXT_COLOR }]}
                  >
                    Upcoming Events
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.viewAllButton,
                      {
                        backgroundColor: theme.BUTTON_BG,
                        borderColor: theme.BORDER_COLOR,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.viewAllText, { color: theme.TEXT_COLOR }]}
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
                        backgroundColor: theme.CARD_BG,
                        borderColor: theme.BORDER_COLOR,
                      },
                    ]}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={getEventGradient(party.type) as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.eventCardAccent}
                    />

                    <View style={styles.eventCardContent}>
                      <View style={styles.eventCardHeader}>
                        <Text
                          style={[
                            styles.eventCardTitle,
                            { color: theme.TEXT_COLOR },
                          ]}
                        >
                          {party.name}
                        </Text>
                        <View
                          style={[
                            styles.eventCardBadge,
                            { backgroundColor: theme.BUTTON_BG },
                          ]}
                        >
                          <Text
                            style={[
                              styles.eventCardBadgeText,
                              { color: theme.TEXT_COLOR },
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
                            color={theme.TEXT_SECONDARY}
                          />
                          <Text
                            style={[
                              styles.eventCardDetailText,
                              { color: theme.TEXT_SECONDARY },
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
                            color={theme.TEXT_SECONDARY}
                          />
                          <Text
                            style={[
                              styles.eventCardDetailText,
                              { color: theme.TEXT_SECONDARY },
                            ]}
                          >
                            {party.attendees} attendees
                          </Text>
                        </View>

                        <View style={styles.eventCardDetail}>
                          <FontAwesome5
                            name="map-marker-alt"
                            size={14}
                            color={theme.TEXT_SECONDARY}
                          />
                          <Text
                            style={[
                              styles.eventCardDetailText,
                              { color: theme.TEXT_SECONDARY },
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
                <Button
                  title="View More Events"
                  variant="primary"
                  icon={
                    <FontAwesome5
                      name="chevron-right"
                      size={12}
                      color={theme.TEXT_COLOR}
                    />
                  }
                  iconPosition="right"
                  onPress={() => {}}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Floating Action Button with Animations */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [
              { scale: fabScaleAnim },
              { rotate: fabRotate },
              { scale: fabPulseAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => console.log("Create new event")}
          style={styles.fabTouchable}
        >
          <LinearGradient
            colors={theme.FAB_GRADIENT as [string, string]}
            style={styles.floatingButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FontAwesome5 name="plus" size={24} color={theme.TEXT_COLOR} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  filterToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -10,
    marginBottom: 16,
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
    fontSize: 14,
    marginLeft: 8,
  },
  filterContainerWrapper: {
    marginBottom: 16,
  },
  filterContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
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
    fontSize: 12,
  },
  filtersWrapper: {
    gap: 10,
  },
  filterItem: {
    marginBottom: 10,
  },
  mapSectionContainer: {
    marginBottom: 24,
  },
  eventsSectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONTS.BOLD,
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
    fontSize: 12,
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
  },
  // Event Card Styles
  eventCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  eventCardAccent: {
    height: 6,
    width: "100%",
  },
  eventCardContent: {
    padding: 16,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventCardTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
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
    fontSize: 12,
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
    fontSize: 14,
    marginLeft: 8,
  },
  // Floating Action Button
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 999,
  },
  fabTouchable: {
    width: "100%",
    height: "100%",
  },
  floatingButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});

export default HomeScreen;
