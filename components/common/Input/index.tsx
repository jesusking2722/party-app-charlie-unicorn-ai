import { FONTS } from "@/app/theme";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  isPassword = false,
  keyboardType = "default",
  autoCapitalize = "none",
  containerStyle,
  labelStyle,
  inputStyle,
  error,
  ...restProps
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = (): void => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={[styles.inputLabel, labelStyle]}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !isVisible : secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          {...restProps}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={toggleVisibility}
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          >
            <View
              style={[styles.eyeIconCircle, isVisible && styles.eyeIconActive]}
            >
              <FontAwesome
                name={isVisible ? "eye" : "eye-slash"}
                size={16}
                color="#ffffff"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: "white",
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    height: 56,
  },
  inputWrapperError: {
    borderWidth: 1,
    borderColor: "rgba(255, 100, 100, 0.7)",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    color: "white",
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIconActive: {
    // backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  errorText: {
    color: "rgba(255, 100, 100, 0.9)",
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: FONTS.REGULAR,
  },
});

export default Input;
