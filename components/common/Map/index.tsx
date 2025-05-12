import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Geo, Party } from "@/types/data";
import { CountryType, RegionType } from "@/types/place";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

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
  isDarkMode?: boolean;
}

// Mapping for party types to colors with matching theme
const LIGHT_MARKER_COLORS: Record<string, readonly [string, string]> = {
  birthday: ["#ec4899", "#9333ea"] as const, // pink-500 to purple-600
  wedding: ["#6366f1", "#2563eb"] as const, // indigo-500 to blue-600
  corporate: ["#10b981", "#0d9488"] as const, // emerald-500 to teal-600
  sport: ["#ef4444", "#e11d48"] as const, // red-500 to rose-600
  music: ["#8b5cf6", "#4f46e5"] as const, // violet-500 to indigo-600
  default: ["#f59e0b", "#ea580c"] as const, // amber-500 to orange-600
};

// Darker versions of marker colors for dark mode
const DARK_MARKER_COLORS: Record<string, readonly [string, string]> = {
  birthday: ["#9D174D", "#6D28D9"] as const, // darker pink to purple
  wedding: ["#4338CA", "#3730A3"] as const, // darker indigo to blue
  corporate: ["#065F46", "#064E3B"] as const, // darker emerald to teal
  sport: ["#991B1B", "#9F1239"] as const, // darker red to rose
  music: ["#5B21B6", "#4338CA"] as const, // darker violet to indigo
  default: ["#B45309", "#C2410C"] as const, // darker amber to orange
};

// Modern dark theme for Google Maps
const darkMapStyle: MapStyleElement[] = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#8ec3b9" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1a3646" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64779e" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0c0d15" }],
  },
];

// Light version of map style
const lightMapStyle: MapStyleElement[] = [];

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

// Determine marker colors based on party type
const getMarkerColor = (
  partyType: string,
  isDarkMode: boolean
): readonly [string, string] => {
  const markerColors = isDarkMode ? DARK_MARKER_COLORS : LIGHT_MARKER_COLORS;
  const normalizedType = partyType.toLowerCase().replace(/\s+/g, "");

  for (const type of Object.keys(markerColors)) {
    if (normalizedType.includes(type)) {
      return markerColors[type as keyof typeof markerColors];
    }
  }

  return markerColors.default;
};

// Function to check if coordinates are valid
const isValidGeoPosition = (position: Geo | null): boolean => {
  if (!position) return false;
  const { lat, lng } = position;
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
      const animY = isVeryClose ? -10 : isNearby ? -7 : -4;

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
    ? 32 // w-8 h-8 equivalent
    : isNearby
    ? 24 // w-6 h-6 equivalent
    : 20; // w-5 h-5 equivalent

  const ringSize = isVeryClose
    ? 48 // marker size + 16
    : isNearby
    ? 36 // marker size + 12
    : 30; // marker size + 10

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
              opacity: isVeryClose ? 0.7 : isNearby ? 0.5 : 0.3,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

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
                backgroundColor: isDarkMode
                  ? "rgba(31, 41, 55, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                borderColor: isDarkMode
                  ? "rgba(55, 65, 81, 0.5)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <Text
              style={[
                styles.distanceText,
                {
                  color: isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY,
                },
              ]}
            >
              {distance.toFixed(1)} km
            </Text>
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

  // Define gradient colors
  const outerGradientColors = isDarkMode
    ? (["#3B82F6", "#7C3AED"] as const) // Blue to purple
    : (["#7F00FF", "#E100FF"] as const); // Primary gradient

  const innerGradientColors = isDarkMode
    ? (["#60A5FA", "#8B5CF6"] as const)
    : (["#9333EA", "#E100FF"] as const);

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
                ? "rgba(31, 41, 55, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
              borderColor: isDarkMode
                ? "rgba(55, 65, 81, 0.5)"
                : "rgba(0, 0, 0, 0.1)",
            },
          ]}
        >
          <Text
            style={[
              styles.locationLabelText,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_PRIMARY
                  : COLORS.LIGHT_TEXT_PRIMARY,
              },
            ]}
          >
            You are here
          </Text>
        </View>
      </View>
    </Marker>
  );
};

// Map Controls Component
const MapControls: FC<{
  myGeo: Geo | null;
  onCenterLocation: () => void;
  centeringOnLocation: boolean;
  isDarkMode: boolean;
  onToggleLegend: () => void;
  showLegend: boolean;
}> = ({
  myGeo,
  onCenterLocation,
  centeringOnLocation,
  isDarkMode,
  onToggleLegend,
  showLegend,
}) => {
  const hasValidMyGeo = isValidGeoPosition(myGeo);
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  return (
    <View style={styles.controlsContainer}>
      {/* Legend toggle button */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            backgroundColor: isDarkMode
              ? "rgba(31, 41, 55, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
            borderColor: isDarkMode
              ? "rgba(55, 65, 81, 0.5)"
              : "rgba(230, 234, 240, 0.8)",
          },
        ]}
        activeOpacity={0.7}
        onPress={onToggleLegend}
      >
        <FontAwesome
          name="info"
          size={16}
          color={
            showLegend
              ? getAccentColor()
              : isDarkMode
              ? COLORS.DARK_TEXT_PRIMARY
              : COLORS.LIGHT_TEXT_PRIMARY
          }
        />
      </TouchableOpacity>

      {/* Location button - only shown when we have a valid location */}
      {hasValidMyGeo && (
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: isDarkMode
                ? "rgba(31, 41, 55, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
              borderColor: isDarkMode
                ? "rgba(55, 65, 81, 0.5)"
                : "rgba(230, 234, 240, 0.8)",
            },
          ]}
          activeOpacity={0.7}
          onPress={onCenterLocation}
        >
          <FontAwesome5
            name="crosshairs"
            size={16}
            color={
              centeringOnLocation
                ? getAccentColor()
                : isDarkMode
                ? COLORS.DARK_TEXT_PRIMARY
                : COLORS.LIGHT_TEXT_PRIMARY
            }
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Simplified Map Legend Component
// const MapLegend: FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
//   const getAccentColor = () =>
//     isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

//   // Get appropriate marker colors based on dark mode
//   const markerColors = isDarkMode ? DARK_MARKER_COLORS : LIGHT_MARKER_COLORS;

//   return (
//     <BlurView
//       intensity={isDarkMode ? 40 : 30}
//       tint={isDarkMode ? "dark" : "light"}
//       style={styles.legendContainer}
//     >
//       <View
//         style={[
//           styles.legendContent,
//           {
//             backgroundColor: isDarkMode
//               ? "rgba(31, 41, 55, 0.5)"
//               : "rgba(255, 255, 255, 0.5)",
//             borderColor: isDarkMode ? COLORS.DARK_BORDER : COLORS.LIGHT_BORDER,
//           },
//         ]}
//       >
//         <Text
//           style={[
//             styles.legendTitle,
//             {
//               color: getAccentColor(),
//               borderBottomColor: isDarkMode
//                 ? "rgba(55, 65, 81, 0.5)"
//                 : "rgba(230, 234, 240, 0.8)",
//             },
//           ]}
//         >
//           Event Types
//         </Text>

//         <View style={styles.legendItemsContainer}>
//           {Object.entries({
//             music: "Music Festival",
//             birthday: "Birthday Party",
//             wedding: "Wedding",
//             corporate: "Corporate Event",
//             sport: "Sport Event",
//           }).map(([key, label]) => (
//             <View key={key} style={styles.legendItem}>
//               <LinearGradient
//                 colors={markerColors[key as keyof typeof markerColors]}
//                 style={styles.legendDot}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               />
//               <Text
//                 style={[
//                   styles.legendText,
//                   {
//                     color: isDarkMode
//                       ? COLORS.DARK_TEXT_SECONDARY
//                       : COLORS.LIGHT_TEXT_SECONDARY,
//                   },
//                 ]}
//               >
//                 {label}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     </BlurView>
//   );
// };

// Enhanced Google Maps Component
const Map: FC<MapProps> = ({
  parties = [],
  center = null,
  zoom = 2,
  myGeo = null,
  setZoom = () => {},
  onClick = () => {},
  selectedCountry,
  selectedRegion,
  isDarkMode = false,
}) => {
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
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const mapOpacityAnim = useRef(new Animated.Value(0)).current;

  // Get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Calculate appropriate delta values based on zoom level
  const zoomToDelta = (
    zoomLevel: number | null
  ): { latitudeDelta: number; longitudeDelta: number } => {
    if (!zoomLevel) return { latitudeDelta: 50, longitudeDelta: 50 };
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

  // Toggle legend visibility
  const handleToggleLegend = () => {
    setShowLegend(!showLegend);
  };

  const hasValidMyGeo = isValidGeoPosition(userLocation);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mapWrapper, { opacity: mapOpacityAnim }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          customMapStyle={isDarkMode ? darkMapStyle : lightMapStyle}
          showsUserLocation={false}
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
          mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {/* User location radius circle */}
          {hasValidMyGeo && userLocation && (
            <Circle
              center={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
              }}
              radius={5000} // 5km radius
              strokeColor={getAccentColor()}
              strokeWidth={1}
              fillColor={
                isDarkMode
                  ? "rgba(127, 0, 255, 0.05)"
                  : "rgba(255, 0, 153, 0.05)"
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

        {/* Map Controls */}
        <MapControls
          myGeo={userLocation}
          onCenterLocation={handleCenterOnLocation}
          centeringOnLocation={centeringOnLocation}
          isDarkMode={isDarkMode}
          onToggleLegend={handleToggleLegend}
          showLegend={showLegend}
        />

        {/* Map Legend (conditional) */}
        {/* {showLegend && <MapLegend isDarkMode={isDarkMode} />} */}

        {/* Event count badge */}
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: isDarkMode
                ? "rgba(31, 41, 55, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
              borderColor: isDarkMode
                ? "rgba(55, 65, 81, 0.5)"
                : "rgba(230, 234, 240, 0.8)",
            },
          ]}
        >
          <FontAwesome5
            name="map-marker-alt"
            size={12}
            color={getAccentColor()}
          />
          <Text
            style={[
              styles.countText,
              {
                color: isDarkMode
                  ? COLORS.DARK_TEXT_PRIMARY
                  : COLORS.LIGHT_TEXT_PRIMARY,
              },
            ]}
          >
            {parties.length} Events
          </Text>
        </View>

        {/* Location badge - only shown when country/region selected */}
        {selectedCountry && (
          <View
            style={[
              styles.locationBadge,
              {
                backgroundColor: isDarkMode
                  ? "rgba(31, 41, 55, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                borderColor: isDarkMode
                  ? "rgba(55, 65, 81, 0.5)"
                  : "rgba(230, 234, 240, 0.8)",
              },
            ]}
          >
            <FontAwesome5
              name="globe-americas"
              size={12}
              color={getAccentColor()}
            />
            <Text
              style={[
                styles.locationText,
                {
                  color: isDarkMode
                    ? COLORS.DARK_TEXT_PRIMARY
                    : COLORS.LIGHT_TEXT_PRIMARY,
                },
              ]}
            >
              {selectedCountry?.name}
              {selectedRegion ? `, ${selectedRegion.name}` : ""}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 400,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  mapWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Party Marker Styles
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerDot: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    ...SHADOWS.SMALL,
  },
  markerRing: {
    position: "absolute",
    opacity: 0.4,
    zIndex: 1,
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
    bottom: -20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.M,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  distanceText: {
    fontSize: FONT_SIZES.XS,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    ...SHADOWS.SMALL,
  },
  userMarkerInnerGradient: {
    width: "100%",
    height: "100%",
  },
  locationLabel: {
    position: "absolute",
    top: 25,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  locationLabelText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
  },
  // Map Controls Styles
  controlsContainer: {
    position: "absolute",
    top: SPACING.S,
    right: SPACING.S,
    zIndex: 20,
    flexDirection: "column",
    gap: SPACING.XS,
  },
  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  // Legend Styles
  legendContainer: {
    position: "absolute",
    bottom: SPACING.S,
    left: SPACING.S,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
    zIndex: 20,
    maxWidth: width * 0.5,
    ...SHADOWS.SMALL,
  },
  legendContent: {
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 0.5,
    padding: SPACING.XS,
  },
  legendTitle: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    textAlign: "center",
    paddingBottom: SPACING.XS,
    marginBottom: SPACING.XS,
    borderBottomWidth: 0.5,
  },
  legendItemsContainer: {
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.XS,
  },
  legendText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  // Count Badge
  countBadge: {
    position: "absolute",
    top: SPACING.S,
    left: SPACING.S,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  countText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    marginLeft: 4,
  },
  // Location Badge
  locationBadge: {
    position: "absolute",
    bottom: SPACING.S,
    right: SPACING.S,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  locationText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    marginLeft: 4,
  },
});

export default Map;
