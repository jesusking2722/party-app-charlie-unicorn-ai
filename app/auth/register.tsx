import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
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

import { Button, Input } from "@/components/common";

const LogoImage = require("@/assets/images/logo.png");

const RegisterScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateInputs = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = (): void => {
    if (validateInputs()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        console.log("Register with:", { name, email, password });
        setLoading(false);
      }, 1500);
    }
  };

  const handleGoogleRegister = (): void => {
    console.log("Register with Google");
  };

  const handleSignIn = (): void => {
    router.push("/auth/login");
  };

  const handlePrivacyPolicy = (): void => {
    console.log("Navigate to privacy policy");
  };

  const handleTermsOfService = (): void => {
    console.log("Navigate to terms of service");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#7F00FF", "#E100FF"] as const}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Image
                source={LogoImage}
                alt="Logo"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subText}>Sign up to get started</Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword={true}
                error={errors.confirmPassword}
              />

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing up, you agree to our{" "}
                  <Text style={styles.termsLink} onPress={handleTermsOfService}>
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text style={styles.termsLink} onPress={handlePrivacyPolicy}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              <Button
                title="Sign Up"
                onPress={handleRegister}
                loading={loading}
                style={styles.signUpButton}
              />

              <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              <Button
                title="Sign Up with Google"
                onPress={handleGoogleRegister}
                variant="outline"
                icon={<FontAwesome name="google" size={18} color="white" />}
              />

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleSignIn}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
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
  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 10,
  },
  headerContainer: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    color: "white",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
  subText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
  },
  formContainer: {
    width: "100%",
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "white",
    fontFamily: "Montserrat-Medium",
    textDecorationLine: "underline",
  },
  signUpButton: {
    marginBottom: 20,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  orText: {
    color: "white",
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signInText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  signInButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
});

export default RegisterScreen;
