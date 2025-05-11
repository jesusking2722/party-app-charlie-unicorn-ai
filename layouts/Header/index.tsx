import { FONTS, THEME } from "@/app/theme";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ColorValue,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LanguageDropdown, ThemeToggle } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";

// Logo asset path - update with your actual logo path
const LOGO_IMAGE = require("@/assets/images/logo.png");
// Default avatar if user doesn't have one
const DEFAULT_AVATAR = require("@/assets/images/bnb.png");

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  showChat?: boolean;
  notificationCount?: number;
  chatCount?: number;
  userAvatar?: string; // URL for the user's avatar
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onChatPress?: () => void;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showNotifications = true,
  showChat = true,
  notificationCount = 0,
  chatCount = 0,
  userAvatar,
  onAvatarPress,
  onNotificationPress,
  onChatPress,
  onBackPress,
  rightComponent,
  currentLanguage = "EN",
  onLanguageChange = () => {},
}) => {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Gradient colors for the badge based on theme
  const accentGradientColors: readonly [ColorValue, ColorValue] = isDarkMode
    ? (["#D97706", "#DC2626"] as [string, string]) // Darker orange to red for dark mode
    : (["#F59E0B", "#EF4444"] as [string, string]); // Original orange to red for light mode

  // Animation effect on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle back press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Handle notification press
  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push("/");
    }
  };

  // Handle chat press
  const handleChatPress = () => {
    if (onChatPress) {
      onChatPress();
    } else {
      router.push("/");
    }
  };

  // Handle avatar press
  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      router.push("/");
    }
  };

  // Badge rendering function with gradient
  const renderBadge = (count: number) => {
    if (count <= 0) return null;

    return (
      <View style={styles.badgeOuterContainer}>
        <LinearGradient
          colors={accentGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background with gradient and blur */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={theme.GRADIENT as [string, string]}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
        />
        <BlurView
          intensity={isDarkMode ? 25 : 10}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Animated.View
        style={[
          styles.headerContent,
          {
            transform: [{ translateY }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Left section: Logo or Back button */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={22} color={theme.TEXT_COLOR} />
            </TouchableOpacity>
          )}
          <View style={styles.logoWrapper}>
            <Image
              source={LOGO_IMAGE}
              style={styles.logo}
              resizeMode="contain"
            />
            {title && (
              <Text
                style={[styles.title, { color: theme.TEXT_COLOR }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                <Text style={styles.titleBold}>{title}</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Right section: Custom component or default icons */}
        {rightComponent ? (
          <View style={styles.rightSection}>{rightComponent}</View>
        ) : (
          <View style={styles.rightSection}>
            {/* Chat icon */}
            {showChat && (
              <View style={styles.iconOuterContainer}>
                <View
                  style={[
                    styles.iconButtonContainer,
                    { borderColor: theme.BORDER_COLOR },
                  ]}
                >
                  <BlurView
                    intensity={isDarkMode ? 25 : 10}
                    tint={isDarkMode ? "dark" : "light"}
                    style={styles.iconButtonBlur}
                  >
                    <TouchableOpacity
                      style={[
                        styles.iconButton,
                        { backgroundColor: theme.BUTTON_BG },
                      ]}
                      onPress={handleChatPress}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name="message-circle"
                        size={20}
                        color={theme.TEXT_COLOR}
                      />
                    </TouchableOpacity>
                  </BlurView>
                </View>
                {/* Badge positioned outside the button container */}
                {renderBadge(chatCount)}
              </View>
            )}

            {/* Notification icon */}
            {showNotifications && (
              <View style={styles.iconOuterContainer}>
                <View
                  style={[
                    styles.iconButtonContainer,
                    { borderColor: theme.BORDER_COLOR },
                  ]}
                >
                  <BlurView
                    intensity={isDarkMode ? 25 : 10}
                    tint={isDarkMode ? "dark" : "light"}
                    style={styles.iconButtonBlur}
                  >
                    <TouchableOpacity
                      style={[
                        styles.iconButton,
                        { backgroundColor: theme.BUTTON_BG },
                      ]}
                      onPress={handleNotificationPress}
                      activeOpacity={0.7}
                    >
                      <Feather name="bell" size={20} color={theme.TEXT_COLOR} />
                    </TouchableOpacity>
                  </BlurView>
                </View>
                {/* Badge positioned outside the button container */}
                {renderBadge(notificationCount)}
              </View>
            )}

            {/* Language dropdown component */}
            <LanguageDropdown
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              isDarkMode={isDarkMode}
            />

            {/* Theme toggle component */}
            <ThemeToggle />

            {/* User avatar button */}
            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={0.8}
              style={[
                styles.avatarButtonContainer,
                { borderColor: theme.BORDER_COLOR },
              ]}
            >
              <BlurView
                intensity={isDarkMode ? 25 : 10}
                tint={isDarkMode ? "dark" : "light"}
                style={styles.avatarBlur}
              >
                <View
                  style={[
                    styles.avatarWrapper,
                    {
                      borderColor: isDarkMode
                        ? "rgba(209, 213, 219, 0.3)"
                        : "rgba(255, 255, 255, 0.3)",
                    },
                  ]}
                >
                  <Image
                    source={userAvatar ? { uri: userAvatar } : DEFAULT_AVATAR}
                    style={styles.avatar}
                  />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: Platform.OS === "ios" ? 100 : 90,
    paddingTop: Platform.OS === "ios" ? 40 : StatusBar.currentHeight,
    position: "relative",
    zIndex: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  background: {
    flex: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: "100%",
    position: "relative",
    zIndex: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 90,
  },
  logo: {
    height: 70,
    width: 70,
    marginRight: 15,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
  },
  titleBold: {
    fontFamily: FONTS.BOLD,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  // Outer container to handle badge positioning
  iconOuterContainer: {
    position: "relative",
    width: 40,
    height: 40,
  },
  iconButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  iconButtonBlur: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  iconButton: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeOuterContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    zIndex: 20,
    borderRadius: 9,
    overflow: "hidden",
  },
  badge: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontFamily: FONTS.BOLD,
    textAlign: "center",
  },
  avatarButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
  },
  avatarBlur: {
    width: "100%",
    height: "100%",
    borderRadius: 21,
    overflow: "hidden",
  },
  avatarWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 21,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});

export default Header;
