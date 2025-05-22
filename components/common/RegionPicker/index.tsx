import { BORDER_RADIUS, COLORS, FONTS, FONT_SIZES, SPACING } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import countryRegionData from "country-region-data";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Translate from "../Translate";

// Custom light theme secondary color - to match Input
const LIGHT_THEME_ACCENT = "#FF0099";

export interface RegionType {
  code: string;
  name: string;
}

interface RegionPickerProps {
  label?: string;
  placeholder?: string;
  value?: RegionType | null;
  onSelect: (item: RegionType) => void;
  containerStyle?: ViewStyle;
  error?: string;
  countryCode?: string | null;
  isDarkMode?: boolean; // Allow overriding the theme context
}

const RegionPicker: React.FC<RegionPickerProps> = ({
  label = "Region",
  placeholder = "Select a region",
  value = null,
  onSelect,
  containerStyle,
  error,
  countryCode = null,
  isDarkMode: forceDarkMode,
}) => {
  const { isDarkMode: contextDarkMode } = useTheme();
  const isDarkMode =
    forceDarkMode !== undefined ? forceDarkMode : contextDarkMode;

  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [regions, setRegions] = useState<RegionType[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<RegionType[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const modalSlideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

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

      // Focus the search input when modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    } else {
      modalSlideAnim.setValue(Dimensions.get("window").height);
    }
  }, [showModal]);

  // Update regions when country changes
  useEffect(() => {
    if (countryCode) {
      // Find the country data in the country-region-data package
      const countryData: any = countryRegionData.find(
        (country: any) => country.countryShortCode === countryCode
      );

      if (countryData && countryData.regions) {
        // Convert region data to our format
        const formattedRegions = countryData.regions.map((region: any) => ({
          code: region.shortCode || region.name.replace(/\s+/g, ""), // Fallback if no code
          name: region.name,
        }));

        setRegions(formattedRegions);
        setFilteredRegions(formattedRegions);
      } else {
        setRegions([]);
        setFilteredRegions([]);
      }
    } else {
      setRegions([]);
      setFilteredRegions([]);
    }
  }, [countryCode]);

  // Filter regions based on search text - we're not using this anymore
  useEffect(() => {}, [searchText, regions]);

  // Handle region selection
  const handleSelect = (item: RegionType) => {
    onSelect(item);
    setShowModal(false);
    setSearchText("");
    setIsFocused(false);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSearchText("");
    setIsFocused(false);
  };

  // Format display text
  const getSelectedRegionName = () => {
    if (!value) return <Translate>{placeholder}</Translate>;
    return value.name;
  };

  // Theme-based styles (matching Input component)
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  const getPlaceholderColor = () =>
    isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.35)";

  const getLabelColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  const getBackgroundColor = () =>
    isDarkMode
      ? isFocused
        ? "rgba(40, 45, 55, 0.65)"
        : "rgba(30, 35, 45, 0.5)"
      : isFocused
      ? "rgba(255, 255, 255, 0.65)"
      : "rgba(255, 255, 255, 0.5)";

  const getBorderColor = () =>
    isDarkMode
      ? isFocused
        ? COLORS.SECONDARY
        : "rgba(255, 255, 255, 0.1)"
      : isFocused
      ? LIGHT_THEME_ACCENT
      : "rgba(0, 0, 0, 0.05)";

  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Render region item
  const renderItem = ({ item }: { item: RegionType }) => (
    <TouchableOpacity
      style={[
        styles.regionItem,
        {
          borderBottomColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
        },
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.regionName, { color: getTextColor() }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Function to handle text change with focus maintenance
  // const handleTextChange = (text: string) => {
  //   setSearchText(text);

  //   // Fixed the filter logic - correctly using the new text parameter
  //   if (text) {
  //     const filtered = regions.filter((region) =>
  //       region.name.toLowerCase().includes(text.toLowerCase())
  //     );
  //     setFilteredRegions(filtered);
  //   } else {
  //     setFilteredRegions(regions);
  //   }
  // };

  // If no regions are available for the country
  const NoRegionsMessage = () => (
    <View style={styles.noRegionsContainer}>
      <Text
        style={[
          styles.noRegionsText,
          {
            color: isDarkMode
              ? COLORS.DARK_TEXT_SECONDARY
              : COLORS.LIGHT_TEXT_SECONDARY,
          },
        ]}
      >
        <Translate>No regions available for this country</Translate>
      </Text>
    </View>
  );

  const handleModalOpen = () => {
    if (countryCode) {
      setIsFocused(true);
      setShowModal(true);
    }
  };

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && (
        <Text style={[styles.inputLabel, { color: getLabelColor() }]}>
          <Translate>{label}</Translate>
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 1 : 0.5,
            opacity: !countryCode ? 0.7 : 1,
          },
          error && styles.inputWrapperError,
        ]}
      >
        <View style={styles.iconContainer}>
          <FontAwesome
            name="map-marker"
            size={16}
            color={
              !countryCode
                ? isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.2)"
                : isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY
            }
          />
        </View>

        <TouchableOpacity
          style={styles.pickerTouchable}
          onPress={handleModalOpen}
          activeOpacity={0.7}
          disabled={!countryCode}
        >
          <Text
            style={[
              styles.selectedText,
              {
                color: !countryCode
                  ? isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.2)"
                  : value
                  ? getTextColor()
                  : getPlaceholderColor(),
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {!countryCode ? (
              <Translate>Select a country first</Translate>
            ) : (
              getSelectedRegionName()
            )}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chevronContainer}
          onPress={handleModalOpen}
          activeOpacity={0.7}
          disabled={!countryCode}
        >
          <FontAwesome
            name="chevron-down"
            size={12}
            color={
              !countryCode
                ? isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.2)"
                : isDarkMode
                ? COLORS.DARK_TEXT_SECONDARY
                : COLORS.LIGHT_TEXT_SECONDARY
            }
          />
        </TouchableOpacity>

        {/* Accent indicator for focused state */}
        {isFocused && (
          <View
            style={[
              styles.focusAccent,
              {
                backgroundColor: getAccentColor(),
              },
            ]}
          />
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: COLORS.ERROR }]}>
          <Translate>{error}</Translate>
        </Text>
      )}

      {/* Region Picker Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: modalSlideAnim }],
                backgroundColor: isDarkMode
                  ? COLORS.DARK_BG_SECONDARY
                  : "#FFFFFF",
              },
            ]}
          >
            {regions.length > 0 ? (
              <FlatList
                data={filteredRegions}
                renderItem={renderItem}
                keyExtractor={(item) => item.code}
                style={styles.regionList}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                ListEmptyComponent={
                  <View style={styles.noResults}>
                    <Text
                      style={[
                        styles.noResultsText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      <Translate>
                        No regions found matching your search
                      </Translate>
                    </Text>
                  </View>
                }
              />
            ) : (
              <>
                <NoRegionsMessage />
              </>
            )}

            {/* Add a backdrop to handle click outside to close modal */}
            <TouchableOpacity
              style={styles.closeTouchable}
              activeOpacity={1}
              onPress={handleCloseModal}
            >
              <FontAwesome
                name="times"
                size={14}
                color={COLORS.WHITE}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: SPACING.M,
    width: "100%",
  },
  inputLabel: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.MEDIUM,
    marginBottom: SPACING.XS,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    position: "relative",
  },
  focusAccent: {
    position: "absolute",
    left: 0,
    width: 3,
    height: "100%",
    borderTopRightRadius: BORDER_RADIUS.S,
    borderBottomRightRadius: BORDER_RADIUS.S,
  },
  inputWrapperError: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  iconContainer: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerTouchable: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  selectedText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  chevronContainer: {
    paddingHorizontal: SPACING.M,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
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
    position: "relative",
    zIndex: 1,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listHeaderContainer: {
    width: "100%",
    position: "relative",
    zIndex: 2,
  },
  modalHeader: {
    paddingVertical: SPACING.M,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.BOLD,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.M,
    margin: SPACING.M,
    paddingHorizontal: SPACING.S,
    height: 40,
    borderWidth: 1,
    zIndex: 3,
  },
  searchIcon: {
    marginRight: SPACING.S,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    paddingVertical: 0, // Helps with focus issues on Android
  },
  clearButton: {
    padding: 4,
    zIndex: 4,
  },
  regionList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  regionItem: {
    paddingVertical: SPACING.M,
    paddingHorizontal: SPACING.M,
    borderBottomWidth: 1,
  },
  regionName: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
  },
  noResults: {
    padding: SPACING.L,
    alignItems: "center",
  },
  noResultsText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
  },
  noRegionsContainer: {
    padding: SPACING.L,
    alignItems: "center",
  },
  noRegionsText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
  },
  closeTouchable: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  closeIcon: {
    opacity: 0.8,
  },
});

export default RegionPicker;
