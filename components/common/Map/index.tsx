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
import { FontAwesome5 } from "@expo/vector-icons";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Circle,
  MapStyleElement,
  Marker,
  Region,
} from "react-native-maps";
import { PartyDetailsModal } from "../Modal";

// Map props interface - keeping the same as studied
export interface MapProps {
  parties: Party[];
  center: Geo | null;
  zoom: number | null;
  myGeo: Geo | null;
  setZoom?: (zoom: number) => void;
  onClick?: (party: Party) => void;
  onJoin?: (party: Party) => void; // Add onJoin prop
  selectedCountry?: CountryType | null;
  selectedRegion?: RegionType | null;
  isDarkMode?: boolean;
}

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

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Enhanced dark map style to match web version
const darkMapStyle: MapStyleElement[] = [
  {
    elementType: "geometry",
    stylers: [{ color: "#121a30" }],
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
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c6675" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255763" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }],
  },
];

// Light map style - empty array for default style
const lightMapStyle: MapStyleElement[] = [];

// Animated Party Marker Component with proximity features
const AnimatedPartyMarker: FC<{
  party: Party;
  myGeo: Geo | null;
  onClick: (party: Party) => void;
  isDarkMode: boolean;
}> = ({ party, myGeo, onClick, isDarkMode }) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate distance from user's location if available
  const distance = myGeo ? calculateDistance(myGeo, party.geo) : null;

  // Determine proximity
  const isNearby = distance !== null && distance < 10; // Within 10km
  const isVeryClose = distance !== null && distance < 3; // Within 3km

  // Get marker color based on party type
  const getMarkerColor = () => {
    const normalizedType = party.type.toLowerCase().replace(/\s+/g, "");

    if (normalizedType.includes("birthday")) {
      return "#ec4899"; // pink
    } else if (normalizedType.includes("wedding")) {
      return "#6366f1"; // indigo
    } else if (normalizedType.includes("sport")) {
      return "#ef4444"; // red
    } else if (normalizedType.includes("movie")) {
      return "#8b5cf6"; // violet
    } else if (normalizedType.includes("corporate")) {
      return "#10b981"; // emerald
    } else {
      return "#f59e0b"; // amber
    }
  };

  // Start animations based on proximity
  useEffect(() => {
    const animationDuration = isVeryClose ? 1000 : isNearby ? 1500 : 2000;

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: isVeryClose ? 1.3 : isNearby ? 1.2 : 1.1,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for very close parties
    if (isVeryClose) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isVeryClose, isNearby, bounceAnim, pulseAnim]);

  return (
    <Marker
      coordinate={{
        latitude: party.geo.lat,
        longitude: party.geo.lng,
      }}
      onPress={() => onClick(party)}
      anchor={{ x: 0.5, y: 0.8 }} // Anchor at bottom center for better positioning
    >
      <View style={styles.markerContainer}>
        {/* Extra glow for very close parties */}
        {isVeryClose && (
          <Animated.View
            style={[
              styles.extraGlow,
              {
                transform: [{ scale: pulseAnim }],
                backgroundColor: getMarkerColor() + "40",
              },
            ]}
          />
        )}

        {/* Main marker with bounce animation */}
        <Animated.View
          style={[
            styles.markerWrapper,
            {
              transform: [{ scale: bounceAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.marker,
              {
                backgroundColor: getMarkerColor(),
                width: 24, // Same size for all markers
                height: 24, // Same size for all markers
                borderRadius: 12, // Same border radius for all markers
              },
            ]}
          >
            <FontAwesome5
              name={isVeryClose ? "star" : "map-marker-alt"}
              size={8} // Same icon size for all markers
              color="white"
            />
          </View>

          {/* Distance indicator */}
          {/* {distance !== null && (
            <View
              style={[
                styles.distanceIndicator,
                {
                  backgroundColor: isVeryClose
                    ? "#10b981"
                    : isNearby
                    ? "#3b82f6"
                    : "rgba(0,0,0,0.7)",
                },
              ]}
            >
              <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
            </View>
          )} */}
        </Animated.View>
      </View>
    </Marker>
  );
};

// Enhanced User Location Marker
const UserLocationMarker: FC<{
  position: Geo;
  isDarkMode: boolean;
}> = ({ position, isDarkMode }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Marker
      coordinate={{
        latitude: position.lat,
        longitude: position.lng,
      }}
    >
      <View style={styles.userMarkerContainer}>
        <Animated.View
          style={[
            styles.userMarkerGlow,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <View style={styles.userMarker}>
          <FontAwesome5 name="user" size={12} color="white" />
        </View>
        {/* <View style={styles.userLocationLabel}>
          <Text style={styles.userLocationText}>You are here</Text>
        </View> */}
      </View>
    </Marker>
  );
};

// Enhanced Legend Component
const MapLegend: FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  return (
    <View
      style={[
        styles.legend,
        {
          backgroundColor: isDarkMode
            ? "rgba(18, 26, 48, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
          borderColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
        },
      ]}
    >
      <Text
        style={[
          styles.legendTitle,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_PRIMARY
              : COLORS.LIGHT_TEXT_PRIMARY,
          },
        ]}
      >
        Map Legend
      </Text>

      {/* Legend items */}
      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "#4dabf7" }]} />
        <Text
          style={[
            styles.legendText,
            { color: isDarkMode ? "#8ec3b9" : "#374151" },
          ]}
        >
          Your Location
        </Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "#ec4899" }]} />
        <Text
          style={[
            styles.legendText,
            { color: isDarkMode ? "#8ec3b9" : "#374151" },
          ]}
        >
          Birthday Party
        </Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "#f59e0b" }]} />
        <Text
          style={[
            styles.legendText,
            { color: isDarkMode ? "#8ec3b9" : "#374151" },
          ]}
        >
          Common Party
        </Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "#6366f1" }]} />
        <Text
          style={[
            styles.legendText,
            { color: isDarkMode ? "#8ec3b9" : "#374151" },
          ]}
        >
          Wedding
        </Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "#10b981" }]} />
        <Text
          style={[
            styles.legendText,
            { color: isDarkMode ? "#8ec3b9" : "#374151" },
          ]}
        >
          Corporate Event
        </Text>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.legendColor, { backgroundColor: "#ef4444" }]} />
        <Text
          style={[
            styles.legendText,
            { color: isDarkMode ? "#8ec3b9" : "#374151" },
          ]}
        >
          Sport Event
        </Text>
      </View>
    </View>
  );
};

// Main Enhanced Map Component
const Map: FC<MapProps> = ({
  parties = [],
  center = null,
  zoom = 2,
  myGeo = null,
  setZoom = () => {},
  onClick = () => {},
  onJoin = () => {}, // Add onJoin with default
  isDarkMode = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: center?.lat || 37.78825,
    longitude: center?.lng || -122.4324,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });
  const [centeringOnLocation, setCenteringOnLocation] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Handle party marker click
  const handlePartyClick = (party: Party) => {
    setSelectedParty(party);
    setModalVisible(true);
    onClick(party); // Still call the original onClick
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedParty(null);
  };

  // Handle join party
  const handleJoinParty = (party: Party) => {
    onJoin(party);
    setModalVisible(false);
    setSelectedParty(null);
  };

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

  // Center on user location function
  const centerOnUserLocation = () => {
    if (myGeo && mapRef.current) {
      setCenteringOnLocation(true);
      const { latitudeDelta, longitudeDelta } = zoomToDelta(14);
      mapRef.current.animateToRegion(
        {
          latitude: myGeo.lat,
          longitude: myGeo.lng,
          latitudeDelta,
          longitudeDelta,
        },
        1000
      );

      // Reset centering state after animation
      setTimeout(() => setCenteringOnLocation(false), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mapContainer,
          {
            borderColor: isDarkMode ? COLORS.DARK_BORDER : COLORS.LIGHT_BORDER,
          },
        ]}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          // provider={PROVIDER_GOOGLE} // Comment out temporarily for testing
          initialRegion={mapRegion}
          zoomControlEnabled={true}
          customMapStyle={isDarkMode ? darkMapStyle : lightMapStyle}
          showsUserLocation={false}
          showsMyLocationButton={false}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
        >
          {/* User location radius circle */}
          {myGeo && isValidGeoPosition(myGeo) && (
            <Circle
              center={{
                latitude: myGeo.lat,
                longitude: myGeo.lng,
              }}
              radius={5000} // 5km radius
              strokeColor="#4dabf7"
              strokeWidth={1}
              fillColor="rgba(77, 171, 247, 0.05)"
            />
          )}

          {/* User location marker */}
          {myGeo && isValidGeoPosition(myGeo) && (
            <UserLocationMarker position={myGeo} isDarkMode={isDarkMode} />
          )}

          {/* Render party markers */}
          {parties.map((party, index) => (
            <AnimatedPartyMarker
              key={party._id || index}
              party={party}
              myGeo={myGeo}
              onClick={handlePartyClick} // Use the new handler
              isDarkMode={isDarkMode}
            />
          ))}
        </MapView>

        {/* Floating Controls */}
        <View style={styles.floatingControls}>
          {/* Search button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.1)",
                borderColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <FontAwesome5
              name="search"
              size={16}
              color={isDarkMode ? "white" : COLORS.PRIMARY}
            />
          </TouchableOpacity>

          {/* Location button - only shown when we have valid location */}
          {myGeo && isValidGeoPosition(myGeo) && (
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: centeringOnLocation
                    ? isDarkMode
                      ? "rgba(59, 130, 246, 0.5)"
                      : "rgba(99, 102, 241, 0.2)"
                    : isDarkMode
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(0, 0, 0, 0.1)",
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
              onPress={centerOnUserLocation}
            >
              <FontAwesome5
                name="crosshairs"
                size={16}
                color={isDarkMode ? "white" : COLORS.PRIMARY}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Event count badge */}
        <View
          style={[
            styles.eventCountBadge,
            {
              backgroundColor: isDarkMode
                ? "rgba(18, 26, 48, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
              borderColor: isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
            },
          ]}
        >
          <FontAwesome5
            name="map-marker-alt"
            size={12}
            color={isDarkMode ? COLORS.ACCENT_PURPLE_LIGHT : COLORS.PRIMARY}
          />
          <Text
            style={[
              styles.eventCountText,
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

        {/* Map Legend */}
        <MapLegend isDarkMode={isDarkMode} />

        {/* Party Details Modal */}
        <PartyDetailsModal
          party={selectedParty}
          visible={modalVisible}
          onClose={handleModalClose}
          onJoin={handleJoinParty}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 400,
  },
  mapContainer: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Marker styles
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  extraGlow: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.3,
  },
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  distanceIndicator: {
    position: "absolute",
    top: 30, // Reduced from 35 to bring closer to marker
    left: -15, // Center it better relative to marker
    right: -15,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: "center",
  },
  distanceText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },

  // User marker styles
  userMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(77, 171, 247, 0.3)",
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4dabf7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  userLocationLabel: {
    position: "absolute",
    top: 30,
    backgroundColor: "rgba(77, 171, 247, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  userLocationText: {
    fontSize: 8, // Smaller text
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },

  // Control styles
  floatingControls: {
    position: "absolute",
    top: SPACING.S,
    right: SPACING.S,
    gap: SPACING.XS,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    ...SHADOWS.SMALL,
  },

  // Badge styles
  eventCountBadge: {
    position: "absolute",
    top: SPACING.S,
    left: SPACING.S,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 1,
    ...SHADOWS.SMALL,
  },
  eventCountText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    marginLeft: 4,
  },

  // Legend styles
  legend: {
    position: "absolute",
    bottom: SPACING.S,
    left: SPACING.S,
    padding: SPACING.S,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 1,
    ...SHADOWS.SMALL,
    maxWidth: 160,
  },
  legendTitle: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    fontFamily: FONTS.REGULAR,
  },
});

export default Map;
