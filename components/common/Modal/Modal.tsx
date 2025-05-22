import React, { ReactNode, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import theme from "@/app/theme";
import { useTheme } from "@/contexts/ThemeContext";
import Translate from "../Translate";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

interface PremiumModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
  showBackdrop?: boolean;
  animationType?: "slide" | "fade" | "none";
  closeOnBackdropPress?: boolean;
  withBlur?: boolean;
  containerStyle?: object;
  headerStyle?: object;
  bodyStyle?: object;
  footerContent?: ReactNode;
}

const PremiumModal: React.FC<PremiumModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  showCloseButton = true,
  showBackdrop = true,
  animationType = "slide",
  closeOnBackdropPress = true,
  withBlur = true,
  containerStyle,
  headerStyle,
  bodyStyle,
  footerContent,
}) => {
  // Animation values
  const [animation] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);

  const { isDarkMode } = useTheme();

  // Theme colors based on dark/light mode
  const modalBg = isDarkMode
    ? theme.COLORS.MODAL_BG_DARK
    : theme.COLORS.MODAL_BG_LIGHT;
  const modalGradient = isDarkMode
    ? theme.GRADIENTS.MODAL_HEADER_DARK
    : theme.GRADIENTS.MODAL_HEADER_LIGHT;
  const textColor = isDarkMode
    ? theme.THEME.DARK.TEXT_COLOR
    : theme.THEME.LIGHT.TEXT_COLOR;
  const textSecondary = isDarkMode
    ? theme.THEME.DARK.TEXT_SECONDARY
    : theme.THEME.LIGHT.TEXT_SECONDARY;
  const blurIntensity = isDarkMode ? 20 : 15;
  const backgroundOpacity = isDarkMode ? 0.7 : 0.4;
  const borderColor = isDarkMode
    ? theme.COLORS.DARK_BORDER
    : theme.COLORS.LIGHT_BORDER;
  const cardBg = isDarkMode
    ? theme.COLORS.DARK_CARD_GLASS
    : theme.COLORS.LIGHT_CARD_GLASS;

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      setModalVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: theme.ANIMATIONS.MEDIUM,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: theme.ANIMATIONS.MEDIUM,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [isVisible]);

  // Animation variables
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height / 2, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, backgroundOpacity],
  });

  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 0.95, 1],
  });

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  // Content component with blur effect for glassy feel
  const ModalContent = () => (
    <Animated.View
      style={[
        styles.modalContainer,
        {
          transform: [{ translateY }, { scale }],
          backgroundColor: cardBg,
          borderColor: borderColor,
        },
        containerStyle,
      ]}
    >
      {withBlur && (
        <BlurView
          intensity={blurIntensity}
          style={styles.blurContainer}
          tint={isDarkMode ? "dark" : "light"}
        />
      )}

      {/* Header with gradient */}
      <LinearGradient
        colors={modalGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerGradient, headerStyle]}
      >
        <Text style={[styles.title, { color: textColor }]}>
          <Translate>{title}</Translate>
        </Text>
        {showCloseButton && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: textColor }]}>✕</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Modal body */}
      <ScrollView
        style={[styles.contentContainer, bodyStyle]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>

      {/* Optional footer */}
      {footerContent && (
        <View style={styles.footerContainer}>{footerContent}</View>
      )}
    </Animated.View>
  );

  return (
    <Modal
      transparent
      visible={modalVisible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Backdrop */}
        {showBackdrop && (
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                  backgroundColor: isDarkMode ? "#000" : "#333",
                },
              ]}
            />
          </TouchableWithoutFeedback>
        )}

        {/* Modal content */}
        <ModalContent />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: theme.BORDER_RADIUS.L,
    overflow: "hidden",
    borderWidth: 1,
    ...theme.SHADOWS.PREMIUM,
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.BORDER_RADIUS.L,
  },
  headerGradient: {
    paddingVertical: theme.SPACING.M,
    paddingHorizontal: theme.SPACING.L,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: theme.BORDER_RADIUS.L,
    borderTopRightRadius: theme.BORDER_RADIUS.L,
  },
  title: {
    fontFamily: theme.FONTS.SEMIBOLD,
    fontSize: theme.FONT_SIZES.L,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  closeText: {
    fontSize: theme.FONT_SIZES.M,
  },
  contentContainer: {
    maxHeight: height * 0.6,
  },
  scrollContent: {
    padding: theme.SPACING.L,
  },
  footerContainer: {
    padding: theme.SPACING.M,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});

export default PremiumModal;
