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
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ProfileDrawer } from "@/components/molecules";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/redux/store";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

// Logo asset path
const LOGO_IMAGE = require("@/assets/images/logo.png");
// Default avatar if user doesn't have one
const DEFAULT_AVATAR = require("@/assets/images/bnb.png");

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

interface HeaderProps {
  title?: string;
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  onProfileUpdate?: (data: {
    userName: string;
    professionalTitle: string;
    description: string;
  }) => void;
  onNotificationPress?: () => void;
  hasNotifications?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  currentLanguage = "EN",
  onLanguageChange,
  onProfileUpdate,
  onNotificationPress,
  hasNotifications = false,
}) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // Animation values
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  // Helper function to get accent color based on theme
  const getAccentColor = () =>
    isDarkMode ? COLORS.SECONDARY : LIGHT_THEME_ACCENT;

  // Animation effect on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATIONS.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ANIMATIONS.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle avatar press - opens profile drawer
  const handleAvatarPress = () => {
    setProfileDrawerVisible(!profileDrawerVisible);
  };

  // Handle profile drawer close
  const handleProfileDrawerClose = () => {
    setProfileDrawerVisible(false);
  };

  // Handle notification press
  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push("/main/notification");
    }
  };

  return (
    <>
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Background with gradient */}
        <LinearGradient
          colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.PRIMARY}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <Animated.View
          style={[
            styles.headerContent,
            {
              transform: [{ translateY }, { scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Logo and Title */}
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              <Image
                source={LOGO_IMAGE}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {title && (
              <View style={styles.titleContainer}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_PRIMARY
                        : COLORS.WHITE,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : "rgba(255, 255, 255, 0.8)",
                    },
                  ]}
                >
                  CHARLIE UNICORN AI
                </Text>
              </View>
            )}
          </View>

          {/* Right section with actions */}
          <View style={styles.rightSection}>
            {/* Notification Button */}
            <TouchableOpacity
              onPress={handleNotificationPress}
              activeOpacity={0.8}
              style={[
                styles.iconButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(31, 41, 55, 0.7)"
                    : "rgba(255, 255, 255, 0.2)",
                  borderColor: isDarkMode
                    ? COLORS.DARK_BORDER
                    : "rgba(255, 255, 255, 0.3)",
                },
              ]}
            >
              <Ionicons
                name="chatbox"
                size={16}
                color={isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.WHITE}
              />

              {/* Notification dot */}
              {hasNotifications && (
                <View
                  style={[
                    styles.notificationDot,
                    {
                      backgroundColor: getAccentColor(),
                    },
                  ]}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNotificationPress}
              activeOpacity={0.8}
              style={[
                styles.iconButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(31, 41, 55, 0.7)"
                    : "rgba(255, 255, 255, 0.2)",
                  borderColor: isDarkMode
                    ? COLORS.DARK_BORDER
                    : "rgba(255, 255, 255, 0.3)",
                },
              ]}
            >
              <FontAwesome5
                name="bell"
                size={16}
                color={isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.WHITE}
              />

              {/* Notification dot */}
              {hasNotifications && (
                <View
                  style={[
                    styles.notificationDot,
                    {
                      backgroundColor: getAccentColor(),
                    },
                  ]}
                />
              )}
            </TouchableOpacity>

            {/* User avatar button */}
            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={0.8}
              style={styles.avatarContainer}
            >
              <BlurView
                intensity={isDarkMode ? 40 : 30}
                tint={isDarkMode ? "dark" : "light"}
                style={styles.avatarBlur}
              >
                <View
                  style={[
                    styles.avatarWrapper,
                    {
                      borderColor: isDarkMode
                        ? COLORS.DARK_BORDER
                        : "rgba(255, 255, 255, 0.3)",
                      backgroundColor: isDarkMode
                        ? "rgba(31, 41, 55, 0.5)"
                        : "rgba(255, 255, 255, 0.15)",
                    },
                  ]}
                >
                  <Image
                    source={
                      user?.avatar && user?.avatar.trim().length > 0
                        ? { uri: user.avatar }
                        : DEFAULT_AVATAR
                    }
                    style={styles.avatar}
                  />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Profile Drawer */}
      <ProfileDrawer
        visible={profileDrawerVisible}
        onClose={handleProfileDrawerClose}
        userAvatar={user?.avatar ?? DEFAULT_AVATAR}
        userName={user?.name ?? ""}
        professionalTitle={user?.title ?? ""}
        description={user?.about ?? ""}
        email={user?.email ?? ""}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: Platform.OS === "ios" ? 120 : 110,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    position: "relative",
    zIndex: 30,
    ...SHADOWS.MEDIUM,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.M,
    height: "100%",
    position: "relative",
    zIndex: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    height: 60,
    width: 60,
    marginRight: SPACING.S,
    overflow: "hidden",
  },
  logo: {
    height: "100%",
    width: "100%",
  },
  titleContainer: {
    flexDirection: "column",
  },
  title: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.REGULAR,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.S,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.CIRCLE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    ...SHADOWS.SMALL,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "white",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.CIRCLE,
    overflow: "hidden",
    ...SHADOWS.SMALL,
  },
  avatarBlur: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.CIRCLE,
    overflow: "hidden",
  },
  avatarWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.CIRCLE,
    borderWidth: 1.5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "92%",
    height: "92%",
    borderRadius: BORDER_RADIUS.CIRCLE,
  },
});

export default Header;
