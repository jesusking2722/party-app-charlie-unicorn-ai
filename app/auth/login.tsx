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

const LoginScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = (): void => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Login with:", email, password);
      setLoading(false);
      router.push("/onboarding");
    }, 1500);
  };

  const handleGoogleLogin = (): void => {
    console.log("Login with Google");
  };

  const handleForgotPassword = (): void => {
    console.log("Navigate to forgot password");
  };

  const handleSignUp = (): void => {
    router.push("/auth/register");
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
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subText}>Sign in to continue</Text>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.signInButton}
              />

              <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              <Button
                title="Sign In with Google"
                onPress={handleGoogleLogin}
                variant="outline"
                icon={<FontAwesome name="google" size={18} color="white" />}
              />

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
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
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7F00FF",
    fontFamily: "Montserrat-Bold",
  },
  headerContainer: {
    marginBottom: 20,
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Montserrat-Medium",
  },
  signInButton: {
    marginBottom: 24,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signUpText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
  },
  signUpButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
});

export default LoginScreen;
