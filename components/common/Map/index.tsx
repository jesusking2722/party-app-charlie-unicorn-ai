import { FONTS } from "@/app/theme";
import { Geo, Party } from "@/types/data";
import { CountryType, RegionType } from "@/types/place";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Circle,
  MapStyleElement,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

// Map props interface
export interface MapProps {
  parties: Party[];
  center: Geo | null;
  zoom: number | null;
  myGeo: Geo | null;
  setZoom?: (zoom: number) => void;
  onClick?: (party: Party) => void;
  selectedCountry?: CountryType | null;
  selectedRegion?: RegionType | null;
  isDarkMode?: boolean; // Added isDarkMode prop
}

// Theme colors
const THEME = {
  LIGHT: {
    GRADIENT: ["#7F00FF", "#E100FF"] as [string, string],
    MAP_OVERLAY: ["rgba(127, 0, 255, 0.15)", "rgba(225, 0, 255, 0.15)"] as [
      string,
      string
    ],
    ACCENT_COLOR: "#FF0099",
    ACCENT_BG: "rgba(255, 0, 153, 0.2)",
    ACCENT_BORDER: "rgba(255, 0, 153, 0.4)",
    CARD_BG: "rgba(0, 0, 0, 0.15)",
    BUTTON_BG: "rgba(255, 255, 255, 0.15)",
    BORDER_COLOR: "rgba(255, 255, 255, 0.1)",
    TEXT_COLOR: "white",
    TEXT_SECONDARY: "rgba(255, 255, 255, 0.7)",
    LOCATION_ACTIVE: "rgba(59, 130, 246, 0.5)",
    LEGEND_BG: "rgba(0, 0, 0, 0.4)",
  },
  DARK: {
    GRADIENT: ["#111827", "#1F2937"] as [string, string],
    MAP_OVERLAY: ["rgba(17, 24, 39, 0.25)", "rgba(31, 41, 55, 0.25)"] as [
      string,
      string
    ],
    ACCENT_COLOR: "#4F46E5",
    ACCENT_BG: "rgba(79, 70, 229, 0.2)",
    ACCENT_BORDER: "rgba(79, 70, 229, 0.4)",
    CARD_BG: "rgba(17, 24, 39, 0.95)",
    BUTTON_BG: "rgba(55, 65, 81, 0.7)",
    BORDER_COLOR: "rgba(75, 85, 99, 0.3)",
    TEXT_COLOR: "#F3F4F6",
    TEXT_SECONDARY: "#D1D5DB",
    LOCATION_ACTIVE: "rgba(79, 70, 229, 0.5)",
    LEGEND_BG: "rgba(17, 24, 39, 0.7)",
  },
};

// Mapping for party types to colors (matching web version)
// Use 'as const' to ensure the arrays are properly typed as readonly tuples
const LIGHT_MARKER_COLORS: Record<string, readonly [string, string]> = {
  birthday: ["#ec4899", "#9333ea"] as const, // pink-500 to purple-600
  common: ["#f59e0b", "#ea580c"] as const, // amber-500 to orange-600
  wedding: ["#6366f1", "#2563eb"] as const, // indigo-500 to blue-600
  corporate: ["#10b981", "#0d9488"] as const, // emerald-500 to teal-600
  sport: ["#ef4444", "#e11d48"] as const, // red-500 to rose-600
  default: ["#6b7280", "#475569"] as const, // gray-500 to slate-600
};

// Darker versions of marker colors for dark mode
const DARK_MARKER_COLORS: Record<string, readonly [string, string]> = {
  birthday: ["#9D174D", "#6D28D9"] as const, // darker pink to purple
  common: ["#B45309", "#C2410C"] as const, // darker amber to orange
  wedding: ["#4338CA", "#3730A3"] as const, // darker indigo to blue
  corporate: ["#065F46", "#064E3B"] as const, // darker emerald to teal
  sport: ["#991B1B", "#9F1239"] as const, // darker red to rose
  default: ["#4B5563", "#374151"] as const, // darker gray to slate
};

// Modern dark theme for Google Maps - matches web version
const mapStyle: MapStyleElement[] = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#121a30",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8ec3b9",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1a3646",
      },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#4b6878",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#64779e",
      },
    ],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#4b6878",
      },
    ],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#334e87",
      },
    ],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [
      {
        color: "#023e58",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#283d6a",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6f9ba5",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1d2c4d",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#023e58",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3C7680",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#304a7d",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#98a5be",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1d2c4d",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#2c6675",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#255763",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#0e1626",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#4e6d70",
      },
    ],
  },
];

// Light version of map style for light mode
const lightMapStyle: MapStyleElement[] = [];

// Determine marker colors based on party type (matching web version)
const getMarkerColor = (
  partyType: string,
  isDarkMode: boolean
): readonly [string, string] => {
  // Use the appropriate color scheme based on dark mode
  const markerColors = isDarkMode ? DARK_MARKER_COLORS : LIGHT_MARKER_COLORS;

  // Convert to lowercase and remove any spaces for comparison
  const normalizedType = partyType.toLowerCase().replace(/\s+/g, "");

  // Check if the normalized type exists in our color mapping
  for (const type of Object.keys(markerColors)) {
    if (normalizedType.includes(type)) {
      return markerColors[type as keyof typeof markerColors];
    }
  }

  return markerColors.default;
};

// Calculate distance between two coordinates in km
const calculateDistance = (pos1: Geo, pos2: Geo): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(pos2.lat - pos1.lat);
  const dLon = deg2rad(pos2.lng - pos1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pos1.lat)) *
      Math.cos(deg2rad(pos2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper function to convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Function to check if coordinates are valid
const isValidGeoPosition = (position: Geo | null): boolean => {
  if (!position) return false;

  const { lat, lng } = position;

  // Check if latitude and longitude are numbers and within valid ranges
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Custom Party Marker Component
const PartyMarker: FC<{
  party: Party;
  myGeo: Geo | null;
  onClick: (party: Party) => void;
  isDarkMode: boolean;
}> = ({ party, myGeo, onClick, isDarkMode }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Get marker colors based on party type and dark mode
  const markerColors = getMarkerColor(party.type, isDarkMode);

  // Calculate distance from user's location if available
  const distance = myGeo ? calculateDistance(myGeo, party.geo) : null;

  // Determine marker properties based on distance
  const isNearby = distance !== null && distance < 10; // Within 10km
  const isVeryClose = distance !== null && distance < 3; // Within 3km

  useEffect(() => {
    // Initial appear animation
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.back(1.5),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Setup continuous animations
    const animatePulse = () => {
      const animDuration = isVeryClose ? 1000 : isNearby ? 1500 : 2000;
      const animScale = isVeryClose ? 1.3 : isNearby ? 1.2 : 1.1;
      const animY = isVeryClose ? -12 : isNearby ? -8 : -5;

      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: animScale,
            duration: animDuration / 2,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: animDuration / 2,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: animY,
            duration: animDuration / 2,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: animDuration / 2,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
      ]).start(() => {
        animatePulse();
      });
    };

    animatePulse();
  }, [isNearby, isVeryClose]);

  // Determine marker size based on proximity
  const markerSize = isVeryClose
    ? 40 // w-10 h-10 equivalent
    : isNearby
    ? 32 // w-8 h-8 equivalent
    : 24; // w-6 h-6 equivalent

  const ringSize = isVeryClose
    ? 60 // -inset-6 equivalent (marker size + 20)
    : isNearby
    ? 50 // -inset-5 equivalent (marker size + 18)
    : 36; // -inset-3 equivalent (marker size + 12)

  return (
    <Marker
      coordinate={{
        latitude: party.geo.lat,
        longitude: party.geo.lng,
      }}
      tracksViewChanges={false}
      onPress={() => onClick(party)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Animated.View
        style={[
          styles.markerContainer,
          {
            opacity: opacity,
            transform: [{ scale: scale }, { translateY: translateY }],
          },
        ]}
      >
        {/* Outer glow */}
        <LinearGradient
          colors={markerColors}
          style={[
            styles.markerRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              opacity: isVeryClose ? 0.8 : isNearby ? 0.6 : 0.4,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Extra glow for very close parties */}
        {isVeryClose && (
          <View
            style={[
              styles.extraGlow,
              {
                width: ringSize + 20,
                height: ringSize + 20,
                borderRadius: (ringSize + 20) / 2,
              },
            ]}
          />
        )}

        {/* Inner dot */}
        <LinearGradient
          colors={markerColors}
          style={[
            styles.markerDot,
            {
              width: markerSize,
              height: markerSize,
              borderRadius: markerSize / 2,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Icon on top */}
        <View style={styles.iconContainer}>
          <FontAwesome5
            name={isVeryClose ? "star" : "map-marker-alt"}
            size={markerSize * 0.5}
            color="white"
            style={styles.markerIcon}
          />
        </View>

        {/* Distance indicator */}
        {distance !== null && (
          <View
            style={[
              styles.distanceIndicator,
              {
                backgroundColor: isVeryClose
                  ? isDarkMode
                    ? "rgba(5, 150, 105, 0.9)"
                    : "rgba(22, 163, 74, 0.9)" // darkmode: emerald-600/90, lightmode: green-600/90
                  : isNearby
                  ? isDarkMode
                    ? "rgba(67, 56, 202, 0.8)"
                    : "rgba(59, 130, 246, 0.8)" // darkmode: indigo-700/80, lightmode: blue-500/80
                  : isDarkMode
                  ? "rgba(17, 24, 39, 0.7)"
                  : "rgba(0, 0, 0, 0.7)", // darkmode: gray-900/70, lightmode: black/70
              },
            ]}
          >
            <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
          </View>
        )}
      </Animated.View>
    </Marker>
  );
};

// Custom User Location Marker
const UserLocationMarker: FC<{
  position: Geo;
  isDarkMode: boolean;
}> = ({ position, isDarkMode }) => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Define gradient colors with proper readonly typing - adjusting for dark mode
  const outerGradientColors = isDarkMode
    ? (["#3B82F6", "#4F46E5", "#7C3AED"] as const) // Blue to indigo to purple
    : (["#00FFFF", "#00CCFF", "#0088FF"] as const); // Cyan to blue

  const innerGradientColors = isDarkMode
    ? (["#3B82F6", "#4F46E5"] as const)
    : (["#00FFFF", "#00CCFF"] as const);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Marker
      coordinate={{
        latitude: position.lat,
        longitude: position.lng,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={styles.userMarkerContainer}>
        {/* Outer rotating ring */}
        <Animated.View
          style={[
            styles.userMarkerRing,
            {
              transform: [{ scale: pulseAnim }, { rotate: rotate }],
            },
          ]}
        >
          <LinearGradient
            colors={outerGradientColors}
            style={styles.userMarkerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Center dot */}
        <View style={styles.userMarkerDot}>
          <LinearGradient
            colors={innerGradientColors}
            style={styles.userMarkerInnerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* "You are here" text */}
        <View
          style={[
            styles.locationLabel,
            {
              backgroundColor: isDarkMode
                ? "rgba(59, 130, 246, 0.7)" // blue-500/70 in dark mode
                : "rgba(0, 136, 255, 0.7)", // bright blue in light mode
            },
          ]}
        >
          <Text style={styles.locationLabelText}>You are here</Text>
        </View>
      </View>
    </Marker>
  );
};

// Map Legend Component
const MapLegend: FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Define location colors for user location marker
  const locationColors = isDarkMode
    ? (["#3B82F6", "#4F46E5"] as const) // Blue to indigo
    : (["#00FFFF", "#0088FF"] as const); // Cyan to blue

  // Get appropriate marker colors based on dark mode
  const markerColors = isDarkMode ? DARK_MARKER_COLORS : LIGHT_MARKER_COLORS;

  return (
    <View
      style={[
        styles.legendContainer,
        {
          backgroundColor: theme.LEGEND_BG,
          borderColor: theme.BORDER_COLOR,
        },
      ]}
    >
      <Text style={[styles.legendTitle, { color: theme.TEXT_COLOR }]}>
        Map Legend
      </Text>

      <View style={styles.legendItem}>
        <LinearGradient
          colors={locationColors}
          style={styles.legendColorDot}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={[styles.legendText, { color: theme.TEXT_SECONDARY }]}>
          Your Location
        </Text>
      </View>

      <View style={styles.legendItem}>
        <LinearGradient
          colors={markerColors.birthday}
          style={styles.legendColorDot}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={[styles.legendText, { color: theme.TEXT_SECONDARY }]}>
          Birthday Party
        </Text>
      </View>

      <View style={styles.legendItem}>
        <LinearGradient
          colors={markerColors.common}
          style={styles.legendColorDot}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={[styles.legendText, { color: theme.TEXT_SECONDARY }]}>
          Common Party
        </Text>
      </View>

      <View style={styles.legendItem}>
        <LinearGradient
          colors={markerColors.wedding}
          style={styles.legendColorDot}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={[styles.legendText, { color: theme.TEXT_SECONDARY }]}>
          Wedding
        </Text>
      </View>

      <View style={styles.legendItem}>
        <LinearGradient
          colors={markerColors.corporate}
          style={styles.legendColorDot}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={[styles.legendText, { color: theme.TEXT_SECONDARY }]}>
          Corporate Event
        </Text>
      </View>

      <View style={styles.legendItem}>
        <LinearGradient
          colors={markerColors.sport}
          style={styles.legendColorDot}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={[styles.legendText, { color: theme.TEXT_SECONDARY }]}>
          Sport Event
        </Text>
      </View>
    </View>
  );
};

// Map Controls Component
const MapControls: FC<{
  myGeo: Geo | null;
  onCenterLocation: () => void;
  centeringOnLocation: boolean;
  isDarkMode: boolean;
}> = ({ myGeo, onCenterLocation, centeringOnLocation, isDarkMode }) => {
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;
  const hasValidMyGeo = isValidGeoPosition(myGeo);

  return (
    <View style={styles.controlsContainer}>
      {/* Search button */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            backgroundColor: theme.BUTTON_BG,
            borderColor: theme.BORDER_COLOR,
          },
        ]}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="map-search"
          size={20}
          color={theme.TEXT_COLOR}
        />
      </TouchableOpacity>

      {/* Location button - only shown when we have a valid location */}
      {hasValidMyGeo && (
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: centeringOnLocation
                ? theme.LOCATION_ACTIVE
                : theme.BUTTON_BG,
              borderColor: theme.BORDER_COLOR,
            },
          ]}
          activeOpacity={0.7}
          onPress={onCenterLocation}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={20}
            color={theme.TEXT_COLOR}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Enhanced Google Maps Component
const AdvancedMapComponent: FC<MapProps> = ({
  parties = [],
  center = null,
  zoom = 2,
  myGeo = null,
  setZoom = () => {},
  onClick = () => {},
  selectedCountry,
  selectedRegion,
  isDarkMode = false, // Default to light mode
}) => {
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: center?.lat || 37.78825,
    longitude: center?.lng || -122.4324,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });
  const [userLocation, setUserLocation] = useState<Geo | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [centeringOnLocation, setCenteringOnLocation] =
    useState<boolean>(false);
  const mapOpacityAnim = useRef(new Animated.Value(0)).current;

  // Calculate appropriate delta values based on zoom level
  const zoomToDelta = (
    zoomLevel: number | null
  ): { latitudeDelta: number; longitudeDelta: number } => {
    if (!zoomLevel) return { latitudeDelta: 50, longitudeDelta: 50 };
    // Convert zoom level to appropriate delta values (exponential)
    const delta = 180 / Math.pow(2, zoomLevel);
    return {
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  };

  // Request location permission and get initial position
  useEffect(() => {
    // Animate map in
    Animated.timing(mapOpacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      // If myGeo is provided, use it
      if (myGeo) {
        setUserLocation(myGeo);
        if (!center) {
          // Only center on user location if no specific center provided
          const { latitudeDelta, longitudeDelta } = zoomToDelta(zoom);
          setMapRegion({
            latitude: myGeo.lat,
            longitude: myGeo.lng,
            latitudeDelta,
            longitudeDelta,
          });
        }
      } else if (status === "granted") {
        // Otherwise use device location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const userLocationCoords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        setUserLocation(userLocationCoords);

        if (!center) {
          // Only center on user location if no specific center provided
          const { latitudeDelta, longitudeDelta } = zoomToDelta(zoom);
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta,
            longitudeDelta,
          });
        }
      }
    })();
  }, []);

  // Update map when center or zoom changes
  useEffect(() => {
    if (center) {
      const { latitudeDelta, longitudeDelta } = zoomToDelta(zoom);
      const newRegion = {
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta,
        longitudeDelta,
      };

      setMapRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  }, [center, zoom]);

  // Handle region change
  const onRegionChangeComplete = (region: Region) => {
    // Calculate zoom level from delta
    const latDelta = region.latitudeDelta;
    const newZoom = Math.log2(180 / latDelta);
    setZoom(Math.round(newZoom));
  };

  // Center on user location
  const handleCenterOnLocation = () => {
    if (userLocation) {
      setCenteringOnLocation(true);

      // Add a bouncing animation effect
      const bounceAnimation = Animated.sequence([
        Animated.timing(mapOpacityAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(mapOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.elastic(1),
        }),
      ]);

      bounceAnimation.start();

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          800
        );
      }

      // Reset centering state after animation
      setTimeout(() => {
        setCenteringOnLocation(false);
      }, 1000);
    }
  };

  const hasValidMyGeo = isValidGeoPosition(userLocation);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.GRADIENT}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
      >
        <View style={styles.mapHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.mapTitle, { color: theme.TEXT_COLOR }]}>
              Party Locations
            </Text>
            {selectedCountry && (
              <View
                style={[
                  styles.locationTag,
                  {
                    backgroundColor: theme.BUTTON_BG,
                    borderColor: theme.BORDER_COLOR,
                  },
                ]}
              >
                <FontAwesome5
                  name="map-marker-alt"
                  size={12}
                  color={theme.ACCENT_COLOR}
                />
                <Text
                  style={[styles.locationText, { color: theme.TEXT_COLOR }]}
                >
                  {selectedCountry?.name}
                  {selectedRegion ? `, ${selectedRegion.name}` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Animated.View
          style={[styles.mapContainer, { opacity: mapOpacityAnim }]}
        >
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            customMapStyle={isDarkMode ? mapStyle : lightMapStyle}
            showsUserLocation={false} // We'll use custom marker
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            showsTraffic={false}
            showsBuildings={false}
            showsIndoors={false}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            onRegionChangeComplete={onRegionChangeComplete}
            mapPadding={{ top: 0, right: 0, bottom: 20, left: 0 }}
          >
            {/* User location radius circle */}
            {hasValidMyGeo && userLocation && (
              <Circle
                center={{
                  latitude: userLocation.lat,
                  longitude: userLocation.lng,
                }}
                radius={5000} // 5km radius
                strokeColor={isDarkMode ? "#3B82F6" : "#4dabf7"}
                strokeWidth={1}
                fillColor={
                  isDarkMode
                    ? "rgba(59, 130, 246, 0.05)"
                    : "rgba(77, 171, 247, 0.05)"
                }
              />
            )}

            {/* User location marker */}
            {hasValidMyGeo && userLocation && (
              <UserLocationMarker
                position={userLocation}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Party markers */}
            {parties.map((party) => (
              <PartyMarker
                key={party._id}
                party={party}
                myGeo={userLocation}
                onClick={onClick}
                isDarkMode={isDarkMode}
              />
            ))}
          </MapView>

          {/* Map overlay gradient */}
          <LinearGradient
            colors={theme.MAP_OVERLAY}
            style={styles.mapOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
          />

          {/* Map Controls */}
          <MapControls
            myGeo={userLocation}
            onCenterLocation={handleCenterOnLocation}
            centeringOnLocation={centeringOnLocation}
            isDarkMode={isDarkMode}
          />

          {/* Map Legend */}
          <MapLegend isDarkMode={isDarkMode} />
        </Animated.View>

        <View
          style={[
            styles.statsContainer,
            {
              borderTopColor: theme.BORDER_COLOR,
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.TEXT_COLOR }]}>
              {parties.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.TEXT_SECONDARY }]}>
              Events
            </Text>
          </View>
          <View
            style={[
              styles.statDivider,
              {
                backgroundColor: theme.BORDER_COLOR,
              },
            ]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.TEXT_COLOR }]}>
              {selectedCountry ? selectedCountry.name : "Worldwide"}
            </Text>
            <Text style={[styles.statLabel, { color: theme.TEXT_SECONDARY }]}>
              Location
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 450, // Increased map height
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
  },
  mapTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
    marginRight: 12,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: Platform.OS === "ios" ? 0 : 4,
    borderWidth: 1,
  },
  locationText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    marginLeft: 5,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  // Party Marker Styles
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
  },
  markerDot: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  markerRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.4,
    zIndex: 1,
  },
  extraGlow: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    opacity: 0.5,
    zIndex: 0,
  },
  markerIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  iconContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  distanceIndicator: {
    position: "absolute",
    bottom: -30,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  distanceText: {
    color: "white",
    fontSize: 10,
    fontFamily: FONTS.MEDIUM,
  },
  // User Location Marker Styles
  userMarkerContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    overflow: "hidden",
  },
  userMarkerGradient: {
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  userMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
    zIndex: 2,
  },
  userMarkerInnerGradient: {
    width: "100%",
    height: "100%",
  },
  locationLabel: {
    position: "absolute",
    top: 30,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  locationLabelText: {
    color: "white",
    fontSize: 10,
    fontFamily: FONTS.MEDIUM,
  },
  // Map Controls Styles
  controlsContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "column",
    gap: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Legend Styles
  legendContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    zIndex: 20,
  },
  legendTitle: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    fontFamily: FONTS.REGULAR,
  },
  // Stats Container Styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: FONTS.BOLD,
    fontSize: 18,
  },
  statLabel: {
    fontFamily: FONTS.REGULAR,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
});

export default AdvancedMapComponent;
