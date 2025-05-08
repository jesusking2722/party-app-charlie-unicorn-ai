import { FONTS } from "@/app/theme";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface TextAreaProps extends Omit<TextInputProps, "style"> {
  label?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  textAreaStyle?: TextStyle;
  error?: string;
  minHeight?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder = "Type your message here...",
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  containerStyle,
  labelStyle,
  textAreaStyle,
  error,
  minHeight = 120,
  maxLength,
  showCharCount = false,
  ...restProps
}) => {
  // Animation for error text
  const fadeAnim = useRef(new Animated.Value(error ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(error ? 0 : 20)).current;

  // Update animation when error state changes
  React.useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  // Calculate remaining characters
  const remainingChars = maxLength ? maxLength - (value?.length || 0) : null;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View
        style={[
          styles.textAreaWrapper,
          error && styles.textAreaWrapperError,
          { minHeight },
        ]}
      >
        <TextInput
          style={[
            styles.textArea,
            { minHeight: minHeight - 16 }, // Account for padding
            textAreaStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={value}
          onChangeText={onChangeText}
          multiline
          textAlignVertical="top"
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          maxLength={maxLength}
          {...restProps}
        />

        {showCharCount && maxLength && (
          <View style={styles.charCountContainer}>
            <Text
              style={[
                styles.charCountText,
                remainingChars !== null && remainingChars < 20
                  ? styles.charCountWarning
                  : undefined,
              ]}
            >
              {remainingChars}
            </Text>
          </View>
        )}
      </View>

      {error && (
        <Animated.Text
          style={[
            styles.errorText,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 8,
  },
  textAreaWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  textAreaWrapperError: {
    borderWidth: 1,
    borderColor: "rgba(255, 100, 100, 0.7)",
  },
  textArea: {
    color: "white",
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    padding: 16,
    textAlignVertical: "top",
    width: "100%",
  },
  errorText: {
    color: "rgba(255, 100, 100, 0.9)",
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: FONTS.REGULAR,
  },
  charCountContainer: {
    position: "absolute",
    bottom: 8,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    padding: 4,
    paddingHorizontal: 8,
  },
  charCountText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
  },
  charCountWarning: {
    color: "rgba(255, 150, 100, 0.9)",
  },
});

export default TextArea;
