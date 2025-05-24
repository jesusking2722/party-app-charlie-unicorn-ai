import {
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
  Drawer,
  Input,
  LanguageSelector,
  Textarea,
  Translate,
} from "@/components/common";
import { ReviewScreen } from "@/components/molecules";
import { API_ENDPOINT, BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { setAuthToken } from "@/lib/axiosInstance";
import { updateAuthUser } from "@/lib/scripts/auth.scripts";
import { setAuthUserAsync } from "@/redux/actions/auth.actions";
import { RootState, useAppDispatch } from "@/redux/store";
import { User } from "@/types/data";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  userAvatar?: string;
  userName?: string;
  professionalTitle?: string;
  description?: string;
  email?: string;
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  visible,
  onClose,
  userName = "John Doe",
  professionalTitle = "Software Developer",
  description = "Experienced software developer with a passion for creating beautiful and functional applications.",
  email = "johndoe@example.com",
  currentLanguage = "EN",
  onLanguageChange,
}) => {
  // Theme context
  const { isDarkMode, toggleTheme } = useTheme();

  // State for different editing sections
  const [activeSection, setActiveSection] = useState<
    "profile" | "account" | "reviews" | null
  >(null);

  // State for form fields
  const [editedUserName, setEditedUserName] = useState(userName);
  const [editedProfessionalTitle, setEditedProfessionalTitle] =
    useState(professionalTitle);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedEmail, setEditedEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading state for save operation
  const [isSaving, setIsSaving] = useState(false);

  // Avatar upload states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Helper function to get text color based on theme
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Helper function to get secondary text color based on theme
  const getSecondaryTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_SECONDARY : COLORS.LIGHT_TEXT_SECONDARY;

  // Helper function to get icon color based on theme
  const getIconColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Reset state when drawer visibility changes
  useEffect(() => {
    if (!visible) {
      setActiveSection(null);
      setSelectedImage(null);
    }
  }, [visible]);

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showToast(
            "Sorry, we need camera roll permissions to change your avatar!",
            "error"
          );
        }
      }
    })();
  }, []);

  // Form validation errors
  const [errors, setErrors] = useState({
    userName: "",
    professionalTitle: "",
    description: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Function to pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (5MB limit)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          showToast("Please select an image smaller than 5MB", "error");
          return;
        }

        setSelectedImage(asset.uri);

        // Automatically upload the image
        await uploadAvatar(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast("Failed to pick image", "error");
    }
  };

  // Function to upload avatar to backend
  const uploadAvatar = async (imageUri: string) => {
    if (!user) return;

    const token = await AsyncStorage.getItem("Authorization");

    if (!token) return;

    setIsUploadingAvatar(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Get file extension from URI
      const uriParts = imageUri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      // For React Native, we need to format the file object correctly
      const imageFile = {
        uri: imageUri,
        type: `image/${fileType}`,
        name: `avatar.${fileType}`,
      } as any;

      formData.append("avatar", imageFile);

      // Make API call to upload avatar
      const response = await fetch(
        `${API_ENDPOINT}/auth/me/avatar/${user._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
          body: formData,
        }
      );

      const data = await response.json();

      await dispatch(setAuthUserAsync(data.data.user));

      showToast("Avatar updated successfully!", "success");
      setSelectedImage(null);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      showToast(error.message || "Failed to upload avatar", "error");
      setSelectedImage(null); // Clear selected image on error
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Toggle profile edit mode
  const handleEditProfile = () => {
    setActiveSection("profile");
    // Reset form values to current values
    setEditedUserName(userName);
    setEditedProfessionalTitle(professionalTitle);
    setEditedDescription(description);
  };

  // Toggle account edit mode
  const handleEditAccount = () => {
    setActiveSection("account");
    setEditedEmail(email);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Toggle reviews mode
  const handleViewReviews = () => {
    setActiveSection("reviews");
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setActiveSection(null);
    // Reset all form fields
    setEditedUserName(userName);
    setEditedProfessionalTitle(professionalTitle);
    setEditedDescription(description);
    setEditedEmail(email);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSelectedImage(null);

    // Clear errors
    setErrors({
      userName: "",
      professionalTitle: "",
      description: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {
      ...errors,
      userName: "",
      professionalTitle: "",
      description: "",
    };

    let isValid = true;

    if (!editedUserName.trim()) {
      newErrors.userName = "Name is required";
      isValid = false;
    }

    if (!editedProfessionalTitle.trim()) {
      newErrors.professionalTitle = "Professional title is required";
      isValid = false;
    }

    if (!editedDescription.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (editedDescription.trim().length < 10) {
      newErrors.description = "Description should be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Validate account form
  const validateAccountForm = () => {
    const newErrors = {
      ...errors,
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!editedEmail.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(editedEmail)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Only validate password fields if the user is trying to change password
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = "Current password is required";
        isValid = false;
      }

      if (!newPassword) {
        newErrors.newPassword = "New password is required";
        isValid = false;
      } else if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
        isValid = false;
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!validateProfileForm() || !user) return;

    setIsSaving(true);

    try {
      const updatingUser: User = {
        ...user,
        name: editedUserName,
        title: editedProfessionalTitle,
        about: editedDescription,
      };

      const response = await updateAuthUser(updatingUser);

      if (response.ok) {
        const { user: updatedUser } = response.data;
        await dispatch(setAuthUserAsync(updatedUser));

        // Exit edit mode
        setActiveSection(null);
        setIsSaving(false);

        showToast("Profile is updated successfully", "success");
      }
    } catch (error) {
      setIsSaving(false);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleLogout = async () => {
    await setAuthToken(null);
    onClose();
    router.replace("/auth/login");
  };

  // Function to get the current avatar source
  const getAvatarSource = () => {
    if (selectedImage) {
      return { uri: selectedImage };
    }
    if (user?.avatar) {
      return { uri: BACKEND_BASE_URL + user.avatar };
    }
    return null;
  };

  // Function to render avatar content
  const renderAvatarContent = () => {
    const avatarSource = getAvatarSource();

    if (isUploadingAvatar) {
      return (
        <View style={[styles.avatarLarge, styles.avatarLoadingContainer]}>
          <ActivityIndicator size="large" color={getAccentColor()} />
        </View>
      );
    }

    if (avatarSource) {
      return (
        <Image
          source={avatarSource}
          style={styles.avatarLarge}
          resizeMode="cover"
        />
      );
    }

    return (
      <LinearGradient
        colors={isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.avatarLarge,
          {
            width: "100%",
            height: "100%",
            borderRadius: BORDER_RADIUS.CIRCLE,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text
          style={{
            color: COLORS.WHITE,
            fontFamily: FONTS.SEMIBOLD,
            fontSize: FONT_SIZES.M,
          }}
        >
          {user?.name ? user.name.slice(0, 2).toUpperCase() : ""}
        </Text>
      </LinearGradient>
    );
  };

  // If reviews section is active, show the reviews screen
  if (activeSection === "reviews") {
    return (
      <Drawer
        visible={visible}
        onClose={handleCancelEdit}
        position="right"
        width={Platform.OS === "ios" ? "85%" : "90%"}
      >
        <ReviewScreen
          visible={true}
          onClose={handleCancelEdit}
          reviews={user?.reviews || []}
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      visible={visible}
      onClose={activeSection ? handleCancelEdit : onClose}
      position="right"
      width={Platform.OS === "ios" ? "85%" : "90%"}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Fixed header with X button */}
        <View style={styles.header}>
          {activeSection ? (
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(31, 41, 55, 0.7)"
                    : "rgba(240, 240, 240, 0.9)",
                },
              ]}
              onPress={handleCancelEdit}
              activeOpacity={0.7}
              disabled={isSaving || isUploadingAvatar}
            >
              <Feather name="x" size={22} color={getIconColor()} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(31, 41, 55, 0.7)"
                    : "rgba(240, 240, 240, 0.9)",
                },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather name="x" size={22} color={getIconColor()} />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable content area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* User Profile Header */}
            {!activeSection ? (
              // View mode with large avatar
              <View style={styles.profileHeaderLarge}>
                <View style={styles.avatarContainerLarge}>
                  {renderAvatarContent()}
                  <LinearGradient
                    colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
                    style={styles.avatarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                  <View style={styles.avatarInfoContainer}>
                    <Text style={styles.userNameLarge}>{userName}</Text>
                    <Text style={styles.professionalTitleLarge}>
                      {professionalTitle}
                    </Text>
                  </View>
                </View>

                <View style={styles.descriptionContainer}>
                  <Text
                    style={[
                      styles.description,
                      { color: getSecondaryTextColor() },
                    ]}
                  >
                    {description}
                  </Text>
                </View>
              </View>
            ) : (
              // Edit mode with standard profile header
              <View
                style={[
                  styles.profileHeader,
                  {
                    borderBottomColor: isDarkMode
                      ? "rgba(55, 65, 81, 0.5)"
                      : "rgba(230, 234, 240, 0.8)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.avatarContainer,
                    {
                      borderColor: isDarkMode
                        ? "rgba(55, 65, 81, 0.8)"
                        : "rgba(230, 234, 240, 0.9)",
                    },
                  ]}
                >
                  {renderAvatarContent()}
                  {activeSection === "profile" && !isUploadingAvatar && (
                    <TouchableOpacity
                      style={[
                        styles.changeAvatarButton,
                        {
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                        },
                      ]}
                      activeOpacity={0.8}
                      onPress={pickImage}
                    >
                      <View
                        style={[
                          styles.changeAvatarIconContainer,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(55, 65, 81, 0.7)"
                              : "rgba(240, 240, 240, 0.9)",
                          },
                        ]}
                      >
                        <Feather
                          name="camera"
                          size={16}
                          color={getIconColor()}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                  {activeSection === "profile" ? (
                    // Profile Edit Form
                    <>
                      <Input
                        label="Name"
                        value={editedUserName}
                        onChangeText={setEditedUserName}
                        placeholder="Your name"
                        error={errors.userName}
                        icon={
                          <FontAwesome
                            name="user"
                            size={16}
                            color={getIconColor()}
                          />
                        }
                      />

                      <Input
                        label="Professional Title"
                        value={editedProfessionalTitle}
                        onChangeText={setEditedProfessionalTitle}
                        placeholder="Your professional title"
                        error={errors.professionalTitle}
                        icon={
                          <FontAwesome
                            name="briefcase"
                            size={16}
                            color={getIconColor()}
                          />
                        }
                      />

                      <View style={styles.inputContainer}>
                        <Text
                          style={[
                            styles.inputLabel,
                            { color: getAccentColor() },
                          ]}
                        >
                          <Translate>About You</Translate>
                        </Text>
                        <View
                          style={[
                            styles.inputWrapper,
                            styles.textareaWrapper,
                            {
                              backgroundColor: isDarkMode
                                ? "rgba(40, 45, 55, 0.65)"
                                : "rgba(255, 255, 255, 0.65)",
                              borderColor: isDarkMode
                                ? errors.description
                                  ? COLORS.ERROR
                                  : "rgba(255, 255, 255, 0.1)"
                                : errors.description
                                ? COLORS.ERROR
                                : "rgba(0, 0, 0, 0.05)",
                              borderWidth: errors.description ? 1 : 0.5,
                            },
                          ]}
                        >
                          <Textarea
                            value={editedDescription}
                            onChangeText={setEditedDescription}
                            placeholder="Describe yourself"
                            error={errors.description}
                            containerStyle={styles.textareaContainerStyle}
                            numberOfLines={7}
                          />
                        </View>
                      </View>
                    </>
                  ) : null}
                </View>
              </View>
            )}

            {/* Save Button for Edit Modes */}
            {activeSection && (
              <View style={styles.buttonContainer}>
                <Button
                  variant={isDarkMode ? "primary" : "secondary"}
                  title="Save Changes"
                  icon={
                    <FontAwesome5
                      name="check"
                      size={14}
                      color="white"
                      style={{ marginRight: SPACING.S }}
                    />
                  }
                  onPress={handleSaveProfile}
                  loading={isSaving}
                  disabled={isUploadingAvatar}
                  small={true}
                />
              </View>
            )}

            {/* Settings Section */}
            {!activeSection && (
              <View style={styles.settingsContainer}>
                <Text style={[styles.settingsTitle, { color: getTextColor() }]}>
                  <Translate>Settings</Translate>
                </Text>

                {user?._id && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.settingButton,
                        {
                          borderBottomColor: isDarkMode
                            ? "rgba(55, 65, 81, 0.5)"
                            : "rgba(230, 234, 240, 0.8)",
                        },
                      ]}
                      onPress={handleEditProfile}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.settingIconContainer,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(31, 41, 55, 0.7)"
                              : "rgba(240, 240, 240, 0.9)",
                          },
                        ]}
                      >
                        <Feather name="user" size={18} color={getIconColor()} />
                      </View>
                      <Text
                        style={[
                          styles.settingButtonText,
                          { color: getTextColor() },
                        ]}
                      >
                        <Translate>Edit Profile</Translate>
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={18}
                        color={getSecondaryTextColor()}
                      />
                    </TouchableOpacity>

                    {/* New Reviews Button */}
                    <TouchableOpacity
                      style={[
                        styles.settingButton,
                        {
                          borderBottomColor: isDarkMode
                            ? "rgba(55, 65, 81, 0.5)"
                            : "rgba(230, 234, 240, 0.8)",
                        },
                      ]}
                      onPress={handleViewReviews}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.settingIconContainer,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(31, 41, 55, 0.7)"
                              : "rgba(240, 240, 240, 0.9)",
                          },
                        ]}
                      >
                        <Feather name="star" size={18} color={getIconColor()} />
                      </View>
                      <Text
                        style={[
                          styles.settingButtonText,
                          { color: getTextColor() },
                        ]}
                      >
                        <Translate>My Reviews</Translate>
                      </Text>
                      <View style={styles.reviewBadge}>
                        <Text style={styles.reviewBadgeText}>
                          {user?.reviews?.length || 0}
                        </Text>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={18}
                        color={getSecondaryTextColor()}
                      />
                    </TouchableOpacity>
                  </>
                )}

                {/* Language Setting */}
                <View
                  style={[
                    styles.settingButton,
                    {
                      borderBottomColor: isDarkMode
                        ? "rgba(55, 65, 81, 0.5)"
                        : "rgba(230, 234, 240, 0.8)",
                      borderBottomWidth: 0, // Remove bottom border for language section
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.settingIconContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(31, 41, 55, 0.7)"
                          : "rgba(240, 240, 240, 0.9)",
                      },
                    ]}
                  >
                    <Feather name="globe" size={18} color={getIconColor()} />
                  </View>
                  <Text
                    style={[
                      styles.settingButtonText,
                      { color: getTextColor() },
                    ]}
                  >
                    <Translate>Language</Translate>
                  </Text>
                </View>

                {/* Language Selector */}
                <View style={styles.languageSelectorWrapper}>
                  <LanguageSelector
                    currentLanguage={currentLanguage}
                    onLanguageChange={onLanguageChange}
                    hideLabel={true} // Hide label since we already have one
                  />
                </View>

                {/* Dark Mode Toggle */}
                <View
                  style={[
                    styles.settingButton,
                    {
                      borderBottomColor: isDarkMode
                        ? "rgba(55, 65, 81, 0.5)"
                        : "rgba(230, 234, 240, 0.8)",
                      marginTop: SPACING.S, // Add margin after language
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.settingIconContainer,
                      {
                        backgroundColor: isDarkMode
                          ? "rgba(31, 41, 55, 0.7)"
                          : "rgba(240, 240, 240, 0.9)",
                      },
                    ]}
                  >
                    <Feather name="moon" size={18} color={getIconColor()} />
                  </View>
                  <Text
                    style={[
                      styles.settingButtonText,
                      { color: getTextColor() },
                    ]}
                  >
                    {isDarkMode ? (
                      <Translate>Light Mode</Translate>
                    ) : (
                      <Translate>Dark Mode</Translate>
                    )}
                  </Text>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{
                      false: "rgba(155, 155, 155, 0.3)",
                      true: isDarkMode
                        ? "rgba(127, 0, 255, 0.4)"
                        : "rgba(255, 0, 153, 0.4)",
                    }}
                    thumbColor={
                      isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT
                    }
                    ios_backgroundColor={
                      isDarkMode
                        ? "rgba(55, 65, 81, 0.5)"
                        : "rgba(155, 155, 155, 0.3)"
                    }
                  />
                </View>

                {/* Logout Button */}
                {user?._id && (
                  <TouchableOpacity
                    style={[styles.settingButton, styles.logoutButton]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.settingIconContainer,
                        {
                          backgroundColor: "rgba(255, 77, 77, 0.1)",
                          borderColor: "rgba(255, 77, 77, 0.2)",
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Feather name="log-out" size={18} color="#FF4D4D" />
                    </View>
                    <Text style={styles.logoutText}>
                      <Translate>Sign out</Translate>
                    </Text>
                  </TouchableOpacity>
                )}

                {!user && (
                  <TouchableOpacity
                    style={[
                      styles.settingButton,
                      {
                        borderBottomColor: isDarkMode
                          ? "rgba(55, 65, 81, 0.5)"
                          : "rgba(230, 234, 240, 0.8)",
                      },
                    ]}
                    onPress={() => router.replace("/auth/login")}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.settingIconContainer,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(31, 41, 55, 0.7)"
                            : "rgba(240, 240, 240, 0.9)",
                        },
                      ]}
                    >
                      <Feather name="log-in" size={18} color={getIconColor()} />
                    </View>
                    <Text
                      style={[
                        styles.settingButtonText,
                        { color: getTextColor() },
                      ]}
                    >
                      <Translate>Sign in</Translate>
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Version info */}
                <View style={styles.versionContainer}>
                  <Text
                    style={[
                      styles.versionText,
                      { color: getSecondaryTextColor() },
                    ]}
                  >
                    <Translate>App Version 1.0.0</Translate>
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: SPACING.M,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.SMALL,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.XL,
  },
  // Large profile header (view mode)
  profileHeaderLarge: {
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  avatarContainerLarge: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.3,
    position: "relative",
  },
  avatarLarge: {
    width: "100%",
    height: "100%",
  },
  avatarLoadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  avatarGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  avatarInfoContainer: {
    position: "absolute",
    bottom: SPACING.M,
    left: SPACING.M,
    right: SPACING.M,
  },
  userNameLarge: {
    fontSize: FONT_SIZES.XXL,
    fontFamily: FONTS.BOLD,
    color: COLORS.WHITE,
    marginBottom: SPACING.XS,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  professionalTitleLarge: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.MEDIUM,
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionContainer: {
    padding: SPACING.M,
  },
  // Standard profile header (edit mode)
  profileHeader: {
    alignItems: "center",
    padding: SPACING.M,
    borderBottomWidth: 1,
    marginBottom: SPACING.M,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    overflow: "hidden",
    marginTop: SPACING.M,
    marginBottom: SPACING.M,
    position: "relative",
    ...SHADOWS.SMALL,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  changeAvatarIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
    marginBottom: SPACING.XS,
  },
  professionalTitle: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
    marginBottom: SPACING.S,
  },
  description: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    lineHeight: 20,
  },
  settingsContainer: {
    padding: SPACING.M,
  },
  settingsTitle: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.SEMIBOLD,
    marginBottom: SPACING.M,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderBottomWidth: 1,
    marginBottom: SPACING.M,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.M,
  },
  languageSelectorWrapper: {
    paddingHorizontal: SPACING.S,
    marginTop: 5,
    marginBottom: SPACING.M,
  },
  settingButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: SPACING.L,
  },
  logoutText: {
    flex: 1,
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.SEMIBOLD,
    color: "#FF4D4D",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: SPACING.XL,
  },
  versionText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  // Form styles
  formContainer: {
    width: "100%",
    marginTop: SPACING.S,
  },
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
  textareaWrapper: {
    height: 122,
    alignItems: "flex-start",
  },
  textareaContainerStyle: {
    height: 120,
    marginBottom: 0,
  },
  focusAccent: {
    position: "absolute",
    left: 0,
    width: 3,
    height: "100%",
    borderTopRightRadius: BORDER_RADIUS.S,
    borderBottomRightRadius: BORDER_RADIUS.S,
  },
  errorText: {
    fontSize: FONT_SIZES.XS,
    marginTop: SPACING.XS,
    paddingHorizontal: SPACING.XS,
    fontFamily: FONTS.REGULAR,
  },
  passwordSection: {
    width: "100%",
    marginTop: SPACING.M,
    marginBottom: SPACING.M,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.M,
    fontFamily: FONTS.SEMIBOLD,
    marginBottom: SPACING.M,
  },
  buttonContainer: {
    marginHorizontal: SPACING.M,
    marginTop: SPACING.S,
    marginBottom: SPACING.M,
  },
  // Review Badge styles
  reviewBadge: {
    backgroundColor: "#FF0099",
    borderRadius: BORDER_RADIUS.CIRCLE,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.S,
  },
  reviewBadgeText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.BOLD,
  },
});

export default ProfileDrawer;
