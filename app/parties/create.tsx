import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  DatePicker,
  Dropdown,
  Input,
  LocationPicker,
  RegionPicker,
  Textarea,
} from "@/components/common";
import {
  CURRENCY_OPTIONS,
  EUR_FEE_OPTIONS,
  EVENT_PAYMENT_OPTIONS,
  EVENT_TYPES,
  PLN_FEE_OPTIONS,
  USD_FEE_OPTIONS,
} from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { uploadMultipleToImgBB } from "@/lib/services/imgbb.uploads.servce";
import socket from "@/lib/socketInstance";
import { addNewPartyAsync } from "@/redux/actions/party.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import { Party } from "@/types/data";
import { CountryType, RegionType } from "@/types/place";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { useSelector } from "react-redux";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Custom light theme accent color - matching ProfileSetup style
const LIGHT_THEME_ACCENT = "#FF0099";

// Party creation step types
type CreatePartyStep = "details" | "location" | "media" | "congratulations";

// Party Image Assets
const PartyDetailsImage = require("@/assets/images/preparing-party.png");
const PartyLocationImage = require("@/assets/images/party-location.png");
const PartyMediaImage = require("@/assets/images/party-image.png");
const PartyCongratulationsImage = require("@/assets/images/congratulations.png");

// Media type - simplified to only support images
export type MediaItem = {
  uri: string;
  id: string;
};

const CreatePartyScreen = () => {
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.97)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<LottieView>(null);

  // Form state
  const [currentStep, setCurrentStep] = useState<CreatePartyStep>("details");

  // Party details form state
  const [partyTitle, setPartyTitle] = useState<string>("");
  const [partyType, setPartyType] = useState<any>(null);
  const [partyDescription, setPartyDescription] = useState<string>("");

  // Location form state
  const [country, setCountry] = useState<CountryType | null>(null);
  const [region, setRegion] = useState<RegionType | null>(null);
  const [address, setAddress] = useState<string>("");
  const [addressData, setAddressData] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<any>(null);
  const [fee, setFee] = useState<any>(null);
  const [currency, setCurrency] = useState<any>("usd");

  // Media form state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Opening date
  const [openingDate, setOpeningDate] = useState<Date | null>(null);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string> | any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  // Scroll view reference for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  // Particle animations for the background (matching other screens)
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

  // Request permissions for media library access
  useEffect(() => {
    (async () => {
      const { status: mediaLibraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaLibraryStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your media library to upload images."
        );
      }

      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your camera to take photos."
        );
      }
    })();
  }, []);

  // Continuous animation for floating particles (matching ProfileSetup)
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

  // Function to pick images from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Images only
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        setIsUploading(true);

        // Process each selected asset
        const newMediaItems: MediaItem[] = [];

        for (const asset of result.assets) {
          // Add the image
          newMediaItems.push({
            uri: asset.uri,
            id: Date.now().toString() + Math.random().toString(),
          });
        }

        setMediaItems((prevItems) => [...prevItems, ...newMediaItems]);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      setIsUploading(false);
      Alert.alert("Error", "Failed to select images. Please try again.");
    }
  };

  // Function to capture image with camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Images only
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsUploading(true);

        const asset = result.assets[0];

        // Add the image
        setMediaItems((prevItems) => [
          ...prevItems,
          {
            uri: asset.uri,
            id: Date.now().toString() + Math.random().toString(),
          },
        ]);

        setIsUploading(false);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      setIsUploading(false);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  // Function to remove media item
  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Form validation function
  const validateForm = (step: CreatePartyStep): boolean => {
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
    } else if (step === "media") {
      // Media is optional, but we could add validation if needed
      // For example, requiring at least one image:
      // if (mediaItems.length === 0) {
      //   newErrors.media = "Please add at least one image";
      // }
      if (!openingDate) {
        newErrors.openingDate = "Please add your opening date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = async () => {
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
      switch (currentStep) {
        case "details":
          if (validateForm("details")) {
            changeStep("location");
          }
          break;
        case "location":
          if (validateForm("location")) {
            changeStep("media");
          }
          break;
        case "media":
          if (validateForm("media")) {
            // If we have media items, upload them first
            if (mediaItems.length > 0) {
              setLoading(false);
              setIsUploading(true);
              try {
                // Upload images before proceeding
                const muls = await uploadMultipleToImgBB(mediaItems);
                setMediaUrls(muls);
                setIsUploading(false);
              } catch (error) {
                console.error("Failed to upload images:", error);
                setIsUploading(false);
                setLoading(false);
                return;
              }
            }

            changeStep("congratulations");
            // Play confetti animation if we're moving to congratulations
            setTimeout(() => {
              if (confettiRef.current) {
                confettiRef.current.play();
              }
              // Animate the checkmark
              Animated.spring(checkmarkScale, {
                toValue: 1,
                tension: 80,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }, 300);
          }
          break;
      }
    } catch (error) {
      console.error("Error in handleNextStep:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle back step
  const handleBackStep = () => {
    switch (currentStep) {
      case "location":
        changeStep("details");
        break;
      case "media":
        changeStep("location");
        break;
      case "congratulations":
        changeStep("media");
        break;
    }
  };

  // Change step with animation
  const changeStep = (nextStep: CreatePartyStep) => {
    // Reset scroll position
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Change step
      setCurrentStep(nextStep);
      // Reset checkmark scale if going back from congratulations
      if (nextStep !== "congratulations") {
        checkmarkScale.setValue(0);
      }
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const createNewEvent = (partyData: Party, userId: string): Promise<Party> => {
    return new Promise((resolve) => {
      socket.once("party:created", (newParty: Party) => {
        resolve(newParty);
      });
      socket.emit("party:creating", partyData, userId);
    });
  };

  // Handle completion
  const handleComplete = async () => {
    if (!user?._id || !region?.name || !country?.name || !openingDate) return;

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

    setLoading(true);

    try {
      const newEvent: Party = {
        title: partyTitle,
        description: partyDescription,
        type: partyType.value,
        address,
        country: country.name,
        paidOption: paymentType.value,
        creator: user,
        region: region.name,
        geo: addressData.geometry.location,
        fee: fee.value,
        currency: currency.value,
        status: "opening",
        medias: mediaUrls,
        applicants: [],
        finishApproved: [],
        openingAt: openingDate,
        createdAt: new Date(),
      };

      const createdEvent = await createNewEvent(newEvent, user._id);

      await dispatch(addNewPartyAsync(createdEvent)).unwrap();

      router.replace("/parties");
    } catch (error) {
      console.error("handle create event error: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Render particles effect
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

  // Render media buttons or loading indicator
  const renderMediaButtons = () => {
    if (isUploading) {
      return (
        <View style={styles.mediaLoadingContainer}>
          <View style={styles.mediaLoadingIndicator}>
            <LinearGradient
              colors={
                isDarkMode
                  ? ["rgba(40, 45, 55, 0.8)", "rgba(30, 35, 45, 0.8)"]
                  : ["rgba(255, 255, 255, 0.8)", "rgba(245, 245, 245, 0.8)"]
              }
              style={styles.mediaLoadingGradient}
            >
              <ActivityIndicator
                size="small"
                color={isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT}
              />
              <Text
                style={[
                  styles.mediaLoadingText,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY,
                  },
                ]}
              >
                Processing images...
              </Text>
            </LinearGradient>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mediaButtonsContainer}>
        {/* Upload from gallery button */}
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={pickImage}
          disabled={isUploading}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? ["#4A00E0", "#8E2DE2"] // Deep purple to violet gradient for dark mode
                : ["#FF6CAB", "#7366FF"] // Pink to blue gradient for light mode
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mediaButtonGradient}
          >
            <View style={styles.mediaButtonContent}>
              <View style={styles.mediaButtonIconContainer}>
                <FontAwesome5 name="images" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.mediaButtonText}>Upload Photos</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Take photo button */}
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={takePhoto}
          disabled={isUploading}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? ["#11998E", "#38EF7D"] // Deep teal to bright green for dark mode
                : ["#FF5F6D", "#FFC371"] // Red-orange to yellow gradient for light mode
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mediaButtonGradient}
          >
            <View style={styles.mediaButtonContent}>
              <View style={styles.mediaButtonIconContainer}>
                <FontAwesome5 name="camera" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.mediaButtonText}>Take Photo</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  // Render a media item
  const renderMediaItem = (item: MediaItem) => {
    return (
      <View key={item.id} style={styles.mediaItemContainer}>
        <Image
          source={{ uri: item.uri }}
          style={styles.mediaItemImage}
          resizeMode="cover"
        />

        {/* Delete button */}
        <TouchableOpacity
          style={styles.mediaDeleteButton}
          onPress={() => removeMediaItem(item.id)}
        >
          <LinearGradient
            colors={
              isDarkMode ? ["#d32f2f", "#b71c1c"] : ["#f44336", "#d32f2f"]
            }
            style={styles.mediaDeleteButtonGradient}
          >
            <FontAwesome5 name="times" size={10} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  // Get the appropriate image based on current step
  const getStepImage = () => {
    switch (currentStep) {
      case "details":
        return PartyDetailsImage;
      case "location":
        return PartyLocationImage;
      case "media":
        return PartyMediaImage;
      case "congratulations":
        return PartyCongratulationsImage;
      default:
        return PartyDetailsImage;
    }
  };

  // Get the progress percentage based on current step
  const getProgressPercentage = () => {
    switch (currentStep) {
      case "details":
        return "25%";
      case "location":
        return "50%";
      case "media":
        return "75%";
      case "congratulations":
        return "100%";
      default:
        return "25%";
    }
  };

  // Get the step number text
  const getStepText = () => {
    switch (currentStep) {
      case "details":
        return "Step 1 of 4";
      case "location":
        return "Step 2 of 4";
      case "media":
        return "Step 3 of 4";
      case "congratulations":
        return "Step 4 of 4";
      default:
        return "Step 1 of 4";
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? COLORS.DARK_BG : COLORS.LIGHT_BG },
      ]}
    >
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Party Image Section (Top Half) */}
          <View style={styles.partyImageContainer}>
            <Image
              source={getStepImage()}
              style={styles.partyImage}
              resizeMode="cover"
            />

            {/* Add floating particles for fun effect */}
            {renderParticles()}
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
                  transform: [{ translateY }, { scale: cardScale }],
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
                    {/* Different content based on current step */}
                    {currentStep === "details" && (
                      <View style={styles.formContainer}>
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
                          Party Details
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
                          Tell us about your event
                        </Text>

                        <Input
                          label="Party Title"
                          placeholder="Enter a catchy title for your party"
                          value={partyTitle}
                          onChangeText={(text) => {
                            setPartyTitle(text);
                            if (errors.partyTitle)
                              setErrors({ ...errors, partyTitle: undefined });
                          }}
                          error={errors.partyTitle}
                          icon={
                            <FontAwesome
                              name="music"
                              size={16}
                              color={
                                isDarkMode
                                  ? COLORS.DARK_TEXT_SECONDARY
                                  : COLORS.LIGHT_TEXT_SECONDARY
                              }
                            />
                          }
                        />

                        <Dropdown
                          label="Event Type"
                          placeholder="Select event type"
                          options={EVENT_TYPES}
                          value={partyType}
                          onSelect={(value) => {
                            setPartyType(value);
                            if (errors.partyType)
                              setErrors({ ...errors, partyType: undefined });
                          }}
                          error={errors.partyType}
                        />

                        <Textarea
                          label="Party Description"
                          placeholder="Describe your awesome party..."
                          value={partyDescription}
                          onChangeText={(text) => {
                            setPartyDescription(text);
                            if (errors.partyDescription)
                              setErrors({
                                ...errors,
                                partyDescription: undefined,
                              });
                          }}
                          error={errors.partyDescription}
                          minHeight={120}
                          maxLength={500}
                          showCharCount
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
                              Party Setup
                            </Text>
                            <Text
                              style={[
                                styles.progressStep,
                                {
                                  color: getAccentColor(),
                                },
                              ]}
                            >
                              {getStepText()}
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
                                { width: getProgressPercentage() },
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
                            onPress={handleNextStep}
                            loading={loading}
                            variant={isDarkMode ? "primary" : "secondary"}
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
                    )}

                    {currentStep === "location" && (
                      <View style={styles.formContainer}>
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
                          Location & Payment
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
                          Where will your party take place?
                        </Text>

                        <CountryPicker
                          label="Country"
                          placeholder="Select country"
                          value={country as any}
                          onSelect={(selectedCountry) => {
                            setCountry(selectedCountry);
                            setRegion(null);
                            setAddress("");
                            if (errors.country)
                              setErrors({ ...errors, country: undefined });
                          }}
                          error={errors.country}
                        />

                        <RegionPicker
                          label="Region"
                          placeholder="Select region"
                          value={region}
                          onSelect={(selectedRegion) => {
                            setRegion(selectedRegion);
                            setAddress("");
                            if (errors.region)
                              setErrors({ ...errors, region: undefined });
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
                              locationData.description ||
                                locationData.formattedAddress
                            );
                            setAddressData(locationData);
                            if (errors.address)
                              setErrors({ ...errors, address: undefined });
                          }}
                          countryCode={country?.code}
                          regionCode={region?.code}
                          error={errors.address}
                        />

                        <Dropdown
                          label="Entry Type"
                          placeholder="Select entry type"
                          options={EVENT_PAYMENT_OPTIONS}
                          value={paymentType}
                          onSelect={(value) => {
                            setPaymentType(value);
                            if (value.value !== "paid") {
                              setFee(null);
                              setCurrency(null);
                            }
                            if (errors.paymentType)
                              setErrors({ ...errors, paymentType: undefined });
                          }}
                          error={errors.paymentType}
                        />

                        {paymentType?.value === "paid" && (
                          <View style={styles.paymentRow}>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Dropdown
                                label="Currency"
                                placeholder="Select currency"
                                options={CURRENCY_OPTIONS}
                                value={currency}
                                onSelect={(value) => {
                                  setCurrency(value);
                                  if (errors.currency)
                                    setErrors({
                                      ...errors,
                                      currency: undefined,
                                    });
                                }}
                                error={errors.currency}
                              />
                            </View>

                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Dropdown
                                label="Entry Fee"
                                placeholder="Select amount"
                                options={
                                  currency.value === "usd"
                                    ? USD_FEE_OPTIONS
                                    : currency.value === "eur"
                                    ? EUR_FEE_OPTIONS
                                    : PLN_FEE_OPTIONS
                                }
                                value={fee}
                                onSelect={(value) => {
                                  setFee(value);
                                  if (errors.fee)
                                    setErrors({ ...errors, fee: undefined });
                                }}
                                error={errors.fee}
                              />
                            </View>
                          </View>
                        )}

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
                              Party Setup
                            </Text>
                            <Text
                              style={[
                                styles.progressStep,
                                {
                                  color: getAccentColor(),
                                },
                              ]}
                            >
                              {getStepText()}
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
                                { width: getProgressPercentage() },
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

                        {/* Navigation Buttons */}
                        <View style={styles.navigationButtons}>
                          <TouchableOpacity
                            style={[
                              styles.navigationBackButton,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(55, 65, 81, 0.5)"
                                  : "rgba(0, 0, 0, 0.05)",
                              },
                            ]}
                            onPress={handleBackStep}
                          >
                            <FontAwesome5
                              name="arrow-left"
                              size={14}
                              color={
                                isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY
                              }
                            />
                          </TouchableOpacity>

                          <Animated.View
                            style={{
                              flex: 1,
                              marginLeft: 12,
                              transform: [{ scale: buttonScale }],
                            }}
                          >
                            <Button
                              title={loading ? "Saving..." : "Continue"}
                              onPress={handleNextStep}
                              loading={loading}
                              variant={isDarkMode ? "primary" : "secondary"}
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
                    )}

                    {currentStep === "media" && (
                      <View style={styles.formContainer}>
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
                          Add Photos
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
                          Upload photos of your event
                        </Text>

                        {/* Media grid */}
                        <View style={styles.mediaGrid}>
                          {mediaItems.map((item) => renderMediaItem(item))}

                          {/* Render media buttons or loading indicator */}
                          {renderMediaButtons()}
                        </View>

                        {/* Help text */}
                        <Text
                          style={[
                            styles.mediaHelpText,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          You can upload multiple photos. Tap an item to remove
                          it.
                        </Text>

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
                              Party Setup
                            </Text>
                            <Text
                              style={[
                                styles.progressStep,
                                {
                                  color: getAccentColor(),
                                },
                              ]}
                            >
                              {getStepText()}
                            </Text>
                          </View>

                          <View style={{ width: "100%" }}>
                            <DatePicker
                              label="Opening date"
                              value={openingDate}
                              error={errors.openingDate}
                              onSelect={setOpeningDate}
                              minDate={new Date()}
                            />
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
                                { width: getProgressPercentage() },
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

                        {/* Navigation Buttons */}
                        <View style={styles.navigationButtons}>
                          <TouchableOpacity
                            style={[
                              styles.navigationBackButton,
                              {
                                backgroundColor: isDarkMode
                                  ? "rgba(55, 65, 81, 0.5)"
                                  : "rgba(0, 0, 0, 0.05)",
                              },
                            ]}
                            onPress={handleBackStep}
                          >
                            <FontAwesome5
                              name="arrow-left"
                              size={14}
                              color={
                                isDarkMode
                                  ? COLORS.DARK_TEXT_PRIMARY
                                  : COLORS.LIGHT_TEXT_PRIMARY
                              }
                            />
                          </TouchableOpacity>

                          <Animated.View
                            style={{
                              flex: 1,
                              marginLeft: 12,
                              transform: [{ scale: buttonScale }],
                            }}
                          >
                            <Button
                              title={loading ? "Creating..." : "Create Party"}
                              onPress={handleNextStep}
                              loading={loading || isUploading}
                              variant={isDarkMode ? "primary" : "secondary"}
                              icon={
                                !(loading || isUploading) && (
                                  <FontAwesome5
                                    name="check"
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
                    )}

                    {currentStep === "congratulations" && (
                      <View style={styles.congratsContainer}>
                        {/* Confetti animation */}
                        <LottieView
                          ref={confettiRef}
                          source={require("@/assets/animations/confetti.json")}
                          style={styles.confettiAnimation}
                          loop={false}
                          autoPlay={false}
                        />

                        {/* Success Icon */}
                        <Animated.View
                          style={[
                            styles.checkIconContainer,
                            {
                              transform: [{ scale: checkmarkScale }],
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
                            style={styles.checkIconGradient}
                          >
                            <FontAwesome5
                              name="check"
                              size={24}
                              color="white"
                              solid
                            />
                          </LinearGradient>
                        </Animated.View>

                        <Text
                          style={[
                            styles.congratsTitle,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_PRIMARY
                                : COLORS.LIGHT_TEXT_PRIMARY,
                            },
                          ]}
                        >
                          Congratulations!
                        </Text>

                        <Text
                          style={[
                            styles.congratsSubtitle,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          Your party has been successfully created
                        </Text>

                        <Text
                          style={[
                            styles.congratsMessage,
                            {
                              color: isDarkMode
                                ? COLORS.DARK_TEXT_SECONDARY
                                : COLORS.LIGHT_TEXT_SECONDARY,
                            },
                          ]}
                        >
                          {partyTitle || "Your event"} is now live! People can
                          discover and join your event. You can manage all
                          details from your dashboard.
                        </Text>

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
                              Party Setup Complete
                            </Text>
                            <Text
                              style={[
                                styles.progressStep,
                                {
                                  color: getAccentColor(),
                                },
                              ]}
                            >
                              {getStepText()}
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
                                { width: getProgressPercentage() },
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
                            zIndex: 999,
                          }}
                        >
                          <Button
                            title={loading ? "Loading..." : "Go to Events"}
                            onPress={handleComplete}
                            loading={loading}
                            variant={isDarkMode ? "primary" : "secondary"}
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
                    )}
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
    height: height * 0.4, // Shorter top image area for more form space
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  partyImage: {
    width: "100%",
    height: "100%",
  },
  mediaLoadingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    margin: SPACING.S,
  },
  mediaLoadingIndicator: {
    width: width * 0.7,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    ...SHADOWS.MEDIUM,
  },
  mediaLoadingGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.M,
    paddingHorizontal: SPACING.L,
  },
  mediaLoadingText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    marginLeft: SPACING.S,
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
  formContainer: {
    width: "100%",
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
  progressContainer: {
    marginTop: SPACING.M,
    marginBottom: SPACING.S,
    width: "100%",
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
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.M,
  },
  navigationBackButton: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.M,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  // Media upload styles
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: SPACING.M,
  },
  mediaItemContainer: {
    width: (width * 0.9 - SPACING.M * 4) / 3, // 3 items per row
    height: (width * 0.9 - SPACING.M * 4) / 3,
    margin: SPACING.XS,
    borderRadius: BORDER_RADIUS.M,
    overflow: "hidden",
  },
  mediaItemImage: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.M,
  },
  mediaDeleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 10,
  },
  mediaDeleteButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: SPACING.S,
  },
  mediaButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  mediaButtonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.XS,
  },
  mediaButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mediaButton: {
    width: width * 0.38,
    height: width * 0.25,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
    margin: SPACING.XS,
  },
  mediaButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.M,
  },
  mediaHelpText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    textAlign: "center",
    marginTop: SPACING.S,
  },
  // Congratulations styles
  congratsContainer: {
    width: "100%",
    alignItems: "center",
    padding: SPACING.S,
    position: "relative",
  },
  confettiAnimation: {
    position: "absolute",
    top: -100,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  checkIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: SPACING.M,
    ...SHADOWS.MEDIUM,
  },
  checkIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  congratsTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.XL,
    marginBottom: SPACING.XS,
    textAlign: "center",
  },
  congratsSubtitle: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    marginBottom: SPACING.M,
    textAlign: "center",
  },
  congratsMessage: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
    marginBottom: SPACING.M,
    lineHeight: 22,
  },
});

export default CreatePartyScreen;
