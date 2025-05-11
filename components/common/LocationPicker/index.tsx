import { FONTS, THEME } from "@/app/theme";
import { GOOGLE_API_KEY } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface LocationPickerProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onSelect: (data: any) => void;
  containerStyle?: any;
  labelStyle?: any;
  error?: string;
  countryCode?: string | null;
  regionCode?: string | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  label = "Address",
  placeholder = "Enter your address",
  value = "",
  onSelect,
  containerStyle,
  labelStyle,
  error,
  countryCode = null,
  regionCode = null,
}) => {
  const { isDarkMode } = useTheme();
  // Get the appropriate theme based on isDarkMode
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const modalSlideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  // Add a ref for the text input to maintain focus
  const textInputRef = useRef<TextInput>(null);

  // Check if location picker is enabled (requires country and region)
  const isEnabled = countryCode && regionCode;

  // Run animations when error state changes
  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  // Run modal animation
  useEffect(() => {
    if (showModal) {
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setSearchText(value || "");

      // Focus the text input when modal opens
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 400); // Add a delay to ensure modal is fully visible
    } else {
      modalSlideAnim.setValue(Dimensions.get("window").height);
    }
  }, [showModal]);

  // Format display text
  const getDisplayText = () => {
    if (!isEnabled) return "Select country and region first";
    if (!value) return placeholder;
    return value;
  };

  const handleOpenModal = () => {
    setGeocodingError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setGeocodingError(null);
  };

  // Geocode the address using Google Geocoding API directly
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;

    try {
      setGeocoding(true);
      setGeocodingError(null);

      // Create a more specific address by adding country and region
      const fullAddress = `${address}, ${regionCode}, ${countryCode}`;

      // Check if Google API key is provided
      if (!GOOGLE_API_KEY) {
        throw new Error("Google API key is required for geocoding");
      }

      // Call Google Geocoding API directly
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];

        // Extract the coordinates
        const { lat, lng } = result.geometry.location;

        const locationData = {
          description: address,
          formattedAddress: result.formatted_address,
          geometry: {
            location: {
              lat,
              lng,
            },
          },
          address_components: result.address_components,
        };

        // Store in recent addresses
        if (!recentAddresses.includes(address)) {
          setRecentAddresses([address, ...recentAddresses.slice(0, 4)]);
        }

        onSelect(locationData);
        handleCloseModal();
      } else {
        // Handle error based on status
        switch (data.status) {
          case "ZERO_RESULTS":
            setGeocodingError(
              "No location found for this address. Please check the spelling or try a more specific address."
            );
            break;
          case "OVER_QUERY_LIMIT":
            setGeocodingError("Too many requests. Please try again later.");
            break;
          case "REQUEST_DENIED":
            setGeocodingError("Request denied. Please check your API key.");
            break;
          case "INVALID_REQUEST":
            setGeocodingError(
              "Invalid request. Please check the address format."
            );
            break;
          default:
            setGeocodingError(`Error finding location: ${data.status}`);
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodingError(
        "Error connecting to geocoding service. Please check your connection and try again."
      );
    } finally {
      setGeocoding(false);
    }
  };

  // Handle text change without losing focus
  const handleTextChange = (text: string) => {
    setSearchText(text);
  };

  // Render list header with search input
  const ListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: theme.TEXT_COLOR }]}>
          Enter Address
        </Text>
      </View>

      <View
        style={[styles.searchContainer, { backgroundColor: theme.INPUT_BG }]}
      >
        <FontAwesome
          name="search"
          size={16}
          color={theme.PLACEHOLDER_COLOR}
          style={styles.searchIcon}
        />
        <TextInput
          ref={textInputRef}
          style={[styles.searchInput, { color: theme.TEXT_COLOR }]}
          placeholder="Enter your address"
          placeholderTextColor={theme.PLACEHOLDER_COLOR}
          value={searchText}
          onChangeText={handleTextChange}
          autoFocus={true}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchText("");
              // Refocus input after clearing
              setTimeout(() => {
                if (textInputRef.current) {
                  textInputRef.current.focus();
                }
              }, 50);
            }}
          >
            <FontAwesome
              name="times-circle"
              size={16}
              color={theme.PLACEHOLDER_COLOR}
            />
          </TouchableOpacity>
        )}
      </View>

      {geocodingError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{geocodingError}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.confirmButton,
          { backgroundColor: theme.BUTTON_BG },
          (!searchText.trim() || geocoding) && styles.confirmButtonDisabled,
        ]}
        onPress={() => geocodeAddress(searchText)}
        disabled={!searchText.trim() || geocoding}
      >
        {geocoding ? (
          <ActivityIndicator color={theme.TEXT_COLOR} size="small" />
        ) : (
          <Text style={[styles.confirmButtonText, { color: theme.TEXT_COLOR }]}>
            Find Location
          </Text>
        )}
      </TouchableOpacity>

      {recentAddresses.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={[styles.recentTitle, { color: theme.TEXT_SECONDARY }]}>
            Recent Addresses
          </Text>
        </View>
      )}
    </View>
  );

  // Render recent address item
  const renderRecentItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.recentItem, { borderBottomColor: theme.BORDER_COLOR }]}
      onPress={() => {
        setSearchText(item);
        geocodeAddress(item);
      }}
    >
      <FontAwesome
        name="history"
        size={16}
        color={theme.TEXT_SECONDARY}
        style={styles.recentIcon}
      />
      <Text
        style={[styles.recentText, { color: theme.TEXT_COLOR }]}
        numberOfLines={1}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.TEXT_COLOR }, labelStyle]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.pickerContainer,
          { backgroundColor: theme.INPUT_BG },
          error && styles.pickerContainerError,
          !isEnabled && styles.pickerContainerDisabled,
        ]}
        onPress={() => isEnabled && handleOpenModal()}
        disabled={!isEnabled}
      >
        <Text
          style={[
            styles.selectedText,
            { color: theme.TEXT_COLOR },
            !value && { color: theme.PLACEHOLDER_COLOR },
            !isEnabled && styles.disabledText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getDisplayText()}
        </Text>
        <FontAwesome
          name="chevron-down"
          size={14}
          color={!isEnabled ? "rgba(255, 255, 255, 0.3)" : theme.TEXT_COLOR}
        />
      </TouchableOpacity>

      {error && (
        <Animated.Text
          style={[
            styles.errorText,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {error}
        </Animated.Text>
      )}

      {/* Address Input Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    transform: [{ translateY: modalSlideAnim }],
                    backgroundColor: theme.MODAL_BG,
                  },
                ]}
              >
                <LinearGradient
                  colors={isDarkMode ? (theme.GRADIENT as any) : theme.GRADIENT}
                  style={styles.gradientBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />

                <FlatList
                  data={recentAddresses}
                  renderItem={renderRecentItem}
                  keyExtractor={(item) => item}
                  ListHeaderComponent={ListHeader}
                  style={styles.addressList}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerContainerError: {
    borderWidth: 1,
    borderColor: "rgba(255, 100, 100, 0.7)",
  },
  pickerContainerDisabled: {
    opacity: 0.5,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
  },
  disabledText: {
    color: "rgba(255, 255, 255, 0.3)",
  },
  errorText: {
    color: "rgba(255, 100, 100, 0.9)",
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: FONTS.REGULAR,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    height: Dimensions.get("window").height * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listHeaderContainer: {
    backgroundColor: "transparent",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: FONTS.REGULAR,
  },
  clearButton: {
    padding: 4,
  },
  addressList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  confirmButton: {
    borderRadius: 12,
    height: 50,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.SEMIBOLD,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 10,
    backgroundColor: "rgba(255, 100, 100, 0.2)",
    borderRadius: 8,
  },
  errorMessage: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
  },
  recentContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  recentTitle: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  recentIcon: {
    marginRight: 12,
  },
  recentText: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    flex: 1,
  },
});

export default LocationPicker;
