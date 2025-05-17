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
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, {
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

// Dark map style
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
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
];

// Light map style - empty array for default style
const lightMapStyle: MapStyleElement[] = [];

// Simple Party Marker Component
const PartyMarker: FC<{
  party: Party;
  onClick: (party: Party) => void;
  isDarkMode: boolean;
}> = ({ party, onClick, isDarkMode }) => {
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

  return (
    <Marker
      coordinate={{
        latitude: party.geo.lat,
        longitude: party.geo.lng,
      }}
      pinColor={getMarkerColor()}
      onPress={() => onClick(party)}
    />
  );
};

// User Location Marker
const UserLocationMarker: FC<{
  position: Geo;
  isDarkMode: boolean;
}> = ({ position, isDarkMode }) => {
  // Get color based on theme
  const getMarkerColor = () => {
    return isDarkMode ? "#4F46E5" : "#7F00FF"; // Primary purple
  };

  return (
    <Marker
      coordinate={{
        latitude: position.lat,
        longitude: position.lng,
      }}
      pinColor={getMarkerColor()}
    />
  );
};

// Main Map Component
const Map: FC<MapProps> = ({
  parties = [],
  center = null,
  zoom = 2,
  myGeo = null,
  setZoom = () => {},
  onClick = () => {},
  isDarkMode = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: center?.lat || 37.78825,
    longitude: center?.lng || -122.4324,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });

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
      const { latitudeDelta, longitudeDelta } = zoomToDelta(14); // Zoom level 14
      mapRef.current.animateToRegion(
        {
          latitude: myGeo.lat,
          longitude: myGeo.lng,
          latitudeDelta,
          longitudeDelta,
        },
        1000
      );
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
          provider={PROVIDER_GOOGLE}
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
          {/* Render party markers */}
          {parties.map((party) => (
            <PartyMarker
              key={party._id}
              party={party}
              onClick={onClick}
              isDarkMode={isDarkMode}
            />
          ))}

          {/* User location marker */}
          {myGeo && isValidGeoPosition(myGeo) && (
            <UserLocationMarker position={myGeo} isDarkMode={isDarkMode} />
          )}
        </MapView>

        {/* Location button - only shown when we have valid location */}
        {myGeo && isValidGeoPosition(myGeo) && (
          <TouchableOpacity
            style={[
              styles.locationButton,
              {
                backgroundColor: isDarkMode
                  ? "rgba(31, 41, 55, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                borderColor: isDarkMode
                  ? "rgba(55, 65, 81, 0.5)"
                  : "rgba(230, 234, 240, 0.8)",
              },
            ]}
            onPress={centerOnUserLocation}
          >
            <FontAwesome5
              name="crosshairs"
              size={16}
              color={isDarkMode ? COLORS.ACCENT_PURPLE_LIGHT : COLORS.PRIMARY}
            />
          </TouchableOpacity>
        )}

        {/* Event count badge */}
        <View
          style={[
            styles.eventCountBadge,
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
  locationButton: {
    position: "absolute",
    top: SPACING.S,
    right: SPACING.S,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  eventCountBadge: {
    position: "absolute",
    top: SPACING.S,
    left: SPACING.S,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.S,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.M,
    borderWidth: 0.5,
    ...SHADOWS.SMALL,
  },
  eventCountText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.SEMIBOLD,
    marginLeft: 4,
  },
});

export default Map;
