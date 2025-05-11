import { FONTS, THEME } from "@/app/theme";
import {
  Button,
  CountryPicker,
  Dropdown,
  Input,
  LocationPicker,
  RegionPicker,
  Textarea,
} from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { CountryType, RegionType } from "@/types/place";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Party creation step types
type CreatePartyStep = "details" | "location" | "congratulations";

// Party type options
const partyTypeOptions = [
  { label: "Music Festival", value: "music" },
  { label: "Nightclub Event", value: "nightclub" },
  { label: "Private Party", value: "private" },
  { label: "Beach Party", value: "beach" },
  { label: "Corporate Event", value: "corporate" },
  { label: "Birthday Party", value: "birthday" },
  { label: "Wedding", value: "wedding" },
  { label: "Sports Event", value: "sport" },
];

// Payment options
const paymentOptions = [
  { label: "Free Entry", value: "free" },
  { label: "Paid Entry", value: "paid" },
];

// Fee options
const feeOptions = [
  { label: "$5", value: "5" },
  { label: "$10", value: "10" },
  { label: "$20", value: "20" },
  { label: "$50", value: "50" },
  { label: "$100", value: "100" },
];

// Currency options
const currencyOptions = [
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "PLN", value: "PLN" },
];

const CreatePartyScreen = () => {
  const { isDarkMode } = useTheme();
  // Get the appropriate theme based on isDarkMode
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  // Scroll view reference for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Step state
  const [currentStep, setCurrentStep] = useState<CreatePartyStep>("details");
  const [stepProgress, setStepProgress] = useState<number>(0);

  // Form state
  const [partyTitle, setPartyTitle] = useState<string>("");
  const [partyType, setPartyType] = useState<any>(null);
  const [partyDescription, setPartyDescription] = useState<string>("");

  const [country, setCountry] = useState<CountryType | null>(null);
  const [region, setRegion] = useState<RegionType | null>(null);
  const [address, setAddress] = useState<string>("");
  const [addressData, setAddressData] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<any>(null);
  const [fee, setFee] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update progress bar when step changes
  useEffect(() => {
    let progressValue = 0;

    switch (currentStep) {
      case "details":
        progressValue = 0;
        break;
      case "location":
        progressValue = 0.5;
        break;
      case "congratulations":
        progressValue = 1;
        if (confettiRef.current) {
          confettiRef.current.play();
        }
        break;
    }

    setStepProgress(progressValue);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 600,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Scroll to bottom when paid option is selected
  useEffect(() => {
    if (paymentType?.value === "paid") {
      // Add a short delay to ensure the UI has updated
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [paymentType]);

  // Form validation function
  const validateForm = (step: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === "details") {
      if (!partyTitle.trim()) {
        newErrors.partyTitle = "Party title is required";
      }
      if (!partyType) {
        newErrors.partyType = "Please select a party type";
      }
      if (!partyDescription.trim()) {
        newErrors.partyDescription = "Party description is required";
      } else if (partyDescription.length < 10) {
        newErrors.partyDescription =
          "Description must be at least 10 characters";
      }
    } else if (step === "location") {
      if (!country) {
        newErrors.country = "Country is required";
      }
      if (!region) {
        newErrors.region = "Region is required";
      }
      if (!address) {
        newErrors.address = "Address is required";
      }
      if (!paymentType) {
        newErrors.paymentType = "Please select an entry type";
      }

      if (paymentType?.value === "paid") {
        if (!fee) {
          newErrors.fee = "Please select a fee amount";
        }
        if (!currency) {
          newErrors.currency = "Please select a currency";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    switch (currentStep) {
      case "details":
        if (validateForm("details")) {
          animateStepTransition("location");
        }
        break;
      case "location":
        if (validateForm("location")) {
          animateStepTransition("congratulations");
        } else {
          // If validation fails, scroll to show errors
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
          }, 100);
        }
        break;
    }
  };

  // Handle back step
  const handleBackStep = () => {
    switch (currentStep) {
      case "location":
        animateStepTransition("details");
        break;
      case "congratulations":
        animateStepTransition("location");
        break;
    }
  };

  // Animate step transition
  const animateStepTransition = (nextStep: CreatePartyStep) => {
    // Fade out current step
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change step
      setCurrentStep(nextStep);

      // Reset animation values
      slideAnim.setValue(50);

      // Scroll to top when changing steps
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }

      // Fade in next step
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
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]).start();
    });
  };

  // Handle completion
  const handleComplete = () => {
    router.push("/main");
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "details":
        return (
          <View style={styles.formContainer}>
            <Text style={[styles.stepTitle, { color: theme.TEXT_COLOR }]}>
              Party Details
            </Text>

            <Input
              label="Party Title"
              placeholder="Enter a catchy title for your party"
              value={partyTitle}
              onChangeText={setPartyTitle}
              error={errors.partyTitle}
              autoCapitalize="words"
            />

            <Dropdown
              label="Party Type"
              placeholder="Select party type"
              options={partyTypeOptions}
              value={partyType}
              onSelect={setPartyType}
              error={errors.partyType}
            />

            <Textarea
              label="Party Description"
              placeholder="Describe your awesome party..."
              value={partyDescription}
              onChangeText={setPartyDescription}
              error={errors.partyDescription}
              minHeight={120}
              maxLength={500}
              showCharCount
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Next Step"
                variant={isDarkMode ? "indigo" : "primary"}
                icon={
                  <FontAwesome5
                    name="arrow-right"
                    size={16}
                    color="white"
                    style={{ marginLeft: 8 }}
                  />
                }
                iconPosition="right"
                onPress={handleNextStep}
              />
            </View>
          </View>
        );

      case "location":
        return (
          <View style={styles.formContainer}>
            <Text style={[styles.stepTitle, { color: theme.TEXT_COLOR }]}>
              Party Location & Payment
            </Text>

            <CountryPicker
              label="Country"
              placeholder="Select country"
              value={country as any}
              onSelect={(selectedCountry) => {
                setCountry(selectedCountry);
                setRegion(null);
                setAddress("");
                setAddressData(null);
              }}
              error={errors.country}
            />

            <RegionPicker
              label="Region"
              placeholder="Select region"
              value={region}
              onSelect={(selectedRegion) => {
                setRegion(selectedRegion);
                setAddress(""); // Clear address when region changes
                setAddressData(null);
              }}
              countryCode={country?.code}
              error={errors.region}
            />

            <LocationPicker
              label="Venue Address"
              placeholder="Enter the full address"
              value={address}
              onSelect={(locationData) => {
                setAddress(
                  locationData.formattedAddress || locationData.description
                );
                setAddressData(locationData);
              }}
              countryCode={country?.code}
              regionCode={region?.code}
              error={errors.address}
            />

            <Dropdown
              label="Entry Type"
              placeholder="Select entry type"
              options={paymentOptions}
              value={paymentType}
              onSelect={(value) => {
                setPaymentType(value);
                // Clear fee and currency when switching from paid to free
                if (value.value !== "paid") {
                  setFee(null);
                  setCurrency(null);
                }
              }}
              error={errors.paymentType}
            />

            {paymentType?.value === "paid" && (
              <View style={styles.paymentOptionsContainer}>
                <View style={styles.paymentRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Dropdown
                      label="Entry Fee"
                      placeholder="Select amount"
                      options={feeOptions}
                      value={fee}
                      onSelect={setFee}
                      error={errors.fee}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Dropdown
                      label="Currency"
                      placeholder="Select currency"
                      options={currencyOptions}
                      value={currency}
                      onSelect={setCurrency}
                      error={errors.currency}
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[
                  styles.backButton,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(31, 41, 55, 0.7)"
                      : "rgba(0, 0, 0, 0.2)",
                    borderColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(255, 255, 255, 0.15)",
                  },
                ]}
                onPress={handleBackStep}
              >
                <FontAwesome5
                  name="arrow-left"
                  size={16}
                  color={theme.TEXT_COLOR}
                />
                <Text
                  style={[styles.backButtonText, { color: theme.TEXT_COLOR }]}
                >
                  Back
                </Text>
              </TouchableOpacity>

              <Button
                title="Create Party"
                variant={isDarkMode ? "indigo" : "primary"}
                style={{ flex: 1, marginLeft: 12 }}
                onPress={handleNextStep}
              />
            </View>
          </View>
        );

      case "congratulations":
        return (
          <View style={styles.congratsContainer}>
            {/* Confetti animation */}
            <LottieView
              ref={confettiRef}
              source={require("@/assets/animations/confetti.json")}
              style={styles.confettiAnimation}
              loop={false}
              autoPlay={false}
              resizeMode="cover"
            />

            {/* Success Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: fadeAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={
                  isDarkMode ? ["#4F46E5", "#7C3AED"] : ["#FF9500", "#FF0099"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.iconGradient}
              >
                <FontAwesome5
                  name="check-circle"
                  size={40}
                  color="white"
                  solid
                />
              </LinearGradient>
            </Animated.View>

            <Animated.Text
              style={[
                styles.congratsTitle,
                {
                  opacity: fadeAnim,
                  color: theme.TEXT_COLOR,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Party Created!
            </Animated.Text>

            <Animated.Text
              style={[
                styles.congratsSubtitle,
                {
                  opacity: fadeAnim,
                  color: theme.TEXT_COLOR,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Your event has been successfully created
            </Animated.Text>

            <Animated.Text
              style={[
                styles.congratsMessage,
                {
                  opacity: fadeAnim,
                  color: theme.TEXT_SECONDARY,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {partyTitle} is now live! People can discover and join your event.
              You can manage all details from your dashboard.
            </Animated.Text>

            <Animated.View
              style={[
                styles.completeButtonContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Button
                title="Go to Dashboard"
                variant={isDarkMode ? "indigo" : "primary"}
                onPress={handleComplete}
              />
            </Animated.View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Set StatusBar properties */}
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
          <KeyboardAvoidingView
            style={styles.keyboardAvoidView}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            {/* Header with progress bar */}
            {currentStep !== "congratulations" && (
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <TouchableOpacity
                    style={styles.backIcon}
                    onPress={() => router.back()}
                  >
                    <FontAwesome5
                      name="arrow-left"
                      size={20}
                      color={theme.TEXT_COLOR}
                    />
                  </TouchableOpacity>

                  <Text
                    style={[styles.headerTitle, { color: theme.TEXT_COLOR }]}
                  >
                    Create New Party
                  </Text>

                  <View style={styles.placeholder} />
                </View>

                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressIndicator,
                      {
                        backgroundColor: theme.TEXT_COLOR,
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>

                <View style={styles.stepIndicatorsContainer}>
                  {/* First dot - always active */}
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: theme.TEXT_COLOR,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.stepConnector,
                      {
                        backgroundColor: theme.ACCENT_BG,
                      },
                    ]}
                  />
                  {/* Second dot - active for location and congratulations */}
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: [
                          "location",
                          "congratulations",
                        ].includes(currentStep as string)
                          ? theme.TEXT_COLOR
                          : theme.ACCENT_BG,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.stepConnector,
                      {
                        backgroundColor: theme.ACCENT_BG,
                      },
                    ]}
                  />
                  {/* Third dot - only active for congratulations */}
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: ["congratulations"].includes(
                          currentStep as string
                        )
                          ? theme.TEXT_COLOR
                          : theme.ACCENT_BG,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              // Add extra padding at the bottom for better scrolling
              contentInset={{ bottom: 80 }}
            >
              <Animated.View
                style={[
                  styles.formContent,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {renderStepContent()}
              </Animated.View>

              {/* Extra space at the bottom to ensure good scrollability */}
              {paymentType?.value === "paid" && <View style={{ height: 40 }} />}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Decorative elements */}
        <View
          style={[
            styles.decorativeCircle1,
            {
              backgroundColor: isDarkMode
                ? "rgba(79, 70, 229, 0.1)"
                : "rgba(255, 255, 255, 0.08)",
            },
          ]}
        />
        <View
          style={[
            styles.decorativeCircle2,
            {
              backgroundColor: isDarkMode
                ? "rgba(124, 58, 237, 0.08)"
                : "rgba(255, 255, 255, 0.06)",
            },
          ]}
        />
        <View
          style={[
            styles.decorativeCircle3,
            {
              backgroundColor: isDarkMode
                ? "rgba(79, 70, 229, 0.05)"
                : "rgba(255, 0, 153, 0.08)",
            },
          ]}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: "relative",
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 60, // Increased padding at bottom
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: FONTS.BOLD,
  },
  placeholder: {
    width: 40,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressIndicator: {
    height: "100%",
    borderRadius: 2,
  },
  stepIndicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepConnector: {
    height: 2,
    width: 32,
  },
  formContent: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20, // Added margin at bottom
  },
  stepTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 24,
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    marginLeft: 8,
    fontFamily: FONTS.MEDIUM,
    fontSize: 16,
  },
  paymentOptionsContainer: {
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  // Congratulations styles
  congratsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "relative",
  },
  confettiAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 32,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#FF0099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  congratsTitle: {
    fontSize: 42,
    fontFamily: FONTS.BOLD,
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 20,
  },
  congratsSubtitle: {
    fontSize: 18,
    fontFamily: FONTS.SEMIBOLD,
    marginBottom: 12,
    textAlign: "center",
    zIndex: 20,
  },
  congratsMessage: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "85%",
    marginBottom: 40,
    zIndex: 20,
  },
  completeButtonContainer: {
    width: "100%",
    maxWidth: 250,
    alignItems: "center",
    marginTop: 20,
    zIndex: 20,
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    top: -width * 0.2,
    right: -width * 0.2,
    zIndex: 1,
  },
  decorativeCircle2: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    bottom: -width * 0.1,
    left: -width * 0.1,
    zIndex: 1,
  },
  decorativeCircle3: {
    position: "absolute",
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    top: height * 0.15,
    left: width * 0.1,
    zIndex: 1,
  },
});

export default CreatePartyScreen;
