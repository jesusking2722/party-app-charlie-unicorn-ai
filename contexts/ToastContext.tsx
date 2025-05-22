import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import the styles from your theme file
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  FONTS,
  GRADIENTS,
  SHADOWS,
  SPACING,
} from "@/app/theme";
import { Translate } from "@/components/common";

// Toast types
export type ToastType = "success" | "info" | "warning" | "error";

// Toast data structure
interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Toast context interface
interface ToastContextProps {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

// Create context
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Get screen dimensions
const { width } = Dimensions.get("window");

// Individual Toast Component
const ToastItem = ({
  id,
  message,
  type,
  duration = 3000,
  onClose,
}: {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const progressAnim = useRef(new Animated.Value(100)).current;

  // Get gradient colors based on toast type
  const getGradient = () => {
    switch (type) {
      case "success":
        return ["#10b981", "#059669"];
      case "info":
        return ["#6366f1", "#4f46e5"];
      case "warning":
        return ["#f59e0b", "#d97706"];
      case "error":
        return ["#ef4444", "#dc2626"];
      default:
        return GRADIENTS.PRIMARY;
    }
  };

  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "info":
        return "information-circle";
      case "warning":
        return "warning";
      case "error":
        return "close-circle";
      default:
        return "information-circle";
    }
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  // Dismiss animation
  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose(id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          ...SHADOWS.MEDIUM,
        },
      ]}
    >
      <LinearGradient
        colors={getGradient() as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Progress bar */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />

        <View style={styles.contentContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon() as any} size={24} color="white" />
          </View>

          {/* Message */}
          <Text style={styles.message}>
            <Translate>{message}</Translate>
          </Text>

          {/* Close button */}
          <TouchableOpacity
            onPress={() => dismiss()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Add a new toast
  const showToast = (message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  };

  // Remove a toast by id
  const hideToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Clear all toasts
  const clearAllToasts = () => {
    setToasts([]);
  };

  // Context value
  const contextValue: ToastContextProps = {
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View style={styles.toastWrapper}>
        {toasts.map((toast, index) => (
          <ToastItem
            key={index}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    alignSelf: "center",
    zIndex: 9999,
    width: width - 32,
    alignItems: "center",
  },
  toastContainer: {
    width: "100%",
    marginBottom: SPACING.M,
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: BORDER_RADIUS.L,
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.M,
    paddingVertical: SPACING.M,
  },
  iconContainer: {
    marginRight: SPACING.S,
  },
  message: {
    flex: 1,
    color: COLORS.WHITE,
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.XS,
  },
  closeButton: {
    marginLeft: SPACING.S,
    padding: SPACING.XS,
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
