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

import { Input, Textarea } from "@/components/common";
import { router } from "expo-router";

// Define types for our form errors
interface FormErrorsType {
  professionalTitle?: string;
  description?: string;
}

const ProfessionalSetupScreen = () => {
  // Form state
  const [professionalTitle, setProfessionalTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Error state with proper typing
  const [errors, setErrors] = useState<FormErrorsType>({});

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors: FormErrorsType = {};

    if (!professionalTitle.trim()) {
      newErrors.professionalTitle = "Professional title is required";
    }

    if (!description.trim()) {
      newErrors.description = "About section is required";
    } else if (description.trim().length < 20) {
      newErrors.description = "Please provide at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    router.push("/onboarding/kycSetup");
    // if (validateForm()) {
    //   setLoading(true);
    //   // Simulate API call
    //   setTimeout(() => {
    //     setLoading(false);
    //     // Navigate to next onboarding step
    //     console.log("Form submitted successfully");
    //   }, 1500);
    // }
  };

  const handleBack = () => {
    router.back();
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
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Go back"
            >
              <FontAwesome5 name="arrow-left" size={16} color="white" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Professional Profile</Text>
              <Text style={styles.subtitle}>Tell us about your expertise</Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Professional Title"
                placeholder="e.g. Software Engineer, Designer, Teacher"
                value={professionalTitle}
                onChangeText={setProfessionalTitle}
                error={errors.professionalTitle}
              />

              <Textarea
                label="About You"
                placeholder="Describe your expertise, experience, and what you're passionate about..."
                value={description}
                onChangeText={setDescription}
                error={errors.description}
                minHeight={150}
                maxLength={500}
                showCharCount={true}
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
                <Text style={styles.progressText}>Step 2 of 4</Text>
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
    padding: 24,
  },
  backButton: {
    marginTop: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 20,
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
    width: "50%", // 2 of 4 steps
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

export default ProfessionalSetupScreen;
