import { BORDER_RADIUS, GRADIENTS, SHADOWS } from "@/app/theme";
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

// Custom light theme accent color
const LIGHT_THEME_ACCENT = "#FF0099";

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
  const scale = useRef(new Animated.Value(0.97)).current;

  // Track whether animation is running to avoid interruptions
  const animationRunning = useRef(false);

  // Track animation completion for unmounting
  const shouldUnmount = useRef(false);

  // Get theme context
  const { isDarkMode } = useTheme();

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
      StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");

      // Reset position to ensure proper animation
      translateX.setValue(position === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH);
      backdropOpacity.setValue(0);
      scale.setValue(0.97);

      // Start animation
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 6,
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
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.97,
          duration: 300,
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
  }, [
    visible,
    position,
    mounted,
    translateX,
    backdropOpacity,
    scale,
    isDarkMode,
  ]);

  // Don't render anything if not mounted
  if (!mounted) {
    return null;
  }

  // Calculate border radius based on position
  const borderRadiusStyle: ViewStyle =
    position === "right"
      ? {
          borderTopLeftRadius: BORDER_RADIUS.XXL,
          borderBottomLeftRadius: BORDER_RADIUS.XXL,
        }
      : {
          borderTopRightRadius: BORDER_RADIUS.XXL,
          borderBottomRightRadius: BORDER_RADIUS.XXL,
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
          { width: typeof width === "string" ? width : width },
          borderRadiusStyle,
          {
            transform: [{ translateX }, { scale }],
            ...SHADOWS.MEDIUM,
          },
          position === "right" ? { right: 0 } : { left: 0 },
        ]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <BlurView
          intensity={isDarkMode ? 40 : 30}
          tint={isDarkMode ? "dark" : "light"}
          style={styles.blurContainer}
        >
          <LinearGradient
            colors={isDarkMode ? GRADIENTS.DARK_BG : GRADIENTS.LIGHT_BG}
            style={styles.drawerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={[styles.content, contentContainerStyle]}>
              {children}
            </View>
          </LinearGradient>
        </BlurView>
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
  },
  blurContainer: {
    flex: 1,
  },
  drawerGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 40 : StatusBar.currentHeight || 0,
  },
});

export default Drawer;
