import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import {
  Button,
  CountryPicker,
  Input,
  LanguageToggleGroup,
  LocationPicker,
  RegionPicker,
  ThemeToggle,
  Translate,
} from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { updateAuthUser } from "@/lib/scripts/auth.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import { User } from "@/types/data";
import { CountryType, RegionType } from "@/types/place";
import { router } from "expo-router";
import { useSelector } from "react-redux";

const PartyImage = require("@/assets/images/profile_onboarding.png");

const { width, height } = Dimensions.get("window");

// Custom light theme secondary color
const LIGHT_THEME_ACCENT = "#FF0099";

// Define types for our form data
interface FormErrorsType {
  fullName?: string;
  username?: string;
  country?: string;
  region?: string;
  location?: string;
}

const ProfileSetupScreen = () => {
  const { isDarkMode } = useTheme();

  // Form state
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [country, setCountry] = useState<CountryType | null>(null);
  const [region, setRegion] = useState<RegionType | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrorsType>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  // Particle animations for the background
  const particles = Array(6)
    .fill(0)
    .map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height * 0.4)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.4 + 0.3)).current,
      opacity: useRef(new Animated.Value(Math.random() * 0.4 + 0.2)).current,
      speed: Math.random() * 3000 + 2000,
    }));

  // Run animations when component mounts
  useEffect(() => {
    const animationDelay = Platform.OS === "ios" ? 200 : 300;

    // Main elements fade in
    setTimeout(() => {
      Animated.parallel([
        // Fade in entire view
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.MEDIUM,
          useNativeDriver: true,
        }),
        // Slide up animation
        Animated.spring(translateY, {
          toValue: 0,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        // Card scale animation
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        // Logo animation with bounce
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animation
      Animated.sequence([
        Animated.delay(animationDelay),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Start particle animations
      animateParticles();
    }, 100);
  }, []);

  // Continuous animation for floating particles
  const animateParticles = () => {
    particles.forEach((particle) => {
      // Animate vertical position
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.3) + height * 0.05,
            duration: particle.speed,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * (height * 0.3) + height * 0.05,
            duration: particle.speed,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
        ])
      ).start();

      // Animate scale
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: Math.random() * 0.3 + 0.4,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: Math.random() * 0.3 + 0.4,
            duration: particle.speed * 1.1,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate opacity
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.2 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.2 + 0.2,
            duration: particle.speed * 0.8,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

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

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateForm()) return;

    setLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 200,
        friction: 20,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const updatingUser: User = {
        ...user,
        name: fullName,
        shortname: username,
        country: country?.code,
        region: region?.name,
        address: location as string,
        geo: locationDetails.geometry.location,
      };
      const response = await updateAuthUser(updatingUser);
      console.log(response.data);
      if (response.ok) {
        const { user: updatedUser } = response.data;
        await dispatch(setAuthUserAsync(updatedUser)).unwrap();
        router.push("/onboarding/professionSetup");
      } else {
        showToast(response.message, "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
      console.error("handle profile setup onboarding submit: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderParticles = () => {
    return particles.map((particle, index) => (
      <Animated.View
        key={`particle-${index}`}
        style={[
          styles.particle,
          {
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
            ],
            opacity: particle.opacity,
            backgroundColor: isDarkMode
              ? `rgba(${127 + Math.floor(Math.random() * 128)}, ${Math.floor(
                  Math.random() * 100
                )}, ${Math.floor(Math.random() * 255)}, 0.7)`
              : `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                  Math.random() * 255
                )}, ${Math.floor(Math.random() * 255)}, 0.5)`,
          },
        ]}
      />
    ));
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Theme toggle button */}
      <View style={styles.themeToggle}>
        <ThemeToggle />
        <LanguageToggleGroup containerStyle={{ marginRight: SPACING.M }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Party Image Section (Top Half) */}
          <View style={styles.partyImageContainer}>
            <Image
              source={PartyImage}
              style={styles.partyImage}
              resizeMode="cover"
            />

            {/* Add floating particles for fun effect */}
            {renderParticles()}

            {/* Overlay gradient for readability */}
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0)"]}
              style={styles.imageOverlay}
            />
          </View>

          {/* Bottom Half with Animated Background */}
          <View style={styles.bottomHalf}>
            <LinearGradient
              colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
              style={styles.bottomGradient}
            />

            {/* Form Card */}
            <Animated.View
              style={[
                styles.cardContainer,
                {
                  transform: [{ translateY: translateY }, { scale: cardScale }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <BlurView
                intensity={isDarkMode ? 40 : 30}
                tint={isDarkMode ? "dark" : "light"}
                style={styles.cardBlur}
              >
                <LinearGradient
                  colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
                  style={styles.cardGradient}
                >
                  {/* Accent Bar */}
                  <View
                    style={[
                      styles.cardAccentBar,
                      {
                        backgroundColor: getAccentColor(),
                      },
                    ]}
                  />

                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.welcomeText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_PRIMARY
                            : COLORS.LIGHT_TEXT_PRIMARY,
                        },
                      ]}
                    >
                      <Translate>Personal Details</Translate>
                    </Text>
                    <Text
                      style={[
                        styles.subtitleText,
                        {
                          color: isDarkMode
                            ? COLORS.DARK_TEXT_SECONDARY
                            : COLORS.LIGHT_TEXT_SECONDARY,
                        },
                      ]}
                    >
                      <Translate>Tell us a bit about yourself</Translate>
                    </Text>

                    {/* Form Inputs */}
                    <View style={styles.formContainer}>
                      <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChangeText={(text) => {
                          setFullName(text);
                          if (errors.fullName)
                            setErrors({ ...errors, fullName: undefined });
                        }}
                        icon={
                          <FontAwesome
                            name="user"
                            size={16}
                            color={
                              isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY
                            }
                          />
                        }
                        error={errors.fullName}
                      />

                      <Input
                        label="Username"
                        placeholder="Choose a username"
                        value={username}
                        onChangeText={(text) => {
                          setUsername(text);
                          if (errors.username)
                            setErrors({ ...errors, username: undefined });
                        }}
                        icon={
                          <FontAwesome
                            name="at"
                            size={16}
                            color={
                              isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY
                            }
                          />
                        }
                        error={errors.username}
                      />

                      <CountryPicker
                        label="Country"
                        placeholder="Select your country"
                        value={country as any}
                        onSelect={(selectedCountry: any) => {
                          setCountry(selectedCountry);
                          setRegion(null);
                          setLocation(null);
                          setLocationDetails(null);
                          if (errors.country)
                            setErrors({ ...errors, country: undefined });
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
                          if (errors.region)
                            setErrors({ ...errors, region: undefined });
                        }}
                        countryCode={country?.code}
                        error={errors.region}
                      />

                      <LocationPicker
                        label="Address"
                        placeholder="Enter your address"
                        value={location}
                        onSelect={(locationData) => {
                          setLocation(locationData.formattedAddress);
                          setLocationDetails({
                            geometry: locationData.geometry,
                            address_components: locationData.address_components,
                          });
                          if (errors.location)
                            setErrors({ ...errors, location: undefined });
                        }}
                        countryCode={country?.code}
                        regionCode={region?.code}
                        error={errors.location}
                      />

                      {/* Progress Indicator */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                          <Text
                            style={[
                              styles.progressText,
                              {
                                color: isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY,
                              },
                            ]}
                          >
                            <Translate>Profile Setup</Translate>
                          </Text>
                          <Text
                            style={[
                              styles.progressStep,
                              {
                                color: getAccentColor(),
                              },
                            ]}
                          >
                            <Translate>Step 1 of 4</Translate>
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.progressBarContainer,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(0, 0, 0, 0.05)",
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: "25%", // 1 of 4 steps
                              },
                            ]}
                          >
                            <LinearGradient
                              colors={
                                isDarkMode
                                  ? GRADIENTS.PRIMARY
                                  : ["#FF0099", "#FF6D00"]
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.progressGradient}
                            />
                          </View>
                        </View>
                      </View>

                      {/* Continue Button */}
                      <Animated.View
                        style={{
                          width: "100%",
                          transform: [{ scale: buttonScale }],
                          marginTop: SPACING.M,
                        }}
                      >
                        <Button
                          title={loading ? "Saving..." : "Continue"}
                          onPress={handleSubmit}
                          loading={loading}
                          variant={isDarkMode ? "primary" : "secondary"}
                          small={true}
                          icon={
                            !loading && (
                              <FontAwesome5
                                name="arrow-right"
                                size={14}
                                color="white"
                                style={{ marginLeft: SPACING.S }}
                              />
                            )
                          }
                          iconPosition="right"
                        />
                      </Animated.View>
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  partyImageContainer: {
    height: height * 0.4,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  partyImage: {
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  bottomHalf: {
    minHeight: height * 0.75, // More space for form
    width: "100%",
    position: "relative",
    paddingBottom: SPACING.XL,
  },
  bottomGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    position: "relative",
    top: -height * 0.06,
    marginHorizontal: width * 0.05,
    width: width * 0.9,
    zIndex: 10,
    height: "auto",
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  cardBlur: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.XXL,
    overflow: "hidden",
  },
  cardAccentBar: {
    height: 6,
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.XXL,
    borderTopRightRadius: BORDER_RADIUS.XXL,
  },
  cardContent: {
    padding: SPACING.M,
  },
  welcomeText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
  },
  subtitleText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
  },
  formContainer: {
    width: "100%",
  },
  progressContainer: {
    marginTop: SPACING.M,
    marginBottom: SPACING.S,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.XS,
  },
  progressText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  progressStep: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XS,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: BORDER_RADIUS.S,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressGradient: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    zIndex: 100,
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
});

export default ProfileSetupScreen;
