import { FontAwesome } from "@expo/vector-icons";
import countryRegionData from "country-region-data";
import { LinearGradient } from "expo-linear-gradient";
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
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface RegionType {
  code: string;
  name: string;
}

interface RegionPickerProps {
  label?: string;
  placeholder?: string;
  value?: RegionType | null;
  onSelect: (item: RegionType) => void;
  containerStyle?: any;
  labelStyle?: any;
  error?: string;
  countryCode?: string | null;
}

const RegionPicker: React.FC<RegionPickerProps> = ({
  label = "Region",
  placeholder = "Select a region",
  value = null,
  onSelect,
  containerStyle,
  labelStyle,
  error,
  countryCode = null,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [regions, setRegions] = useState<RegionType[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<RegionType[]>([]);
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
          code: region.shortCode,
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

  // Filter regions based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = regions.filter((region) =>
        region.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredRegions(filtered);
    } else {
      setFilteredRegions(regions);
    }
  }, [searchText, regions]);

  // Handle region selection
  const handleSelect = (item: RegionType) => {
    onSelect(item);
    setShowModal(false);
    setSearchText("");
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSearchText("");
  };

  // Format display text
  const getSelectedRegionName = () => {
    if (!value) return placeholder;
    return value.name;
  };

  // Render region item
  const renderItem = ({ item }: { item: RegionType }) => (
    <TouchableOpacity
      style={styles.regionItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.regionName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render list header - removed close button
  const ListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Select a Region</Text>
      </View>

      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={16}
          color="rgba(255, 255, 255, 0.5)"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search regions..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText("")}
          >
            <FontAwesome
              name="times-circle"
              size={16}
              color="rgba(255, 255, 255, 0.5)"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // If no regions are available for the country
  const NoRegionsMessage = () => (
    <View style={styles.noRegionsContainer}>
      <Text style={styles.noRegionsText}>
        No regions available for this country
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.pickerContainer,
          error && styles.pickerContainerError,
          !countryCode && styles.pickerContainerDisabled,
        ]}
        onPress={() => countryCode && setShowModal(true)}
        disabled={!countryCode}
      >
        <Text
          style={[
            styles.selectedText,
            !value && styles.placeholderText,
            !countryCode && styles.disabledText,
          ]}
        >
          {!countryCode ? "Select a country first" : getSelectedRegionName()}
        </Text>
        <FontAwesome
          name="chevron-down"
          size={14}
          color={!countryCode ? "rgba(255, 255, 255, 0.3)" : "white"}
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

      {/* Region Picker Modal */}
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
                  },
                ]}
              >
                <LinearGradient
                  colors={["#5A0088", "#7F00FF"]}
                  style={styles.gradientBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />

                {regions.length > 0 ? (
                  <FlatList
                    data={filteredRegions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.code}
                    ListHeaderComponent={ListHeader}
                    style={styles.regionList}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <View style={styles.noResults}>
                        <Text style={styles.noResultsText}>
                          No regions found matching your search
                        </Text>
                      </View>
                    }
                  />
                ) : (
                  <>
                    <ListHeader />
                    <NoRegionsMessage />
                  </>
                )}
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
    fontFamily: "Montserrat-Medium",
    color: "white",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedText: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  disabledText: {
    color: "rgba(255, 255, 255, 0.3)",
  },
  errorText: {
    color: "rgba(255, 100, 100, 0.9)",
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: "Montserrat-Regular",
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
    fontFamily: "Montserrat-Bold",
    color: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    color: "white",
    fontFamily: "Montserrat-Regular",
  },
  clearButton: {
    padding: 4,
  },
  regionList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  regionItem: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  regionName: {
    color: "white",
    fontFamily: "Montserrat-Medium",
    fontSize: 16,
  },
  noResults: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    color: "white",
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
  },
  listHeaderContainer: {
    backgroundColor: "transparent",
  },
  noRegionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noRegionsText: {
    color: "white",
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    textAlign: "center",
  },
});

export default RegionPicker;
