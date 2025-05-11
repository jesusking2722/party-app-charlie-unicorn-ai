import { THEME } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  position?: "left" | "right";
  width?: number | "auto" | `${number}%`;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
}

const Drawer: React.FC<DrawerProps> = ({
  visible,
  onClose,
  position = "right",
  width = Math.floor(SCREEN_WIDTH * 0.8),
  children,
  contentContainerStyle,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const translateX = useRef(
    new Animated.Value(position === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH)
  ).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Reset animation state when visibility changes
  useEffect(() => {
    if (visible) {
      setIsAnimatingOut(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      StatusBar.setBarStyle("light-content");
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!isAnimatingOut) {
      setIsAnimatingOut(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: position === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animation is complete, we can set this to false
        setIsAnimatingOut(false);
      });
    }
  }, [visible, position, isAnimatingOut]);

  // If not visible and not animating out, don't render anything
  if (!visible && !isAnimatingOut) {
    return null;
  }

  // Handle tap on backdrop
  const handleBackdropPress = () => {
    if (onClose) {
      onClose();
    }
  };

  // Calculate border radius based on position
  const borderRadiusStyle: ViewStyle =
    position === "right"
      ? {
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }
      : {
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        };

  return (
    <View
      style={styles.container}
      pointerEvents={visible || isAnimatingOut ? "auto" : "none"}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            backgroundColor: "black",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { width, [position]: 0 },
          borderRadiusStyle,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={theme.GRADIENT as [string, string]}
          style={styles.drawerGradient}
          start={{ x: 0, y: 0 }}
          end={isDarkMode ? { x: 0, y: 1 } : { x: 1, y: 1 }}
        >
          <BlurView
            intensity={isDarkMode ? 25 : 10}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.content, contentContainerStyle]}>
            {children}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  backdropTouchable: {
    width: "100%",
    height: "100%",
  },
  drawer: {
    position: "absolute",
    top: 0,
    height: "100%",
    zIndex: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 25,
  },
  drawerGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 40 : StatusBar.currentHeight,
  },
});

export default Drawer;
