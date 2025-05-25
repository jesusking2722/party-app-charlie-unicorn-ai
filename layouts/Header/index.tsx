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
import { BACKEND_BASE_URL } from "@/constant";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/redux/store";
import { FontAwesome5 } from "@expo/vector-icons";
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
  onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentLanguage = "EN",
  onLanguageChange,
  onNotificationPress,
}) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // Animation values
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const { messages } = useSelector((state: RootState) => state.message);

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

  // Handle avatar/menu press - opens profile drawer
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
      router.push("/notification");
    }
  };

  useEffect(() => {
    if (user?.notifications) {
      setUnreadNotifications(user.notifications.filter((n) => !n.read).length);
    }
  }, [user?.notifications]);

  // Render user avatar or menu bar icon
  const renderRightMostButton = () => {
    if (user) {
      // Render user avatar when logged in
      return (
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
              {user?.avatar ? (
                <Image
                  source={{
                    uri: BACKEND_BASE_URL + user?.avatar,
                  }}
                  style={styles.creatorAvatar}
                />
              ) : (
                <View>
                  <LinearGradient
                    colors={
                      isDarkMode ? GRADIENTS.PRIMARY : ["#FF0099", "#FF6D00"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.creatorAvatar,
                      {
                        width: 50,
                        height: 50,
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
                </View>
              )}
            </View>
          </BlurView>
        </TouchableOpacity>
      );
    } else {
      // Render menu bar icon when not logged in
      return (
        <TouchableOpacity
          onPress={handleAvatarPress}
          activeOpacity={0.8}
          style={[
            styles.iconButton,
            styles.menuButton,
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
            name="bars"
            size={16}
            color={isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.WHITE}
          />
        </TouchableOpacity>
      );
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

        <View style={styles.headerContent}>
          {/* Logo and Title */}
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              <Image
                source={LOGO_IMAGE}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: isDarkMode
                      ? COLORS.DARK_TEXT_SECONDARY
                      : "rgba(255, 255, 255, 0.8)",
                  },
                ]}
                numberOfLines={1} // Add this
                ellipsizeMode="tail" // Add this
              >
                CHARLIE UNICORN AI
              </Text>
            </View>
          </View>

          {/* Right section with actions */}
          <View style={styles.rightSection}>
            {/* Notification and Chat Buttons - Only show when user is logged in */}
            {user && (
              <>
                <TouchableOpacity
                  onPress={() => router.push("/chat")}
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
                    name="comment"
                    size={16}
                    color={isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.WHITE}
                  />

                  {/* Notification dot */}
                  {user &&
                    messages.filter(
                      (m) => m.receiver._id === user._id && m.status !== "read"
                    ).length > 0 && (
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
                  {unreadNotifications > 0 && (
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
              </>
            )}

            {/* User avatar or menu bar icon */}
            {renderRightMostButton()}
          </View>
        </View>
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
    zIndex: 9999,
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
  creatorCompact: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.S,
    marginTop: SPACING.XS,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: SPACING.S,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Add this to allow it to grow
  },
  titleContainer: {
    flex: 1, // Add this to allow text to use available space
    flexDirection: "column",
  },
  subtitle: {
    fontSize: FONT_SIZES.XS,
    fontFamily: FONTS.BOLD,
    flexShrink: 1, // Add this to allow shrinking
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.S,
    // Optionally set minWidth or maxWidth if needed
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

  title: {
    fontSize: FONT_SIZES.L,
    fontFamily: FONTS.BOLD,
    marginBottom: 2,
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
  menuButton: {
    width: 40,
    height: 40,
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
