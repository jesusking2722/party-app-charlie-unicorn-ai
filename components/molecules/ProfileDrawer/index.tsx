import { FONTS } from "@/app/theme";
import { Button, Drawer, LanguageSelector } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_AVATAR = require("@/assets/images/bnb.png");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  onProfileUpdate?: (data: {
    userName: string;
    professionalTitle: string;
    description: string;
  }) => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  visible,
  onClose,
  userAvatar,
  userName = "John Doe",
  professionalTitle = "Software Developer",
  description = "Experienced software developer with a passion for creating beautiful and functional applications.",
  email = "johndoe@example.com",
  currentLanguage = "EN",
  onLanguageChange,
  onProfileUpdate,
}) => {
  // Theme context
  const { isDarkMode, toggleTheme } = useTheme();

  // State for different editing sections
  const [activeSection, setActiveSection] = useState<
    "profile" | "account" | null
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

  // Reset state when drawer visibility changes
  useEffect(() => {
    if (!visible) {
      setActiveSection(null);
    }
  }, [visible]);

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
    if (!validateProfileForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call the update callback if provided
      if (onProfileUpdate) {
        onProfileUpdate({
          userName: editedUserName,
          professionalTitle: editedProfessionalTitle,
          description: editedDescription,
        });
      }

      // Exit edit mode
      setActiveSection(null);
      setIsSaving(false);

      // Show success message
      Alert.alert("Success", "Your profile has been updated successfully.");
    } catch (error) {
      setIsSaving(false);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  // Save account changes
  const handleSaveAccount = async () => {
    if (!validateAccountForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Exit edit mode
      setActiveSection(null);
      setIsSaving(false);

      // Show success message
      Alert.alert(
        "Success",
        "Your account information has been updated successfully."
      );
    } catch (error) {
      setIsSaving(false);
      Alert.alert(
        "Error",
        "Failed to update account information. Please try again."
      );
    }
  };

  const handleLogout = () => {
    onClose();
    // Add your logout logic here
    router.replace("/auth/login");
  };

  return (
    <Drawer
      visible={visible}
      onClose={activeSection ? handleCancelEdit : onClose}
      position="right"
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Fixed header with X button */}
        <View style={styles.header}>
          {activeSection ? (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancelEdit}
              activeOpacity={0.7}
              disabled={isSaving}
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather name="x" size={24} color="white" />
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
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={userAvatar ? { uri: userAvatar } : DEFAULT_AVATAR}
                  style={styles.avatar}
                />
                {activeSection === "profile" && (
                  <TouchableOpacity
                    style={styles.changeAvatarButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.changeAvatarIconContainer}>
                      <Feather name="camera" size={18} color="white" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {activeSection === "profile" ? (
                // Profile Edit Form
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.userName ? styles.inputError : null,
                      ]}
                      value={editedUserName}
                      onChangeText={setEditedUserName}
                      placeholder="Your name"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                    {errors.userName ? (
                      <Text style={styles.errorText}>{errors.userName}</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Professional Title</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.professionalTitle ? styles.inputError : null,
                      ]}
                      value={editedProfessionalTitle}
                      onChangeText={setEditedProfessionalTitle}
                      placeholder="Your professional title"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                    {errors.professionalTitle ? (
                      <Text style={styles.errorText}>
                        {errors.professionalTitle}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>About You</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.textareaInput,
                        errors.description ? styles.inputError : null,
                      ]}
                      value={editedDescription}
                      onChangeText={setEditedDescription}
                      placeholder="Describe yourself"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                    {errors.description ? (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    ) : null}
                  </View>

                  <View style={styles.buttonContainer}>
                    <Button
                      variant={isDarkMode ? "indigo" : "primary"}
                      title="Save"
                      icon={
                        <FontAwesome name="check" style={styles.saveIcon} />
                      }
                      onPress={handleSaveProfile}
                      loading={isSaving}
                    />
                  </View>
                </View>
              ) : activeSection === "account" ? (
                // Account Edit Form
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.email ? styles.inputError : null,
                      ]}
                      value={editedEmail}
                      onChangeText={setEditedEmail}
                      placeholder="Your email"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {errors.email ? (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    ) : null}
                  </View>

                  <View style={styles.passwordSection}>
                    <Text style={styles.sectionTitle}>Change Password</Text>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Current Password</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          errors.currentPassword ? styles.inputError : null,
                        ]}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Enter current password"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        secureTextEntry
                      />
                      {errors.currentPassword ? (
                        <Text style={styles.errorText}>
                          {errors.currentPassword}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>New Password</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          errors.newPassword ? styles.inputError : null,
                        ]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        secureTextEntry
                      />
                      {errors.newPassword ? (
                        <Text style={styles.errorText}>
                          {errors.newPassword}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>
                        Confirm New Password
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          errors.confirmPassword ? styles.inputError : null,
                        ]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        secureTextEntry
                      />
                      {errors.confirmPassword ? (
                        <Text style={styles.errorText}>
                          {errors.confirmPassword}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.buttonContainer}>
                    <Button
                      variant={isDarkMode ? "indigo" : "primary"}
                      title="Save"
                      icon={
                        <FontAwesome name="check" style={styles.saveIcon} />
                      }
                      onPress={handleSaveAccount}
                      loading={isSaving}
                    />
                  </View>
                </View>
              ) : (
                // View mode - show profile info
                <>
                  <Text style={styles.userName}>{userName}</Text>
                  <Text style={styles.professionalTitle}>
                    {professionalTitle}
                  </Text>
                  <Text style={styles.description}>{description}</Text>
                </>
              )}
            </View>

            {/* Settings Section */}
            {!activeSection && (
              <View style={styles.settingsContainer}>
                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={handleEditProfile}
                  activeOpacity={0.8}
                >
                  <View style={styles.settingIconContainer}>
                    <Feather name="user" size={20} color="white" />
                  </View>
                  <Text style={styles.settingButtonText}>Edit Profile</Text>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingButton}
                  onPress={handleEditAccount}
                  activeOpacity={0.8}
                >
                  <View style={styles.settingIconContainer}>
                    <Feather name="lock" size={20} color="white" />
                  </View>
                  <Text style={styles.settingButtonText}>Account Settings</Text>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </TouchableOpacity>

                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={onLanguageChange}
                />

                <View style={[styles.settingButton, styles.darkModeContainer]}>
                  <View style={styles.settingIconContainer}>
                    <Feather name="moon" size={20} color="white" />
                  </View>
                  <Text style={styles.settingButtonText}>Dark Mode</Text>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{
                      false: "rgba(255, 255, 255, 0.3)",
                      true: "rgba(127, 0, 255, 0.6)",
                    }}
                    thumbColor={isDarkMode ? "#7F00FF" : "#fff"}
                    ios_backgroundColor="rgba(255, 255, 255, 0.3)"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.settingButton, styles.logoutButton]}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingIconContainer}>
                    <Feather name="log-out" size={20} color="#FF4D4D" />
                  </View>
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Add some extra padding at the bottom for better scrolling on small screens */}
                <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SCREEN_HEIGHT < 700 ? 100 : 40, // Extra padding for small screens
  },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
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
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeAvatarIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontFamily: FONTS.BOLD,
    color: "white",
    marginBottom: 6,
  },
  professionalTitle: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
  },
  settingsContainer: {
    padding: 16,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    color: "white",
  },
  darkModeContainer: {
    marginTop: 16,
  },
  logoutButton: {
    marginTop: 16,
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "#FF4D4D",
  },
  formContainer: {
    width: "100%",
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontFamily: FONTS.REGULAR,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  textareaInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "rgba(255, 100, 100, 0.7)",
  },
  errorText: {
    color: "rgba(255, 100, 100, 0.9)",
    fontSize: 12,
    marginTop: 4,
    fontFamily: FONTS.REGULAR,
  },
  passwordSection: {
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 16,
    marginTop: 8,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  saveIcon: {
    color: "white",
    marginRight: 8,
  },
});

export default ProfileDrawer;
