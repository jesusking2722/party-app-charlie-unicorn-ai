import { FONTS, THEME } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { RootState } from "@/redux/store";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";
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
      <View className="absolute top-0 right-6 w-4 h-4 z-20 rounded-full">
        <LinearGradient
          colors={badgeColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-full h-full justify-center items-center rounded-full"
        >
          <Text className="text-white text-xs font-bold text-center">
            {count > 99 ? "99+" : count}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View className="w-full h-20 absolute bottom-0 left-0 right-0 z-30 shadow-lg">
      {/* Background with blur */}
      <View className="absolute inset-0">
        <LinearGradient
          colors={theme.GRADIENT as [string, string]}
          start={{ x: 0, y: 0 }}
          end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
          className="flex-1"
        />
        <BlurView
          intensity={isDarkMode ? 25 : 10}
          tint="dark"
          className="absolute inset-0"
        />
      </View>

      {/* Semi-transparent line at the top */}
      <View
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ backgroundColor: theme.BORDER_COLOR }}
      />

      {/* Navbar content */}
      <Animated.View
        className="flex-1 flex-row items-center justify-around px-2"
        style={{
          transform: [{ translateY }],
          opacity: opacityAnim,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.name}
            className={`flex-1 h-12 justify-center items-center relative ${
              item.name === "Create" ? "-mt-5" : ""
            }`}
            onPress={() => handleNavigation(item.path)}
            activeOpacity={0.7}
          >
            {item.name === "Create" ? (
              <LinearGradient
                colors={theme.FAB_GRADIENT as [string, string]}
                className="w-14 h-14 rounded-full justify-center items-center border-3"
                style={{ borderColor: "rgba(0, 0, 0, 0.2)" }}
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
                  className={`text-xs mt-1 ${
                    isActive(item.path) ? "font-semibold" : "font-medium"
                  }`}
                  style={{
                    fontFamily: isActive(item.path)
                      ? FONTS.SEMIBOLD
                      : FONTS.MEDIUM,
                    color: isActive(item.path)
                      ? theme.TEXT_COLOR
                      : theme.TEXT_SECONDARY,
                  }}
                >
                  {item.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* iOS safe area padding */}
      {Platform.OS === "ios" && <View className="h-5" />}
    </View>
  );
};

export default Navbar;
