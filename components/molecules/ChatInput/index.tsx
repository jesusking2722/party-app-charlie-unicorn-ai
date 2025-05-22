// src/components/chat/ChatInput.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  THEME,
} from "@/app/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslator } from "@/contexts/TranslatorContext";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onPickImage: () => void;
  loading: boolean;
  isDarkMode: boolean;
}

const ChatInput = ({
  value,
  onChange,
  onSend,
  onPickImage,
  loading,
  isDarkMode,
}: ChatInputProps) => {
  // Input ref
  const inputRef = useRef<TextInput>(null);

  // States
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);

  const [placeholder, setPlaceholder] = useState<string>("");

  const { language } = useLanguage();
  const { translateText } = useTranslator();

  // Animated values
  const attachButtonScale = useRef(new Animated.Value(1)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const inputBorderAnimation = useRef(new Animated.Value(0)).current;

  // Handle text input height adjustment for multiline
  const handleContentSizeChange = useCallback(
    (event: {
      nativeEvent: { contentSize: { width: number; height: number } };
    }) => {
      const newHeight = Math.min(
        Math.max(40, event.nativeEvent.contentSize.height),
        120
      );
      setInputHeight(newHeight);
    },
    []
  );

  // Handle send press
  const handleSendPress = () => {
    if (value.trim().length === 0 || loading) return;

    // Animate button press
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onSend();

    // Optionally blur input after sending
    if (Platform.OS === "ios") {
      Keyboard.dismiss();
    }
  };

  // Handle attachment press animation
  const handleAttachPressIn = () => {
    Animated.timing(attachButtonScale, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleAttachPressOut = () => {
    Animated.timing(attachButtonScale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Handle send button press animation
  const handleSendPressIn = () => {
    Animated.timing(sendButtonScale, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSendPressOut = () => {
    Animated.timing(sendButtonScale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Focus effect for input
  useEffect(() => {
    Animated.timing(inputBorderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, inputBorderAnimation]);

  useEffect(() => {
    const translate = async () => {
      const translated = await translateText("Message");
      setPlaceholder(translated);
    };

    translate();
  }, [language]);

  // Input border color interpolation
  const borderColor = inputBorderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      isDarkMode ? "rgba(138,125,255,0.5)" : "rgba(79,70,229,0.3)",
    ],
  });

  // Background color for input
  const inputBackground = isDarkMode
    ? "rgba(40, 44, 52, 0.8)"
    : "rgba(255, 255, 255, 0.9)";

  // Whether to show attachment button
  const showAttachButton = !loading;

  // Whether to show send button
  const showSendButton = value.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Input Area with Animated Border */}
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: inputBackground,
          },
        ]}
      >
        {/* Attachment Button (Left Side) */}
        {showAttachButton && (
          <Animated.View
            style={[
              styles.attachButtonContainer,
              { transform: [{ scale: attachButtonScale }] },
            ]}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onPickImage}
              onPressIn={handleAttachPressIn}
              onPressOut={handleAttachPressOut}
              activeOpacity={0.8}
              disabled={loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={isDarkMode ? "rgba(255,255,255,0.8)" : "#4F46E5"}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: isDarkMode
                ? COLORS.DARK_TEXT_PRIMARY
                : COLORS.LIGHT_TEXT_PRIMARY,
              height: inputHeight,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={
            isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"
          }
          value={value}
          onChangeText={onChange}
          multiline
          onContentSizeChange={handleContentSizeChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="default"
          keyboardAppearance={isDarkMode ? "dark" : "light"}
        />

        {/* Right Side Icons */}
        <View style={styles.rightIconsContainer}>
          {/* Media Button */}
          {!showSendButton && !loading && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onPickImage}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={isDarkMode ? "rgba(255,255,255,0.8)" : "#4F46E5"}
              />
            </TouchableOpacity>
          )}

          {/* Send Button */}
          {showSendButton && (
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <Pressable
                style={({ pressed }) => [
                  styles.sendButtonContainer,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={handleSendPress}
                onPressIn={handleSendPressIn}
                onPressOut={handleSendPressOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <LinearGradient
                    colors={
                      isDarkMode
                        ? ["#6366F1", "#4F46E5"]
                        : ["#4F46E5", "#4338CA"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendButtonGradient}
                  >
                    <Ionicons
                      name="paper-plane"
                      size={16}
                      color={COLORS.WHITE}
                    />
                  </LinearGradient>
                )}
              </Pressable>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.XS,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1.5,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: SPACING.S,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  attachButtonContainer: {
    marginRight: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 17,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.S,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    maxHeight: 120,
    minHeight: 48,
  },
  rightIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  sendButtonContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatInput;
