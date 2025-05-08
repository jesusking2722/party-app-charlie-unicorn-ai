import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";

interface CustomCountryPickerProps {
  label?: string;
  placeholder?: string;
  value?: any;
  onSelect: (item: any) => void;
  containerStyle?: any;
  labelStyle?: any;
  error?: string;
}

const CustomCountryPicker: React.FC<CustomCountryPickerProps> = ({
  label = "Country",
  placeholder = "Select a country",
  value = null,
  onSelect,
  containerStyle,
  labelStyle,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  // Handle country selection
  const handleSelect = (item: any) => {
    debugger;
    onSelect({
      code: item.code,
      name: item.name.en,
      flag: item.flag,
    });
    setShowModal(false);
  };

  // Format display text
  const getSelectedCountryName = () => {
    if (!value) return placeholder;
    return `${value.flag} ${value.name}`;
  };

  // Setup custom headers and modals components
  const GradientBackground = () => (
    <LinearGradient
      colors={["#5A0088", "#7F00FF"]} // Darker gradient version of your theme
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );

  const ListHeaderComponent = () => (
    <View style={styles.listHeaderContainer}>
      <GradientBackground />
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Select a Country</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity
        style={[styles.pickerContainer, error && styles.pickerContainerError]}
        onPress={() => setShowModal(true)}
      >
        <Text style={[styles.selectedText, !value && styles.placeholderText]}>
          {getSelectedCountryName()}
        </Text>
        <FontAwesome name="chevron-down" size={14} color="white" />
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

      {/* Country Picker Modal */}
      <CountryPicker
        lang="en"
        show={showModal}
        enableModalAvoiding={true}
        pickerButtonOnPress={(item) => handleSelect(item)}
        onBackdropPress={() => setShowModal(false)}
        inputPlaceholder="Search countries..."
        searchMessage="No countries found"
        ListHeaderComponent={ListHeaderComponent}
        style={{
          // Modal container
          modal: {
            height: Dimensions.get("window").height * 0.7,
            backgroundColor: "#5A0088", // Using the same exact color as RegionPicker
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          // Backdrop
          backdrop: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          // Input line
          line: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            height: 1,
          },
          // Text input
          textInput: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            borderRadius: 8,
            marginHorizontal: 16,
            marginVertical: 16,
            paddingHorizontal: 16,
            height: 40,
            fontFamily: "Montserrat-Regular",
            fontSize: 16,
          },
          // Country button
          countryButtonStyles: {
            backgroundColor: "transparent",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
            height: 60,
            paddingHorizontal: 16,
          },
          // Search message
          searchMessageText: {
            color: "white",
            fontFamily: "Montserrat-Regular",
            fontSize: 16,
            textAlign: "center",
            padding: 20,
          },
          // Flag text
          flag: {
            fontSize: 22,
            marginRight: 12,
          },
          // Dial code
          dialCode: {
            color: "white",
            fontFamily: "Montserrat-Regular",
            fontSize: 14,
            marginLeft: 8,
          },
          // Country name
          countryName: {
            color: "white",
            fontFamily: "Montserrat-Medium",
            fontSize: 16,
          },
          // Items list
          itemsList: {
            paddingHorizontal: 16,
          },
          // Country message container
          countryMessageContainer: {
            backgroundColor: "transparent",
          },
        }}
      />
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
  selectedText: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  errorText: {
    color: "rgba(255, 100, 100, 0.9)",
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: "Montserrat-Regular",
  },
  // Gradient and header styles
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
    width: "100%",
    position: "relative",
    zIndex: 10, // Added to ensure header content is above gradient
  },
  modalHeader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "white",
  },
});

export default CustomCountryPicker;
