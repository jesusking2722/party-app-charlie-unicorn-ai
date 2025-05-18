import { FONTS, THEME } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/redux/store";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const NAV_ITEMS = [
  {
    name: "Home",
    icon: "home",
    path: "/home",
  },
  {
    name: "Events",
    icon: "calendar",
    path: "/parties",
  },
  {
    name: "Create",
    icon: "plus-circle",
    path: "/parties/create",
  },
  {
    name: "Tickets",
    icon: "shopping-cart",
    path: "/tickets",
  },
  {
    name: "Shop",
    icon: "tag",
    path: "/subscription",
  },
];

interface NavbarProps {
  unreadChats?: number;
  onCreatePress?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ unreadChats = 0, onCreatePress }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Animation refs
  const translateY = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { parties } = useSelector((state: RootState) => state.party);

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

  // Handle navigation
  const handleNavigation = (path: string) => {
    if (path === "/create" && onCreatePress) {
      onCreatePress();
    } else {
      router.push(path as any);
    }
  };

  // Determine if a route is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname?.startsWith(path);
  };

  // Badge rendering function with gradient
  const renderBadge = (count: number) => {
    if (count <= 0) return null;

    // Select appropriate badge colors based on theme
    const badgeColors = isDarkMode
      ? (["#D97706", "#DC2626"] as [string, string]) // Darker orange to red for dark mode
      : (["#F59E0B", "#EF4444"] as [string, string]); // Original orange to red for light mode

    return (
      <View style={styles.badgeOuterContainer}>
        <LinearGradient
          colors={badgeColors}
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
      {/* Background with blur */}
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

      {/* Semi-transparent line at the top */}
      <View
        style={[styles.topBorder, { backgroundColor: theme.BORDER_COLOR }]}
      />

      {/* Navbar content */}
      <Animated.View
        style={[
          styles.navContent,
          {
            transform: [{ translateY }],
            opacity: opacityAnim,
          },
        ]}
      >
        {NAV_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.navItem,
              item.name === "Create" && styles.createButton,
              isActive(item.path) && styles.activeNavItem,
            ]}
            onPress={() => handleNavigation(item.path)}
            activeOpacity={0.7}
          >
            {item.name === "Create" ? (
              <LinearGradient
                colors={theme.FAB_GRADIENT as [string, string]}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather
                  name={item.icon as any}
                  size={24}
                  color={theme.TEXT_COLOR}
                />
              </LinearGradient>
            ) : (
              <>
                <Feather
                  name={item.icon as any}
                  size={22}
                  color={
                    isActive(item.path)
                      ? theme.TEXT_COLOR
                      : theme.TEXT_SECONDARY
                  }
                />
                {item.name === "Events" &&
                  parties.length > 0 &&
                  renderBadge(parties.length)}
                <Text
                  style={[
                    styles.navLabel,
                    { color: theme.TEXT_SECONDARY },
                    isActive(item.path) && {
                      color: theme.TEXT_COLOR,
                      fontFamily: FONTS.SEMIBOLD,
                    },
                  ]}
                >
                  {item.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 80,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 0, // Safe area for iOS
  },
  background: {
    flex: 1,
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 10,
  },
  navContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  navItem: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  activeNavItem: {
    // Active item styling
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: FONTS.MEDIUM,
  },
  createButton: {
    marginTop: -20, // Lift it up for prominence
  },
  createButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  badgeOuterContainer: {
    position: "absolute",
    top: 0,
    right: 22, // Positioned relative to icon
    width: 16,
    height: 16,
    zIndex: 20,
    borderRadius: 8,
  },
  badge: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    fontFamily: FONTS.BOLD,
    textAlign: "center",
  },
});

export default Navbar;
