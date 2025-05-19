import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  FONT_SIZES,
  FONTS,
  SHADOWS,
  GRADIENTS,
} from "@/app/theme";
import { Ticket } from "@/types/data";
import TicketComponent from "../Ticket";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for the close icon

interface TicketModalProps {
  visible: boolean;
  onClose: () => void;
  alreadyOwned: boolean;
  selectedTicket: Ticket | null;
  onPurchase: (id: string) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  visible,
  onClose,
  alreadyOwned,
  selectedTicket,
  onPurchase,
}) => {
  const { isDarkMode } = useTheme();

  // Scale animation for modal entry
  const [scaleAnim] = React.useState(new Animated.Value(0.9));
  const [opacityAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when modal is hidden
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  // Get gradient colors based on theme
  const getGradientColors = () => {
    return isDarkMode ? GRADIENTS.SECONDARY : ["#FF0099", "#FF6D00"];
  };

  // Get background colors based on theme
  const getBgColor = () => {
    return isDarkMode ? "rgba(30, 30, 30, 0.98)" : "rgba(255, 255, 255, 0.98)";
  };

  // Get text colors based on theme
  const getTextColor = () => {
    return isDarkMode ? COLORS.DARK_TEXT_PRIMARY : COLORS.LIGHT_TEXT_PRIMARY;
  };

  // Get secondary colors based on theme
  const getSecondaryBgColor = () => {
    return isDarkMode ? "rgba(40, 40, 40, 0.8)" : "rgba(240, 240, 240, 0.8)";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: getBgColor(),
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              ...SHADOWS.LARGE,
            },
          ]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={getGradientColors() as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <Text style={styles.headerText}>
              {alreadyOwned ? "Ticket Owned" : "Ticket Details"}
            </Text>
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.contentContainer}>
            {alreadyOwned ? (
              <View style={styles.alreadyOwnedContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color={isDarkMode ? "#40E0D0" : "#00A896"}
                  />
                </View>
                <Text style={[styles.infoText, { color: getTextColor() }]}>
                  You already own this ticket
                </Text>
                <Text
                  style={[
                    styles.subText,
                    {
                      color: isDarkMode
                        ? COLORS.DARK_TEXT_SECONDARY
                        : COLORS.LIGHT_TEXT_SECONDARY,
                    },
                  ]}
                >
                  You can proceed to the application
                </Text>
              </View>
            ) : selectedTicket ? (
              <View style={styles.ticketContainer}>
                <TicketComponent {...selectedTicket} onPurchase={onPurchase} />
              </View>
            ) : null}
          </View>
          {/* Alternative action button for already owned tickets */}
          {alreadyOwned && (
            <TouchableOpacity
              style={[
                styles.alternateButton,
                { backgroundColor: getSecondaryBgColor() },
              ]}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text
                style={[styles.alternateButtonText, { color: getTextColor() }]}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(2px)",
  },
  modalContainer: {
    width: "85%",
    borderRadius: BORDER_RADIUS.XL,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.M,
    paddingHorizontal: SPACING.L,
  },
  headerText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.L,
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: SPACING.L,
  },
  ticketContainer: {
    width: "100%",
    paddingVertical: SPACING.M,
  },
  alreadyOwnedContainer: {
    alignItems: "center",
    paddingVertical: SPACING.XL,
    paddingHorizontal: SPACING.L,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(64, 224, 208, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.M,
  },
  infoText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.L,
    textAlign: "center",
    marginBottom: SPACING.S,
  },
  subText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.S,
    textAlign: "center",
    opacity: 0.8,
  },
  actionButtonContainer: {
    paddingHorizontal: SPACING.L,
    paddingBottom: SPACING.L,
  },
  actionButton: {
    flexDirection: "row",
    height: 56,
    borderRadius: BORDER_RADIUS.L,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.SEMIBOLD,
    fontSize: FONT_SIZES.M,
  },
  alternateButton: {
    margin: SPACING.L,
    height: 50,
    borderRadius: BORDER_RADIUS.L,
    justifyContent: "center",
    alignItems: "center",
  },
  alternateButtonText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.M,
  },
});

export default TicketModal;
