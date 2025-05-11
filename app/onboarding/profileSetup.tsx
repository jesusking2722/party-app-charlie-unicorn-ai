import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import our custom components
import {
  CountryPicker,
  Input,
  LocationPicker,
  RegionPicker,
} from "@/components/common";
import { CountryType, RegionType } from "@/types/place";
import { router } from "expo-router";

// Your Google API key
const GOOGLE_PLACES_API_KEY = "YOUR_GOOGLE_API_KEY";

// Define types for our form data

interface FormErrorsType {
  fullName?: string;
  username?: string;
  country?: string;
  region?: string;
  location?: string;
}

const ProfileSetupScreen = () => {
  // Form state
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [country, setCountry] = useState<CountryType | null>(null);
  const [region, setRegion] = useState<RegionType | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<any | null>(null);

  // Error state with proper typing
  const [errors, setErrors] = useState<FormErrorsType>({});

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors: FormErrorsType = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!country) {
      newErrors.country = "Country is required";
    }

    if (country && !region) {
      newErrors.region = "Region is required";
    }

    if (!location) {
      newErrors.location = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    router.push("/onboarding/professionSetup");
    // if (validateForm()) {
    //   setLoading(true);
    //   // Simulate API call
    //   setTimeout(() => {
    //     setLoading(false);
    //     // Navigate to next onboarding step
    //   }, 1500);
    // }
  };

  const handleLocationSelect = (data: any, details: any) => {
    setLocation(data.description);
    setLocationDetails(details);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#7F00FF", "#E100FF"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Personal Details</Text>
              <Text style={styles.subtitle}>Tell us a bit about yourself</Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
              />

              <Input
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                error={errors.username}
              />

              <CountryPicker
                label="Country"
                placeholder="Select your country"
                value={country}
                onSelect={(selectedCountry: any) => {
                  setCountry(selectedCountry);
                  setRegion(null);
                  setLocation(null);
                  setLocationDetails(null);
                }}
                error={errors.country}
              />

              <RegionPicker
                label="Region"
                placeholder="Select your region"
                value={region}
                onSelect={(selectedRegion) => {
                  setRegion(selectedRegion);
                  setLocation(null);
                  setLocationDetails(null);
                }}
                countryCode={country?.code}
                error={errors.region}
              />

              <LocationPicker
                label="Address"
                placeholder="Enter your address"
                value={location} // Add this to display the selected location
                onSelect={(locationData) => {
                  setLocation(locationData.formattedAddress);
                  setLocationDetails({
                    geometry: locationData.geometry,
                    address_components: locationData.address_components,
                  });
                }}
                countryCode={country?.code}
                regionCode={region?.code}
                error={errors.location}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#FF0099", "#7F00FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.continueButtonText}>Saving</Text>
                      <View style={styles.loadingDots}>
                        <Text style={styles.loadingDot}>.</Text>
                        <Text style={styles.loadingDot}>.</Text>
                        <Text style={styles.loadingDot}>.</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <FontAwesome5
                        name="arrow-right"
                        size={14}
                        color="white"
                        style={styles.buttonIcon}
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressLine}>
                <View style={styles.progressFilled} />
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>Step 1 of 4</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
  },
  formContainer: {
    width: "100%",
  },
  buttonContainer: {
    marginTop: 30,
  },
  skipButton: {
    alignSelf: "center",
    marginBottom: 16,
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
  continueButton: {
    borderRadius: 12,
    height: 56,
    overflow: "hidden",
  },
  continueButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    marginLeft: 4,
  },
  loadingDot: {
    color: "white",
    fontSize: 18,
    marginLeft: 2,
    fontFamily: "Montserrat-Bold",
  },
  progressContainer: {
    marginTop: 40,
  },
  progressLine: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFilled: {
    width: "25%", // 1 of 4 steps
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  progressTextContainer: {
    alignItems: "center",
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
  },
});

export default ProfileSetupScreen;
