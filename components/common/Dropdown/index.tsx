import { FONTS } from "@/app/theme";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from "react-native";

// Enable layout animations for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = "Select an option",
  options,
  value,
  onSelect,
  containerStyle,
  labelStyle,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownRef = useRef<View>(null);
  const windowHeight = Dimensions.get("window").height;

  // Determine max height for dropdown options list
  const maxHeight = Math.min(300, windowHeight * 0.4);

  // Animation config
  const animationConfig = {
    duration: 200,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  useEffect(() => {
    // Calculate content height based on options
    // Limit height if there are many options
    const contentHeight = Math.min(options.length * 50, maxHeight);
    setDropdownHeight(contentHeight);
  }, [options, maxHeight]);

  // Set initial height calculation
  useEffect(() => {
    // Give a minimum height for the dropdown
    const initialHeight = Math.min(
      Math.max(options.length * 50, 150),
      maxHeight
    );
    setDropdownHeight(initialHeight);
  }, []);

  const toggleDropdown = () => {
    // Configure animation
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    // Toggle dropdown state
    setIsOpen(!isOpen);

    // Animate the chevron rotation
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: animationConfig.duration,
      easing: animationConfig.easing,
      useNativeDriver: true,
    }).start();

    // Animate dropdown opacity
    Animated.timing(dropdownOpacity, {
      toValue: isOpen ? 0 : 1,
      duration: animationConfig.duration,
      easing: animationConfig.easing,
      useNativeDriver: true,
    }).start();
  };

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    toggleDropdown();
  };

  // Create rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = () => {
      if (isOpen) {
        toggleDropdown();
      }
    };

    // Setup event listeners (you would need to adapt this for React Native)
    // This is just a placeholder for the concept
    return () => {
      // Cleanup event listeners
    };
  }, [isOpen]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      {/* Dropdown trigger button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.dropdownTrigger, error && styles.dropdownTriggerError]}
        onPress={toggleDropdown}
      >
        <Text style={[styles.selectedText, !value && styles.placeholderText]}>
          {value ? value.label : placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <FontAwesome name="chevron-down" size={16} color="white" />
        </Animated.View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown options container */}
      {isOpen && (
        <Animated.View
          style={[
            styles.dropdownOptionsContainer,
            {
              opacity: dropdownOpacity,
              maxHeight: dropdownHeight,
              top: label ? 80 : 56,
            },
          ]}
        >
          <LinearGradient
            colors={["#7F00FF", "#E100FF"]}
            style={styles.optionsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.optionsInnerContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    value?.value === option.value && styles.selectedOption,
                    index === options.length - 1 && styles.lastOptionItem,
                  ]}
                  onPress={() => {
                    handleSelect(option);
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {value?.value === option.value && (
                    <FontAwesome name="check" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 8,
  },
  dropdownTrigger: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
  },
  dropdownTriggerError: {
    borderWidth: 1,
    borderColor: "rgba(255, 100, 100, 0.7)",
  },
  selectedText: {
    color: "white",
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  errorText: {
    color: "rgba(255, 100, 100, 0.9)",
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: FONTS.REGULAR,
  },
  dropdownOptionsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  optionsGradient: {
    width: "100%",
    height: "100%",
  },
  optionsInnerContainer: {
    width: "100%",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  optionText: {
    color: "white",
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
});

export default Dropdown;
