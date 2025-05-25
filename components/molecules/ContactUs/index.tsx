import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Button, Input, Textarea, Translate } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { sendMessageToSupportTeam } from "@/lib/scripts/mail.scripts";
import { RootState } from "@/redux/store";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

// Type for ContactUsScreen component
interface ContactUsScreenProps {
  visible: boolean;
  onClose: () => void;
}

const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
  visible,
  onClose,
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState<any>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Helper function to get text color based on theme
  const getTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;

  // Helper function to get secondary text color based on theme
  const getSecondaryTextColor = () =>
    isDarkMode ? COLORS.DARK_TEXT_SECONDARY : COLORS.LIGHT_TEXT_SECONDARY;

  // Helper function to get background color based on theme
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(31, 41, 55, 0.7)" : "rgba(240, 240, 240, 0.9)";

  // Helper function to get accent color based on theme
  const getAccentColor = () => (isDarkMode ? COLORS.SECONDARY : "#FF0099");

  // Helper function to get card background color based on theme
  const getCardBackgroundColor = () =>
    isDarkMode ? "rgba(40, 45, 55, 0.65)" : "rgba(255, 255, 255, 0.65)";

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      subject: "",
      message: "",
    };

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    } else if (subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call (replace with your actual API endpoint)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await sendMessageToSupportTeam(
        email,
        subject,
        message,
        name
      );

      if (response.ok) {
        showToast(
          "Message sent successfully! We'll get back to you soon.",
          "success"
        );

        // Reset form
        setEmail(user?.email || "");
        setSubject("");
        setMessage("");
        setErrors({ email: "", subject: "", message: "" });
      }
    } catch (error) {
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when going back
  const handleGoBack = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setSubject("");
    setMessage("");
    setErrors({ name: "", email: "", subject: "", message: "" });
    onClose();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header with X button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.closeButton,
            {
              backgroundColor: getBackgroundColor(),
            },
          ]}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Feather name="x" size={22} color={getTextColor()} />
        </TouchableOpacity>
      </View>

      {/* Contact Us Header */}
      <View style={styles.contactHeaderContainer}>
        <View style={styles.contactIconContainer}>
          <View
            style={[
              styles.contactIcon,
              {
                backgroundColor: getAccentColor(),
              },
            ]}
          >
            <FontAwesome5 name="envelope" size={24} color="#FFFFFF" />
          </View>
        </View>

        <Text style={[styles.contactTitle, { color: getTextColor() }]}>
          <Translate>Contact Us</Translate>
        </Text>

        <Text
          style={[
            styles.contactDescription,
            { color: getSecondaryTextColor() },
          ]}
        >
          <Translate>
            Have questions or feedback? We'd love to hear from you!
          </Translate>
        </Text>
      </View>

      {/* Scrollable Contact Form */}
      <ScrollView
        style={styles.contactContainer}
        contentContainerStyle={styles.contactContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.formCard,
            {
              backgroundColor: getCardBackgroundColor(),
              borderLeftColor: getAccentColor(),
            },
          ]}
        >
          {/* Form Header */}
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: getTextColor() }]}>
              <Translate>Send us a message</Translate>
            </Text>
            <Text
              style={[styles.formSubtitle, { color: getSecondaryTextColor() }]}
            >
              <Translate>
                Fill out the form below and we'll respond as soon as possible
              </Translate>
            </Text>
          </View>

          {/* Contact Form */}
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              autoCapitalize="words"
              error={errors.name}
              icon={
                <FontAwesome5
                  name="user"
                  size={16}
                  color={
                    isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY
                  }
                />
              }
            />

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon={
                <FontAwesome5
                  name="envelope"
                  size={16}
                  color={
                    isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY
                  }
                />
              }
            />

            <Input
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="What is this about?"
              error={errors.subject}
              icon={
                <FontAwesome5
                  name="tag"
                  size={16}
                  color={
                    isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : COLORS.LIGHT_TEXT_SECONDARY
                  }
                />
              }
            />

            <Textarea
              label="Message"
              value={message}
              onChangeText={setMessage}
              placeholder="Please describe your question or feedback in detail..."
              error={errors.message}
              minHeight={120}
              maxLength={1000}
              showCharCount={true}
              containerStyle={{ marginBottom: SPACING.L }}
            />

            {/* Submit Button */}
            <Button
              title="Send Message"
              onPress={handleSubmit}
              loading={isSubmitting}
              variant={isDarkMode ? "primary" : "secondary"}
              icon={
                <FontAwesome5
                  name="paper-plane"
                  size={14}
                  color="#FFFFFF"
                  style={{ marginRight: SPACING.S }}
                />
              }
              style={styles.submitButton}
            />

            {/* Go Back Button */}
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(55, 65, 81, 0.5)"
                    : "rgba(230, 234, 240, 0.8)",
                },
              ]}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="arrow-left"
                size={14}
                color={getTextColor()}
                style={{ marginRight: SPACING.S }}
              />
              <Text style={[styles.backButtonText, { color: getTextColor() }]}>
                <Translate>Go Back</Translate>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact Info */}
          <View style={styles.contactInfoContainer}>
            <View
              style={[
                styles.contactInfoCard,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(55, 65, 81, 0.3)"
                    : "rgba(230, 234, 240, 0.5)",
                },
              ]}
            >
              <FontAwesome5
                name="info-circle"
                size={16}
                color={getAccentColor()}
                style={{ marginRight: SPACING.S }}
              />
              <Text
                style={[
                  styles.contactInfoText,
                  { color: getSecondaryTextColor() },
                ]}
              >
                <Translate>
                  We typically respond within 24 hours during business days
                </Translate>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  contactHeaderContainer: {
    paddingHorizontal: SPACING.M,
    paddingBottom: SPACING.M,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(55, 65, 81, 0.2)",
  },
  contactIconContainer: {
    marginBottom: SPACING.M,
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.MEDIUM,
  },
  contactTitle: {
    fontSize: FONT_SIZES.XL,
    fontFamily: FONTS.BOLD,
    marginBottom: SPACING.S,
    textAlign: "center",
  },
  contactDescription: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    paddingHorizontal: SPACING.L,
  },
  contactContainer: {
    flex: 1,
  },
  contactContentContainer: {
    padding: SPACING.M,
    paddingBottom: SPACING.XXL,
  },
  formCard: {
    borderRadius: BORDER_RADIUS.L,
    padding: SPACING.M,
    borderLeftWidth: 4,
    ...SHADOWS.SMALL,
  },
  formHeader: {
    marginBottom: SPACING.M,
    alignItems: "center",
  },
  formTitle: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.SEMIBOLD,
    marginBottom: SPACING.XS,
  },
  formSubtitle: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    paddingHorizontal: SPACING.S,
  },
  formContainer: {
    width: "100%",
  },
  submitButton: {
    marginBottom: SPACING.M,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.M,
    borderRadius: BORDER_RADIUS.M,
    marginBottom: SPACING.M,
  },
  backButtonText: {
    fontSize: FONT_SIZES.S,
    fontFamily: FONTS.MEDIUM,
  },
  contactInfoContainer: {
    marginTop: SPACING.M,
  },
  contactInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.M,
    borderRadius: BORDER_RADIUS.M,
  },
  contactInfoText: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
    flex: 1,
  },
});

export default ContactUsScreen;
