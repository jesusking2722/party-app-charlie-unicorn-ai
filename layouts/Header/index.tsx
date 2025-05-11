import { FONTS, THEME } from "@/app/theme";
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

// Logo asset path - update with your actual logo path
const LOGO_IMAGE = require("@/assets/images/logo.png");
// Default avatar if user doesn't have one
const DEFAULT_AVATAR = require("@/assets/images/bnb.png");

interface HeaderProps {
  title?: string;
  userAvatar?: string; // URL for the user's avatar
  userName?: string; // User's name for the profile drawer
  professionalTitle?: string; // User's professional title
  description?: string; // User's description
  email?: string; // User's email
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  onProfileUpdate?: (data: {
    userName: string;
    professionalTitle: string;
    description: string;
  }) => void;
}

const Header: React.FC<HeaderProps> = ({
  title = "Charlie Unicorn AI",
  userAvatar,
  userName = "John Doe",
  professionalTitle = "Software Developer",
  description = "Experienced software developer with a passion for creating beautiful and functional applications.",
  email = "johndoe@example.com",
  currentLanguage = "EN",
  onLanguageChange,
  onProfileUpdate,
}) => {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);

  const [userInfo, setUserInfo] = useState({
    userName: userName,
    professionalTitle: professionalTitle,
    description: description,
  });

  // Theme context
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

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

  // Handle profile update
  const handleProfileUpdate = (data: {
    userName: string;
    professionalTitle: string;
    description: string;
  }) => {
    setUserInfo(data);
    // Call the parent callback if provided
    if (onProfileUpdate) {
      onProfileUpdate(data);
    }
  };

  // Handle avatar press - now opens profile drawer
  const handleAvatarPress = () => {
    setProfileDrawerVisible(!profileDrawerVisible);
  };

  // Handle profile drawer close
  const handleProfileDrawerClose = () => {
    setProfileDrawerVisible(false);
  };

  return (
    <>
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
          {/* Left section: Logo and Title */}
          <View style={styles.leftSection}>
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

          {/* Right section: Avatar only */}
          <View style={styles.rightSection}>
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
        </Animated.View>
      </View>

      {/* Profile Drawer */}
      <ProfileDrawer
        visible={profileDrawerVisible}
        onClose={handleProfileDrawerClose}
        userAvatar={userAvatar}
        userName={userInfo.userName}
        professionalTitle={userInfo.professionalTitle}
        description={userInfo.description}
        email={email}
        onProfileUpdate={handleProfileUpdate}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
    </>
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
    fontSize: 18,
    fontFamily: FONTS.REGULAR,
  },
  titleBold: {
    fontFamily: FONTS.BOLD,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
