import { THEME } from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  InteractionManager,
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
  // State to track drawer mounting status
  const [mounted, setMounted] = useState(false);

  // Use useRef for animation values to avoid re-creating them on re-renders
  const translateX = useRef(
    new Animated.Value(position === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH)
  ).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Track whether animation is running to avoid interruptions
  const animationRunning = useRef(false);

  // Track animation completion for unmounting
  const shouldUnmount = useRef(false);

  // Get theme context
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;

  // Handle component mounting/unmounting based on visibility
  useEffect(() => {
    if (visible && !mounted) {
      setMounted(true);
      shouldUnmount.current = false;
    }
  }, [visible, mounted]);

  // Memoize backdrop press handler to avoid recreating on each render
  const handleBackdropPress = useCallback(() => {
    if (onClose && !animationRunning.current) {
      onClose();
    }
  }, [onClose]);

  // Animation control
  useEffect(() => {
    if (!mounted) return;

    // If drawer is visible, animate in
    if (visible) {
      animationRunning.current = true;
      StatusBar.setBarStyle("light-content");

      // Reset position to ensure proper animation
      translateX.setValue(position === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH);
      backdropOpacity.setValue(0);

      // Start animation
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.7,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animationRunning.current = false;
      });
    }
    // If drawer should be hidden, animate out
    else if (mounted) {
      animationRunning.current = true;
      shouldUnmount.current = true;

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: position === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animationRunning.current = false;

        // Using InteractionManager to delay unmounting until after animations
        // This ensures we don't interrupt the animation
        InteractionManager.runAfterInteractions(() => {
          if (shouldUnmount.current) {
            setMounted(false);
          }
        });
      });
    }
  }, [visible, position, mounted, translateX, backdropOpacity]);

  // Don't render anything if not mounted
  if (!mounted) {
    return null;
  }

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
      style={[
        styles.container,
        // Only allow interaction when visible
        { pointerEvents: visible ? "auto" : "none" },
      ]}
      // Adding this ensures we don't interrupt other interactions
      collapsable={false}
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
        pointerEvents={visible ? "auto" : "none"}
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
        pointerEvents={visible ? "auto" : "none"}
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

// Optimize styles
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
    shadowRadius: 10,
    elevation: 20,
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
